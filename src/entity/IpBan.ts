import { Entity, Column, PrimaryColumn } from "typeorm";

import { db } from "../dataSource";

@Entity()
export class IpBan {
	@PrimaryColumn()
	ipAddress: string;

	@Column()
	attempts: number;

	@Column()
	banned: boolean;

	public static async find(ipAddress: string): Promise<IpBan | null> {
		return await db.findOneBy(IpBan, { ipAddress });
	}

	public static async addConnectionAttempt(ipAddress: string): Promise<IpBan> {
		let entry = await this.find(ipAddress);

		if (!entry) {
			entry = new IpBan();
			entry.ipAddress = ipAddress;
			entry.attempts = 0;
			entry.banned = false;
		}

		++entry.attempts;
		if (entry.attempts >= 3) {
			entry.banned = true;
		}

		await db.save(entry);
		return entry;
	}
}
