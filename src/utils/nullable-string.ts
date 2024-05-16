export function nullableString(val: any): string | null {
    return val && typeof val === "string" ? val : null;
}
