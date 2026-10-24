import { InferSelectModel, SQL, Table } from 'drizzle-orm';
import { FilterOperationType, FilterOrder } from './filter.enum';

export type FilterColumn<T extends Table> = InferSelectModel<T>;

export interface IFilterTable {
  default: Table;
  [key: string]: Table;
}

// Generates a list of fields in the format: "column" (from default table) or "table.column" (from related tables)
export type IFieldPathMap<TTable extends IFilterTable> = {
  [K in keyof TTable]: K extends 'default'
    ? keyof InferSelectModel<TTable[K]> & string
    : `${Extract<K, string>}.${keyof InferSelectModel<TTable[K]> & string}`;
}[keyof TTable];

export type GeneratedFindOptions = {
  where?: SQL;
  offset: number;
  limit: number;
  orderBy: () => SQL[];
};

export interface IGeneratedFilter extends IFilter {
  findOptions: GeneratedFindOptions;
}

// ----------------------------
export interface IFilter<T = any> {
  filter?: Array<ISingleFilter<T>>;
  orFilter?: Array<ISingleFilter<T>>;
  order?: Array<ISingleOrder<T>>;
  offset: number;
  limit: number;
}

export interface ISingleFilter<T = any> {
  field: keyof T & string;
  type: FilterOperationType;
  value: any;
}

export interface ISingleOrder<T = any> {
  field: keyof T & string;
  dir: FilterOrder;
}
