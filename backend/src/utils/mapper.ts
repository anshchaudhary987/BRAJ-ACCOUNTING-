/**
 * Utility to convert string to snake_case.
 */
export function toSnakeCase(str: string): string {
  return str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
}

/**
 * Utility to convert string to camelCase.
 */
export function toCamelCase(str: string): string {
  return str.replace(/([-_][a-z])/g, group =>
    group
      .toUpperCase()
      .replace('-', '')
      .replace('_', '')
  );
}

/**
 * Maps keys of an object to snake_case.
 */
export function mapKeysToSnakeCase(obj: Record<string, any>): Record<string, any> {
  const result: Record<string, any> = {};
  for (const key in obj) {
    result[toSnakeCase(key)] = obj[key];
  }
  return result;
}

/**
 * Maps keys of an object to camelCase.
 */
export function mapKeysToCamelCase(obj: Record<string, any>): Record<string, any> {
  const result: Record<string, any> = {};
  for (const key in obj) {
    result[toCamelCase(key)] = obj[key];
  }
  return result;
}
