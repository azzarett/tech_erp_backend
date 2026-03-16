import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';
import { UserDao } from './user.dao';

@Entity('user_access_tokens')
export class UserAccessTokenDao {
  @PrimaryColumn({ name: 'id', type: 'char', length: 36 })
  id: string;

  @Column({ name: 'user_id', type: 'char', length: 36 })
  userId: string;

  @Column({ name: 'access_token', type: 'varchar', length: 512, unique: true })
  accessToken: string;

  @Column({ name: 'refresh_token', type: 'varchar', length: 512, unique: true })
  refreshToken: string;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  createdAt: string;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp' })
  updatedAt: string;

  @DeleteDateColumn({ name: 'deleted_at', type: 'timestamp', nullable: true })
  deletedAt: string | null;

  @ManyToOne(() => UserDao, (user) => user.accessTokens)
  @JoinColumn({ name: 'user_id' })
  user: UserDao;
}
