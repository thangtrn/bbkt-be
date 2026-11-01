import * as expressions from 'angular-expressions';

type DataRecord = Record<string, any>;

interface GroupResult {
  index: number;
  key: string;
  value: DataRecord[];
  count: number;
}

// GROUP BY
expressions.filters.groupBy = (
  items: DataRecord[],
  property: string,
): GroupResult[] => {
  if (!Array.isArray(items)) return [];

  const groups = new Map<string, DataRecord[]>();

  for (const item of items) {
    const key = String(item[property] ?? '');

    if (!groups.has(key)) {
      groups.set(key, []);
    }

    groups.get(key)!.push(item);
  }

  return Array.from(groups, ([key, value], index) => ({
    index: index + 1,
    key,
    value,
    count: value.length,
  }));
};

// COUNT BY
expressions.filters.countBy = (
  items: DataRecord[],
  property: string,
  expected: any,
): number => {
  if (!Array.isArray(items)) return 0;

  return items.filter(
    (item) => String(item[property] ?? '') === String(expected ?? ''),
  ).length;
};

// COUNT NOT EMPTY
expressions.filters.countNotEmpty = (
  items: DataRecord[],
  property: string,
): number => {
  if (!Array.isArray(items)) return 0;

  return items.filter(
    (item) =>
      item[property] !== null &&
      item[property] !== undefined &&
      String(item[property]).trim() !== '',
  ).length;
};

// COUNT
expressions.filters.count = (items: any[]): number => {
  return Array.isArray(items) ? items.length : 0;
};

// SUM
expressions.filters.sum = (items: DataRecord[], property: string): number => {
  if (!Array.isArray(items)) return 0;

  return items.reduce(
    (total, item) => total + (Number(item[property]) || 0),
    0,
  );
};

// AVG
expressions.filters.avg = (items: DataRecord[], property: string): number => {
  if (!Array.isArray(items) || items.length === 0) return 0;

  return (
    items.reduce((total, item) => total + (Number(item[property]) || 0), 0) /
    items.length
  );
};

// FILTER BY
expressions.filters.filterBy = (
  items: DataRecord[],
  property: string,
  expected: any,
): DataRecord[] => {
  if (!Array.isArray(items)) return [];

  return items.filter(
    (item) => String(item[property] ?? '') === String(expected ?? ''),
  );
};

// SORT BY
expressions.filters.sortBy = (
  items: DataRecord[],
  property: string,
  direction = 'asc',
): DataRecord[] => {
  if (!Array.isArray(items)) return [];

  return [...items].sort((a, b) => {
    const left = a[property];
    const right = b[property];

    const result =
      typeof left === 'number' && typeof right === 'number'
        ? left - right
        : String(left ?? '').localeCompare(String(right ?? ''), 'vi');

    return direction === 'desc' ? -result : result;
  });
};

// UPPERCASE
expressions.filters.uppercase = (value: any): string => {
  return String(value ?? '').toUpperCase();
};

// LOWERCASE
expressions.filters.lowercase = (value: any): string => {
  return String(value ?? '').toLowerCase();
};

// PROPERCASE
expressions.filters.propercase = (value: any): string => {
  return String(value ?? '')
    .toLowerCase()
    .replace(/(^|\s)\S/g, (char) => char.toUpperCase());
};

export const angularParser = (tag: string) => {
  const expr = expressions.compile(tag);

  return {
    get(scope: Record<string, any>) {
      return expr(scope);
    },
  };
};
