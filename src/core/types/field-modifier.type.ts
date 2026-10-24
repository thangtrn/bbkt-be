export type Simplify<T> = { [K in keyof T]: T[K] };

export type RequireFields<T, K extends keyof T> = Omit<T, K> & {
  [P in K]-?: NonNullable<T[P]>;
};

export type PartialFields<T, K extends keyof T> = Omit<T, K> & {
  [P in K]?: T[P];
};
