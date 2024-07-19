import moment from 'moment';
import { ITeamTask } from '@app/interfaces/ITask';
import { ITasksTimesheet } from '@app/interfaces/ITimer';
import { atom, selector } from 'recoil';

export const teamTasksState = atom<ITeamTask[]>({
	key: 'teamTasksState',
	default: []
});

export const activeTeamTaskState = atom<ITeamTask | null>({
	key: 'activeTeamTaskState',
	default: null
});
export const activeTeamTaskId = atom<{ id: string }>({
	key: 'activeTeamTaskId',
	default: {
		id: ''
	}
});
export const tasksFetchingState = atom<boolean>({
	key: 'tasksFetchingState',
	default: false
});

export const detailedTaskState = atom<ITeamTask | null>({
	key: 'detailedTaskState',
	default: null
});

// export const employeeTasksState = atom<ITeamTask[] | null>({
// 	key: 'employeeTasksState',
// 	default: null
// });

export const tasksByTeamState = selector<ITeamTask[]>({
	key: 'tasksByTeamState',
	get: ({ get }) => {
		const tasks = get(teamTasksState);

		return tasks
			.filter(() => {
				return true;
			})
			.sort((a, b) => moment(b.createdAt).diff(a.createdAt));
	}
});

export const tasksStatisticsState = atom<{
	all: ITasksTimesheet[];
	today: ITasksTimesheet[];
}>({
	key: 'tasksStatisticsState',
	default: {
		all: [],
		today: []
	}
});

export const activeTaskStatisticsState = atom<{
	total: ITasksTimesheet | null;
	today: ITasksTimesheet | null;
}>({
	key: 'activeTaskStatisticsState',
	default: {
		total: null,
		today: null
	}
});

export const allTaskStatisticsState = atom<ITasksTimesheet[]>({
	key: 'allTaskStatisticsState',
	default: []
});
