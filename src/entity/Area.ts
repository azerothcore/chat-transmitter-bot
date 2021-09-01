import { Entity, Column, PrimaryColumn, getManager, Raw } from "typeorm";

@Entity()
export class Area {
	@PrimaryColumn()
	id: number;

	@Column()
	name: string;

	public static async find(name: string): Promise<Area[]> {
		return await getManager().find(Area, {
			where: {
				name: Raw((column: string) => `LOWER(${column}) LIKE LOWER('%${name}%')`),
			},
		});
	}

	public static async findById(id: number): Promise<Area> {
		return await getManager().findOne(Area, id);
	}
};
