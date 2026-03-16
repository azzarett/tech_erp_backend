import { randomUUID } from 'crypto';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserDao } from 'src/common/dao';

@Injectable()
export class UsersRepository {
  constructor(
    @InjectRepository(UserDao)
    private readonly usersRepository: Repository<UserDao>,
  ) {}

  createAndGetUser(payload: {
    identifier: string;
    password: string;
  }): Promise<UserDao> {
    return this.usersRepository.save({
      id: randomUUID(),
      identifier: payload.identifier,
      password: payload.password,
    });
  }

  getOneByIdentifier(identifier: string): Promise<UserDao | null> {
    return this.usersRepository.findOne({ where: { identifier } });
  }

  getOneById(id: string): Promise<UserDao | null> {
    return this.usersRepository.findOne({ where: { id } });
  }
}
