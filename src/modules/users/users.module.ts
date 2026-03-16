import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserDao } from 'src/common/dao';
import { UsersRepository } from './data';
import { UsersService } from './domain';

@Module({
  imports: [TypeOrmModule.forFeature([UserDao])],
  providers: [UsersRepository, UsersService],
  exports: [UsersRepository, UsersService],
})
export class UsersModule {}
