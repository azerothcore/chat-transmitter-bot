import path from "path";
import { DataSource } from "typeorm";
import { SnakeNamingStrategy } from "typeorm-naming-strategies";

export const dataSource = new DataSource({
	type: "sqlite",
	database: "data.sqlite",
	synchronize: false,
	logging: false,
	migrationsRun: true,
	entities: [path.join(__dirname, "entity/**/*.js")],
	migrations: [path.join(__dirname, "migration/**/*.js")],
	namingStrategy: new SnakeNamingStrategy(),
});

export const db = dataSource.manager;
