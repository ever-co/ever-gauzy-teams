import { Fragment, useCallback, useEffect, useMemo, useState } from 'react';
import { Combobox, Transition } from '@headlessui/react';
import { ChevronUpDownIcon } from '@heroicons/react/20/solid';
import { PlusIcon } from '@heroicons/react/24/solid';

import { useTeamTasks } from '@app/hooks/features/useTeamTasks';
import { ITaskStatus, ITeamTask } from '@app/interfaces/ITask';
import { Spinner } from '../spinner';
import { TaskItem } from './task-item';
import DeleteTask from '../delete-task';
import TaskFilter from './task-filter';

export function CreateTaskOption({
	onClick,
	loading,
}: {
	onClick: () => void;
	loading?: boolean;
}) {
	return (
		<div
			className="relative cursor-pointer select-none py-2 px-4 text-gray-700"
			onClick={!loading ? onClick : undefined}
		>
			<div className="flex items-center justify-start cursor-pointer text-primary dark:text-white">
				<span className="mr-[11px]">
					{loading ? (
						<Spinner dark={false} />
					) : (
						<PlusIcon className=" font-bold w-[16px] h-[16px]" />
					)}
				</span>
				Create new task
			</div>
		</div>
	);
}

function useModal() {
	const [isOpen, setIsOpen] = useState(false);
	const closeModal = useCallback(() => {
		setIsOpen(false);
	}, []);

	const openModal = useCallback(() => {
		setIsOpen(true);
	}, []);

	return {
		isOpen,
		closeModal,
		openModal,
	};
}

export const h_filter = (status: ITaskStatus, filters: 'closed' | 'open') => {
	switch (filters) {
		case 'open':
			return status !== 'Closed';
		case 'closed':
			return status === 'Closed';
		default:
			return true;
	}
};

export function useTaskInput() {
	const { isOpen: isModalOpen, openModal, closeModal } = useModal();
	const [closeableTask, setCloseableTaskTask] = useState<ITeamTask | null>(
		null
	);
	const {
		tasks,
		activeTeamTask,
		setActiveTask,
		createLoading,
		tasksFetching,
		updateLoading,
		createTask,
		updateTask,
	} = useTeamTasks();
	const [filter, setFilter] = useState<'closed' | 'open'>('open');
	const [editMode, setEditMode] = useState(false);

	const handleOpenModal = useCallback(
		(concernedTask: ITeamTask) => {
			setCloseableTaskTask(concernedTask);
			openModal();
		},
		[setCloseableTaskTask, openModal]
	);

	const handleReopenTask = useCallback(
		async (concernedTask: ITeamTask) => {
			if (concernedTask) {
				return updateTask({
					...concernedTask,
					status: 'Todo',
				});
			}
		},
		[updateTask]
	);

	const [query, setQuery] = useState('');

	const filteredTasks = useMemo(() => {
		return query.trim() === ''
			? tasks.filter((task) => h_filter(task.status, filter))
			: tasks.filter(
					(task) =>
						task.title
							.trim()
							.toLowerCase()
							.replace(/\s+/g, '')
							.startsWith(query.toLowerCase().replace(/\s+/g, '')) &&
						h_filter(task.status, filter)
				);
	}, [query, tasks, filter]);

	const filteredTasks2 = useMemo(() => {
		return query.trim() === ''
			? tasks
			: tasks.filter((task) => {
					return task.title
						.trim()
						.toLowerCase()
						.replace(/\s+/g, '')
						.startsWith(query.toLowerCase().replace(/\s+/g, ''));
				});
	}, [query, tasks]);

	const hasCreateForm = filteredTasks2.length === 0 && query !== '';

	const handleTaskCreation = (autoActiveTask = true) => {
		if (query.trim().length < 2 || activeTeamTask?.title === query.trim())
			return;
		createTask(query.trim()).then((res) => {
			setQuery('');
			const items = res.data?.items || [];
			const created = items.find((t) => t.title === query.trim());
			if (created && autoActiveTask) setActiveTask(created);
		});
	};

	const closedTaskCount = filteredTasks2.filter((f_task) => {
		return f_task.status === 'Closed';
	}).length;

	const openTaskCount = filteredTasks2.filter((f_task) => {
		return f_task.status !== 'Closed';
	}).length;

	return {
		closedTaskCount,
		openTaskCount,
		hasCreateForm,
		handleTaskCreation,
		filteredTasks,
		handleReopenTask,
		handleOpenModal,
		createLoading,
		tasksFetching,
		updateLoading,
		setFilter,
		closeModal,
		isModalOpen,
		closeableTask,
		editMode,
		setEditMode,
		activeTeamTask,
		setActiveTask,
		setQuery,
		filter,
	};
}

export function TasksList({
	onClickTask,
}: {
	onClickTask?: (task: ITeamTask) => void;
}) {
	const {
		activeTeamTask,
		setActiveTask,
		editMode,
		setEditMode,
		setQuery,
		handleTaskCreation,
		tasksFetching,
		createLoading,
		updateLoading,
		setFilter,
		openTaskCount,
		filter,
		closedTaskCount,
		hasCreateForm,
		filteredTasks,
		handleOpenModal,
		handleReopenTask,
		isModalOpen,
		closeModal,
		closeableTask,
	} = useTaskInput();
	const [combxShow, setCombxShow] = useState<true | undefined>(undefined);

	useEffect(() => {
		if (isModalOpen) {
			setCombxShow(true);
		}
	}, [isModalOpen]);

	const closeCombox = useCallback(() => {
		setCombxShow(undefined);
	}, [setCombxShow]);

	return (
		<>
			<Combobox
				value={activeTeamTask}
				onChange={onClickTask ? onClickTask : setActiveTask}
			>
				<div className="relative mt-1">
					<div className="relative w-full cursor-default overflow-hidden rounded-lg  bg-[#EEEFF5] dark:bg-[#1B1B1E] text-left shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75 focus-visible:ring-offset-2 focus-visible:ring-offset-teal-300 sm:text-sm ">
						<Combobox.Input
							key={`${editMode}`}
							className="h-[60px] bg-[#EEEFF5] dark:bg-[#1B1B1E] placeholder-[#9490A0] dark:placeholder-[#616164] w-full rounded-[10px] px-[20px] py-[18px] shadow-inner"
							displayValue={(task: ITeamTask) => {
								return task
									? (!editMode ? `#${task.taskNumber} ` : '') + task.title
									: '';
							}}
							onFocus={() => setEditMode(true)}
							onBlur={() => setEditMode(false)}
							onChange={(event) => setQuery(event.target.value)}
							onKeyDown={(event: any) => {
								if (event.key === 'Enter') {
									handleTaskCreation();
								}
							}}
							autoComplete="off"
							placeholder="What you working on?"
							readOnly={tasksFetching}
						/>
						<Combobox.Button
							onClick={closeCombox}
							className="absolute inset-y-0 right-0 flex items-center pr-2"
						>
							{tasksFetching || createLoading || updateLoading ? (
								<Spinner dark={false} />
							) : (
								<ChevronUpDownIcon
									className="h-5 w-5 text-gray-400"
									aria-hidden="true"
								/>
							)}
						</Combobox.Button>
					</div>
					<Transition
						as={Fragment}
						leave="transition ease-in duration-100"
						leaveFrom="opacity-100"
						leaveTo="opacity-0"
						show={combxShow}
						appear={true}
						afterLeave={() => {
							!createLoading && setQuery('');
							setFilter('open');
						}}
					>
						<Combobox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-[#FFFFFF] dark:bg-[#1B1B1E] py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
							<div className="ml-10 flex items-center justify-start space-x-2 mb-4 mt-2">
								<TaskFilter
									count={openTaskCount}
									type="open"
									selected={filter === 'open'}
									handleChange={() => {
										setFilter('open');
									}}
								/>
								<TaskFilter
									count={closedTaskCount}
									type="closed"
									selected={filter === 'closed'}
									handleChange={() => {
										if (closedTaskCount > 0) {
											setFilter('closed');
										}
									}}
								/>
							</div>
							{hasCreateForm ? (
								<CreateTaskOption
									onClick={handleTaskCreation}
									loading={createLoading}
								/>
							) : (
								<>
									{filteredTasks.map((task) => {
										return (
											<Combobox.Option
												key={task.id}
												className={({ active }) =>
													`relative text-[14px] cursor-pointer select-none pl-10 pr-4 text-primary ${
														active
															? 'bg-[#F9FAFB] text-opacity-80 dark:text-white dark:bg-[#202023] cursor-pointer'
															: ' dark:text-white text-opacity-100'
													}`
												}
												value={task}
											>
												{({ selected, active }) => {
													return (
														<div>
															<div className="py-2">
																<InputTaskItem
																	selected={selected}
																	active={active}
																	item={task}
																	onDelete={() => handleOpenModal(task)}
																	onReopen={() => handleReopenTask(task)}
																/>
															</div>
															<div className="w-full h-[1px] bg-[#EDEEF2] dark:bg-gray-700" />
														</div>
													);
												}}
											</Combobox.Option>
										);
									})}
								</>
							)}

							<DeleteTask
								isOpen={isModalOpen}
								closeModal={closeModal}
								Fragment={Fragment}
								task={closeableTask}
							/>
						</Combobox.Options>
					</Transition>
				</div>
			</Combobox>
		</>
	);
}

function InputTaskItem({
	selected,
	item,
	onDelete,
	onReopen,
}: {
	selected: boolean;
	item: ITeamTask;
	active: boolean;
	onDelete: () => void;
	onReopen: () => Promise<any>;
}) {
	const [loading, setLoading] = useState(false);

	const handleOnReopen = useCallback(() => {
		setLoading(true);
		return onReopen().finally(() => setLoading(false));
	}, [onReopen]);
	return (
		<TaskItem
			selected={selected}
			item={item}
			onDelete={onDelete}
			onReopen={handleOnReopen}
			updateLoading={loading}
		/>
	);
}

export default function TaskInput() {
	return (
		<div className="w-full">
			<TasksList />
		</div>
	);
}
