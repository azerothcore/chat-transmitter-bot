import { Entity, PrimaryColumn, Column, getManager, OneToMany } from "typeorm";
import { Channel } from "./Channel";
import { AdminRole } from "./AdminRole";
import { ZoneChannel } from "./ZoneChannel";

@Entity()
export class Guild {
	@PrimaryColumn()
	discordId: string;

	@Column({ "nullable": true })
	miscChannel: string;

	@OneToMany(type => Channel, chan => chan.guild)
	channels: Channel[];

	@OneToMany(type => ZoneChannel, chan => chan.guild)
	zoneChannels: ZoneChannel[];

	@OneToMany(type => AdminRole, role => role.guild)
	adminRoles: AdminRole[];

	public static async findOrCreate(discordId: string): Promise<Guild> {
		let guild: Guild = await this.find(discordId);

		if (guild === undefined) {
			guild = new Guild();
			guild.discordId = discordId;
			await getManager().save(guild);
		}

		return guild;
	}

	public static async find(discordId: string): Promise<Guild> {
		return await getManager().findOne(Guild, discordId, {
			relations: ["channels", "zoneChannels", "adminRoles"],
		});
	}

	public getChannel(channelName: string): Channel {
		return this.channels.find((c) => c.name === channelName);
	}

	public getZoneChannel(zoneName: string): Channel {
		return this.zoneChannels.find((c) => c.name === zoneName);
	}

	public async addChannel(discordId: string, channelName: string): Promise<Channel> {
		let channel: Channel = this.getChannel(channelName);
		if (channel !== undefined) {
			this.channels.splice(this.channels.indexOf(channel), 1);
			await getManager().remove(Channel, channel);
		}

		channel = new Channel();
		channel.discordId = discordId;
		channel.name = channelName;
		channel.guild = this;
		this.channels.push(channel);

		await getManager().save(channel);
		return channel;
	}

	public async addZoneChannel(discordId: string, zoneName: string): Promise<ZoneChannel> {
		let channel: ZoneChannel = this.getZoneChannel(zoneName);
		if (channel !== undefined) {
			this.zoneChannels.splice(this.zoneChannels.indexOf(channel), 1);
			await getManager().remove(ZoneChannel, channel);
		}

		channel = new ZoneChannel();
		channel.discordId = discordId;
		channel.name = zoneName;
		channel.guild = this;
		this.zoneChannels.push(channel);

		await getManager().save(channel);
		return channel;
	}

	public async addAdminRole(discordId: string): Promise<AdminRole> {
		let role: AdminRole = this.adminRoles.find(r => r.discordId === discordId);
		if (role !== undefined) {
			return role;
		}

		role = new AdminRole();
		role.discordId = discordId;
		role.guild = this;
		this.adminRoles.push(role);

		await getManager().save(role);
		return role;
	}

	public async removeAdminRole(discordId: string): Promise<void> {
		const idx = this.adminRoles.findIndex(r => r.discordId === discordId);
		if (idx !== -1) {
			const role = this.adminRoles[idx];
			await getManager().remove(role);
			this.adminRoles.splice(idx, 1);
		}
	}
};
