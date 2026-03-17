import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class CreateFilesTable1760000002000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'files',
        columns: [
          {
            name: 'id',
            type: 'char',
            length: '36',
            isPrimary: true,
          },
          {
            name: 'name',
            type: 'varchar',
            length: '255',
          },
          {
            name: 'extension',
            type: 'varchar',
            length: '50',
          },
          {
            name: 'mime_type',
            type: 'varchar',
            length: '255',
          },
          {
            name: 'size',
            type: 'int',
            unsigned: true,
          },
          {
            name: 'upload_date',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'storage_name',
            type: 'varchar',
            length: '255',
            isUnique: true,
          },
          {
            name: 'storage_path',
            type: 'varchar',
            length: '1024',
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'updated_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
        ],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('files');
  }
}
