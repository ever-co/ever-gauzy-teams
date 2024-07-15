import { IBasePerTenantAndOrganizationEntity } from './IBaseModel';
import { IEmployee, IRelationnalEmployee } from './IEmployee';
import { IOrganization } from './IOrganization';
import { ITeamTask } from './ITask';

export interface IDailyPlanBase extends IBasePerTenantAndOrganizationEntity {
	date: Date;
	workTimePlanned: number;
	status: DailyPlanStatusEnum;
}

export class IRemoveTaskFromManyPlans {
	employeeId?: IEmployee['id'];
	plansIds?: IDailyPlan['id'][];
	organizationId?: IOrganization['id']
}

export interface IDailyPlan extends IDailyPlanBase, IRelationnalEmployee {
	tasks?: ITeamTask[];
}

export interface ICreateDailyPlan extends IDailyPlanBase, IRelationnalEmployee {
	taskId?: ITeamTask['id'];
}

export interface IUpdateDailyPlan extends Partial<IDailyPlanBase>, Pick<ICreateDailyPlan, 'employeeId'> { }

export interface IDailyPlanTasksUpdate
	extends Pick<ICreateDailyPlan, 'taskId' | 'employeeId'>,
	IBasePerTenantAndOrganizationEntity { }

export enum DailyPlanStatusEnum {
	OPEN = 'open',
	IN_PROGRESS = 'in-progress',
	COMPLETED = 'completed'
}

export type IDailyPlanMode = 'today' | 'tomorow' | 'custom';
