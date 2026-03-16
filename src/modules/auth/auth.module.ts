import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { UserAccessTokenDao } from 'src/common/dao';
import { UsersModule } from '../users/users.module';
import { UserAccessTokensRepository } from './data';
import { AuthService } from './domain';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { AuthController } from './presenter/auth.controller';
import { JwtAccessStrategy } from './strategies/jwt-access.strategy';

@Module({
  imports: [
    TypeOrmModule.forFeature([UserAccessTokenDao]),
    JwtModule.register({}),
    PassportModule,
    UsersModule,
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    UserAccessTokensRepository,
    JwtAuthGuard,
    JwtAccessStrategy,
  ],
  exports: [UserAccessTokensRepository, AuthService],
})
export class AuthModule {}
