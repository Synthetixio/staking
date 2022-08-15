export function isObjectOrErrorWithMessage(x: unknown): x is { message: string } {
  if (typeof x !== 'object') return false;
  if (x === null) return false;
  return 'message' in x;
}
export function notNill<Value>(value: Value | null | undefined): value is Value {
  return value !== null && value !== undefined;
}

export type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;
export type PartialBy<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
