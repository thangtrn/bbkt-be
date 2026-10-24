import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  IsArray,
  IsDefined,
  IsEnum,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';
import {
  FilterOperationType,
  FilterOrder,
} from '@/libs/query-builder/filter.enum';
import {
  GeneratedFindOptions,
  IFilter,
  IGeneratedFilter,
  ISingleFilter,
  ISingleOrder,
} from '@/libs/query-builder/filter.interface';

// The fields are also validated in filter.parser.ts to make sure that only correct fields are used to filter
export class SingleFilter<T> implements ISingleFilter<T> {
  @ApiProperty({ example: 'id', description: 'Field name to filter' })
  @IsString()
  field!: keyof T & string;

  @ApiProperty({
    example: FilterOperationType.Eq,
    enum: FilterOperationType,
    description: 'Filter operation type',
  })
  @IsEnum(FilterOperationType)
  type!: FilterOperationType;

  @ApiProperty({ example: '1', description: 'Value to filter' })
  @IsDefined()
  value: any;
}

export class SingleFilterOrder<T> implements ISingleOrder<T> {
  @ApiProperty({ example: 'id', description: 'Field name to order by' })
  @IsString()
  field!: keyof T & string;

  @ApiProperty({
    example: 'asc',
    enum: ['asc', 'desc'],
    description: 'Order direction',
  })
  @IsIn(['asc', 'desc'])
  dir!: FilterOrder;
}

export class Filter<T = any> implements IFilter<T> {
  @ApiPropertyOptional({
    description: 'The offset of the first result to return',
    type: Number,
    default: 0,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  readonly offset = 0;

  @ApiPropertyOptional({
    description: 'The maximum number of results to return',
    type: Number,
    default: 10,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  readonly limit = 10;

  @ApiPropertyOptional({
    description: 'Filter to apply',
    type: () => [SingleFilter<T>],
    required: false,
    example: [{ field: 'id', type: FilterOperationType.Eq, value: '1' }],
  })
  @Transform(({ value }) => (Array.isArray(value) ? value : Array(value)))
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SingleFilter<T>)
  @IsOptional()
  readonly filter?: Array<SingleFilter<T>>;

  @ApiPropertyOptional({
    description: 'Or Filter to apply',
    type: () => [SingleFilter<T>],
    required: false,
    example: [{ field: 'id', type: FilterOperationType.Eq, value: '1' }],
  })
  @Transform(({ value }) => (Array.isArray(value) ? value : Array(value)))
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SingleFilter<T>)
  @IsOptional()
  readonly orFilter?: Array<SingleFilter<T>>;

  @ApiPropertyOptional({
    description: 'Order to apply',
    type: () => [SingleFilterOrder],
    required: false,
    example: [{ field: 'id', dir: 'asc' }],
  })
  @Transform(({ value }) => (Array.isArray(value) ? value : Array(value)))
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SingleFilterOrder<T>)
  @IsOptional()
  readonly order?: Array<SingleFilterOrder<T>>;
}

export class FilterDto<T> extends Filter<T> implements IGeneratedFilter {
  // This will be set by filter pipe
  findOptions!: GeneratedFindOptions;
}
