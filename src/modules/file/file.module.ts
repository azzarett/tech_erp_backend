import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FileDao } from 'src/common/dao';
import { FilesRepository } from './data';
import { FilesService } from './domain';
import { FileController } from './presenter/file.controller';

@Module({
  imports: [TypeOrmModule.forFeature([FileDao])],
  controllers: [FileController],
  providers: [FilesRepository, FilesService],
  exports: [FilesRepository, FilesService],
})
export class FileModule {}
