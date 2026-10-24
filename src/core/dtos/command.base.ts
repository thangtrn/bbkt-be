import { RESULT_TYPE_SYMBOL } from '@nestjs/cqrs/dist/classes/constants';

export type CommandProps<T> = Omit<T, typeof RESULT_TYPE_SYMBOL>;
