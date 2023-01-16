import { MigrationInterface, QueryRunner } from "typeorm";

export class playerGuildId1673898753415 implements MigrationInterface {
	name = "playerGuildId1673898753415";

	public async up(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query("ALTER TABLE \"player\" RENAME TO \"temporary_player\"");
		await queryRunner.query("CREATE TABLE \"player\" (\"id\" integer PRIMARY KEY AUTOINCREMENT NOT NULL, \"guid\" integer NOT NULL, \"name\" varchar NOT NULL, \"level\" integer NOT NULL, \"race_id\" integer NOT NULL, \"class_id\" integer NOT NULL, \"gender\" integer NOT NULL, \"account_name\" varchar NOT NULL, \"account_guid\" integer NOT NULL, \"last_ip_addr\" varchar, \"guild_discord_id\" varchar, CONSTRAINT \"FK_a300eb0a4ffaa4dfa999e1e26eb\" FOREIGN KEY (\"guild_discord_id\") REFERENCES \"guild\" (\"discord_id\") ON DELETE CASCADE ON UPDATE NO ACTION)");
		await queryRunner.query("INSERT INTO \"player\"(\"guid\", \"name\", \"level\", \"race_id\", \"class_id\", \"gender\", \"account_name\", \"account_guid\", \"last_ip_addr\", \"guild_discord_id\") SELECT \"guid\", \"name\", \"level\", \"race_id\", \"class_id\", \"gender\", \"account_name\", \"account_guid\", \"last_ip_addr\", NULL FROM \"temporary_player\"");
		await queryRunner.query("DROP TABLE \"temporary_player\"");
		await queryRunner.query("CREATE INDEX \"IDX_7baa5220210c74f8db27c06f8b\" ON \"player\" (\"name\") ");
	}

	public async down(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query("DROP INDEX \"IDX_7baa5220210c74f8db27c06f8b\"");
		await queryRunner.query("ALTER TABLE \"player\" RENAME TO \"temporary_player\"");
		await queryRunner.query("CREATE TABLE \"player\" (\"guid\" integer PRIMARY KEY NOT NULL, \"name\" varchar NOT NULL, \"level\" integer NOT NULL, \"race_id\" integer NOT NULL, \"class_id\" integer NOT NULL, \"gender\" integer NOT NULL, \"account_name\" varchar NOT NULL, \"account_guid\" integer NOT NULL, \"last_ip_addr\" varchar)");
		await queryRunner.query("INSERT INTO \"player\"(\"guid\", \"name\", \"level\", \"race_id\", \"class_id\", \"gender\", \"account_name\", \"account_guid\", \"last_ip_addr\") SELECT \"guid\", \"name\", \"level\", \"race_id\", \"class_id\", \"gender\", \"account_name\", \"account_guid\", \"last_ip_addr\" FROM \"temporary_player\"");
		await queryRunner.query("DROP TABLE \"temporary_player\"");
	}
}
