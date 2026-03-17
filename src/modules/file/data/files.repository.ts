import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FileDao } from 'src/common/dao';

@Injectable()
export class FilesRepository {
  constructor(
    @InjectRepository(FileDao)
    private readonly filesRepository: Repository<FileDao>,
  ) {}

  createAndSave(payload: Partial<FileDao>): Promise<FileDao> {
    return this.filesRepository.save(this.filesRepository.create(payload));
  }

  getOneById(id: string): Promise<FileDao | null> {
    return this.filesRepository.findOne({ where: { id } });
  }

  async getPaginated(payload: {
    page: number;
    listSize: number;
  }): Promise<{ items: FileDao[]; total: number }> {
    const [items, total] = await this.filesRepository.findAndCount({
      order: { uploadDate: 'DESC' },
      skip: (payload.page - 1) * payload.listSize,
      take: payload.listSize,
    });

    return { items, total };
  }

  save(file: FileDao): Promise<FileDao> {
    return this.filesRepository.save(file);
  }

  async deleteById(id: string): Promise<void> {
    await this.filesRepository.delete({ id });
  }
}
