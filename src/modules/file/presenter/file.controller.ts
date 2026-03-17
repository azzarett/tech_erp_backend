import { existsSync, mkdirSync } from 'fs';
import { basename, extname, join } from 'path';
import {
  BadRequestException,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  Res,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ApiConsumes, ApiTags } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { Response } from 'express';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { FilesService } from '../domain';
import { ListFilesQuery } from './queries';

const uploadsDirectory = join(process.cwd(), 'uploads');

if (!existsSync(uploadsDirectory)) {
  mkdirSync(uploadsDirectory, { recursive: true });
}

const uploadStorage = diskStorage({
  destination: uploadsDirectory,
  filename: (request, file, callback) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const safeName = basename(file.originalname, extname(file.originalname))
      .replace(/[^a-zA-Z0-9-_]/g, '_')
      .slice(0, 120);
    const extension = extname(file.originalname);

    callback(null, `${safeName}-${uniqueSuffix}${extension}`);
  },
});

@ApiTags('File')
@Controller('/file')
@UseGuards(JwtAuthGuard)
export class FileController {
  constructor(private readonly filesService: FilesService) {}

  @Post('/upload')
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('file', { storage: uploadStorage }))
  async upload(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('File is required');
    }

    const uploadedFile = await this.filesService.uploadFile(file);

    return {
      data: this.toResponse(uploadedFile),
    };
  }

  @Get('/list')
  async list(@Query() query: ListFilesQuery) {
    const result = await this.filesService.listFiles({
      page: query.page,
      listSize: query.list_size,
    });

    return {
      data: result.items.map((file) => this.toResponse(file)),
      meta: {
        page: result.page,
        list_size: result.listSize,
        total: result.total,
      },
    };
  }

  @Delete('/delete/:id')
  async delete(@Param('id') id: string) {
    await this.filesService.deleteFileById(id);

    return {
      data: {
        success: true,
      },
    };
  }

  @Get('/:id')
  async getById(@Param('id') id: string) {
    const file = await this.filesService.getFileById(id);

    return {
      data: this.toResponse(file),
    };
  }

  @Get('/download/:id')
  async download(@Param('id') id: string, @Res() response: Response) {
    const file = await this.filesService.getFileById(id);
    const extensionSuffix = file.extension ? `.${file.extension}` : '';

    return response.download(
      file.storagePath,
      `${file.name}${extensionSuffix}`,
    );
  }

  @Put('/update/:id')
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('file', { storage: uploadStorage }))
  async update(
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) {
      throw new BadRequestException('File is required');
    }

    const updatedFile = await this.filesService.updateFileById(id, file);

    return {
      data: this.toResponse(updatedFile),
    };
  }

  private toResponse(file: {
    id: string;
    name: string;
    extension: string;
    mimeType: string;
    size: number;
    uploadDate: string;
  }) {
    return {
      id: file.id,
      name: file.name,
      extension: file.extension,
      mime_type: file.mimeType,
      size: file.size,
      upload_date: file.uploadDate,
    };
  }
}
