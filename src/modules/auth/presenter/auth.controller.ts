import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
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
  async signUp(@Body() body: SignUpBody) {
    const result = await this.authService.signUp({
      identifier: body.identifier,
      password: body.password,
    });

    return {
      data: {
        user: {
          id: result.user.id,
        },
        auth: result.auth,
      },
    };
  }

  @Post('/signin')
  async signIn(@Body() body: SignInBody) {
    const result = await this.authService.signIn({
      identifier: body.identifier,
      password: body.password,
    });

    return {
      data: {
        user: {
          id: result.user.id,
        },
        auth: result.auth,
      },
    };
  }

  @Post('/signin/new_token')
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
  async info(@AuthenticatedUser() user: User) {
    return {
      data: {
        id: user.id,
      },
    };
  }

  @UseGuards(JwtAuthGuard)
  @Get('/logout')
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
