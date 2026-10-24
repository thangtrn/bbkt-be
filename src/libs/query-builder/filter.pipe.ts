import { Injectable, PipeTransform } from '@nestjs/common';
import {
  IFieldPathMap,
  IFilter,
  IFilterTable,
  IGeneratedFilter,
} from './filter.interface';
import { FilterParser } from './filter.parser';

@Injectable()
export class DirectFilterPipe<T extends IFilterTable = IFilterTable>
  implements PipeTransform
{
  private readonly filterParser: FilterParser<T>;

  constructor(private readonly mapping: T) {
    this.filterParser = new FilterParser<T>(mapping);
  }

  transform(value: IFilter<IFieldPathMap<T>>): IGeneratedFilter {
    return {
      ...value,
      findOptions: this.filterParser.generateQueryFindOptions(value),
    };
  }
}
