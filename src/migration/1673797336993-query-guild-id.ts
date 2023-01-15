import { MigrationInterface, QueryRunner } from "typeorm";

export class queryGuildId1673797336993 implements MigrationInterface {
	name = "queryGuildId1673797336993";

	public async up(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(`CREATE TABLE "temporary_query" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "name" varchar NOT NULL, "query" varchar NOT NULL, "database" integer NOT NULL, "admin_query" boolean NOT NULL, "guild_discord_id" varchar, CONSTRAINT "FK_f6f758ede61f2ea9847271c28ac" FOREIGN KEY ("guild_discord_id") REFERENCES "guild" ("discord_id") ON DELETE CASCADE ON UPDATE NO ACTION)`);
		await queryRunner.query(`INSERT INTO "temporary_query"("id", "name", "query", "database", "admin_query", "guild_discord_id") SELECT "id", "name", "query", "database", "admin_query", "guild_discord_id" FROM "query"`);
		await queryRunner.query(`DROP TABLE "query"`);
		await queryRunner.query(`ALTER TABLE "temporary_query" RENAME TO "query"`);
	}

	public async down(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(`ALTER TABLE "query" RENAME TO "temporary_query"`);
		await queryRunner.query(`CREATE TABLE "query" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "name" varchar NOT NULL, "query" varchar NOT NULL, "database" integer NOT NULL, "admin_query" boolean NOT NULL, "guild_discord_id" varchar)`);
		await queryRunner.query(`INSERT INTO "query"("id", "name", "query", "database", "admin_query") SELECT "id", "name", "query", "database", "admin_query" FROM "temporary_query"`);
		await queryRunner.query(`DROP TABLE "temporary_query"`);
	}
}
