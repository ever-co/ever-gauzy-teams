import {
	RTuseTaskInput,
	useAuthenticateUser,
	useCallbackRef,
	useOrganizationEmployeeTeams,
	useOrganizationTeams,
	useOutsideClick,
	useTaskInput,
} from '@app/hooks';
import { ITeamTask, Nullable } from '@app/interfaces';
import { clsxm } from '@app/utils';
import { Popover, Transition } from '@headlessui/react';
import { PlusIcon } from '@heroicons/react/20/solid';
import {
	Button,
	Card,
	Divider,
	InputField,
	OutlineBadge,
	SpinnerLoader,
	Tooltip,
} from 'lib/components';
import { TickCircleIcon } from 'lib/components/svgs';
import { useTranslation } from 'lib/i18n';
import {
	MutableRefObject,
	PropsWithChildren,
	useCallback,
	useEffect,
	useMemo,
	useRef,
	useState,
} from 'react';
import { ActiveTaskIssuesDropdown, TaskIssuesDropdown } from './task-issue';
import { TaskItem } from './task-item';

type Props = {
	task?: Nullable<ITeamTask>;
	tasks?: ITeamTask[];
	onTaskClick?: (task: ITeamTask) => void;
	initEditMode?: boolean;
	onCloseCombobox?: () => void;
	inputLoader?: boolean;
	onEnterKey?: (taskName: string, task: ITeamTask) => void;
	keepOpen?: boolean;
	loadingRef?: MutableRefObject<boolean>;
	closeable_fc?: () => void;
	viewType?: 'input-trigger' | 'one-view';
	createOnEnterClick?: boolean;
	showTaskNumber?: boolean;
	showCombobox?: boolean;
	autoAssignTaskAuth?: boolean;
	fullWidthCombobox?: boolean;
	placeholder?: string;
	autoFocus?: boolean;
	autoInputSelectText?: boolean;
	usersTaskCreatedAssignTo?: { id: string }[];
	onTaskCreated?: (task: ITeamTask | undefined) => void;
	cardWithoutShadow?: boolean;

	forParentChildRelationship?: boolean;
} & PropsWithChildren;

/**
 * If task passed then some function should not considered as global state
 *
 * @param param0
 * @returns
 */

export function TaskInput(props: Props) {
	const { trans } = useTranslation();

	const {
		viewType = 'input-trigger',
		showTaskNumber = false,
		showCombobox = true,
	} = props;

	const datas = useTaskInput({
		task: props.task,
		initEditMode: props.initEditMode,
		tasks: props.tasks,
	});

	const { updateOrganizationTeamEmployee } = useOrganizationEmployeeTeams();
	const { activeTeam } = useOrganizationTeams();
	const { user } = useAuthenticateUser();

	const onCloseComboboxRef = useCallbackRef(props.onCloseCombobox);
	const closeable_fcRef = useCallbackRef(props.closeable_fc);
	const $onTaskClick = useCallbackRef(props.onTaskClick);
	const $onTaskCreated = useCallbackRef(props.onTaskCreated);
	const inputRef = useRef<HTMLDivElement>(null);

	const onTaskCreated = useCallback(
		(task: ITeamTask | undefined) =>
			$onTaskCreated.current && $onTaskCreated.current(task),
		[$onTaskCreated]
	);

	const onTaskClick = useCallback(
		(task: ITeamTask) => $onTaskClick.current && $onTaskClick.current(task),
		[$onTaskClick]
	);

	const {
		inputTask,
		editMode,
		setEditMode,
		setQuery,
		updateLoading,
		updateTaskTitleHandler,
		setFilter,
		taskIssue,
	} = datas;

	const inputTaskTitle = useMemo(
		() => inputTask?.title || '',
		[inputTask?.title]
	);

	const [taskName, setTaskName] = useState('');

	const { targetEl, ignoreElementRef } = useOutsideClick<HTMLInputElement>(
		() => !props.keepOpen && setEditMode(false)
	);

	useEffect(() => {
		setQuery(taskName === inputTask?.title ? '' : taskName);
	}, [taskName, inputTask, setQuery]);

	useEffect(() => {
		setTaskName(inputTaskTitle);
	}, [editMode, inputTaskTitle]);

	useEffect(() => {
		/**
		 * Call onCloseCombobox only when the menu has been closed
		 */
		!editMode && onCloseComboboxRef.current && onCloseComboboxRef.current();
	}, [editMode, onCloseComboboxRef]);

	/**
	 * set the active task for the authenticated user
	 */
	const setAuthActiveTask = useCallback(
		(task: ITeamTask) => {
			if (datas.setActiveTask) {
				datas.setActiveTask(task);

				// Update Current user's active task to sync across multiple devices
				const currentEmployeeDetails = activeTeam?.members.find(
					(member) => member.employeeId === user?.employee?.id
				);
				if (currentEmployeeDetails && currentEmployeeDetails.id) {
					updateOrganizationTeamEmployee(currentEmployeeDetails.id, {
						organizationId: task.organizationId,
						activeTaskId: task.id,
						organizationTeamId: activeTeam?.id,
						tenantId: activeTeam?.tenantId,
					});
				}
			}
			setEditMode(false);
		},
		[datas, setEditMode, activeTeam, user, updateOrganizationTeamEmployee]
	);

	/**
	 * On update task name
	 */
	const updateTaskNameHandler = useCallback(
		(task: ITeamTask, title: string) => {
			if (task.title !== title) {
				!updateLoading && updateTaskTitleHandler(task, title);
			}
		},
		[updateLoading, updateTaskTitleHandler]
	);

	/**
	 * Signle parent about updating and close event (that can trigger close component e.g)
	 */
	useEffect(() => {
		if (props.loadingRef?.current && !updateLoading) {
			closeable_fcRef.current && closeable_fcRef.current();
		}

		if (props.loadingRef) {
			props.loadingRef.current = updateLoading;
		}
	}, [updateLoading, props.loadingRef, closeable_fcRef]);

	/* Setting the filter to open when the edit mode is true. */
	useEffect(() => {
		editMode && setFilter('open');
	}, [editMode, setFilter]);

	/*
		If task is passed then we don't want to set the active task for the authenticated user.
		after task creation
	 */
	const autoActiveTask = props.task !== undefined ? false : true;

	const handleTaskCreation = useCallback(() => {
		/* Checking if the `handleTaskCreation` is available and if the `hasCreateForm` is true. */
		datas &&
			datas.handleTaskCreation &&
			datas.hasCreateForm &&
			datas
				.handleTaskCreation({
					autoActiveTask,
					autoAssignTaskAuth: props.autoAssignTaskAuth,
					assignToUsers: props.usersTaskCreatedAssignTo || [],
				})
				?.then(onTaskCreated)
				.finally(() => {
					viewType === 'one-view' && setTaskName('');
				});
	}, [datas, props, autoActiveTask, onTaskCreated, viewType]);

	let updatedTaskList: ITeamTask[] = [];
	if (props.forParentChildRelationship) {
		if (props.task?.issueType === 'Story') {
			updatedTaskList = datas.filteredTasks.filter(
				(item) => item.issueType === 'Epic'
			);
		} else {
			updatedTaskList = datas.filteredTasks;
		}
	}

	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (
				inputRef.current &&
				!inputRef.current.contains(event.target as Node) &&
				editMode
			) {
				inputTask && updateTaskNameHandler(inputTask, taskName);
				// console.log('func active');
			}
		};

		// Attach the event listener
		document.addEventListener('mousedown', handleClickOutside);

		// Clean up the event listener on component unmount
		return () => {
			document.removeEventListener('mousedown', handleClickOutside);
		};
	}, [inputTask, taskName, updateTaskNameHandler]);

	const inputField = (
		<InputField
			value={taskName}
			onFocus={(e) => {
				setEditMode(true);
				props.autoInputSelectText && setTimeout(() => e?.target?.select(), 10);
			}}
			onChange={(event) => {
				setTaskName(event.target.value);
			}}
			placeholder={props.placeholder || trans.form.TASK_INPUT_PLACEHOLDER}
			ref={targetEl}
			autoFocus={props.autoFocus}
			onKeyUp={(e) => {
				if (e.key === 'Enter' && inputTask) {
					/* If createOnEnterClick is false then updateTaskNameHandler is called. */
					!props.createOnEnterClick &&
						updateTaskNameHandler(inputTask, taskName);

					props.onEnterKey && props.onEnterKey(taskName, inputTask);
				}
				/* Creating a new task when the enter key is pressed. */
				if (e.key === 'Enter') {
					props.createOnEnterClick && handleTaskCreation();
				}
			}}
			trailingNode={
				/* Showing the spinner when the task is being updated. */
				<div className="flex items-center justify-center h-full p-2">
					{props.task ? (
						(updateLoading || props.inputLoader) && <SpinnerLoader size={25} />
					) : (
						<>{updateLoading && <SpinnerLoader size={25} />}</>
					)}
				</div>
			}
			className={clsxm(
				showTaskNumber && inputTask && ['pl-2'],
				'dark:bg-[#1B1D22]',
				props.initEditMode && 'h-10'
			)}
			wrapperClassName={`rounded-lg dark:bg-[#1B1D22]`}
			/* Showing the task number. */
			leadingNode={
				showTaskNumber &&
				inputTask && (
					<div
						className="flex items-center pl-3 space-x-2"
						ref={ignoreElementRef}
					>
						{!datas.hasCreateForm ? (
							<ActiveTaskIssuesDropdown
								key={inputTask.id}
								task={inputTask}
								forParentChildRelationship={true}
								taskStatusClassName={clsxm(
									`${
										inputTask.issueType === 'Bug'
											? '!px-[0.3312rem] py-[0.2875rem] rounded-sm'
											: '!px-[0.375rem] py-[0.375rem] rounded-sm'
									} `,
									'border-none'
								)}
							/>
						) : (
							<TaskIssuesDropdown
								taskStatusClassName="!px-1 py-1 rounded-sm"
								showIssueLabels={false}
								onValueChange={(v) => {
									taskIssue.current = v;
								}}
							/>
						)}

						{!datas.hasCreateForm && (
							<span className="text-sm text-gray-500">
								#{inputTask.taskNumber}
							</span>
						)}
					</div>
				)
			}
		/>
	);

	const taskCard = (
		<TaskCard
			datas={datas}
			onItemClick={
				props.task !== undefined || props.onTaskClick
					? onTaskClick
					: setAuthActiveTask
			}
			inputField={viewType === 'one-view' ? inputField : undefined}
			fullWidth={props.fullWidthCombobox}
			handleTaskCreation={handleTaskCreation}
			cardWithoutShadow={props.cardWithoutShadow}
			updatedTaskList={updatedTaskList}
			forParentChildRelationship={props.forParentChildRelationship}
		/>
	);

	return viewType === 'one-view' ? (
		taskCard
	) : (
		<Popover className="relative z-30 w-full" ref={inputRef}>
			{inputField}
			{props.children}

			<Transition
				show={editMode && showCombobox}
				enter="transition duration-100 ease-out"
				enterFrom="transform scale-95 opacity-0"
				enterTo="transform scale-100 opacity-100"
				leave="transition duration-75 ease-out"
				leaveFrom="transform scale-100 opacity-100"
				leaveTo="transform scale-95 opacity-0"
			>
				<Popover.Panel
					className={clsxm(
						'absolute -mt-3',
						props.fullWidthCombobox && ['w-full left-0 right-0']
					)}
					ref={ignoreElementRef}
				>
					{taskCard}
				</Popover.Panel>
			</Transition>
		</Popover>
	);
}

/**
 * A component that is used to render the task list.
 */
function TaskCard({
	datas,
	onItemClick,
	inputField,
	fullWidth,
	handleTaskCreation,
	cardWithoutShadow,
	forParentChildRelationship,
	updatedTaskList,
}: {
	datas: Partial<RTuseTaskInput>;
	onItemClick?: (task: ITeamTask) => void;
	inputField?: JSX.Element;
	fullWidth?: boolean;
	handleTaskCreation: () => void;
	cardWithoutShadow?: boolean;
	forParentChildRelationship?: boolean;
	updatedTaskList?: ITeamTask[];
}) {
	const { trans } = useTranslation();
	const activeTaskEl = useRef<HTMLLIElement | null>(null);

	useEffect(() => {
		if (datas.editMode) {
			window.setTimeout(() => {
				activeTaskEl?.current?.scrollIntoView({
					block: 'nearest',
					inline: 'start',
				});
			}, 10);
		}
	}, [datas.editMode]);

	return (
		<>
			<Card
				shadow="custom"
				className={clsxm(
					'rounded-xl md:px-4 md:py-4 max-h-96',
					'overflow-auto',
					!cardWithoutShadow && ['shadow-xlcard'],
					fullWidth ? ['w-full'] : ['md:w-[500px]']
				)}
			>
				{inputField}
				{/* Create team button */}
				<div>
					<Tooltip
						enabled={!datas.user?.isEmailVerified}
						label={trans.common.VERIFY_ACCOUNT_MSG}
						placement="top-start"
						className="inline-block"
					>
						<Button
							variant="outline"
							disabled={
								!datas.hasCreateForm ||
								datas.createLoading ||
								!datas.user?.isEmailVerified
							}
							loading={datas.createLoading}
							className="font-normal text-sm rounded-xl min-w-[240px] inline-flex"
							onClick={handleTaskCreation}
						>
							{!datas.createLoading && (
								<PlusIcon className="w-[16px] h-[16px]" />
							)}{' '}
							{trans.common.CREATE_TASK}
						</Button>
					</Tooltip>
				</div>

				{/* Task filter buttons  */}
				<div className="flex mt-4 space-x-3">
					<OutlineBadge
						className="py-2 text-xs cursor-pointer input-border"
						onClick={() => datas.setFilter && datas.setFilter('open')}
					>
						<div
							className={clsxm('w-4 h-4 rounded-full opacity-50 bg-green-300')}
						/>
						<span
							className={clsxm(
								datas.filter === 'open' && [
									'text-primary dark:text-primary-light font-semibold',
								]
							)}
						>
							{datas.openTaskCount || 0} {trans.common.OPEN}
						</span>
					</OutlineBadge>

					<OutlineBadge
						className="py-2 text-xs cursor-pointer input-border"
						onClick={() => datas.setFilter && datas.setFilter('closed')}
					>
						<TickCircleIcon className="opacity-50" />
						<span
							className={clsxm(
								datas.filter === 'closed' && [
									'text-primary dark:text-primary-light font-semibold',
								]
							)}
						>
							{datas.closedTaskCount || 0} {trans.common.CLOSED}
						</span>
					</OutlineBadge>
				</div>

				<Divider className="mt-4" />

				{/* Task list */}
				<ul className="my-6">
					{forParentChildRelationship &&
						updatedTaskList?.map((task, i) => {
							const last = (datas.filteredTasks?.length || 0) - 1 === i;
							const active = datas.inputTask === task;

							return (
								<li key={task.id} ref={active ? activeTaskEl : undefined}>
									<TaskItem
										task={task}
										selected={active}
										onClick={onItemClick}
										className="cursor-pointer"
									/>

									{!last && <Divider className="my-5" />}
								</li>
							);
						})}
					{!forParentChildRelationship &&
						datas.filteredTasks?.map((task, i) => {
							const last = (datas.filteredTasks?.length || 0) - 1 === i;
							const active = datas.inputTask === task;

							return (
								<li key={task.id} ref={active ? activeTaskEl : undefined}>
									<TaskItem
										task={task}
										selected={active}
										onClick={onItemClick}
										className="cursor-pointer"
									/>

									{!last && <Divider className="my-5" />}
								</li>
							);
						})}
				</ul>
			</Card>

			{/* Just some spaces at the end */}
			<div className="w-2 h-5 opacity-0">{'|'}</div>
		</>
	);
}
