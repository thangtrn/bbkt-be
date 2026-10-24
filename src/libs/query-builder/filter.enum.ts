export enum FilterOperationType {
  Eq = 'Eq',
  Ne = 'Ne',
  Gt = 'Gt',
  Gte = 'Gte',
  Lt = 'Lt',
  Lte = 'Lte',
  In = 'In',
  NotIn = 'NotIn',
  Like = 'Like',
  NotLike = 'NotLike',
  ILike = 'ILike',
  NotILike = 'NotILike',
  StartsWith = 'StartsWith',
  EndsWith = 'EndsWith',
  IStartsWith = 'IStartsWith',
  IEndsWith = 'IEndsWith',
  NotStartsWith = 'NotStartsWith',
  NotEndsWith = 'NotEndsWith',
  NotIStartsWith = 'NotIStartsWith',
  NotIEndsWith = 'NotIEndsWith',
  Between = 'Between',
  NotBetween = 'NotBetween',
  IsNull = 'IsNull',
  IsNotNull = 'IsNotNull',
  ArrayContains = 'ArrayContains',
  ArrayContained = 'ArrayContained',
  ArrayOverlaps = 'ArrayOverlaps',
}

export type FilterOrder = 'asc' | 'desc';

export enum FilterOperationTypeGroup {
  String = 'string',
  Number = 'number',
  Date = 'date',
  Boolean = 'boolean',
  Array = 'array',
}
