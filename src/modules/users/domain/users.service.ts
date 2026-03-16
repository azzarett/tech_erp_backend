import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { UserDao } from 'src/common/dao';
import { UsersRepository } from '../data';

@Injectable()
export class UsersService {
  constructor(private readonly usersRepository: UsersRepository) {}

  getUserById(id: string): Promise<UserDao | null> {
    return this.usersRepository.getOneById(id);
  }

  getUserByIdentifier(identifier: string): Promise<UserDao | null> {
    return this.usersRepository.getOneByIdentifier(identifier);
  }

  async registerUser(payload: {
    identifier: string;
    password: string;
  }): Promise<UserDao> {
    const existingUser = await this.usersRepository.getOneByIdentifier(
      payload.identifier,
    );

    if (existingUser) {
      throw new HttpException('User already exists', HttpStatus.BAD_REQUEST);
    }

    return this.usersRepository.createAndGetUser(payload);
  }
}
