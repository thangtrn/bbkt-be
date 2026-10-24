import {
  and,
  AnyColumn,
  arrayContained,
  arrayContains,
  arrayOverlaps,
  asc,
  between,
  Column,
  desc,
  eq,
  gt,
  gte,
  ilike,
  inArray,
  isNotNull,
  isNull,
  like,
  lt,
  lte,
  ne,
  not,
  notBetween,
  notInArray,
  or,
  SQL,
} from 'drizzle-orm';
import { FilterOperationType, FilterOperationTypeGroup } from './filter.enum';
import { FilterException } from './filter.exception';
import {
  GeneratedFindOptions,
  IFieldPathMap,
  IFilter,
  IFilterTable,
  ISingleFilter,
} from './filter.interface';

export class FilterParser<TTable extends IFilterTable> {
  private readonly operatorTypeMap: Record<
    FilterOperationTypeGroup,
    Set<FilterOperationType>
  > = {
    string: new Set([
      FilterOperationType.Eq,
      FilterOperationType.Ne,
      FilterOperationType.Like,
      FilterOperationType.NotLike,
      FilterOperationType.ILike,
      FilterOperationType.NotILike,
      FilterOperationType.In,
      FilterOperationType.NotIn,
      FilterOperationType.IsNull,
      FilterOperationType.IsNotNull,
      FilterOperationType.StartsWith,
      FilterOperationType.EndsWith,
      FilterOperationType.IStartsWith,
      FilterOperationType.IEndsWith,
      FilterOperationType.NotStartsWith,
      FilterOperationType.NotEndsWith,
      FilterOperationType.NotIStartsWith,
      FilterOperationType.NotIEndsWith,
    ]),
    number: new Set([
      FilterOperationType.Eq,
      FilterOperationType.Ne,
      FilterOperationType.Gt,
      FilterOperationType.Gte,
      FilterOperationType.Lt,
      FilterOperationType.Lte,
      FilterOperationType.In,
      FilterOperationType.NotIn,
      FilterOperationType.Between,
      FilterOperationType.NotBetween,
      FilterOperationType.IsNull,
      FilterOperationType.IsNotNull,
    ]),
    date: new Set([
      FilterOperationType.Eq,
      FilterOperationType.Ne,
      FilterOperationType.Gt,
      FilterOperationType.Gte,
      FilterOperationType.Lt,
      FilterOperationType.Lte,
      FilterOperationType.In,
      FilterOperationType.NotIn,
      FilterOperationType.Between,
      FilterOperationType.NotBetween,
      FilterOperationType.IsNull,
      FilterOperationType.IsNotNull,
    ]),
    boolean: new Set([
      FilterOperationType.Eq,
      FilterOperationType.Ne,
      FilterOperationType.IsNull,
      FilterOperationType.IsNotNull,
    ]),
    array: new Set([
      FilterOperationType.ArrayContains,
      FilterOperationType.ArrayContained,
      FilterOperationType.ArrayOverlaps,
    ]),
  };

  groups: Record<FilterOperationTypeGroup, string[]> = {
    [FilterOperationTypeGroup.Number]: [
      'int', // integer, smallint, bigint, serial, smallserial, bigserial, MySQL int
      'numeric', // numeric, decimal
      'real', // real
      'double', // double precision, double
      'float', // float
    ],
    [FilterOperationTypeGroup.Boolean]: [
      'bool', // bool, boolean
    ],
    [FilterOperationTypeGroup.Date]: [
      'date', // date, localdate
      'time', // time, localtime
      'timestamp', // timestamp, datetime, localdatetime
      'interval', // interval, duration, relduration
      'year', // MySQL year
    ],
    [FilterOperationTypeGroup.Array]: [
      'array', // Postgres array
    ],
    [FilterOperationTypeGroup.String]: [
      'char', // char, varchar
      'text', // text
      'json', // json, jsonb
      'uuid', // uuid
      'blob', // sqlite blob
      'string', // generic
      'custom', // custom
      'buffer', // buffer
    ],
  };

  constructor(private readonly mapping: TTable) {}

  public generateQueryFindOptions(
    filterDto: IFilter<IFieldPathMap<TTable>>,
  ): GeneratedFindOptions {
    const { filter = [], orFilter = [], order = [], limit, offset } = filterDto;

    const andConditions = filter
      .map((f) => this.buildCondition(f))
      .filter(Boolean);

    const orConditions = orFilter
      .map((f) => this.buildCondition(f))
      .filter(Boolean);

    const whereClause =
      andConditions.length && orConditions.length
        ? and(...andConditions, or(...orConditions))
        : andConditions.length
          ? and(...andConditions)
          : orConditions.length
            ? or(...orConditions)
            : undefined;

    const orderBy: SQL<AnyColumn>[] = order.map((o) => {
      const column = this.resolveField(o.field);
      return o.dir === 'asc'
        ? (asc(column) as SQL<AnyColumn>)
        : (desc(column) as SQL<AnyColumn>);
    });

    const orderByWrapper = () => orderBy;

    return {
      where: whereClause,
      orderBy: orderByWrapper,
      limit,
      offset,
    };
  }

  private buildCondition(
    filter: ISingleFilter<IFieldPathMap<TTable>>,
  ): SQL | undefined {
    const column = this.resolveField(filter.field);
    const dataType = this.resolveDataType(column);

    if (!this.operatorTypeMap[dataType]?.has(filter.type)) {
      throw new FilterException({
        field: filter.field,
        value: filter.value,
        message: `Operator '${filter.type}' is not valid for type '${dataType}' (field: ${filter.field})`,
      });
    }

    let value = this.validateAndParseValue(filter, dataType);

    switch (filter.type) {
      // === BASIC COMPARISONS ===
      case FilterOperationType.Eq:
        return eq(column, value);
      case FilterOperationType.Ne:
        return ne(column, value);
      case FilterOperationType.Gt:
        return gt(column, value);
      case FilterOperationType.Gte:
        return gte(column, value);
      case FilterOperationType.Lt:
        return lt(column, value);
      case FilterOperationType.Lte:
        return lte(column, value);

      // === IN / NOT IN ===
      case FilterOperationType.In:
        return inArray(column, value);
      case FilterOperationType.NotIn:
        return notInArray(column, value);

      // === LIKE OPS ===
      case FilterOperationType.Like:
        return like(column, `%${value}%`);
      case FilterOperationType.NotLike:
        return not(like(column, `%${value}%`));
      case FilterOperationType.ILike:
        return ilike(column, `%${value}%`);
      case FilterOperationType.NotILike:
        return not(ilike(column, `%${value}%`));
      case FilterOperationType.StartsWith:
        return like(column, `${value}%`);
      case FilterOperationType.NotStartsWith:
        return not(like(column, `${value}%`));
      case FilterOperationType.EndsWith:
        return like(column, `%${value}`);
      case FilterOperationType.NotEndsWith:
        return not(like(column, `%${value}`));
      case FilterOperationType.IStartsWith:
        return ilike(column, `${value}%`);
      case FilterOperationType.NotIStartsWith:
        return not(ilike(column, `${value}%`));
      case FilterOperationType.IEndsWith:
        return ilike(column, `%${value}`);
      case FilterOperationType.NotIEndsWith:
        return not(ilike(column, `%${value}`));

      // === BETWEEN OPS ===
      case FilterOperationType.Between:
        return between(column, value[0], value[1]);
      case FilterOperationType.NotBetween:
        return notBetween(column, value[0], value[1]);

      // === NULL CHECKS ===
      case FilterOperationType.IsNull:
        return isNull(column);
      case FilterOperationType.IsNotNull:
        return isNotNull(column);

      // === ARRAY OPS
      case FilterOperationType.ArrayOverlaps:
        return arrayOverlaps(column, value);
      case FilterOperationType.ArrayContained:
        return arrayContained(column, value);
      case FilterOperationType.ArrayContains:
        return arrayContains(column, value);

      default:
        throw new FilterException({
          field: filter.field,
          value: filter.value,
          message: `Unsupported filter operation: ${filter.type}`,
        });
    }
  }

  private validateAndParseValue(
    filter: ISingleFilter<IFieldPathMap<TTable>>,
    dataType: FilterOperationTypeGroup,
  ): any {
    const { value, type, field } = filter;
    let parsedValue: any = value;

    // --- handle riêng cho In / NotIn ---
    if (type === FilterOperationType.In || type === FilterOperationType.NotIn) {
      const arrValue = Array.isArray(value) ? value : [value];

      switch (dataType) {
        case FilterOperationTypeGroup.Number: {
          parsedValue = arrValue.map((element) => {
            const num = Number(element);
            if (isNaN(num)) {
              throw new FilterException({
                field: filter.field,
                value: filter.value,
                message: `Invalid number value '${element}' for field '${field}'`,
              });
            }
            return num;
          });
          break;
        }

        case FilterOperationTypeGroup.Date: {
          parsedValue = arrValue.map((element) => {
            const d = new Date(element);
            if (isNaN(d.getTime())) {
              throw new FilterException({
                field: filter.field,
                value: filter.value,
                message: `Invalid date value '${element}' for field '${field}'`,
              });
            }
            return d;
          });
          break;
        }

        case FilterOperationTypeGroup.Boolean: {
          parsedValue = arrValue.map((element) => {
            if (element === true || element === 'true' || element === '1')
              return true;
            if (element === false || element === 'false' || element === '0')
              return false;
            throw new FilterException({
              field: filter.field,
              value: filter.value,
              message: `Invalid boolean value '${element}' for field '${field}'`,
            });
          });
          break;
        }

        case FilterOperationTypeGroup.String:
        default: {
          parsedValue = arrValue.map((element) => String(element));
          break;
        }
      }

      return parsedValue;
    }

    // --- các operator khác ---
    switch (dataType) {
      case FilterOperationTypeGroup.Number: {
        if (Array.isArray(value)) {
          parsedValue = value.map((element) => {
            const num = Number(element);
            if (isNaN(num)) {
              throw new FilterException({
                field: filter.field,
                value: filter.value,
                message: `Invalid number value '${element}' for field '${field}'`,
              });
            }
            return num;
          });
        } else {
          const num = Number(value);
          if (isNaN(num)) {
            throw new FilterException({
              field: filter.field,
              value: filter.value,
              message: `Invalid number value '${value}' for field '${field}'`,
            });
          }
          parsedValue = num;
        }
        break;
      }

      case FilterOperationTypeGroup.Date: {
        if (Array.isArray(value)) {
          parsedValue = value.map((element) => {
            const d = new Date(element);
            if (isNaN(d.getTime())) {
              throw new FilterException({
                field: filter.field,
                value: filter.value,
                message: `Invalid date value '${element}' for field '${field}'`,
              });
            }
            return d;
          });
        } else {
          const d = new Date(value);
          if (isNaN(d.getTime())) {
            throw new FilterException({
              field: filter.field,
              value: filter.value,
              message: `Invalid date value '${value}' for field '${field}'`,
            });
          }
          parsedValue = d;
        }
        break;
      }

      case FilterOperationTypeGroup.Boolean: {
        if (typeof value !== 'boolean') {
          if (value === 'true' || value === '1') {
            parsedValue = true;
          } else if (value === 'false' || value === '0') {
            parsedValue = false;
          } else {
            throw new FilterException({
              field: filter.field,
              value: filter.value,
              message: `Invalid boolean value '${value}' for field '${field}'`,
            });
          }
        } else {
          parsedValue = value;
        }
        break;
      }

      case FilterOperationTypeGroup.Array: {
        const arrValue = Array.isArray(value) ? value : [value];
        parsedValue = arrValue;
        break;
      }

      case FilterOperationTypeGroup.String:
      default: {
        if (
          Array.isArray(value) &&
          ![
            FilterOperationType.Between,
            FilterOperationType.NotBetween,
          ].includes(type)
        ) {
          throw new FilterException({
            field: filter.field,
            value: filter.value,
            message: `Operator '${type}' does not accept array for field '${field}'`,
          });
        }
        parsedValue = String(value);
        break;
      }
    }

    // --- validate Between ---
    if (
      [FilterOperationType.Between, FilterOperationType.NotBetween].includes(
        type,
      )
    ) {
      if (!Array.isArray(parsedValue) || parsedValue.length !== 2) {
        throw new FilterException({
          field: filter.field,
          value: filter.value,
          message: `'${type}' requires array of exactly 2 values`,
        });
      }
    }

    return parsedValue;
  }

  private resolveField(field: string): Column {
    if (field.includes('.')) {
      const [modelKey, columnKey] = field.split('.');
      const model = this.mapping[modelKey];
      if (!model)
        throw new FilterException({
          field,
          message: `Model '${modelKey}' not found`,
        });
      if (!model[columnKey])
        throw new FilterException({
          field,
          message: `Field '${columnKey}' not found in model '${modelKey}'`,
        });
      return model[columnKey];
    }

    const defaultModel = this.mapping['default'];
    if (defaultModel && defaultModel[field]) {
      return defaultModel[field];
    }

    throw new FilterException({
      field,
      message: `Field '${field}' not found in any model`,
    });
  }

  private resolveDataType(column: Column): FilterOperationTypeGroup {
    const dataType = column.columnType;

    for (const [logicType, keywords] of Object.entries(this.groups)) {
      console.log(
        dataType,
        logicType,
        keywords.some((keyword) => dataType.toLowerCase().includes(keyword)),
      );
      if (
        keywords.some((keyword) => dataType.toLowerCase().includes(keyword))
      ) {
        return logicType as FilterOperationTypeGroup;
      }
    }

    throw new FilterException({
      field: column.name,
      message: `Unsupported column data type: ${dataType}`,
    });
  }
}
