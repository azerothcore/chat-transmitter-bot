import { Entity, PrimaryColumn, Column, getManager, getRepository } from "typeorm";
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
	accountName: string;

	@Column()
	accountGuid: number;

	@Column({ nullable: true })
	lastIpAddr: string;

	public static async find(name: string): Promise<Player> {
		return await getRepository(Player)
			.createQueryBuilder("player")
			.where("player.name like :name", { name })
			.getOne();
	}

	public static async save(data: IPlayerInfo): Promise<Player> {
		let player = await getManager().findOne(Player, data.guid);
		if (player === undefined) {
			player = new Player();
		}

		player.guid = data.guid;
		player.name = data.name;
		player.level = data.level;
		player.raceId = data.raceId;
		player.classId = data.classId;
		player.accountName = data.accountName;
		player.accountGuid = data.accountGuid;
		player.lastIpAddr = data.lastIpAddr;
		await getManager().save(player);

		return player;
	}
};
