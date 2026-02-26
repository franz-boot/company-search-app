export type Sector = "IT" | "Finance" | "Manufacturing" | "Retail" | "Healthcare" | "Other";

export interface Company {
    id: string;
    name: string;
    ico: string; // Czech Identification Number
    location: {
        city: string;
        street: string;
        zip: string;
    };
    employeeCount: string; // e.g., "1-10", "11-50", "50+"
    sector: Sector;
    contact: {
        email: string;
        phone: string;
        website: string;
    };
    socialLinks: {
        linkedin?: string;
        twitter?: string;
    };
}

export interface SearchParams {
    location?: string;
    employeeCount?: string;
    sector?: Sector | "";
    keyword?: string;
}
