import { Entity, Column, PrimaryColumn, getManager } from "typeorm";

@Entity()
export class IpBan {
	@PrimaryColumn()
	ipAddress: string;

	@Column()
	attempts: number;

	@Column()
	banned: boolean;

	public static async find(ipAddress: string): Promise<IpBan> {
		return await getManager().findOne(IpBan, {
			ipAddress,
		});
	}

	public static async addConnectionAttempt(ipAddress: string): Promise<IpBan> {
		let entry: IpBan = await this.find(ipAddress);

		if (entry === undefined) {
			entry = new IpBan();
			entry.ipAddress = ipAddress;
			entry.attempts = 0;
			entry.banned = false;
		}

		++entry.attempts;
		if (entry.attempts >= 3) {
			entry.banned = true;
		}

		await getManager().save(entry);
		return entry;
	}
};
