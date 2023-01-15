import path from "path";
import fs from "fs-extra";
import { Entity, Column, PrimaryColumn } from "typeorm";

import { Bot } from "../Bot";
import { db } from "../dataSource";

@Entity()
export class QueryResult {
	@PrimaryColumn()
	id: string;

	@Column()
	created: Date;

	public constructor(id: string) {
		this.id = id;
		this.created = new Date();
	}

	public static async findAll(): Promise<QueryResult[]> {
		return await db.getRepository(QueryResult).find();
	}

	public async delete(): Promise<void> {
		try {
			await fs.remove(path.join(Bot.instance.tmpQueryResultsDir, `${this.id}.json`));
			await fs.remove(path.join(Bot.instance.tmpQueryResultsDir, `${this.id}.csv`));
		} catch (err) {
			console.warn(`An error occurred while deleting query results: ${err}`);
		}
		await db.remove(this);
	}

	public async save(): Promise<void> {
		await db.save(this);
	}
}
