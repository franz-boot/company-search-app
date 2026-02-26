import { NextResponse } from 'next/server';
import { Company, SearchParams, Sector } from '@/types';

const ARES_BASE = 'https://ares.gov.cz/ekonomicke-subjekty-v-be/rest';
const KURZY_BASE = 'https://rejstrik-firem.kurzy.cz';

// ─── Shared fetch helper ──────────────────────────────────────────────────────

/** fetch() with an AbortController-based timeout. Cleans up the timer on completion. */
function fetchWithTimeout(url: string, options: RequestInit = {}, ms = 8000): Promise<Response> {
    const ctrl = new AbortController();
    const tid = setTimeout(() => ctrl.abort(), ms);
    return fetch(url, { ...options, signal: ctrl.signal }).finally(() => clearTimeout(tid));
}

// ─── NACE → Sector ──────────────────────────────────────────────────────────

function naceToSector(naceCodes: string[]): Sector {
    // Weighted scoring: distinctive sectors (IT, Finance, Healthcare) score 2 per code,
    // generic ones (Manufacturing, Retail) score 1. Highest total wins.
    const scores: Partial<Record<Sector, number>> = {};

    for (const code of naceCodes) {
        const prefix = parseInt(code.slice(0, 2), 10);
        let sector: Sector | null = null;
        let weight = 1;

        if ([58, 59, 62, 63].includes(prefix))           { sector = 'IT';            weight = 3; }
        else if ([64, 65, 66].includes(prefix))           { sector = 'Finance';       weight = 3; }
        else if (prefix >= 86 && prefix <= 88)            { sector = 'Healthcare';    weight = 3; }
        else if (prefix >= 10 && prefix <= 35)            { sector = 'Manufacturing'; weight = 2; }
        else if (prefix >= 45 && prefix <= 47)            { sector = 'Retail';        weight = 1; }

        if (sector) scores[sector] = (scores[sector] ?? 0) + weight;
    }

    // Pick highest score; ties broken by this priority order
    let best: Sector = 'Other';
    let bestScore = 0;
    for (const s of ['IT', 'Finance', 'Healthcare', 'Manufacturing', 'Retail'] as Sector[]) {
        const score = scores[s] ?? 0;
        if (score > bestScore) { bestScore = score; best = s; }
    }
    return best;
}

// ─── ARES types ──────────────────────────────────────────────────────────────

interface AresSidlo {
    nazevObce?: string;
    nazevUlice?: string;
    cisloDomovni?: number;
    cisloOrientacni?: number;
    psc?: number;
    textovaAdresa?: string;
}

interface AresSubject {
    ico: string;
    obchodniJmeno: string;
    sidlo?: AresSidlo;
    czNace2008?: string[];
    czNace?: string[];
}

function formatZip(psc?: number): string {
    if (!psc) return '';
    const s = psc.toString().padStart(5, '0');
    return `${s.slice(0, 3)} ${s.slice(3)}`;
}

function formatStreet(sidlo: AresSidlo): string {
    const parts: string[] = [];
    if (sidlo.nazevUlice) parts.push(sidlo.nazevUlice);
    if (sidlo.cisloDomovni) {
        let num = sidlo.cisloDomovni.toString();
        if (sidlo.cisloOrientacni) num += `/${sidlo.cisloOrientacni}`;
        parts.push(num);
    }
    return parts.join(' ') || sidlo.textovaAdresa || '';
}

function mapSubject(s: AresSubject): Company {
    const sidlo = s.sidlo ?? {};
    const naceCodes = s.czNace2008 ?? s.czNace ?? [];
    return {
        id: s.ico,
        name: s.obchodniJmeno,
        ico: s.ico,
        location: {
            city: sidlo.nazevObce ?? '',
            street: formatStreet(sidlo),
            zip: formatZip(sidlo.psc),
        },
        employeeCount: '1-10',
        sector: naceToSector(naceCodes),
        contact: { email: '', phone: '', website: '' },
        socialLinks: {},
    };
}

// ─── Enrichment ──────────────────────────────────────────────────────────────

interface KurzyContact {
    website: string;
    email: string;
    phone: string;
}

/** Scrape kurzy.cz to extract website, email and phone from the registry page. */
async function fetchKurzyContact(ico: string): Promise<KurzyContact> {
    const empty: KurzyContact = { website: '', email: '', phone: '' };
    try {
        const controller = new AbortController();
        const tid = setTimeout(() => controller.abort(), 4000);
        const res = await fetch(`${KURZY_BASE}/${ico}/`, {
            signal: controller.signal,
            headers: { 'User-Agent': 'Mozilla/5.0 (compatible; CompanySearch/1.0)' },
        });
        clearTimeout(tid);
        if (!res.ok) return empty;

        const html = await res.text();

        // Website — pattern: <b>WWW:</b></td><td><a href="URL">
        const webMatch = html.match(/<b>WWW:<\/b>[\s\S]{0,80}?href="(https?:\/\/[^"]+)"/i);
        const website = webMatch && !webMatch[1].includes('kurzy.cz') ? webMatch[1] : '';

        // Email — pattern: <b>EMAIL:</b></td><td><a href="mailto:ADDRESS">
        const emailMatch = html.match(/<b>EMAIL:<\/b>[\s\S]{0,80}?href="mailto:([^"]+)"/i);
        const email = emailMatch ? emailMatch[1] : '';

        // Phone — pattern: <b>TELEFON:</b></td><td>NUMBER
        const phoneMatch = html.match(/<b>TELEFON:<\/b><\/td><td>([^<]{5,30})/i);
        const phone = phoneMatch ? phoneMatch[1].trim() : '';

        return { website, email, phone };
    } catch {
        return empty;
    }
}

/** LinkedIn company search URL — always opens a targeted company search. */
function linkedInUrl(companyName: string): string {
    return `https://www.linkedin.com/search/results/companies/?keywords=${encodeURIComponent(companyName)}`;
}

/** Enrich a single company with contact data from kurzy.cz + LinkedIn URL. */
async function enrich(company: Company): Promise<Company> {
    const kurzy = await fetchKurzyContact(company.ico);
    return {
        ...company,
        contact: {
            email: kurzy.email,
            phone: kurzy.phone,
            website: kurzy.website,
        },
        socialLinks: { linkedin: linkedInUrl(company.name) },
    };
}

// ─── Route handler ───────────────────────────────────────────────────────────

export async function POST(request: Request) {
    try {
        const body: SearchParams = await request.json();

        // Direct ICO lookup
        if (body.keyword && /^\d{8}$/.test(body.keyword.trim())) {
            const res = await fetchWithTimeout(`${ARES_BASE}/ekonomicke-subjekty/${body.keyword.trim()}`, {
                headers: { Accept: 'application/json' },
            });
            if (!res.ok) return NextResponse.json({ data: [] });
            const subject: AresSubject = await res.json();
            let company = mapSubject(subject);

            if (body.sector && company.sector !== body.sector)
                return NextResponse.json({ data: [] });
            if (body.location && !company.location.city.toLowerCase().includes(body.location.toLowerCase()))
                return NextResponse.json({ data: [] });

            company = await enrich(company);
            return NextResponse.json({ data: [company] });
        }

        if (!body.keyword)
            return NextResponse.json({ data: [], error: 'ARES vyžaduje název firmy nebo IČO. Lokalita slouží jako upřesnění.' });

        // Full-text POST search
        const filter: Record<string, unknown> = { start: 0, pocet: 20, obchodniJmeno: body.keyword };
        if (body.location) filter.nazevObce = body.location;

        const res = await fetchWithTimeout(`${ARES_BASE}/ekonomicke-subjekty/vyhledat`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
            body: JSON.stringify(filter),
        });

        if (!res.ok) {
            console.error('ARES error:', res.status, await res.text());
            return NextResponse.json({ data: [], error: 'Chyba při dotazu na ARES.' });
        }

        const data = await res.json();
        let results: Company[] = (data.ekonomickeSubjekty ?? []).map(mapSubject);

        if (body.sector) results = results.filter(c => c.sector === body.sector);

        // Enrich all results in parallel
        const enriched = await Promise.allSettled(results.map(enrich));
        results = enriched.map((r, i) =>
            r.status === 'fulfilled' ? r.value : results[i]
        );

        return NextResponse.json({ data: results });
    } catch (error) {
        console.error('Search error:', error);
        return NextResponse.json({ data: [], error: 'Nepodařilo se zpracovat požadavek.' }, { status: 500 });
    }
}
