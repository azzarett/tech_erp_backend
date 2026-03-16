import {
  MigrationInterface,
  QueryRunner,
  TableColumn,
  TableUnique,
} from 'typeorm';

export class AlterUsersAuthColumns1760000000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumns('users', [
      new TableColumn({
        name: 'identifier',
        type: 'text',
        isNullable: true,
      }),
      new TableColumn({ name: 'password', type: 'text', isNullable: true }),
    ]);

    await queryRunner.createUniqueConstraint(
      'users',
      new TableUnique({
        name: 'users_identifier_unique',
        columnNames: ['identifier'],
      }),
    );

    await queryRunner.query(
      `UPDATE users SET identifier = id::text WHERE identifier IS NULL`,
    );
    await queryRunner.query(
      `UPDATE users SET password = '' WHERE password IS NULL`,
    );

    await queryRunner.changeColumn(
      'users',
      'identifier',
      new TableColumn({
        name: 'identifier',
        type: 'text',
        isNullable: false,
      }),
    );

    await queryRunner.changeColumn(
      'users',
      'password',
      new TableColumn({
        name: 'password',
        type: 'text',
        isNullable: false,
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropUniqueConstraint('users', 'users_identifier_unique');
    await queryRunner.dropColumn('users', 'password');
    await queryRunner.dropColumn('users', 'identifier');
  }
}
