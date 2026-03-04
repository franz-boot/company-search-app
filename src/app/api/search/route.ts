import { NextResponse } from 'next/server';
import { Company, EntityType, SearchParams, Sector } from '@/types';

// ─── Shared fetch helper ──────────────────────────────────────────────────────

function fetchWithTimeout(url: string, options: RequestInit = {}, ms = 10000): Promise<Response> {
    const ctrl = new AbortController();
    const tid = setTimeout(() => ctrl.abort(), ms);
    return fetch(url, { ...options, signal: ctrl.signal }).finally(() => clearTimeout(tid));
}

// ─── City → RUIAN kodObce mapping ─────────────────────────────────────────────
// kodObce = RÚIAN municipality code, the only working ARES city filter.
// Keys are normalised (lowercase, NFD stripped, diacritics removed).

const CITY_KODOBCE: Record<string, number> = {
    'praha':               554782,
    'brno':                582786,
    'ostrava':             554821,
    'plzen':               554791,
    'liberec':             563889,
    'olomouc':             500496,
    'usti nad labem':      568261,
    'ceske budejovice':    544256,
    'hradec kralove':      569810,
    'pardubice':           555134,
    'zlin':                585068,
    'havirov':             598011,
    'kladno':              532053,
    'most':                567027,
    'opava':               505927,
    'frydek-mistek':       598003,
    'frydek mistek':       598003,
    'karvina':             598879,
    'jihlava':             586846,
    'teplice':             567647,
    'decin':               546771,
    'chomutov':            563048,
    'jablonec nad nisou':  563510,
    'mlada boleslav':      535419,
    'prostejov':           589250,
    'prerov':              511382,
    'ceska lipa':          561380,
    'trebic':              590266,
    'trinec':              598810,
    'znojmo':              593711,
    'kolin':               533165,
    'pribram':             539911,
    'cheb':                560286,
    'trutnov':             579297,
    'pisek':               549576,
    'kromeriz':            588296,
    'vsetin':              545058,
    'sumperk':             539791,
    'hodonin':             586064,
    'tabor':               552046,
    'novy jicin':          599191,
    'nymburk':             537004,
    'sokolov':             560731,
    'uherske hradiste':    592005,
    'benesov':             530034,
    'beroun':              531154,
    'blansko':             581283,
    'bruntal':             597180,
    'cesky krumlov':       545392,
    'domazlice':           547301,
    'havlickuv brod':      568740,
    'chrudim':             571164,
    'jicin':               572659,
    'jindrichuv hradec':   547034,
    'klatovy':             557421,
    'kutna hora':          533955,
    'louny':               565962,
    'melnik':              535087,
    'nachod':              574198,
    'strakonice':          551511,
    'svitavy':             578291,
    'uhersky brod':        592731,
    'vyskov':              593265,
    'zabreb':              535672,
    'zdar nad sazavou':    595209,
    'zatec':               566934,
    'litvínov':            567451,
    'litvinov':            567451,
};

// ─── City normalisation helpers ───────────────────────────────────────────────

function normalizeCity(s: string): string {
    return s
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .trim();
}

function getKodObce(location: string): number | null {
    if (!location) return null;
    const key = normalizeCity(location);
    return CITY_KODOBCE[key] ?? null;
}

// ─── NACE → Sector mapping ────────────────────────────────────────────────────

function naceToSector(codes: string[]): Sector {
    if (!codes || codes.length === 0) return 'Other';
    const prefix = parseInt(
        (codes[0] ?? '').replace(/\D/g, '').slice(0, 2),
        10
    );
    if ([58, 59, 62, 63].includes(prefix)) return 'IT';
    if ([64, 65, 66].includes(prefix)) return 'Finance';
    if ([86, 87, 88].includes(prefix)) return 'Healthcare';
    if (prefix >= 45 && prefix <= 47) return 'Retail';
    if (prefix >= 10 && prefix <= 35) return 'Manufacturing';
    return 'Other';
}

// ─── Misc helpers ─────────────────────────────────────────────────────────────

function formatZip(raw?: string | number): string {
    if (raw == null) return '';
    const s = String(raw).replace(/\s/g, '');
    if (s.length === 5) return `${s.slice(0, 3)} ${s.slice(3)}`;
    return s;
}

// ─── ARES types ───────────────────────────────────────────────────────────────

interface AresSidlo {
    nazevObce?: string;
    nazevUlice?: string;
    cisloDomovni?: number;
    psc?: string | number;
    kodObce?: number;
}

interface AresSubjekt {
    ico: string;
    obchodniJmeno: string;
    sidlo?: AresSidlo;
    czNace2008?: string[];
}

interface AresResponse {
    ekonomickeSubjekty?: AresSubjekt[];
    pocetCelkem?: number;
}

// ─── ARES search ──────────────────────────────────────────────────────────────

const ARES_URL =
    'https://ares.gov.cz/ekonomicke-subjekty-v-be/rest/ekonomicke-subjekty/vyhledat';

async function searchAres(
    keyword: string,
    kodObce: number | null,
    count = 20,
    legalForms: string[] | null = null
): Promise<AresSubjekt[]> {
    const body: Record<string, unknown> = {
        obchodniJmeno: keyword,
        start: 0,
        pocet: count,
    };
    if (kodObce != null) {
        body.sidlo = { kodObce };
    }
    if (legalForms && legalForms.length > 0) {
        body.pravniForma = legalForms;
    }
    try {
        const res = await fetchWithTimeout(
            ARES_URL,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
                body: JSON.stringify(body),
            },
            12000
        );
        if (!res.ok) return [];
        const data: AresResponse = await res.json();
        return data.ekonomickeSubjekty ?? [];
    } catch {
        return [];
    }
}

// ─── Seed configs per entity type ─────────────────────────────────────────────

interface SeedConfig {
    seeds: string[];
    legalForms: string[] | null;
}

const SEED_CONFIGS: Record<EntityType, SeedConfig> = {
    company: {
        seeds: ['tech', 'group', 'invest', 'digital', 'holding', 'servis', 'trade', 'solutions', 'development', 'systems'],
        legalForms: null,
    },
    sports_club: {
        seeds: ['sport', 'fotbal', 'hokej', 'tenis', 'volejbal', 'basketbal', 'atletika', 'SK', 'FK', 'TJ', 'klub', 'HC'],
        legalForms: ['701', '721'],
    },
    association: {
        seeds: ['spolek', 'sdružení', 'centrum', 'kulturní', 'vzdělávací', 'ekologie', 'komunitní', 'mládež', 'přátelé', 'zájmový'],
        legalForms: ['701', '721'],
    },
    union: {
        seeds: ['svaz', 'asociace', 'unie', 'federace', 'komora', 'aliance', 'konfederace', 'sdružení'],
        legalForms: ['701', '711', '715', '721'],
    },
};

// ─── Multi-seed search ────────────────────────────────────────────────────────

async function searchAresMultiSeed(
    kodObce: number | null,
    seeds: string[],
    legalForms: string[] | null,
    total = 100
): Promise<AresSubjekt[]> {
    const perSeed = Math.ceil(total / seeds.length);
    const results = await Promise.all(
        seeds.map(seed => searchAres(seed, kodObce, perSeed, legalForms))
    );
    const seen = new Set<string>();
    const merged: AresSubjekt[] = [];
    for (const batch of results) {
        for (const s of batch) {
            if (!seen.has(s.ico)) {
                seen.add(s.ico);
                merged.push(s);
            }
        }
    }
    return merged.slice(0, total);
}

// ─── kurzy.cz enrichment ──────────────────────────────────────────────────────

interface Enriched {
    phone: string;
    website: string;
    email: string;
}

async function enrichFromKurzy(ico: string): Promise<Enriched> {
    const empty: Enriched = { phone: '', website: '', email: '' };
    try {
        const res = await fetchWithTimeout(
            `https://rejstrik-firem.kurzy.cz/${ico}/`,
            {
                headers: {
                    'User-Agent':
                        'Mozilla/5.0 (compatible; CompanySearchBot/1.0)',
                    Accept: 'text/html',
                },
            },
            4000
        );
        if (!res.ok) return empty;
        const html = await res.text();

        // Website — look for "WWW:" label then first href within ~400 chars
        let website = '';
        const wwwIdx = html.indexOf('WWW:');
        if (wwwIdx !== -1) {
            const snippet = html.slice(wwwIdx, wwwIdx + 400);
            const match = snippet.match(/href="(https?:\/\/[^"]+)"/);
            if (match) website = match[1];
        }

        // Phone — first tel: link
        const telMatch = html.match(/href="tel:([^"]+)"/);
        const phone = telMatch ? telMatch[1].trim() : '';

        // Email — first mailto: link
        const mailMatch = html.match(/href="mailto:([^"]+)"/);
        const email = mailMatch ? mailMatch[1].trim() : '';

        return { phone, website, email };
    } catch {
        return empty;
    }
}

// ─── Map ARES → Company ───────────────────────────────────────────────────────

let _idCounter = 0;

function mapAresCompany(ares: AresSubjekt, enriched: Enriched): Company {
    const sidlo = ares.sidlo ?? {};
    const city = sidlo.nazevObce ?? '';
    const street = sidlo.nazevUlice
        ? `${sidlo.nazevUlice}${sidlo.cisloDomovni ? ' ' + sidlo.cisloDomovni : ''}`
        : sidlo.cisloDomovni
        ? String(sidlo.cisloDomovni)
        : '';
    const zip = formatZip(sidlo.psc);

    return {
        id: `ares-${ares.ico}-${++_idCounter}`,
        name: ares.obchodniJmeno,
        ico: ares.ico,
        location: {
            city,
            street,
            zip,
        },
        employeeCount: '',
        sector: naceToSector(ares.czNace2008 ?? []),
        contact: {
            email: enriched.email,
            phone: enriched.phone,
            website: enriched.website,
        },
        socialLinks: {
            linkedin: `https://www.linkedin.com/search/results/companies/?keywords=${encodeURIComponent(ares.obchodniJmeno)}`,
        },
    };
}

// ─── POST handler ─────────────────────────────────────────────────────────────

export async function POST(request: Request) {
    try {
        const params: SearchParams = await request.json();
        const location = (params.location ?? '').trim();
        const keyword = (params.keyword ?? '').trim();
        const entityType: EntityType = params.entityType ?? 'company';
        const kodObce = getKodObce(location);

        const config = SEED_CONFIGS[entityType];

        // Decide on ARES call strategy
        let aresResults: AresSubjekt[];

        if (keyword) {
            // Keyword provided — single targeted search
            aresResults = await searchAres(keyword, kodObce, 100, config.legalForms);
        } else if (location) {
            // Location only — multi-seed search
            aresResults = await searchAresMultiSeed(kodObce, config.seeds, config.legalForms, 100);
        } else {
            return NextResponse.json({
                data: [],
                error: 'Zadejte lokalitu nebo klíčové slovo.',
            });
        }

        // Post-filter by city name when kodObce was not found
        if (location && kodObce === null) {
            const normLoc = normalizeCity(location);
            aresResults = aresResults.filter(s => {
                const normCity = normalizeCity(s.sidlo?.nazevObce ?? '');
                return normCity.includes(normLoc) || normLoc.includes(normCity);
            });
        }

        // Cap at 100
        const capped = aresResults.slice(0, 100);

        // Parallel enrichment from kurzy.cz
        const enriched = await Promise.all(
            capped.map(s => enrichFromKurzy(s.ico))
        );

        const companies: Company[] = capped.map((s, i) =>
            mapAresCompany(s, enriched[i])
        );

        return NextResponse.json({ data: companies });
    } catch (err) {
        console.error('[search] Error:', err);
        return NextResponse.json(
            { data: [], error: 'Chyba při vyhledávání.' },
            { status: 500 }
        );
    }
}
