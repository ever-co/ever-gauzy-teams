import { IEmployee } from './IEmployee';
import { IImageAssets } from './IImageAssets';

export interface ITeamProps {
	email: string;
	name: string;
	team: string;
}

export interface IUser {
	lastName: string;
	email: string;
	imageUrl: string;
	name: string;
	tenantId: string | null;
	thirdPartyId: string | null;
	firstName: string | null;
	username: string | null;
	phoneNumber: string | null;
	isEmailVerified: boolean;
	preferredLanguage: string;
	preferredComponentLayout: string;
	timeZone: string | null;
	isActive: boolean;
	roleId: string | null;
	id: string;
	employee: IEmployee;
	role: Role;
	tenant: Tenant;
	createdAt: string;
	updatedAt: string;
	imageId?: string | null;
	image?: IImageAssets | null;
}

interface Role {
	id: string;
	createdAt: string;
	updatedAt: string;
	tenantId: string;
	name: string;
	isSystem: boolean;
}

interface Tenant {
	id: string;
	createdAt: string;
	updatedAt: string;
	name: string;
	logo: string;
}

export interface ITokens {
	token: string;
}

export interface IUserData {
	id?: string;
	token: string;
	email: string;
	firstName: string;
	lastName?: string;
	imageUrl?: string;
	username?: string;
	isActive?: boolean;
}

export interface ILanguageItemList {
	id: string;
	createdAt: string;
	updatedAt: string;
	code: string;
	name: string;
	is_system?: boolean;
	description: string;
	color: string;
	items: [];
	data: any;
}
