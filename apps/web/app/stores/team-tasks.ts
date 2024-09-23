import moment from 'moment';
import { ITeamTask } from '@app/interfaces/ITask';
import { ITasksTimesheet } from '@app/interfaces/ITimer';
import { atom } from 'jotai';

export const teamTasksState = atom<ITeamTask[]>([]);

export const activeTeamTaskState = atom<ITeamTask | null>(null);
export const activeTeamTaskId = atom<{ id: string }>({
  id: ''
});
export const tasksFetchingState = atom<boolean>(false);

export const detailedTaskState = atom<ITeamTask | null>(null);

// export const employeeTasksState = atom<ITeamTask[] | null>({
// 	key: 'employeeTasksState',
// 	default: null
// });

export const tasksByTeamState = atom<ITeamTask[]>((get) => {
  const tasks = get(teamTasksState);

  return tasks
    .filter(() => {
      return true;
    })
    .sort((a, b) => moment(b.createdAt).diff(a.createdAt));
});

export const tasksStatisticsState = atom<{
  all: ITasksTimesheet[];
  today: ITasksTimesheet[];
}>({
  all: [],
  today: []
});

export const activeTaskStatisticsState = atom<{
  total: ITasksTimesheet | null;
  today: ITasksTimesheet | null;
}>({
  total: null,
  today: null
});

export const allTaskStatisticsState = atom<ITasksTimesheet[]>([]);
