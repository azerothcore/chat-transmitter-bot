import { MigrationInterface, QueryRunner } from "typeorm";

export class init1651100640892 implements MigrationInterface {
	name = "init1651100640892";

	public async up(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query("CREATE TABLE \"channel\" (\"discord_id\" varchar PRIMARY KEY NOT NULL, \"name\" varchar NOT NULL, \"guild_discord_id\" varchar)");
		await queryRunner.query("CREATE TABLE \"zone_channel\" (\"discord_id\" varchar PRIMARY KEY NOT NULL, \"name\" varchar NOT NULL, \"guild_discord_id\" varchar)");
		await queryRunner.query("CREATE TABLE \"guild\" (\"discord_id\" varchar PRIMARY KEY NOT NULL, \"misc_channel\" varchar)");
		await queryRunner.query("CREATE TABLE \"admin_role\" (\"discord_id\" varchar PRIMARY KEY NOT NULL, \"guild_discord_id\" varchar)");
		await queryRunner.query("CREATE TABLE \"area\" (\"id\" integer PRIMARY KEY NOT NULL, \"name\" varchar NOT NULL)");
		await queryRunner.query("CREATE TABLE \"player\" (\"guid\" integer PRIMARY KEY NOT NULL, \"name\" varchar NOT NULL, \"level\" integer NOT NULL, \"race_id\" integer NOT NULL, \"class_id\" integer NOT NULL, \"gender\" integer DEFAULT 0, \"account_name\" varchar NOT NULL, \"account_guid\" integer NOT NULL, \"last_ip_addr\" varchar)");
		await queryRunner.query("CREATE TABLE \"ip_ban\" (\"ip_address\" varchar PRIMARY KEY NOT NULL, \"attempts\" integer NOT NULL, \"banned\" boolean NOT NULL)");
		await queryRunner.query("CREATE TABLE \"query\" (\"id\" integer PRIMARY KEY AUTOINCREMENT NOT NULL, \"name\" varchar NOT NULL, \"query\" varchar NOT NULL, \"database\" integer NOT NULL, \"admin_query\" boolean NOT NULL)");
		await queryRunner.query("CREATE TABLE \"temporary_channel\" (\"discord_id\" varchar PRIMARY KEY NOT NULL, \"name\" varchar NOT NULL, \"guild_discord_id\" varchar, CONSTRAINT \"FK_0722a9de529d4efb5c7f9d5da26\" FOREIGN KEY (\"guild_discord_id\") REFERENCES \"guild\" (\"discord_id\") ON DELETE CASCADE ON UPDATE NO ACTION)");
		await queryRunner.query("INSERT INTO \"temporary_channel\"(\"discord_id\", \"name\", \"guild_discord_id\") SELECT \"discord_id\", \"name\", \"guild_discord_id\" FROM \"channel\"");
		await queryRunner.query("DROP TABLE \"channel\"");
		await queryRunner.query("ALTER TABLE \"temporary_channel\" RENAME TO \"channel\"");
		await queryRunner.query("CREATE TABLE \"temporary_zone_channel\" (\"discord_id\" varchar PRIMARY KEY NOT NULL, \"name\" varchar NOT NULL, \"guild_discord_id\" varchar, CONSTRAINT \"FK_7f53650bc7f152e285a72da969d\" FOREIGN KEY (\"guild_discord_id\") REFERENCES \"guild\" (\"discord_id\") ON DELETE CASCADE ON UPDATE NO ACTION)");
		await queryRunner.query("INSERT INTO \"temporary_zone_channel\"(\"discord_id\", \"name\", \"guild_discord_id\") SELECT \"discord_id\", \"name\", \"guild_discord_id\" FROM \"zone_channel\"");
		await queryRunner.query("DROP TABLE \"zone_channel\"");
		await queryRunner.query("ALTER TABLE \"temporary_zone_channel\" RENAME TO \"zone_channel\"");
		await queryRunner.query("CREATE TABLE \"temporary_admin_role\" (\"discord_id\" varchar PRIMARY KEY NOT NULL, \"guild_discord_id\" varchar, CONSTRAINT \"FK_61f84f53e28fc1f18d7284b0882\" FOREIGN KEY (\"guild_discord_id\") REFERENCES \"guild\" (\"discord_id\") ON DELETE CASCADE ON UPDATE NO ACTION)");
		await queryRunner.query("INSERT INTO \"temporary_admin_role\"(\"discord_id\", \"guild_discord_id\") SELECT \"discord_id\", \"guild_discord_id\" FROM \"admin_role\"");
		await queryRunner.query("DROP TABLE \"admin_role\"");
		await queryRunner.query("ALTER TABLE \"temporary_admin_role\" RENAME TO \"admin_role\"");
	}

	public async down(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query("ALTER TABLE \"admin_role\" RENAME TO \"temporary_admin_role\"");
		await queryRunner.query("CREATE TABLE \"admin_role\" (\"discord_id\" varchar PRIMARY KEY NOT NULL, \"guild_discord_id\" varchar)");
		await queryRunner.query("INSERT INTO \"admin_role\"(\"discord_id\", \"guild_discord_id\") SELECT \"discord_id\", \"guild_discord_id\" FROM \"temporary_admin_role\"");
		await queryRunner.query("DROP TABLE \"temporary_admin_role\"");
		await queryRunner.query("ALTER TABLE \"zone_channel\" RENAME TO \"temporary_zone_channel\"");
		await queryRunner.query("CREATE TABLE \"zone_channel\" (\"discord_id\" varchar PRIMARY KEY NOT NULL, \"name\" varchar NOT NULL, \"guild_discord_id\" varchar)");
		await queryRunner.query("INSERT INTO \"zone_channel\"(\"discord_id\", \"name\", \"guild_discord_id\") SELECT \"discord_id\", \"name\", \"guild_discord_id\" FROM \"temporary_zone_channel\"");
		await queryRunner.query("DROP TABLE \"temporary_zone_channel\"");
		await queryRunner.query("ALTER TABLE \"channel\" RENAME TO \"temporary_channel\"");
		await queryRunner.query("CREATE TABLE \"channel\" (\"discord_id\" varchar PRIMARY KEY NOT NULL, \"name\" varchar NOT NULL, \"guild_discord_id\" varchar)");
		await queryRunner.query("INSERT INTO \"channel\"(\"discord_id\", \"name\", \"guild_discord_id\") SELECT \"discord_id\", \"name\", \"guild_discord_id\" FROM \"temporary_channel\"");
		await queryRunner.query("DROP TABLE \"temporary_channel\"");
		await queryRunner.query("DROP TABLE \"query\"");
		await queryRunner.query("DROP TABLE \"ip_ban\"");
		await queryRunner.query("DROP TABLE \"player\"");
		await queryRunner.query("DROP TABLE \"area\"");
		await queryRunner.query("DROP TABLE \"admin_role\"");
		await queryRunner.query("DROP TABLE \"guild\"");
		await queryRunner.query("DROP TABLE \"zone_channel\"");
		await queryRunner.query("DROP TABLE \"channel\"");
	}

}
