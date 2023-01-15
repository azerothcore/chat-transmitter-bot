import { Entity, PrimaryColumn, ManyToOne } from "typeorm";
import { Guild } from "./Guild";

@Entity()
export class AdminRole {
	@PrimaryColumn()
	discordId: string;

	@ManyToOne(type => Guild, guild => guild.adminRoles, { onDelete: "CASCADE" })
	guild: Guild;
}
