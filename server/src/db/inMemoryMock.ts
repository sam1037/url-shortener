//todo better name
export interface Link {
    longURL: string;
    clicks: number;
    createdAt: Date;
}

export const inMemoryDb = new Map<string, Link>();