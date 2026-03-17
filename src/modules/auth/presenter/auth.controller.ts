import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import {
  ApiBody,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Request } from 'express';
import { AuthenticatedUser } from 'src/common/decorators';
import { User } from 'src/common/entities';
import { AuthService } from '../domain';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { RefreshTokenBody, SignInBody, SignUpBody } from './bodies';

@ApiTags('Auth')
@Controller()
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('/signup')
  @ApiBody({
    schema: {
      type: 'object',
      required: ['id', 'password'],
      properties: {
        id: { type: 'string', example: 'user@example.com' },
        password: { type: 'string', example: 'password123' },
      },
    },
  })
  @ApiCreatedResponse({
    schema: {
      type: 'object',
      properties: {
        data: {
          type: 'object',
          properties: {
            user: {
              type: 'object',
              properties: {
                id: { type: 'string', example: 'user@example.com' },
              },
            },
            auth: {
              type: 'object',
              properties: {
                access: {
                  type: 'object',
                  properties: {
                    token: { type: 'string' },
                  },
                },
                refresh: {
                  type: 'object',
                  properties: {
                    token: { type: 'string' },
                  },
                },
              },
            },
          },
        },
      },
    },
  })
  async signUp(@Body() body: SignUpBody) {
    const result = await this.authService.signUp({
      identifier: body.id,
      password: body.password,
    });

    return {
      data: {
        user: {
          id: result.user.identifier,
        },
        auth: result.auth,
      },
    };
  }

  @Post('/signin')
  @ApiBody({
    schema: {
      type: 'object',
      required: ['id', 'password'],
      properties: {
        id: { type: 'string', example: 'user@example.com' },
        password: { type: 'string', example: 'password123' },
      },
    },
  })
  @ApiCreatedResponse({
    schema: {
      type: 'object',
      properties: {
        data: {
          type: 'object',
          properties: {
            user: {
              type: 'object',
              properties: {
                id: { type: 'string', example: 'user@example.com' },
              },
            },
            auth: {
              type: 'object',
              properties: {
                access: {
                  type: 'object',
                  properties: {
                    token: { type: 'string' },
                  },
                },
                refresh: {
                  type: 'object',
                  properties: {
                    token: { type: 'string' },
                  },
                },
              },
            },
          },
        },
      },
    },
  })
  async signIn(@Body() body: SignInBody) {
    const result = await this.authService.signIn({
      identifier: body.id,
      password: body.password,
    });

    return {
      data: {
        user: {
          id: result.user.identifier,
        },
        auth: result.auth,
      },
    };
  }

  @Post('/signin/new_token')
  @ApiBody({
    schema: {
      type: 'object',
      required: ['refresh_token'],
      properties: {
        refresh_token: { type: 'string' },
      },
    },
  })
  @ApiCreatedResponse({
    schema: {
      type: 'object',
      properties: {
        data: {
          type: 'object',
          properties: {
            auth: {
              type: 'object',
              properties: {
                access: {
                  type: 'object',
                  properties: {
                    token: { type: 'string' },
                  },
                },
                refresh: {
                  type: 'object',
                  properties: {
                    token: { type: 'string' },
                  },
                },
              },
            },
          },
        },
      },
    },
  })
  async refreshToken(@Body() body: RefreshTokenBody) {
    const auth = await this.authService.refreshToken(body.refresh_token);

    return {
      data: {
        auth,
      },
    };
  }

  @UseGuards(JwtAuthGuard)
  @Get('/info')
  @ApiOkResponse({
    schema: {
      type: 'object',
      properties: {
        data: {
          type: 'object',
          properties: {
            id: { type: 'string' },
          },
        },
      },
    },
  })
  async info(@AuthenticatedUser() user: User) {
    return {
      data: {
        id: user.id,
      },
    };
  }

  @UseGuards(JwtAuthGuard)
  @Get('/logout')
  @ApiOkResponse({
    schema: {
      type: 'object',
      properties: {
        data: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
          },
        },
      },
    },
  })
  async logout(@Req() request: Request) {
    const token = (request.get('Authorization') || '')
      .replace('Bearer', '')
      .trim();

    await this.authService.logout(token);

    return {
      data: {
        success: true,
      },
    };
  }
}
