import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ApiErrorResponse {
  @ApiProperty({
    example: 'x3A9qL7vTY2eWpFZH5dUb',
    description:
      'Unique ID of the request, useful for tracing logs or debugging',
  })
  readonly requestId: string;

  @ApiProperty({
    description: 'HTTP status code of the error',
    example: 400,
  })
  readonly statusCode: number;

  @ApiProperty({
    example: 'Validation Error',
    description: 'Short description of the error',
  })
  readonly message: string;

  @ApiProperty({
    example: 'GENERIC.ARGUMENT_INVALID',
    description: 'Application-specific error code for categorizing errors',
  })
  readonly errorCode: string;

  @ApiPropertyOptional({
    example: 'Stack trace information',
    description: 'Optional stack trace for debugging',
  })
  readonly error!: unknown;

  constructor(props: ApiErrorResponse) {
    this.requestId = props.requestId;
    this.statusCode = props.statusCode;
    this.message = props.message;
    this.errorCode = props.errorCode;
    this.error = props.error;
  }
}
