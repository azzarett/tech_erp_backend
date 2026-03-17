import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('files')
export class FileDao {
  @PrimaryColumn({ name: 'id', type: 'char', length: 36 })
  id: string;

  @Column({ name: 'name', type: 'varchar', length: 255 })
  name: string;

  @Column({ name: 'extension', type: 'varchar', length: 50 })
  extension: string;

  @Column({ name: 'mime_type', type: 'varchar', length: 255 })
  mimeType: string;

  @Column({ name: 'size', type: 'int', unsigned: true })
  size: number;

  @CreateDateColumn({ name: 'upload_date', type: 'timestamp' })
  uploadDate: string;

  @Column({ name: 'storage_name', type: 'varchar', length: 255, unique: true })
  storageName: string;

  @Column({ name: 'storage_path', type: 'varchar', length: 1024 })
  storagePath: string;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  createdAt: string;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp' })
  updatedAt: string;
}
