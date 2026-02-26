import { NextResponse } from 'next/server';

const NOMINATIM = 'https://nominatim.openstreetmap.org/reverse';

/**
 * GET /api/geocode?lat=<number>&lon=<number>
 *
 * Proxies Nominatim reverse-geocoding so we can set a valid User-Agent header
 * server-side (browsers reject / silently ignore the User-Agent header for
 * security reasons, and Nominatim requires it per its usage policy).
 */
export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const lat = searchParams.get('lat');
    const lon = searchParams.get('lon');

    if (!lat || !lon) {
        return NextResponse.json({ error: 'lat and lon are required' }, { status: 400 });
    }

    // Reject non-numeric values to prevent SSRF / header injection.
    if (isNaN(Number(lat)) || isNaN(Number(lon))) {
        return NextResponse.json({ error: 'Invalid coordinates' }, { status: 400 });
    }

    try {
        const controller = new AbortController();
        const tid = setTimeout(() => controller.abort(), 5000);
        const res = await fetch(
            `${NOMINATIM}?lat=${lat}&lon=${lon}&format=json&accept-language=cs`,
            {
                signal: controller.signal,
                headers: {
                    'User-Agent': 'company-search-app/1.0',
                    Accept: 'application/json',
                },
            }
        );
        clearTimeout(tid);

        if (!res.ok) {
            return NextResponse.json(
                { error: 'Nominatim returned an error' },
                { status: res.status }
            );
        }

        const data = await res.json();
        return NextResponse.json(data);
    } catch {
        return NextResponse.json({ error: 'Geocoding failed' }, { status: 500 });
    }
}
