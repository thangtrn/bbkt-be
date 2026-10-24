import { Simplify } from 'drizzle-orm';

export interface Entity {
  readonly id: string;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}

export type CreateEntityProps<T> = Simplify<
  Omit<T, 'id' | 'createdAt' | 'updatedAt'>
>;

export type UpdateEntityProps<T> = Simplify<
  Partial<
    Omit<T, 'id' | 'createdAt' | 'updatedAt' | 'createdBy' | 'updatedBy'>
  > & { updatedBy: string }
>;

export abstract class BaseEntity<T extends Entity> {
  protected _props: T;

  constructor(props: T) {
    this._props = props;
  }

  update(props: UpdateEntityProps<T>): void {
    this._props = {
      ...this._props,
      ...props,
      updatedAt: new Date(),
    };
  }

  getProps(): T {
    return this._props;
  }
}
