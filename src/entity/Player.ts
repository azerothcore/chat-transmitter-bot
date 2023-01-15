import { Entity, PrimaryColumn, Column } from "typeorm";

import { db } from "../dataSource";
import { IPlayerInfo } from "../model/IPlayerInfo";

@Entity()
export class Player {
	@PrimaryColumn()
	guid: number;

	@Column()
	name: string;

	@Column()
	level: number;

	@Column()
	raceId: number;

	@Column()
	classId: number;

	@Column()
	gender: number;

	@Column()
	accountName: string;

	@Column()
	accountGuid: number;

	@Column({ nullable: true })
	lastIpAddr: string;

	public static async findOne(name: string): Promise<Player | null> {
		return await db.getRepository(Player)
			.createQueryBuilder("player")
			.where("LOWER(player.name) LIKE LOWER(:name)", { name: `${name}%` })
			.getOne();
	}

	public static async find(name: string): Promise<Player[]> {
		return await db.getRepository(Player)
			.createQueryBuilder("player")
			.where("LOWER(player.name) LIKE LOWER(:name)", { name: `${name}%` })
			.getMany();
	}

	public static async save(data: IPlayerInfo): Promise<Player> {
		let player = await db.findOneBy(Player, { guid: data.guid });
		if (!player) {
			player = new Player();
		}

		player.guid = data.guid;
		player.name = data.name;
		player.level = data.level;
		player.raceId = data.raceId;
		player.classId = data.classId;
		player.gender = data.gender;
		player.accountName = data.accountName;
		player.accountGuid = data.accountGuid;
		player.lastIpAddr = data.lastIpAddr;
		await db.save(player);

		return player;
	}
}
