export function isObjectOrErrorWithMessage(x: unknown): x is { message: string } {
	if (typeof x !== 'object') return false;
	if (x === null) return false;
	return 'message' in x;
}
export function notNill<Value>(value: Value | null | undefined): value is Value {
	return value !== null && value !== undefined;
}
