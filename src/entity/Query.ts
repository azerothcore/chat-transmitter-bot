import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, Equal } from "typeorm";

import { Guild } from "./Guild";
import { db } from "../dataSource";

export enum EDatabase {
	Auth,
	Characters,
	World,
	Eluna,
}

@Entity()
export class Query {
	@PrimaryGeneratedColumn("increment")
	id: number;

	@Column()
	name: string;

	@Column()
	query: string;

	@Column()
	database: EDatabase;

	@Column()
	adminQuery: boolean;

	@ManyToOne(_type => Guild, guild => guild.queries, { onDelete: "CASCADE" })
	guild: Guild;

	public static async findAll(guild: Guild): Promise<Query[]> {
		return await db.find(Query, {
			where: {
				guild: {
					discordId: guild.discordId,
				},
			},
		});
	}

	public static async find(name: string, guild: Guild): Promise<Query[]> {
		return await db.getRepository(Query)
			.createQueryBuilder("query")
			.where("LOWER(query.name) LIKE LOWER(:name)", { name: `%${name}%` })
			.andWhere("query.guild_discord_id = :guild", { guild: guild.discordId })
			.getMany();
	}

	public static async findOne(name: string, guild: Guild): Promise<Query | null> {
		return await db.getRepository(Query)
			.createQueryBuilder("query")
			.where("LOWER(query.name) = LOWER(:name)", { name })
			.andWhere("query.guild_discord_id = :guild", { guild: guild.discordId })
			.getOne();
	}

	public static async save(name: string, query: string, database: EDatabase, admin: boolean, guild: Guild): Promise<Query> {
		const q = new Query();
		q.name = name;
		q.query = query;
		q.database = database;
		q.adminQuery = admin;
		q.guild = guild;
		await db.save(q);
		return q;
	}

	public async delete(): Promise<void> {
		await db.remove(this);
	}

	public getDatabaseName(): string {
		return EDatabase[this.database];
	}

	public getArguments(): string[] {
		const matches = this.query.match(/\{[a-zA-Z0-9]+\}/g);
		if (!matches) {
			return [];
		}

		return matches.map(arg => arg.replace("{", "").replace("}", "").trim());
	}

	public getFormattedQuery(values: string[]): string {
		const args = this.getArguments();
		let query = this.query.trim();

		let idx = 0;
		for (const arg of args) {
			query = query.replace(`{${arg}}`, values[idx]);
			++idx;
		}

		return query;
	}
}
