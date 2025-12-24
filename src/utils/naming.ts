export const camel = (s: string) => {
  if (!s) return s;
  // Handle PascalCase to camelCase
  return s.charAt(0).toLowerCase() + s.slice(1);
};

export const pascal = (s: string) => {
  if (!s) return s;
  return s.charAt(0).toUpperCase() + s.slice(1);
};

// Convert snake_case or PascalCase to camelCase
export const toCamelCase = (str: string): string => {
  return str
    .replace(/(?:^\w|[A-Z]|\b\w)/g, (letter, index) => {
      return index === 0 ? letter.toLowerCase() : letter.toUpperCase();
    })
    .replace(/\s+|_|-/g, "");
};
