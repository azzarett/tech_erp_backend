import { randomUUID } from 'crypto';
import { basename, extname } from 'path';
import { promises as fsPromises } from 'fs';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { FileDao } from 'src/common/dao';
import { FilesRepository } from '../data';

@Injectable()
export class FilesService {
  constructor(private readonly filesRepository: FilesRepository) {}

  async uploadFile(file: Express.Multer.File): Promise<FileDao> {
    const extension = extname(file.originalname).replace('.', '').toLowerCase();
    const name = basename(file.originalname, extname(file.originalname));

    return this.filesRepository.createAndSave({
      id: randomUUID(),
      name,
      extension,
      mimeType: file.mimetype,
      size: file.size,
      storageName: file.filename,
      storagePath: file.path,
    });
  }

  async listFiles(payload: { page?: number; listSize?: number }): Promise<{
    items: FileDao[];
    page: number;
    listSize: number;
    total: number;
  }> {
    const page = payload.page && payload.page > 0 ? payload.page : 1;
    const listSize =
      payload.listSize && payload.listSize > 0 ? payload.listSize : 10;

    const result = await this.filesRepository.getPaginated({ page, listSize });

    return {
      items: result.items,
      page,
      listSize,
      total: result.total,
    };
  }

  async getFileById(id: string): Promise<FileDao> {
    const file = await this.filesRepository.getOneById(id);

    if (!file) {
      throw new HttpException('File not found', HttpStatus.NOT_FOUND);
    }

    return file;
  }

  async deleteFileById(id: string): Promise<void> {
    const file = await this.getFileById(id);

    await fsPromises.unlink(file.storagePath).catch(() => undefined);
    await this.filesRepository.deleteById(id);
  }

  async updateFileById(
    id: string,
    newFile: Express.Multer.File,
  ): Promise<FileDao> {
    const file = await this.getFileById(id);

    const extension = extname(newFile.originalname)
      .replace('.', '')
      .toLowerCase();
    const name = basename(newFile.originalname, extname(newFile.originalname));

    const updatedFile = await this.filesRepository.save({
      ...file,
      name,
      extension,
      mimeType: newFile.mimetype,
      size: newFile.size,
      storageName: newFile.filename,
      storagePath: newFile.path,
    });

    await fsPromises.unlink(file.storagePath).catch(() => undefined);

    return updatedFile;
  }
}
