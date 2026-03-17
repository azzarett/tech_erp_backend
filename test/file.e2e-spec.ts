import { join } from 'path';
import {
  CanActivate,
  ExecutionContext,
  INestApplication,
  ValidationPipe,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { FileController } from '../src/modules/file/presenter/file.controller';
import { FilesService } from '../src/modules/file/domain';
import { JwtAuthGuard } from '../src/modules/auth/guards/jwt-auth.guard';

class MockJwtAuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const httpContext = context.switchToHttp();
    const request = httpContext.getRequest();

    request.user = {
      id: 'user-uuid-1',
    };

    return true;
  }
}

describe('FileController (e2e)', () => {
  let app: INestApplication;

  const now = new Date().toISOString();
  const existingStoragePath = join(process.cwd(), 'package.json');

  const fileResponse = {
    id: 'file-id-1',
    name: 'avatar',
    extension: 'png',
    mimeType: 'image/png',
    size: 128,
    uploadDate: now,
    storageName: 'avatar-123.png',
    storagePath: existingStoragePath,
  };

  const mockFilesService = {
    uploadFile: jest.fn(),
    listFiles: jest.fn(),
    deleteFileById: jest.fn(),
    getFileById: jest.fn(),
    updateFileById: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [FileController],
      providers: [
        {
          provide: FilesService,
          useValue: mockFilesService,
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useClass(MockJwtAuthGuard)
      .compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        transform: true,
        transformOptions: {
          enableImplicitConversion: true,
        },
      }),
    );
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  it('POST /file/upload', async () => {
    mockFilesService.uploadFile.mockResolvedValueOnce(fileResponse);

    const response = await request(app.getHttpServer())
      .post('/file/upload')
      .set('Authorization', 'Bearer access-token')
      .attach('file', Buffer.from('file-content'), 'avatar.png')
      .expect(201);

    expect(mockFilesService.uploadFile).toHaveBeenCalled();
    expect(response.body.data).toEqual({
      id: 'file-id-1',
      name: 'avatar',
      extension: 'png',
      mime_type: 'image/png',
      size: 128,
      upload_date: now,
    });
  });

  it('GET /file/list with defaults', async () => {
    mockFilesService.listFiles.mockResolvedValueOnce({
      items: [fileResponse],
      page: 1,
      listSize: 10,
      total: 1,
    });

    const response = await request(app.getHttpServer())
      .get('/file/list')
      .set('Authorization', 'Bearer access-token')
      .expect(200);

    expect(mockFilesService.listFiles).toHaveBeenCalledWith({
      page: undefined,
      listSize: undefined,
    });
    expect(response.body.meta).toEqual({
      page: 1,
      list_size: 10,
      total: 1,
    });
  });

  it('GET /file/list with pagination params', async () => {
    mockFilesService.listFiles.mockResolvedValueOnce({
      items: [fileResponse],
      page: 2,
      listSize: 5,
      total: 9,
    });

    await request(app.getHttpServer())
      .get('/file/list')
      .query({ page: 2, list_size: 5 })
      .set('Authorization', 'Bearer access-token')
      .expect(200);

    expect(mockFilesService.listFiles).toHaveBeenCalledWith({
      page: 2,
      listSize: 5,
    });
  });

  it('DELETE /file/delete/:id', async () => {
    mockFilesService.deleteFileById.mockResolvedValueOnce(undefined);

    const response = await request(app.getHttpServer())
      .delete('/file/delete/file-id-1')
      .set('Authorization', 'Bearer access-token')
      .expect(200);

    expect(mockFilesService.deleteFileById).toHaveBeenCalledWith('file-id-1');
    expect(response.body).toEqual({
      data: {
        success: true,
      },
    });
  });

  it('GET /file/:id', async () => {
    mockFilesService.getFileById.mockResolvedValueOnce(fileResponse);

    const response = await request(app.getHttpServer())
      .get('/file/file-id-1')
      .set('Authorization', 'Bearer access-token')
      .expect(200);

    expect(mockFilesService.getFileById).toHaveBeenCalledWith('file-id-1');
    expect(response.body.data.id).toBe('file-id-1');
  });

  it('GET /file/download/:id', async () => {
    mockFilesService.getFileById.mockResolvedValueOnce(fileResponse);

    const response = await request(app.getHttpServer())
      .get('/file/download/file-id-1')
      .set('Authorization', 'Bearer access-token')
      .expect(200);

    expect(mockFilesService.getFileById).toHaveBeenCalledWith('file-id-1');
    expect(response.headers['content-disposition']).toContain('attachment');
  });

  it('PUT /file/update/:id', async () => {
    mockFilesService.updateFileById.mockResolvedValueOnce(fileResponse);

    const response = await request(app.getHttpServer())
      .put('/file/update/file-id-1')
      .set('Authorization', 'Bearer access-token')
      .attach('file', Buffer.from('updated-content'), 'updated.png')
      .expect(200);

    expect(mockFilesService.updateFileById).toHaveBeenCalled();
    expect(response.body.data).toEqual({
      id: 'file-id-1',
      name: 'avatar',
      extension: 'png',
      mime_type: 'image/png',
      size: 128,
      upload_date: now,
    });
  });
});
