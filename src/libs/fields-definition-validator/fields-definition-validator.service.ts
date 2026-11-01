import { BadRequestException, Injectable } from '@nestjs/common';
import {
  FieldDefinition,
  FieldDefinitionType,
  FieldsDefinition,
  ValidationOptions,
} from './interfaces';

@Injectable()
export class FieldsDefinitionValidatorService {
  /**
   * Validate data theo fieldsDefinition.
   *
   * @param data Data cần validate
   * @param definition Fields definition
   * @param options Validation options
   */
  validate<T extends Record<string, unknown>>(
    data: T,
    definition: FieldsDefinition,
    options: ValidationOptions = {},
  ): T {
    const { partial = false } = options;

    const errors: string[] = [];

    if (!definition || !Array.isArray(definition.fields)) {
      throw new BadRequestException('Invalid fields definition');
    }

    for (const field of definition.fields) {
      const { field: fieldKey, name, type, required } = field;

      const exists = Object.prototype.hasOwnProperty.call(data, fieldKey);

      const value = data[fieldKey];

      // Update: bỏ qua các field không được gửi lên
      if (partial && !exists) {
        continue;
      }

      // Required
      if (required && this.isEmpty(value)) {
        errors.push(`${name} (${fieldKey}) is required`);
        continue;
      }

      // Optional và không có dữ liệu
      if (this.isEmpty(value)) {
        continue;
      }

      // Type validation
      if (!this.validateType(value, type)) {
        errors.push(`${name} (${fieldKey}) must be of type ${type}`);
      }
    }

    if (errors.length > 0) {
      throw new BadRequestException({
        message: 'Data validation failed',
        errors,
      });
    }

    return data;
  }

  /**
   * Kiểm tra giá trị rỗng.
   */
  private isEmpty(value: unknown): boolean {
    return (
      value === undefined ||
      value === null ||
      (typeof value === 'string' && value.trim() === '')
    );
  }

  /**
   * Validate kiểu dữ liệu.
   */
  private validateType(value: unknown, type: FieldDefinitionType): boolean {
    switch (type) {
      case 'string':
        return typeof value === 'string';

      case 'number':
        return typeof value === 'number' && Number.isFinite(value);

      case 'boolean':
        return typeof value === 'boolean';

      case 'date':
        return this.isValidDate(value);

      case 'array':
        return Array.isArray(value);

      case 'object':
        return (
          typeof value === 'object' && value !== null && !Array.isArray(value)
        );

      default:
        return false;
    }
  }

  /**
   * Kiểm tra ngày hợp lệ.
   */
  private isValidDate(value: unknown): boolean {
    if (value instanceof Date) {
      return !Number.isNaN(value.getTime());
    }

    if (typeof value !== 'string') {
      return false;
    }

    // Hỗ trợ dd/MM/yyyy
    const vietnameseDateRegex = /^(\d{2})\/(\d{2})\/(\d{4})$/;

    const match = value.match(vietnameseDateRegex);

    if (match) {
      const day = Number(match[1]);
      const month = Number(match[2]);
      const year = Number(match[3]);

      const date = new Date(year, month - 1, day);

      return (
        date.getFullYear() === year &&
        date.getMonth() === month - 1 &&
        date.getDate() === day
      );
    }

    // Hỗ trợ ISO date: yyyy-MM-dd
    const isoDateRegex = /^\d{4}-\d{2}-\d{2}$/;

    if (isoDateRegex.test(value)) {
      const [year, month, day] = value.split('-').map(Number);

      const date = new Date(year, month - 1, day);

      return (
        date.getFullYear() === year &&
        date.getMonth() === month - 1 &&
        date.getDate() === day
      );
    }

    return false;
  }
}
