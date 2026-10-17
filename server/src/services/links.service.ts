const longURLMock = "https://www.google.com/";
const codeMock = "abc123";
const clicksMock = 123;

// ? TODO more detailed type for the code, e..g limit its length
// todo fix mock
// todo later add interface for 
export function getShortenURLStats(code: string) : { longURL: string; clicks: number } | null {
    if (code === 'missing') {
        return null
    }
    return {longURL: longURLMock, clicks: clicksMock};
}

export function createCode(longURL: string): string {
    return codeMock;
}

/**
 * return longURL, and increment click stat by 1
 */
export function resolveRedirect(code: string): string | null {
    if (code === 'missing') {
        return null
    }
    return longURLMock;
}