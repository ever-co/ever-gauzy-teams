import { IEmployee } from './IEmployee';
import { IOrganizationTeamList } from './IOrganizationTeam';

export type ITeamTask = {
	id: string;
	createdAt: string;
	updatedAt: string;
	tenantId: string;
	organizationId: string;
	number: number;
	prefix: string;
	title: string;
	description: string;
	estimate: null | number;
	estimateDays?: number;
	estimateHours?: number;
	estimateMinutes?: number;
	dueDate: string;
	projectId: string;
	creatorId: string;
	members: IEmployee[];
	selectedTeam?: IOrganizationTeamList;
	tags: Tag[];
	teams: SelectedTeam[];
	creator: Creator;
	taskNumber: string;
	privacy: ITaskPrivacy;
} & ITaskStatusStack;

type SelectedTeam = Pick<
	IOrganizationTeamList,
	| 'id'
	| 'createdAt'
	| 'name'
	| 'organizationId'
	| 'tenantId'
	| 'updatedAt'
	| 'prefix'
>;

interface Tag {
	id: string;
	createdAt: string;
	updatedAt: string;
	tenantId: string;
	organizationId: string;
	name: string;
	description: string;
	color: string;
	isSystem: boolean;
}

interface Creator {
	id: string;
	createdAt: string;
	updatedAt: string;
	tenantId: string;
	thirdPartyId: any;
	firstName: string;
	lastName: string;
	email: string;
	username: any;
	hash: string;
	refreshToken: any;
	imageUrl: string;
	preferredLanguage: string;
	preferredComponentLayout: string;
	isActive: boolean;
	roleId: string;
	name: string;
	employeeId: any;
}

export type ITaskPrivacy = 'public' | 'private';

export type ITaskPriority = 'Medium' | 'High' | 'Low' | 'Urgent';

export type IVersionProperty = 'Version 1' | 'Version 2';

export type IEpicProperty = string;

export type ITaskSize = 'Extra Large' | 'Large' | 'Medium' | 'Small' | 'Tiny';

export type ITaskLabel = 'UI/UX' | 'Mobile' | 'WEB' | 'Tablet';

export type ITaskStatus =
	| 'Blocked'
	| 'Ready'
	| 'Backlog'
	| 'Todo'
	| 'In Progress'
	| 'Completed'
	| 'Closed'
	| 'In Review';

export type ITaskIssue = 'Bug' | 'Task' | 'Story' | 'Epic';

export type ITaskStatusField =
	| 'status'
	| 'size'
	| 'priority'
	| 'label'
	| 'issue'
	| 'version'
	| 'epic'
	| 'project'
	| 'team';

export type ITaskStatusStack = {
	status: ITaskStatus;
	size: ITaskSize;
	label: ITaskLabel;
	priority: ITaskPriority;
	issue: ITaskIssue;
	version: IVersionProperty;
	epic: IEpicProperty;
	project: string; //TODO: these types are not strings, but rather objects for team and project. To reimplement
	team: string; //TODO: these types are not strings, but rather objects for team and project. To reimplement
};

export interface ICreateTask {
	title: string;
	status: ITaskStatus;
	members?: { id: string; [x: string]: any }[];
	estimateDays?: number;
	estimateHours?: string;
	estimateMinutes?: string;
	dueDate?: string;
	description: string;
	tags: { id: string }[];
	teams: { id: string }[];
	estimate: number;
	privacy: ITaskPrivacy;
	organizationId: string;
	tenantId: string;
}
