import { NextResponse } from 'next/server';
import { Company, SearchParams, Sector } from '@/types';

// ─── Shared fetch helper ──────────────────────────────────────────────────────

function fetchWithTimeout(url: string, options: RequestInit = {}, ms = 10000): Promise<Response> {
    const ctrl = new AbortController();
    const tid = setTimeout(() => ctrl.abort(), ms);
    return fetch(url, { ...options, signal: ctrl.signal }).finally(() => clearTimeout(tid));
}

// ─── Sector inference ─────────────────────────────────────────────────────────

const SECTOR_KEYWORDS: { sector: Sector; words: string[] }[] = [
    {
        sector: 'IT',
        words: [
            'software', ' it ', 'technolog', 'vývoj', 'programov', 'webov', 'aplikac',
            'cloud', 'datov', 'umělá intelig', 'kybernetick', 'digital', 'počítač',
            'informační', 'hosting', 'sítě', 'server', 'saas', 'devops',
        ],
    },
    {
        sector: 'Finance',
        words: [
            'banka', 'pojišt', 'investic', 'financ', 'účetní', 'daňov',
            'leasing', 'audit', 'burza', 'fond', 'úvěr', 'spořit', 'pojistov',
        ],
    },
    {
        sector: 'Healthcare',
        words: [
            'zdraví', 'nemocnic', 'lékař', 'lékárn', 'ordinac', 'klinik',
            'farmac', 'dental', 'zubn', 'terapeut', 'rehabilit', 'optik',
            'veterinár', 'zdravotn',
        ],
    },
    {
        sector: 'Manufacturing',
        words: [
            'výrob', 'průmysl', 'strojír', 'slévár', 'kovov', 'montáž',
            'hutní', 'chemick', 'plasty', 'tiskár', 'polygraf', 'zpracov',
        ],
    },
    {
        sector: 'Retail',
        words: [
            'prodej', 'obchod', 'maloobchod', 'e-shop', 'eshop',
            'velkoobchod', 'prodejna', 'nákup', 'zboží', 'shop', 'prodejn',
        ],
    },
];

function inferSector(text: string): Sector {
    const lower = ` ${text.toLowerCase()} `;
    const scores: Partial<Record<Sector, number>> = {};

    for (const { sector, words } of SECTOR_KEYWORDS) {
        for (const word of words) {
            if (lower.includes(word)) {
                scores[sector] = (scores[sector] ?? 0) + 1;
            }
        }
    }

    let best: Sector = 'Other';
    let bestScore = 0;
    for (const s of ['IT', 'Finance', 'Healthcare', 'Manufacturing', 'Retail'] as Sector[]) {
        const score = scores[s] ?? 0;
        if (score > bestScore) {
            bestScore = score;
            best = s;
        }
    }
    return best;
}

// ─── firmy.cz JSON-LD types ───────────────────────────────────────────────────

interface FirmyAddress {
    streetAddress?: string;
    addressLocality?: string;
    postalCode?: string;
}

interface FirmyLd {
    '@type'?: string;
    name?: string;
    url?: string;
    sameAs?: string | string[];
    telephone?: string;
    description?: string;
    address?: FirmyAddress;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatZip(raw?: string): string {
    if (!raw) return '';
    const digits = raw.replace(/\D/g, '').padStart(5, '0');
    return `${digits.slice(0, 3)} ${digits.slice(3)}`;
}

/** Extract firmy.cz numeric ID from detail URL, e.g. /detail/12777240-company.html → "12777240" */
function extractFirmyId(url?: string): string {
    if (!url) return '';
    const m = url.match(/\/detail\/(\d+)-/);
    return m ? m[1] : '';
}

/** Return the company's own website from sameAs — ignore firmy.cz URLs. */
function extractWebsite(sameAs?: string | string[]): string {
    if (!sameAs) return '';
    const list = Array.isArray(sameAs) ? sameAs : [sameAs];
    for (const u of list) {
        if (u && !u.includes('firmy.cz')) return u;
    }
    return '';
}

/** "Praha, Nusle" → "Praha" */
function extractCity(addressLocality?: string): string {
    if (!addressLocality) return '';
    return addressLocality.split(',')[0].trim();
}

// ─── firmy.cz scraper ─────────────────────────────────────────────────────────

const BROWSER_UA =
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 ' +
    '(KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36';

const FIRMY_HEADERS = {
    'User-Agent': BROWSER_UA,
    Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
    'Accept-Language': 'cs-CZ,cs;q=0.9,en;q=0.5',
    'Accept-Encoding': 'gzip, deflate, br',
    Referer: 'https://www.firmy.cz/',
};

function parseLdItems(html: string): FirmyLd[] {
    const results: FirmyLd[] = [];
    const ldRe = /<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
    let match: RegExpExecArray | null;
    while ((match = ldRe.exec(html)) !== null) {
        try {
            const parsed = JSON.parse(match[1]) as Record<string, unknown>;
            const items: unknown[] = Array.isArray(parsed['@graph'])
                ? (parsed['@graph'] as unknown[])
                : [parsed];
            for (const item of items) {
                const ld = item as FirmyLd;
                if (ld['@type'] === 'LocalBusiness' || ld['@type'] === 'Organization') {
                    results.push(ld);
                }
            }
        } catch {
            // skip malformed JSON-LD blocks
        }
    }
    return results;
}

async function fetchFirmyPage(location: string, page: number): Promise<FirmyLd[]> {
    // firmy.cz requires q= (even empty) for locality filter to work correctly
    const qs = new URLSearchParams({ q: '', locality: location });
    if (page > 1) qs.set('page', String(page));
    const url = `https://www.firmy.cz/?${qs.toString()}`;

    let res: Response;
    try {
        res = await fetchWithTimeout(url, { headers: FIRMY_HEADERS }, 13000);
    } catch (err) {
        console.error(`firmy.cz page ${page} fetch failed:`, err);
        return [];
    }
    if (!res.ok) {
        console.error(`firmy.cz page ${page} HTTP error:`, res.status);
        return [];
    }
    return parseLdItems(await res.text());
}

/** Fetch at least `targetCount` unique LocalBusiness items for a locality. */
async function searchFirmy(location: string, targetCount = 25): Promise<FirmyLd[]> {
    const seen = new Set<string>();
    const all: FirmyLd[] = [];

    const addItems = (items: FirmyLd[]) => {
        for (const item of items) {
            const key = item.name ?? item.url ?? '';
            if (key && !seen.has(key)) {
                seen.add(key);
                all.push(item);
            }
        }
    };

    // Fetch pages 1 & 2 in parallel for speed
    const [p1, p2] = await Promise.all([
        fetchFirmyPage(location, 1),
        fetchFirmyPage(location, 2),
    ]);
    addItems(p1);
    addItems(p2);

    // If still under target, fetch page 3
    if (all.length < targetCount) {
        addItems(await fetchFirmyPage(location, 3));
    }

    return all;
}

// ─── Map JSON-LD → Company ────────────────────────────────────────────────────

function mapFirmyLd(ld: FirmyLd): Company {
    const detailUrl = typeof ld.url === 'string'
        ? ld.url
        : (Array.isArray(ld.sameAs) ? ld.sameAs[0] : (ld.sameAs ?? ''));

    const id = extractFirmyId(detailUrl);
    const name = ld.name ?? '';
    const inferText = `${name} ${ld.description ?? ''}`;

    return {
        id: id || name,
        name,
        ico: id,           // firmy.cz numeric ID used as ICO placeholder
        location: {
            city: extractCity(ld.address?.addressLocality),
            street: ld.address?.streetAddress ?? '',
            zip: formatZip(ld.address?.postalCode),
        },
        employeeCount: '',
        sector: inferSector(inferText),
        contact: {
            email: '',
            phone: ld.telephone ?? '',
            website: extractWebsite(ld.sameAs),
        },
        socialLinks: {},
    };
}

// ─── Route handler ────────────────────────────────────────────────────────────

const SECTOR_ORDER: Record<string, number> = {
    IT: 0, Finance: 1, Healthcare: 2, Manufacturing: 3, Retail: 4, Other: 5,
};

export async function POST(request: Request) {
    try {
        const body: SearchParams = await request.json();
        const location = body.location?.trim() ?? '';

        if (!location) {
            return NextResponse.json({
                data: [],
                error: 'Zadejte lokalitu pro vyhledávání.',
            });
        }

        const ldItems = await searchFirmy(location);
        const results: Company[] = ldItems.map(mapFirmyLd);

        // Sort by sector priority, then alphabetically by name
        results.sort((a, b) => {
            const sd = (SECTOR_ORDER[a.sector] ?? 5) - (SECTOR_ORDER[b.sector] ?? 5);
            return sd !== 0 ? sd : a.name.localeCompare(b.name, 'cs');
        });

        return NextResponse.json({ data: results });
    } catch (error) {
        console.error('Search error:', error);
        return NextResponse.json(
            { data: [], error: 'Nepodařilo se zpracovat požadavek.' },
            { status: 500 },
        );
    }
}
