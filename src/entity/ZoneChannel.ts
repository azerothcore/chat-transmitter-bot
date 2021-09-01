import { Entity, Column, PrimaryColumn, ManyToOne } from "typeorm";
import { Guild } from "./Guild";

@Entity()
export class ZoneChannel {
	@PrimaryColumn()
	discordId: string;

	@ManyToOne(type => Guild, guild => guild.zoneChannels, { "onDelete": "CASCADE" })
	guild: Guild;

	@Column()
	name: string;
};
