export class Paginated<T> {
  readonly total: number;
  readonly limit: number;
  readonly page: number;
  readonly data: readonly T[];

  constructor(props: Paginated<T>) {
    this.total = props.total;
    this.limit = props.limit;
    this.page = props.page;
    this.data = props.data;
  }
}
