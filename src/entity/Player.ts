import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, Index } from "typeorm";

import { Guild } from "./Guild";
import { db } from "../dataSource";
import { IPlayerInfo } from "../model/IPlayerInfo";

@Entity()
export class Player {
	@PrimaryGeneratedColumn("increment")
	id: number;

	@Column()
	guid: number;

	@Column()
	@Index()
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

	@ManyToOne(_type => Guild, guild => guild.players, { onDelete: "CASCADE" })
	guild: Guild;

	public static async findOne(name: string, guild: Guild): Promise<Player | null> {
		return await db.getRepository(Player)
			.createQueryBuilder("player")
			.where("LOWER(player.name) LIKE LOWER(:name)", { name: `${name}%` })
			.andWhere("player.guild_discord_id = :guild", { guild: guild.discordId })
			.getOne();
	}

	public static async find(name: string, guild: Guild): Promise<Player[]> {
		return await db.getRepository(Player)
			.createQueryBuilder("player")
			.where("LOWER(player.name) LIKE LOWER(:name)", { name: `${name}%` })
			.andWhere("player.guild_discord_id = :guild", { guild: guild.discordId })
			.getMany();
	}

	public static async save(data: IPlayerInfo, guild: Guild): Promise<Player> {
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
		player.guild = guild;
		await db.save(player);

		return player;
	}
}
