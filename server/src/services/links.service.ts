import { generateCode } from "../utils/base62.js"
import { inMemoryDb, type Link } from "../db/inMemoryMock.js"
import { config } from "../config.js";

// ? TODO more detailed type for the code, e..g limit its length
// todo fix mock
// todo later add interface for stat?
export function getLinkStats(code: string) : { longURL: string; clicks: number } | null {
    const link = inMemoryDb.get(code);
    if (!link) {
        return null;
    }

    return {longURL: link.longURL, clicks: link.clicks};
}

function generateUniqueCode(maxTries: number): string {
  for (let i = 0; i < maxTries; i++) {
    const code = generateCode(config.codeLength);
    if (!inMemoryDb.has(code)) return code;
  }
  throw new Error(`Failed to generate unique code after ${maxTries} tries`);
}

/**
 * Create shortenURL code and update db/ redis
 * @param longURL 
 * @returns 
 */
export function createLink(longURL: string): string {
    const maxTries = 5
    const code = generateUniqueCode(maxTries);

    // ? call an util?
    const link: Link = {
        longURL: longURL,
        clicks: 0,
        createdAt: new Date()
    }
    inMemoryDb.set(code, link);

    return code;
}

/**
 * return longURL, and increment click stat by 1
 */
export function resolveLink(code: string): string | null {
    // validate
    const link = inMemoryDb.get(code);
    if (!link) {
        return null;
    }

    // inc
    link.clicks += 1; //? 

    // return 
    return link.longURL
}