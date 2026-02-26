import { NextResponse } from 'next/server';
import { Company, SearchParams } from '@/types';

// Realistická mock data
const mockCompanies: Company[] = [
    {
        id: "uuid-1",
        name: "TechNova Solutions s.r.o.",
        ico: "12345678",
        location: { city: "Praha", street: "Václavské náměstí 1", zip: "110 00" },
        employeeCount: "11-50",
        sector: "IT",
        contact: { email: "info@technova.cz", phone: "+420 123 456 789", website: "https://technova.example.com" },
        socialLinks: { linkedin: "https://linkedin.com/company/technova-solutions" }
    },
    {
        id: "uuid-2",
        name: "FinSecure a.s.",
        ico: "87654321",
        location: { city: "Brno", street: "Česká 10", zip: "602 00" },
        employeeCount: "50+",
        sector: "Finance",
        contact: { email: "kontakt@finsecure.cz", phone: "+420 987 654 321", website: "https://finsecure.example.com" },
        socialLinks: {}
    },
    {
        id: "uuid-3",
        name: "Kovosport Praha",
        ico: "11223344",
        location: { city: "Praha", street: "Sportovní 5", zip: "140 00" },
        employeeCount: "1-10",
        sector: "Other",
        contact: { email: "info@kovosport.cz", phone: "+420 111 222 333", website: "https://kovosport.example.com" },
        socialLinks: { twitter: "https://twitter.com/kovosport" }
    },
    {
        id: "uuid-4",
        name: "DataMinds CZ",
        ico: "99887766",
        location: { city: "Ostrava", street: "Porubská 120", zip: "708 00" },
        employeeCount: "11-50",
        sector: "IT",
        contact: { email: "hello@dataminds.cz", phone: "+420 555 666 777", website: "https://dataminds.example.com" },
        socialLinks: { linkedin: "https://linkedin.com/company/dataminds" }
    },
    {
        id: "uuid-5",
        name: "MediCare Plus",
        ico: "55443322",
        location: { city: "Praha", street: "Nemocniční 8", zip: "120 00" },
        employeeCount: "50+",
        sector: "Healthcare",
        contact: { email: "recepce@medicareplus.cz", phone: "+420 222 333 444", website: "https://medicareplus.example.com" },
        socialLinks: {}
    }
];

export async function POST(request: Request) {
    try {
        const body: SearchParams = await request.json();

        // Simulace zpoždění sítě (např. z REST API / Scrapingu)
        await new Promise(resolve => setTimeout(resolve, 800));

        let results = [...mockCompanies];

        if (body.keyword) {
            const keywordLower = body.keyword.toLowerCase();
            results = results.filter(c =>
                c.name.toLowerCase().includes(keywordLower) ||
                c.ico.includes(body.keyword!)
            );
        }

        if (body.location) {
            const locLower = body.location.toLowerCase();
            results = results.filter(c => c.location.city.toLowerCase().includes(locLower));
        }

        if (body.sector) {
            results = results.filter(c => c.sector === body.sector);
        }

        if (body.employeeCount && body.employeeCount !== "all") {
            results = results.filter(c => c.employeeCount === body.employeeCount);
        }

        return NextResponse.json({ data: results });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to process search request' }, { status: 500 });
    }
}
