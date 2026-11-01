import { BadRequestException, Injectable } from '@nestjs/common';
import {
  FieldDefinition,
  FieldDefinitionType,
  FieldsDefinition,
  RecordDataSources,
  ValidationOptions,
} from './interfaces';

@Injectable()
export class FieldsDefinitionValidatorService {
  /**
   * Validate data theo fieldsDefinition.
   * Validate luôn sources nếu data có truyền sources.
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

    if (!data || typeof data !== 'object' || Array.isArray(data)) {
      throw new BadRequestException('Data must be an object');
    }

    // Validate các fields được định nghĩa
    for (const field of definition.fields) {
      const { field: fieldKey, name, type, required } = field;

      const exists = Object.prototype.hasOwnProperty.call(data, fieldKey);

      const value = data[fieldKey];

      // Update: bỏ qua field không được gửi lên
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

      // Validate type
      if (!this.validateType(value, type)) {
        errors.push(`${name} (${fieldKey}) must be of type ${type}`);
      }
    }

    // Validate sources
    const hasSources = Object.prototype.hasOwnProperty.call(data, 'sources');

    if (hasSources && definition.sources) {
      this.validateSources(data.sources, definition.sources, errors);
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
   * Validate sources.
   */
  private validateSources(
    sources: unknown,
    schemaSources: RecordDataSources,
    errors: string[],
  ): void {
    // Kiểm tra sources là object
    if (!sources || typeof sources !== 'object' || Array.isArray(sources)) {
      if (schemaSources.excel.required || schemaSources.docx.required) {
        errors.push('sources must be an object');
      }
      return;
    }

    const source = sources as Record<string, unknown>;

    // Validate Excel
    if (schemaSources.excel.required) {
      const excel = source.excel;

      if (!excel || typeof excel !== 'object' || Array.isArray(excel)) {
        errors.push('Excel source is required');
      } else {
        const excelSource = excel as Record<string, unknown>;

        if (!this.isNonEmptyString(excelSource.file)) {
          errors.push('sources.excel.file is required');
        }
      }
    }

    // Validate DOCX
    if (schemaSources.docx.required) {
      const docx = source.docx;

      if (!docx || typeof docx !== 'object' || Array.isArray(docx)) {
        errors.push('DOCX source is required');
      } else {
        const docxSource = docx as Record<string, unknown>;

        if (!Array.isArray(docxSource.files) || docxSource.files.length === 0) {
          errors.push('sources.docx.files is required');
        } else {
          docxSource.files.forEach((file, index) => {
            if (!this.isNonEmptyString(file)) {
              errors.push(
                `sources.docx.files[${index}] must be a non-empty string`,
              );
            }
          });
        }
      }
    }
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
   * Kiểm tra string không rỗng.
   */
  private isNonEmptyString(value: unknown): value is string {
    return typeof value === 'string' && value.trim().length > 0;
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

    // dd/MM/yyyy
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

    // yyyy-MM-dd
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
