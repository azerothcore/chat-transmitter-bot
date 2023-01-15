import { GuildMember } from "discord.js";
import { Entity, PrimaryColumn, Column, OneToMany } from "typeorm";

import { Bot } from "../Bot";
import { Query } from "./Query";
import { db } from "../dataSource";
import { Channel } from "./Channel";
import { AdminRole } from "./AdminRole";
import { ZoneChannel } from "./ZoneChannel";

@Entity()
export class Guild {
	@PrimaryColumn()
	discordId: string;

	@Column({ nullable: true })
	miscChannel: string;

	@Column({ nullable: true })
	anticheatReportsChannel: string;

	@OneToMany(_type => Channel, chan => chan.guild)
	channels: Channel[];

	@OneToMany(_type => ZoneChannel, chan => chan.guild)
	zoneChannels: ZoneChannel[];

	@OneToMany(_type => AdminRole, role => role.guild)
	adminRoles: AdminRole[];

	@OneToMany(_type => Query, query => query.guild)
	queries: Query[];

	public static async findOrCreate(discordId: string): Promise<Guild> {
		let guild = await Guild.find(discordId);

		if (!guild) {
			guild = new Guild();
			guild.discordId = discordId;
			await guild.save();
			guild = await Guild.find(discordId);
			if (!guild) {
				throw new Error(`Could not find guild ${discordId} after its creation`);
			}
		}

		return guild;
	}

	public static async find(discordId: string): Promise<Guild | null> {
		return await db.findOne(Guild, {
			where: { discordId },
			relations: ["channels", "zoneChannels", "adminRoles", "adminRoles.guild", "queries"],
		});
	}

	public getChannel(channelName: string): Channel | undefined {
		return this.channels.find((c) => c.name === channelName);
	}

	public getZoneChannel(zoneName: string): Channel | undefined {
		return this.zoneChannels.find((c) => c.name === zoneName);
	}

	public async addChannel(discordId: string, channelName: string): Promise<Channel> {
		let channel = this.getChannel(channelName);
		if (channel) {
			this.channels.splice(this.channels.indexOf(channel), 1);
			await db.remove(Channel, channel);
		}

		channel = new Channel();
		channel.discordId = discordId;
		channel.name = channelName;
		channel.guild = this;
		this.channels.push(channel);

		await db.save(channel);
		return channel;
	}

	public async addZoneChannel(discordId: string, zoneName: string): Promise<ZoneChannel> {
		let channel = this.getZoneChannel(zoneName);
		if (channel) {
			this.zoneChannels.splice(this.zoneChannels.indexOf(channel), 1);
			await db.remove(ZoneChannel, channel);
		}

		channel = new ZoneChannel();
		channel.discordId = discordId;
		channel.name = zoneName;
		channel.guild = this;
		this.zoneChannels.push(channel);

		await db.save(channel);
		return channel;
	}

	public async addAdminRole(discordId: string): Promise<AdminRole> {
		let role = this.adminRoles.find(r => r.discordId === discordId);
		if (role) {
			return role;
		}

		role = new AdminRole();
		role.discordId = discordId;
		role.guild = this;
		this.adminRoles.push(role);

		await db.save(role);
		return role;
	}

	public async removeAdminRole(discordId: string): Promise<boolean> {
		const idx = this.adminRoles.findIndex(r => r.discordId === discordId);
		if (idx !== -1) {
			const role = this.adminRoles[idx];
			await db.remove(role);
			this.adminRoles.splice(idx, 1);
			return true;
		}
		return false;
	}

	public async isMemberAdmin(member: GuildMember | string) {
		const fetched = await this.fetchMember(member);
		return fetched?.roles.cache.some(role => this.adminRoles.some(adminRole => adminRole.guild.discordId === this.discordId && adminRole.discordId === role.id)) ?? false;
	}

	private async fetchMember(member: GuildMember | string) {
		if (member instanceof GuildMember) {
			return await member.fetch();
		} else {
			return await Bot.instance.client.guilds.cache.get(this.discordId)?.members.fetch(member);
		}
	}

	public async save() {
		await db.save(this);
	}
}
