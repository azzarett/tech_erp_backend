import { randomUUID } from 'crypto';
import { compare, hash } from 'bcryptjs';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Auth } from 'src/common/entities';
import { getAuthConfig } from 'src/config/auth.config';
import { UserDao } from 'src/common/dao';
import { UsersService } from 'src/modules/users/domain';
import { UserAccessTokensRepository } from '../data';
import { TokenPairDto } from '../dto';

@Injectable()
export class AuthService {
  private readonly authConfig = getAuthConfig();

  constructor(
    private readonly jwtService: JwtService,
    private readonly usersService: UsersService,
    private readonly userAccessTokensRepository: UserAccessTokensRepository,
  ) {}

  async signUp(payload: { identifier: string; password: string }): Promise<{
    user: UserDao;
    auth: Auth;
  }> {
    const passwordHash = await hash(payload.password, 12);

    const user = await this.usersService.registerUser({
      identifier: payload.identifier,
      password: passwordHash,
    });

    const tokens = await this.getTokens(user.id);
    await this.userAccessTokensRepository.createSession({
      userId: user.id,
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    });

    return {
      user,
      auth: this.toAuth(tokens),
    };
  }

  async signIn(payload: { identifier: string; password: string }): Promise<{
    user: UserDao;
    auth: Auth;
  }> {
    const user = await this.usersService.getUserByIdentifier(
      payload.identifier,
    );

    if (!user) {
      throw new HttpException(
        'Credentials are invalid',
        HttpStatus.UNAUTHORIZED,
      );
    }

    const isPasswordValid = await compare(payload.password, user.password);

    if (!isPasswordValid) {
      throw new HttpException(
        'Credentials are invalid',
        HttpStatus.UNAUTHORIZED,
      );
    }

    const tokens = await this.getTokens(user.id);
    await this.userAccessTokensRepository.createSession({
      userId: user.id,
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    });

    return {
      user,
      auth: this.toAuth(tokens),
    };
  }

  async refreshToken(refreshToken: string): Promise<Auth> {
    if (!refreshToken) {
      throw new HttpException(
        'Refresh token is required',
        HttpStatus.BAD_REQUEST,
      );
    }

    let payload: { sub: string };
    try {
      payload = await this.jwtService.verifyAsync(refreshToken, {
        secret: this.authConfig.jwt.refresh.secret,
      });
    } catch {
      throw new HttpException(
        'Refresh token is invalid',
        HttpStatus.UNAUTHORIZED,
      );
    }

    const session =
      await this.userAccessTokensRepository.getOneByRefreshToken(refreshToken);

    if (!session || session.userId !== payload.sub) {
      throw new HttpException(
        'Refresh token is invalid',
        HttpStatus.UNAUTHORIZED,
      );
    }

    await this.userAccessTokensRepository.softDeleteByRefreshToken(
      refreshToken,
    );

    const tokens = await this.getTokens(payload.sub);

    await this.userAccessTokensRepository.createSession({
      userId: payload.sub,
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    });

    return this.toAuth(tokens);
  }

  async logout(accessToken: string): Promise<void> {
    if (!accessToken) {
      throw new HttpException(
        'Access token is required',
        HttpStatus.BAD_REQUEST,
      );
    }

    const session =
      await this.userAccessTokensRepository.getOneByAccessToken(accessToken);

    if (!session) {
      throw new HttpException('Session not found', HttpStatus.NOT_FOUND);
    }

    await this.userAccessTokensRepository.softDeleteByAccessToken(accessToken);
  }

  private async getTokens(userId: string): Promise<TokenPairDto> {
    const sessionId = randomUUID();

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(
        {
          sub: userId,
          jti: sessionId,
        },
        {
          secret: this.authConfig.jwt.access.secret,
          expiresIn: this.authConfig.jwt.access.expiresIn,
        },
      ),
      this.jwtService.signAsync(
        {
          sub: userId,
          jti: sessionId,
        },
        {
          secret: this.authConfig.jwt.refresh.secret,
          expiresIn: this.authConfig.jwt.refresh.expiresIn,
        },
      ),
    ]);

    return {
      accessToken,
      refreshToken,
    };
  }

  private toAuth(tokens: TokenPairDto): Auth {
    return {
      access: {
        token: tokens.accessToken,
      },
      refresh: {
        token: tokens.refreshToken,
      },
    };
  }
}
