export function isObjectOrErrorWithMessage(x: unknown): x is { message: string } {
	if (typeof x !== 'object') return false;
	if (x === null) return false;
	return 'message' in x;
}
