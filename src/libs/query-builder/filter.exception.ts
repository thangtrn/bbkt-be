import { HttpException, HttpStatus } from '@nestjs/common';

export type FilterError = {
  field: string;
  value?: any;
  message: string;
};

export class FilterException extends HttpException {
  constructor(public error: FilterError | FilterError[]) {
    super(
      {
        message: 'Validation failed',
        error,
      },
      HttpStatus.UNPROCESSABLE_ENTITY,
    );
  }
}
