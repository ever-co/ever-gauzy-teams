'use client';

import { secondsToTime, tomorrowDate } from '@app/helpers';
import {
	I_TeamMemberCardHook,
	I_UserProfilePage,
	useAuthenticateUser,
	useCanSeeActivityScreen,
	useDailyPlan,
	useModal,
	useOrganizationEmployeeTeams,
	useOrganizationTeams,
	useTMCardTaskEdit,
	useTaskStatistics,
	useTeamMemberCard,
	useTeamTasks,
	useTimerView
} from '@app/hooks';
import ImageComponent, { ImageOverlapperProps } from 'lib/components/image-overlapper';
import {
	DailyPlanStatusEnum,
	IClassName,
	IDailyPlan,
	IDailyPlanMode,
	IDailyPlanTasksUpdate,
	IOrganizationTeamList,
	IRemoveTaskFromManyPlans,
	ITeamTask,
	Nullable,
	OT_Member
} from '@app/interfaces';
import { timerSecondsState } from '@app/stores';
import { clsxm } from '@app/utils';
import { Popover, Transition } from '@headlessui/react';
import {
	Card,
	Divider,
	// ConfirmDropdown,
	SpinnerLoader,
	Text,
	VerticalSeparator
} from 'lib/components';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCallback, useState, useTransition } from 'react';
import { SetterOrUpdater, useRecoilValue } from 'recoil';
import { TaskEstimateInfo } from '../team/user-team-card/task-estimate';
import { TimerButton } from '../timer/timer-button';
import { TaskAllStatusTypes } from './task-all-status-type';
import { TaskNameInfoDisplay } from './task-displays';
import { TaskAvatars } from './task-item';
import { ActiveTaskStatusDropdown } from './task-status';
import { TaskTimes } from './task-times';
import { useTranslations } from 'next-intl';
import { SixSquareGridIcon, ThreeCircleOutlineVerticalIcon } from 'assets/svg';
import { CreateDailyPlanFormModal } from '../daily-plan/create-daily-plan-form-modal';
import { AddTaskToPlan } from '../daily-plan/add-task-to-plan';
import { AddWorkTimeAndEstimatesToPlan } from '../daily-plan/plans-work-time-and-estimate';
import { ReloadIcon } from '@radix-ui/react-icons';
import { ESTIMATE_POPUP_SHOWN_DATE, TODAY_PLAN_ALERT_SHOWN_DATE } from '@app/constants';

type Props = {
	active?: boolean;
	task?: Nullable<ITeamTask>;
	isAuthUser: boolean;
	activeAuthTask: boolean;
	viewType?: 'default' | 'unassign' | 'dailyplan';
	profile?: I_UserProfilePage;
	editTaskId?: string | null;
	setEditTaskId?: SetterOrUpdater<string | null>;
	taskBadgeClassName?: string;
	taskTitleClassName?: string;
	plan?: IDailyPlan;
	planMode?: FilterTabs;
} & IClassName;

type FilterTabs = 'Today Tasks' | 'Future Tasks' | 'Past Tasks' | 'All Tasks' | 'Outstanding';

export function TaskCard(props: Props) {
	const {
		active,
		className,
		task,
		isAuthUser,
		activeAuthTask,
		viewType = 'default',
		profile,
		taskBadgeClassName,
		taskTitleClassName,
		plan,
		planMode
	} = props;
	const t = useTranslations();
	const [loading, setLoading] = useState(false);
	const seconds = useRecoilValue(timerSecondsState);
	const { activeTaskDailyStat, activeTaskTotalStat, addSeconds } = useTaskStatistics(seconds);
	const { isTrackingEnabled, activeTeam } = useOrganizationTeams();
	const members = activeTeam?.members || [];
	const currentMember = members.find((m) => {
		return m.employee.user?.id === profile?.userProfile?.id;
	});

	const { h, m } = secondsToTime((activeTaskTotalStat?.duration || 0) + addSeconds);
	const totalWork =
		isAuthUser && activeAuthTask ? (
			<div className={clsxm('flex space-x-2 items-center font-normal')}>
				<span className="text-gray-500 lg:text-sm">{t('pages.taskDetails.TOTAL_TIME')}:</span>
				<Text>
					{h}h : {m}m
				</Text>
			</div>
		) : (
			<></>
		);

	// Daily work
	const { h: dh, m: dm } = secondsToTime((activeTaskDailyStat?.duration || 0) + addSeconds);
	const todayWork =
		isAuthUser && activeAuthTask ? (
			<div className={clsxm('flex flex-col items-start font-normal')}>
				<span className="text-xs text-gray-500">{t('common.TOTAL_WORK')}</span>
				<Text>
					{dh}h : {dm}m
				</Text>
			</div>
		) : (
			<></>
		);

	const memberInfo = useTeamMemberCard(currentMember || undefined);
	const taskEdition = useTMCardTaskEdit(task);
	const activeMembers = task != null && task?.members?.length > 0;
	const hasMembers = task?.members && task?.members?.length > 0;
	const taskAssignee: ImageOverlapperProps[] =
		task?.members?.map((member: any) => {
			return {
				id: member.user?.id,
				url: member.user?.imageUrl,
				alt: member.user?.firstName
			};
		}) || [];

	return (
		<>
			<Card
				shadow="bigger"
				className={clsxm(
					'lg:flex items-center justify-between py-3 px-4 md:px-4 hidden min-h-[7rem] dark:bg-[#1E2025] border-[0.125rem] dark:border-[#FFFFFF0D] relative',
					active && ['border-primary-light dark:bg-[#1E2025]'],
					'gap-5',
					className
				)}
			>
				<div className="absolute -left-0">
					<SixSquareGridIcon className="w-6 h-6 text-[#CCCCCC] dark:text-[#4F5662]" />
				</div>

				<div className="flex-1 min-w-[35%] max-w-[40%] flex flex-row justify-between">
					{/* Task information */}
					<TaskInfo
						task={task}
						className="px-4 w-full"
						taskBadgeClassName={clsxm(taskBadgeClassName)}
						taskTitleClassName={clsxm(taskTitleClassName)}
						dayPlanTab={planMode}
						tab={viewType}
					/>
				</div>
				<VerticalSeparator />
				{(viewType === 'default' || viewType === 'dailyplan') && (
					<>
						{/* TaskEstimateInfo */}
						<div className="flex items-center flex-col justify-center lg:flex-row w-[20%]">
							<TaskEstimateInfo memberInfo={memberInfo} edition={taskEdition} activeAuthTask={true} />
						</div>
					</>
				)}

				{viewType === 'unassign' && (
					<div className="w-[20%] flex justify-around items-center">
						<UsersTaskAssigned task={task} />
						<ImageComponent
							radius={40}
							images={taskAssignee}
							item={task}
							hasActiveMembers={activeMembers}
							hasInfo={!hasMembers ? 'Assign this task' : 'Assign this task to more people'}
						/>
					</div>
				)}
				<VerticalSeparator />

				{/* TaskTimes */}
				<div className="flex items-center justify-between gap-[1.125rem]  px-5 w-1/5 lg:px-3 2xl:w-52 3xl:w-72">
					<TaskTimes
						activeAuthTask={activeAuthTask}
						task={task}
						isAuthUser={isAuthUser}
						className="flex flex-col gap-2"
						showTotal={viewType !== 'unassign'}
						memberInfo={memberInfo}
					/>
					{isTrackingEnabled && isAuthUser && task && (
						<TimerButtonCall
							activeTeam={activeTeam}
							currentMember={currentMember}
							task={task}
							className="w-11 h-11"
						/>
					)}
				</div>
				<VerticalSeparator />

				<div className="flex flex-row justify-between items-center w-1/5 lg:px-3 2xl:w-52 3xl:w-80">
					{/* Active Task Status Dropdown (It's a dropdown that allows the user to change the status of the task.)*/}
					<div className="w-full flex items-center justify-center">
						<ActiveTaskStatusDropdown
							task={task}
							onChangeLoading={(load) => setLoading(load)}
							className="min-w-[10.625rem]"
						/>
					</div>

					{/* TaskCardMenu */}
					{task && currentMember && (
						<TaskCardMenu
							task={task}
							loading={loading}
							memberInfo={memberInfo}
							viewType={viewType}
							profile={profile}
							plan={plan}
							planMode={planMode}
						/>
					)}
				</div>
			</Card>

			{/* Small screen size */}
			<Card
				shadow="bigger"
				className={clsxm(
					'relative lg:hidden flex justify-between py-3 flex-col',
					active && ['border-primary-light border-[2px]'],
					className
				)}
			>
				<div className="flex justify-between mb-4 ml-2">
					{totalWork}
					{/* {isTrackingEnabled && isAuthUser && viewType === 'unassign' && task && (
						<TimerButtonCall activeTeam={activeTeam} currentMember={currentMember} task={task} />
					)} */}
				</div>
				<div className="flex flex-wrap items-start justify-between pb-4 border-b">
					<TaskInfo task={task} className="px-4 mb-4 w-full" tab={viewType} dayPlanTab={planMode} />{' '}
					{viewType === 'default' && (
						<>
							<div className="flex items-end mx-auto py-4 space-x-2">
								<TaskEstimateInfo
									memberInfo={memberInfo}
									edition={taskEdition}
									activeAuthTask={true}
									className="px-3 w-52"
								/>
							</div>
						</>
					)}
				</div>

				{viewType === 'unassign' && (
					<>
						<UsersTaskAssigned className="px-3 mx-auto w-full py-4" task={task} />
					</>
				)}
				<div className="flex justify-between items-center mt-4 mb-4 space-x-5">
					<div className="flex space-x-4">
						{todayWork}
						{isTrackingEnabled && isAuthUser && task && (
							<TimerButtonCall activeTeam={activeTeam} currentMember={currentMember} task={task} />
						)}
					</div>

					<ActiveTaskStatusDropdown task={task || null} onChangeLoading={(load) => setLoading(load)} />

					{task && currentMember && (
						<TaskCardMenu
							task={task}
							loading={loading}
							memberInfo={memberInfo}
							viewType={viewType}
							plan={plan}
						/>
					)}
				</div>
			</Card>
		</>
	);
}

function UsersTaskAssigned({ task, className }: { task: Nullable<ITeamTask> } & IClassName) {
	const t = useTranslations();
	const members = task?.members || [];

	return (
		<div className={clsxm('flex justify-center items-center', className)}>
			<div className="flex flex-col justify-center items-center">
				{members.length > 0 && <span className="mb-1 text-xs text-center">{t('common.ASSIGNED')}</span>}
				<span className="text-sm font-medium text-center">
					{members.length > 0
						? `${members.length} ${t('common.PEOPLE')}`
						: t('task.tabFilter.NO_TASK_USER_ASSIGNED')}
				</span>
			</div>
			{members.length > 0 && task && <TaskAvatars task={task} limit={3} />}
		</div>
	);
}

/**
 * "If the task is the active task, then use the timer handler, otherwise start the timer with the
 * task."
 *
 * The function is a bit more complicated than that, but that's the gist of it
 * @param  - `task` - the task that the timer button is for
 * @returns A TimerButton component that is either a spinner or a timer button.
 */
function TimerButtonCall({
	task,
	currentMember,
	activeTeam,
	className
}: {
	task: ITeamTask;
	currentMember: OT_Member | undefined;
	activeTeam: IOrganizationTeamList | null;
	className?: string;
}) {
	const [loading, setLoading] = useState(false);
	const { updateOrganizationTeamEmployee } = useOrganizationEmployeeTeams();
	const { closeModal, isOpen, openModal } = useModal();

	const {
		canTrack,
		disabled,
		canRunTimer,
		timerStatusFetching,
		timerStatus,
		activeTeamTask,
		startTimer,
		stopTimer,
		isPlanVerified,
		hasPlan
	} = useTimerView();

	const { setActiveTask } = useTeamTasks();

	const activeTaskStatus = activeTeamTask?.id === task.id ? timerStatus : undefined;

	/* It's a function that is called when the timer button is clicked. */
	const startTimerWithTask = useCallback(async () => {
		if (task.status === 'closed') return;

		if (timerStatus?.running) {
			setLoading(true);
			await stopTimer().finally(() => setLoading(false));
		}

		setActiveTask(task);

		// Update Current user's active task to sync across multiple devices
		const currentEmployeeDetails = activeTeam?.members.find((member) => member.id === currentMember?.id);
		if (currentEmployeeDetails && currentEmployeeDetails.id) {
			updateOrganizationTeamEmployee(currentEmployeeDetails.id, {
				organizationId: task.organizationId,
				activeTaskId: task.id,
				organizationTeamId: activeTeam?.id,
				tenantId: activeTeam?.tenantId
			});
		}

		window.setTimeout(startTimer, 100);

		window.scrollTo({ top: 0, behavior: 'smooth' });
	}, [
		task,
		timerStatus?.running,
		setActiveTask,
		activeTeam,
		startTimer,
		stopTimer,
		currentMember?.id,
		updateOrganizationTeamEmployee
	]);

	const timerHanlderStartStop = useCallback(() => {
		const currentDate = new Date().toISOString().split('T')[0];
		const lastPopupDate = window && window?.localStorage.getItem(TODAY_PLAN_ALERT_SHOWN_DATE);
		const lastPopupEstimates = window && window?.localStorage.getItem(ESTIMATE_POPUP_SHOWN_DATE);

		if (timerStatusFetching || !canRunTimer) return;
		if (timerStatus?.running) {
			stopTimer();
		} else {
			if (!isPlanVerified || lastPopupDate !== currentDate || lastPopupEstimates !== currentDate) {
				openModal();
			} else {
				startTimer();
			}
		}
	}, [canRunTimer, isPlanVerified, openModal, startTimer, stopTimer, timerStatus, timerStatusFetching]);

	return loading ? (
		<SpinnerLoader size={30} />
	) : (
		<>
			<TimerButton
				onClick={activeTaskStatus ? timerHanlderStartStop : startTimerWithTask}
				running={activeTaskStatus?.running}
				disabled={activeTaskStatus ? disabled : task.status === 'closed' || !canTrack}
				className={clsxm('h-14 w-14', className)}
			/>
			<AddWorkTimeAndEstimatesToPlan
				closeModal={closeModal}
				open={isOpen}
				plan={hasPlan}
				startTimer={startTimer}
				hasPlan={!!hasPlan}
			/>
		</>
	);
}

//* Task Estimate info *
//* Task Info FC *
function TaskInfo({
	className,
	task,
	taskBadgeClassName,
	taskTitleClassName,
	tab,
	dayPlanTab
}: IClassName & {
	tab: 'default' | 'unassign' | 'dailyplan';
	dayPlanTab?: FilterTabs;
	task?: Nullable<ITeamTask>;
	taskBadgeClassName?: string;
	taskTitleClassName?: string;
}) {
	const router = useRouter();

	return (
		<div className={clsxm('h-full flex flex-col items-start justify-between gap-[1.0625rem]', className)}>
			{/* task */}
			{!task && <div className="self-center py-1 text-center">--</div>}
			{task && (
				<div className="w-full h-10 overflow-hidden">
					<div className={clsxm('h-full flex flex-col items-start justify-start')}>
						<div
							className={clsxm('text-sm text-ellipsis overflow-hidden w-full cursor-pointer')}
							onClick={() => task && router.push(`/task/${task?.id}`)}
						>
							<TaskNameInfoDisplay
								task={task}
								className={clsxm(taskBadgeClassName)}
								taskTitleClassName={clsxm(taskTitleClassName)}
							/>
						</div>
					</div>
				</div>
			)}

			{/* Task status */}
			{task && <TaskAllStatusTypes task={task} tab={tab} dayPlanTab={dayPlanTab} />}
			{!task && <div className="self-center py-1 text-center">--</div>}
		</div>
	);
}
/**
 * It's a dropdown menu that allows the user to remove the task.
 */
function TaskCardMenu({
	task,
	loading,
	memberInfo,
	viewType,
	profile,
	plan,
	planMode
}: {
	task: ITeamTask;
	loading?: boolean;
	memberInfo?: I_TeamMemberCardHook;
	viewType: 'default' | 'unassign' | 'dailyplan';
	profile?: I_UserProfilePage;
	plan?: IDailyPlan;
	planMode?: FilterTabs;
}) {
	const t = useTranslations();
	const handleAssignment = useCallback(() => {
		if (viewType === 'unassign') {
			memberInfo?.assignTask(task);
		} else {
			memberInfo?.unassignTask(task);
		}
	}, [memberInfo, task, viewType]);

	const canSeeActivity = useCanSeeActivityScreen();
	const { hasPlan, hasPlanForTomorrow } = useTimerView();

	return (
		<Popover>
			<Popover.Button className="flex items-center border-none outline-none">
				{!loading && <ThreeCircleOutlineVerticalIcon className="w-full max-w-[24px] dark:text-[#B1AEBC]" />}
				{loading && <SpinnerLoader size={20} />}
			</Popover.Button>

			<Transition
				enter="transition duration-100 ease-out"
				enterFrom="transform scale-95 opacity-0"
				enterTo="transform scale-100 opacity-100"
				leave="transition duration-75 ease-out"
				leaveFrom="transform scale-100 opacity-100"
				leaveTo="transform scale-95 opacity-0"
				className="absolute z-10 right-0 min-w-[110px]"
			>
				<Popover.Panel>
					{() => {
						return (
							<Card shadow="custom" className="shadow-xlcard !py-3 !px-7">
								<ul className="min-w-[124px]">
									<li className="mb-2">
										<Link
											href={`/task/${task.id}`}
											className={clsxm(
												'font-normal whitespace-nowrap transition-all',
												'hover:font-semibold hover:transition-all'
											)}
										>
											{t('common.TASK_DETAILS')}
										</Link>
									</li>
									<li className="mb-3">
										<span
											className={clsxm(
												'font-normal whitespace-nowrap transition-all',
												'hover:font-semibold hover:transition-all cursor-pointer'
											)}
											onClick={handleAssignment}
										>
											{viewType === 'unassign'
												? t('common.ASSIGN_TASK')
												: t('common.UNASSIGN_TASK')}
										</span>
									</li>

									{viewType == 'default' && (
										<>
											<Divider type="HORIZONTAL" />
											<div className="mt-3">
												<li className="mb-2">
													<PlanTask
														planMode="today"
														taskId={task.id}
														employeeId={profile?.member?.employeeId ?? ''}
														hasTodayPlan={hasPlan}
													/>
												</li>
												<li className="mb-2">
													<PlanTask
														planMode="tomorow"
														taskId={task.id}
														employeeId={profile?.member?.employeeId ?? ''}
														hasPlanForTomorrow={hasPlanForTomorrow}
													/>
												</li>
												<li className="mb-2">
													<PlanTask
														planMode="custom"
														taskId={task.id}
														employeeId={profile?.member?.employeeId ?? ''}
													/>
												</li>
											</div>
										</>
									)}

									{viewType === 'dailyplan' && planMode === 'Outstanding' && (
										<>
											{canSeeActivity ? (
												<AddTaskToPlanComponent employee={profile?.member} task={task} />
											) : (
												<></>
											)}
										</>
									)}

									{viewType === 'dailyplan' &&
										(planMode === 'Today Tasks' || planMode === 'Future Tasks') && (
											<>
												{canSeeActivity ? (
													<div>
														<Divider type="HORIZONTAL" />
														<div className="mt-2">
															<RemoveTaskFromPlan
																member={profile?.member}
																task={task}
																plan={plan}
															/>
														</div>
														<div className="mt-2">
															<RemoveManyTaskFromPlan
																task={task}
																member={profile?.member}
															/>
														</div>
													</div>
												) : (
													<></>
												)}
											</>
										)}
									{/* <li>
										<ConfirmDropdown
											className="right-[110%] top-0"
											onConfirm={() => {
												console.log('remove task...', task);
											}}
										>
											<Text
												className={clsxm(
													'font-normal whitespace-nowrap hover:font-semibold hover:transition-all',
													'text-red-500'
												)}
											>
												{t('common.REMOVE')}
											</Text>
										</ConfirmDropdown>
									</li> */}
								</ul>
							</Card>
						);
					}}
				</Popover.Panel>
			</Transition>
		</Popover>
	);
}

export function PlanTask({
	planMode,
	taskId,
	employeeId,
	chooseMember,
	hasTodayPlan,
	hasPlanForTomorrow
}: {
	taskId: string;
	planMode: IDailyPlanMode;
	employeeId?: string;
	chooseMember?: boolean;
	hasTodayPlan?: IDailyPlan;
	hasPlanForTomorrow?: IDailyPlan;
}) {
	const t = useTranslations();
	const [isPending, startTransition] = useTransition();
	const { closeModal, isOpen, openModal } = useModal();
	const { createDailyPlan } = useDailyPlan();
	const { user } = useAuthenticateUser();

	const handleOpenModal = () => {
		if (planMode === 'custom') {
			openModal();
		} else if (planMode === 'today') {
			startTransition(() => {
				createDailyPlan({
					workTimePlanned: 0,
					taskId,
					date: new Date(),
					status: DailyPlanStatusEnum.OPEN,
					tenantId: user?.tenantId ?? '',
					employeeId: employeeId,
					organizationId: user?.employee.organizationId
				});
			});
		} else {
			startTransition(() => {
				createDailyPlan({
					workTimePlanned: 0,
					taskId,
					date: tomorrowDate,
					status: DailyPlanStatusEnum.OPEN,
					tenantId: user?.tenantId ?? '',
					employeeId: employeeId,
					organizationId: user?.employee.organizationId
				});
			});
		}
	};

	return (
		<>
			<span
				className={clsxm(
					'font-normal whitespace-nowrap transition-all',
					'hover:font-semibold hover:transition-all cursor-pointer'
				)}
				onClick={handleOpenModal}
			>
				<CreateDailyPlanFormModal
					open={isOpen}
					closeModal={closeModal}
					taskId={taskId}
					planMode={planMode}
					employeeId={employeeId}
					chooseMember={chooseMember}
				/>
				{planMode === 'today' && !hasTodayPlan && (
					<span>
						{isPending ? (
							<ReloadIcon className="animate-spin mr-2 h-4 w-4" />
						) : (
							t('dailyPlan.PLAN_FOR_TODAY')
						)}
					</span>
				)}
				{planMode === 'tomorow' && !hasPlanForTomorrow && (
					<span>
						{isPending ? (
							<ReloadIcon className="animate-spin mr-2 h-4 w-4" />
						) : (
							t('dailyPlan.PLAN_FOR_TOMORROW')
						)}
					</span>
				)}
				{planMode === 'custom' && t('dailyPlan.PLAN_FOR_SOME_DAY')}
			</span>
		</>
	);
}

export function AddTaskToPlanComponent({ task, employee }: { task: ITeamTask; employee?: OT_Member }) {
	const t = useTranslations();
	const { closeModal, isOpen, openModal } = useModal();
	return (
		<span
			className={clsxm(
				'font-normal whitespace-nowrap transition-all',
				'hover:font-semibold hover:transition-all cursor-pointer'
			)}
			onClick={openModal}
		>
			<AddTaskToPlan closeModal={closeModal} open={isOpen} task={task} employee={employee} />
			{t('dailyPlan.ADD_TASK_TO_PLAN')}
		</span>
	);
}

export function RemoveTaskFromPlan({ task, plan, member }: { task: ITeamTask; member?: OT_Member; plan?: IDailyPlan }) {
	const t = useTranslations();
	const { removeTaskFromPlan } = useDailyPlan();
	const data: IDailyPlanTasksUpdate = { taskId: task.id, employeeId: member?.employeeId };
	const onClick = () => {
		removeTaskFromPlan(data, plan?.id ?? '');
	};
	return (
		<span
			className={clsxm(
				'font-normal whitespace-nowrap transition-all text-red-600',
				'hover:font-semibold hover:transition-all cursor-pointer'
			)}
			onClick={onClick}
		>
			{t('dailyPlan.REMOVE_FROM_THIS_PLAN')}
		</span>
	);
}

export function RemoveManyTaskFromPlan({ task, member }: { task: ITeamTask; member?: OT_Member }) {
	// const t = useTranslations();
	const { removeManyTaskPlans } = useDailyPlan();
	const data: IRemoveTaskFromManyPlans = { plansIds: [], employeeId: member?.employeeId };
	const onClick = () => {
		removeManyTaskPlans(data, task.id ?? '');
	};
	return (
		<span
			className={clsxm(
				'font-normal whitespace-nowrap transition-all text-red-600',
				'hover:font-semibold hover:transition-all cursor-pointer'
			)}
			onClick={onClick}
		>
			Remove from all plans
		</span>
	);
}
