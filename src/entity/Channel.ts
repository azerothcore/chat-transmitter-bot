import { Entity, Column, PrimaryColumn, ManyToOne } from "typeorm";
import { Guild } from "./Guild";

@Entity()
export class Channel {
	@PrimaryColumn()
	discordId: string;

	@ManyToOne(_type => Guild, guild => guild.zoneChannels, { onDelete: "CASCADE" })
	guild: Guild;

	@Column()
	name: string;
}
