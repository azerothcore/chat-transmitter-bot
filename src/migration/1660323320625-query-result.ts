import { MigrationInterface, QueryRunner } from "typeorm";

export class queryResult1660323320625 implements MigrationInterface {
	name = "queryResult1660323320625";

	public async up(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query("CREATE TABLE \"query_result\" (\"id\" varchar PRIMARY KEY NOT NULL, \"created\" datetime NOT NULL)");
	}

	public async down(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query("DROP TABLE \"query_result\"");
	}
}
