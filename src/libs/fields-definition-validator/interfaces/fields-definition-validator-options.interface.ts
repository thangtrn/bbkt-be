export type FieldDefinitionType =
  | 'string'
  | 'number'
  | 'date'
  | 'array'
  | 'boolean'
  | 'object';

export interface FieldDefinition {
  name: string;
  field: string;
  type: FieldDefinitionType;
  required?: boolean;
}

export interface FieldsDefinition {
  fields: FieldDefinition[];
  version?: number;
}

export interface ValidationOptions {
  /**
   * true: chỉ validate các field có trong data.
   * false: validate toàn bộ field và required.
   */
  partial?: boolean;
}

export interface ExcelSource {
  folder: string;
  sheet: string;
  field: string;
  file: string;
  headerRow: number;
  required: boolean;
}

export interface DocxSource {
  folder: string;
  files: string[];
  required: boolean;
}

export interface RecordDataSources {
  rootFolder: string;
  excel: ExcelSource;
  docx: DocxSource;
}

export interface FieldsDefinitionValidatorOptions {}
