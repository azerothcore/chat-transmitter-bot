import { Entity, Column, PrimaryColumn, Raw } from "typeorm";

import { db } from "../dataSource";

@Entity()
export class Area {
	@PrimaryColumn()
	id: number;

	@Column()
	name: string;

	public static async findAll(): Promise<Area[]> {
		return await db.find(Area);
	}

	public static async find(name: string): Promise<Area[]> {
		return await db.find(Area, {
			where: {
				name: Raw((column: string) => `LOWER(${column}) LIKE LOWER('%${name}%')`),
			},
		});
	}

	public static async findById(id: number): Promise<Area | null> {
		return await db.findOneBy(Area, { id });
	}
}
