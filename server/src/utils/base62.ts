import { randomInt } from "node:crypto";

const ALPHABET = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";

export function generateCode(length: number): string {
    let out = "";
    for (let i = 0; i < length; i++) {
        out += ALPHABET[randomInt(ALPHABET.length)];
    }
    return out;
}