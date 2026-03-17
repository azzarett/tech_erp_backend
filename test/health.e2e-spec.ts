import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { HealthCheckService, TypeOrmHealthIndicator } from '@nestjs/terminus';
import { HealthController } from '../src/modules/health/presenter/health.controller';

describe('HealthController (e2e)', () => {
  let app: INestApplication;

  const mockHealthCheckService = {
    check: jest.fn(),
  };

  const mockTypeOrmHealthIndicator = {
    pingCheck: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [HealthController],
      providers: [
        {
          provide: HealthCheckService,
          useValue: mockHealthCheckService,
        },
        {
          provide: TypeOrmHealthIndicator,
          useValue: mockTypeOrmHealthIndicator,
        },
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  it('GET /health', async () => {
    const response = await request(app.getHttpServer())
      .get('/health')
      .expect(200);

    expect(response.body).toEqual({ status: 'ok' });
  });

  it('GET /health/mysql', async () => {
    mockTypeOrmHealthIndicator.pingCheck.mockResolvedValueOnce({
      database: {
        status: 'up',
      },
    });

    mockHealthCheckService.check.mockImplementationOnce(async (checks) => {
      const result = await checks[0]();
      return {
        status: 'ok',
        info: result,
        error: {},
        details: result,
      };
    });

    const response = await request(app.getHttpServer())
      .get('/health/mysql')
      .expect(200);

    expect(mockHealthCheckService.check).toHaveBeenCalled();
    expect(response.body.status).toBe('ok');
  });
});
