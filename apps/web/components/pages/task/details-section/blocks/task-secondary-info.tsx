import { useModal, useSyncRef, useTeamTasks } from '@app/hooks';
import { detailedTaskState, taskVersionListState } from '@app/stores';
import {
	ActiveTaskPropertiesDropdown,
	ActiveTaskSizesDropdown,
	ActiveTaskStatusDropdown,
	ActiveTaskVersionDropdown,
	EpicPropertiesDropdown as TaskEpicDropdown,
	TaskLabels,
} from 'lib/features';
import { useCallback, useState } from 'react';
import { useRecoilValue } from 'recoil';
import TaskRow from '../components/task-row';
import { useTranslation } from 'lib/i18n';
import { Button, Card, Modal } from 'lib/components';
import { PlusIcon } from '@heroicons/react/20/solid';
import {
	TaskPrioritiesForm,
	TaskSizesForm,
	TaskStatusesForm,
} from 'lib/settings';
import { VersionForm } from 'lib/settings/version-form';
import { ITaskVersionCreate, ITeamTask } from '@app/interfaces';
import { cloneDeep } from 'lodash';

type StatusType = 'version' | 'epic' | 'status' | 'label' | 'size' | 'priority';

const TaskSecondaryInfo = () => {
	const task = useRecoilValue(detailedTaskState);
	const taskVersion = useRecoilValue(taskVersionListState);
	const $taskVersion = useSyncRef(taskVersion);
	const { updateTask } = useTeamTasks();

	const { handleStatusUpdate } = useTeamTasks();

	const { trans } = useTranslation('taskDetails');

	const modal = useModal();
	const [formTarget, setFormTarget] = useState<StatusType | null>(null);

	const openModalEditionHandle = useCallback(
		(type: StatusType) => {
			return () => {
				setFormTarget(type);
				modal.openModal();
			};
		},
		[modal]
	);

	const onVersionCreated = useCallback(
		(version: ITaskVersionCreate) => {
			if ($taskVersion.current.length === 0) {
				handleStatusUpdate(version.value || version.name, 'version', task);
			}
		},
		[$taskVersion, task, handleStatusUpdate]
	);

	const onTaskSelect = useCallback(
		async (parentTask: ITeamTask | undefined) => {
			if (!parentTask) return;
			const childTask = cloneDeep(task);

			await updateTask({
				...childTask,
				parentId: parentTask.id ? parentTask.id : null,
				parent: parentTask.id ? parentTask : null,
			} as any);
		},
		[task, updateTask]
	);

	return (
		<section className="flex flex-col gap-4 p-[0.9375rem]">
			{/* Version */}
			<TaskRow labelTitle={trans.VERSION}>
				<ActiveTaskVersionDropdown
					task={task}
					className="lg:min-w-[170px] text-black"
					forDetails={true}
					sidebarUI={true}
					taskStatusClassName="text-[0.625rem] h-[1.5625rem] max-w-[7.6875rem] rounded"
				>
					<Button
						className="w-full py-1 px-2 text-[0.625rem] mt-3 dark:text-white dark:border-white"
						variant="outline"
						onClick={openModalEditionHandle('version')}
					>
						<PlusIcon className="w-4 h-4" />
					</Button>
				</ActiveTaskVersionDropdown>
			</TaskRow>

			{/* Epic */}
			{task && task.issueType === 'Story' && (
				<TaskRow labelTitle={trans.EPIC}>
					<TaskEpicDropdown
						onValueChange={(d) => {
							onTaskSelect({
								id: d,
							} as ITeamTask);
						}}
						className="lg:min-w-[170px] text-black"
						forDetails={true}
						sidebarUI={true}
						taskStatusClassName="text-[0.625rem] h-[1.5625rem] max-w-[7.6875rem] rounded"
						defaultValue={task.parentId || ''}
					/>
				</TaskRow>
			)}

			{/* Task Status */}
			<TaskRow labelTitle={trans.STATUS}>
				<ActiveTaskStatusDropdown
					task={task}
					className="lg:min-w-[170px] text-black"
					forDetails={true}
					sidebarUI={true}
					taskStatusClassName="text-[0.625rem] h-[1.5625rem] max-w-[7.6875rem] rounded"
				>
					<Button
						className="w-full py-1 px-2 text-xs dark:text-white dark:border-white"
						variant="outline"
						onClick={openModalEditionHandle('status')}
					>
						<PlusIcon className="w-4 h-4" />
					</Button>
				</ActiveTaskStatusDropdown>
			</TaskRow>

			{/* Task Labels */}
			<TaskRow labelTitle={trans.LABELS}>
				<TaskLabels
					task={task}
					className="lg:min-w-[170px] text-black lg:mt-0"
					forDetails={true}
					taskStatusClassName="text-[0.625rem] h-[1.5625rem] max-w-[7.6875rem] rounded"
				/>
			</TaskRow>

			{/* Task Size */}
			<TaskRow labelTitle={trans.SIZE} wrapperClassName="text-black">
				<ActiveTaskSizesDropdown
					task={task}
					className="lg:min-w-[170px] text-black"
					forDetails={true}
					sidebarUI={true}
					taskStatusClassName="text-[0.625rem] h-[1.5625rem] max-w-[7.6875rem] rounded"
				>
					<Button
						className="w-full py-1 px-2 text-xs dark:text-white dark:border-white"
						variant="outline"
						onClick={openModalEditionHandle('size')}
					>
						<PlusIcon className="w-4 h-4" />
					</Button>
				</ActiveTaskSizesDropdown>
			</TaskRow>

			{/* Task Properties */}
			<TaskRow labelTitle={trans.PRIORITY} wrapperClassName="text-black">
				<ActiveTaskPropertiesDropdown
					task={task}
					className="lg:min-w-[170px] text-black rounded-xl"
					forDetails={true}
					sidebarUI={true}
					taskStatusClassName="text-[0.625rem] h-[1.5625rem] max-w-[7.6875rem] rounded"
				>
					<Button
						className="w-full text-xs py-1 px-2 dark:text-white dark:border-white"
						variant="outline"
						onClick={openModalEditionHandle('priority')}
					>
						<PlusIcon className="w-4 h-4" />
					</Button>
				</ActiveTaskPropertiesDropdown>
			</TaskRow>

			<Modal isOpen={modal.isOpen} closeModal={modal.closeModal}>
				<Card className="sm:w-[530px] w-[330px]" shadow="custom">
					{formTarget === 'version' && (
						<VersionForm
							onVersionCreated={onVersionCreated}
							onCreated={modal.closeModal}
							formOnly={true}
						/>
					)}
					{formTarget === 'status' && (
						<TaskStatusesForm onCreated={modal.closeModal} formOnly={true} />
					)}
					{formTarget === 'priority' && (
						<TaskPrioritiesForm onCreated={modal.closeModal} formOnly={true} />
					)}
					{formTarget === 'size' && (
						<TaskSizesForm onCreated={modal.closeModal} formOnly={true} />
					)}
				</Card>
			</Modal>
		</section>
	);
};

export default TaskSecondaryInfo;
