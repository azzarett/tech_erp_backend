import { randomUUID } from 'crypto';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserAccessTokenDao } from 'src/common/dao';

@Injectable()
export class UserAccessTokensRepository {
  constructor(
    @InjectRepository(UserAccessTokenDao)
    private readonly userAccessTokensRepository: Repository<UserAccessTokenDao>,
  ) {}

  createSession(payload: {
    userId: string;
    accessToken: string;
    refreshToken: string;
  }): Promise<UserAccessTokenDao> {
    return this.userAccessTokensRepository.save({
      id: randomUUID(),
      userId: payload.userId,
      accessToken: payload.accessToken,
      refreshToken: payload.refreshToken,
    });
  }

  getOneByAccessToken(accessToken: string): Promise<UserAccessTokenDao | null> {
    return this.userAccessTokensRepository.findOne({ where: { accessToken } });
  }

  getOneByRefreshToken(
    refreshToken: string,
  ): Promise<UserAccessTokenDao | null> {
    return this.userAccessTokensRepository.findOne({ where: { refreshToken } });
  }

  async softDeleteByAccessToken(accessToken: string): Promise<void> {
    await this.userAccessTokensRepository.softDelete({ accessToken });
  }

  async softDeleteByRefreshToken(refreshToken: string): Promise<void> {
    await this.userAccessTokensRepository.softDelete({ refreshToken });
  }

  async softDeleteById(id: string): Promise<void> {
    await this.userAccessTokensRepository.softDelete({ id });
  }
}
