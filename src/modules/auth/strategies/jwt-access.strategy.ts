import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { Request } from 'express';
import { getAuthConfig } from 'src/config/auth.config';
import { UsersService } from 'src/modules/users/domain';
import { UserAccessTokensRepository } from '../data';

@Injectable()
export class JwtAccessStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    private readonly userAccessTokensRepository: UserAccessTokensRepository,
    private readonly usersService: UsersService,
  ) {
    const authConfig = getAuthConfig();

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: authConfig.jwt.access.secret,
      passReqToCallback: true,
    });
  }

  async validate(request: Request, payload: { sub: string }) {
    const rawAuthorization = request.get('Authorization') || '';
    const token = rawAuthorization.replace('Bearer', '').trim();

    if (!token) {
      return null;
    }

    const userAccessToken =
      await this.userAccessTokensRepository.getOneByAccessToken(token);

    if (!userAccessToken) {
      return null;
    }

    const user = await this.usersService.getUserById(payload.sub);

    return user ?? null;
  }
}
