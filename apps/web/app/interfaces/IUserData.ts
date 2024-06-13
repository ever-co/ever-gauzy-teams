import { IEmployee } from './IEmployee';
import { IImageAssets } from './IImageAssets';

export interface ITeamProps {
	email: string;
	name: string;
	team: string;
	recaptcha?: string;
}

export interface IUser {
	lastName: string;
	email: string;
	imageUrl: string;
	tenantId: string | null;
	thirdPartyId: string | null;
	firstName: string | null;
	username: string | null;
	preferredLanguage: string;
	preferredComponentLayout: string;
	isActive: boolean;
	roleId: string | null;
	id: string;
	isEmailVerified: boolean;
	employee: IEmployee;
	role: Role;
	tenant: Tenant;
	createdAt: string;
	updatedAt: string;
	timeZone?: string;
	name?: string | null | undefined;
	phoneNumber: string | null;
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

export interface IEmail {
	email: string;
}
export interface ICode {
	code: string;
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

//export language list interface
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

//export timezone list interface
export interface ITimezoneItemList {
	length: number | undefined;
	id: string;
	createdAt: string;
	updatedAt: string;
	code: string;
	name: string;
	is_system?: boolean;
	description: string;
	color: string;
	items: [];
	title: string;
}

export interface IRelationalUser {
	user?: IUser;
	userId?: IUser['id'];
}
