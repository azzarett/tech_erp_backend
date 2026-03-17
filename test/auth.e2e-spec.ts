import {
  CanActivate,
  ExecutionContext,
  INestApplication,
  ValidationPipe,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { AuthController } from '../src/modules/auth/presenter/auth.controller';
import { AuthService } from '../src/modules/auth/domain';
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

describe('AuthController (e2e)', () => {
  let app: INestApplication;

  const mockAuthService = {
    signUp: jest.fn(),
    signIn: jest.fn(),
    refreshToken: jest.fn(),
    logout: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
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

  it('POST /signup', async () => {
    mockAuthService.signUp.mockResolvedValueOnce({
      user: {
        identifier: 'user@example.com',
      },
      auth: {
        access: { token: 'access-token' },
        refresh: { token: 'refresh-token' },
      },
    });

    const response = await request(app.getHttpServer())
      .post('/signup')
      .send({
        id: 'user@example.com',
        password: 'password',
      })
      .expect(201);

    expect(mockAuthService.signUp).toHaveBeenCalledWith({
      identifier: 'user@example.com',
      password: 'password',
    });
    expect(response.body).toEqual({
      data: {
        user: {
          id: 'user@example.com',
        },
        auth: {
          access: { token: 'access-token' },
          refresh: { token: 'refresh-token' },
        },
      },
    });
  });

  it('POST /signin', async () => {
    mockAuthService.signIn.mockResolvedValueOnce({
      user: {
        identifier: 'user@example.com',
      },
      auth: {
        access: { token: 'access-token' },
        refresh: { token: 'refresh-token' },
      },
    });

    const response = await request(app.getHttpServer())
      .post('/signin')
      .send({
        id: 'user@example.com',
        password: 'password',
      })
      .expect(201);

    expect(mockAuthService.signIn).toHaveBeenCalledWith({
      identifier: 'user@example.com',
      password: 'password',
    });
    expect(response.body.data.user.id).toBe('user@example.com');
  });

  it('POST /signin/new_token', async () => {
    mockAuthService.refreshToken.mockResolvedValueOnce({
      access: { token: 'new-access-token' },
      refresh: { token: 'new-refresh-token' },
    });

    const response = await request(app.getHttpServer())
      .post('/signin/new_token')
      .send({
        refresh_token: 'refresh-token',
      })
      .expect(201);

    expect(mockAuthService.refreshToken).toHaveBeenCalledWith('refresh-token');
    expect(response.body).toEqual({
      data: {
        auth: {
          access: { token: 'new-access-token' },
          refresh: { token: 'new-refresh-token' },
        },
      },
    });
  });

  it('GET /info', async () => {
    const response = await request(app.getHttpServer())
      .get('/info')
      .set('Authorization', 'Bearer access-token')
      .expect(200);

    expect(response.body).toEqual({
      data: {
        id: 'user-uuid-1',
      },
    });
  });

  it('GET /logout', async () => {
    mockAuthService.logout.mockResolvedValueOnce(undefined);

    const response = await request(app.getHttpServer())
      .get('/logout')
      .set('Authorization', 'Bearer access-token')
      .expect(200);

    expect(mockAuthService.logout).toHaveBeenCalledWith('access-token');
    expect(response.body).toEqual({
      data: {
        success: true,
      },
    });
  });
});
