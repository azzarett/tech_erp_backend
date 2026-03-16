import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  OneToMany,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';
import { UserAccessTokenDao } from './user-access-token.dao';

@Entity('users')
export class UserDao {
  @PrimaryColumn({ name: 'id', type: 'char', length: 36 })
  id: string;

  @Column({ name: 'identifier', type: 'varchar', length: 255, unique: true })
  identifier: string;

  @Column({ name: 'password', type: 'varchar', length: 255 })
  password: string;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  createdAt: string;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp' })
  updatedAt: string;

  @DeleteDateColumn({ name: 'deleted_at', type: 'timestamp', nullable: true })
  deletedAt: string | null;

  @OneToMany(() => UserAccessTokenDao, (token) => token.user)
  accessTokens: UserAccessTokenDao[];
}
