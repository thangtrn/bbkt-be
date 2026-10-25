import { Inject, Injectable } from '@nestjs/common';
import Docxtemplater from 'docxtemplater';
import PizZip from 'pizzip';
import { DOCXTEMPLATER_MODULE_OPTIONS } from './docxtemplater.module-definition';
import { DocxtemplaterOptions } from './interfaces';

@Injectable()
export class DocxtemplaterService {
  constructor(
    @Inject(DOCXTEMPLATER_MODULE_OPTIONS)
    private readonly options: DocxtemplaterOptions,
  ) {}

  async renderTemplate(
    templateFolderPath: string,
    excelFolderPath: string,
    content: string,
  ): Promise<null> {
    const doc = new Docxtemplater();
    return null;
  }
}
