import { useTeamMemberCard, useTMCardTaskEdit } from '@app/hooks';
import { IClassName, IOrganizationTeamList } from '@app/interfaces';
import { clsxm } from '@app/utils';
import { Card, VerticalSeparator } from 'lib/components';
import { DraggerIcon } from 'lib/components/svgs';
import { TaskTimes, TodayWorkedTime } from 'lib/features';
import { useTranslation } from 'lib/i18n';
import { TaskEstimateInfo } from './task-estimate';
import { TaskInfo } from './task-info';
import { UserInfo } from './user-info';
import { UserTeamCardMenu } from './user-team-card-menu';

export function UserTeamCardHeader() {
	const { trans } = useTranslation();
	return (
		<ul className="flex row font-normal justify-between mb-3 mt-16">
			<li>{trans.common.STATUS}</li>
			<li>{trans.common.NAME}</li>
			<li>{trans.common.TASK}</li>
			<li>{trans.common.WORKED_ON_TASK}</li>
			<li>{trans.common.ESTIMATE}</li>
			<li>{trans.common.TOTAL_WORKED_TODAY}</li>
		</ul>
	);
}

type IUserTeamCard = {
	active?: boolean;
	member?: IOrganizationTeamList['members'][number];
	publicTeam?: boolean;
	members?: IOrganizationTeamList['members'];
} & IClassName;

export function UserTeamCard({
	className,
	active,
	member,
	publicTeam = false,
}: IUserTeamCard) {
	const memberInfo = useTeamMemberCard(member);
	const taskEdition = useTMCardTaskEdit(memberInfo.memberTask);

	return (
		<Card
			shadow="bigger"
			className={clsxm(
				'relative flex items-center py-3',
				active && ['border-primary-light border-[2px]'],
				className
			)}
		>
			<div className="absolute -left-0">
				<DraggerIcon />
			</div>

			{/* Show user name, email and image */}
			<UserInfo
				memberInfo={memberInfo}
				className="lg:w-[330px] w-1/4"
				publicTeam={publicTeam}
			/>
			<VerticalSeparator />

			{/* Task information */}
			<TaskInfo
				edition={taskEdition}
				memberInfo={memberInfo}
				className="lg:w-80 w-1/5 lg:px-4 px-2"
				publicTeam={publicTeam}
			/>
			<VerticalSeparator className="ml-2" />

			{/* TaskTimes */}
			<TaskTimes
				activeAuthTask={true}
				memberInfo={memberInfo}
				task={memberInfo.memberTask}
				isAuthUser={memberInfo.isAuthUser}
				className="lg:w-48 w-1/5 lg:px-4 px-2"
			/>
			<VerticalSeparator />

			{/* TaskEstimateInfo */}
			<TaskEstimateInfo
				memberInfo={memberInfo}
				edition={taskEdition}
				activeAuthTask={true}
				className="lg:px-3 lg:w-52 w-1/5"
			/>
			<VerticalSeparator />

			{/* TodayWorkedTime */}
			<TodayWorkedTime
				isAuthUser={memberInfo.isAuthUser}
				className="flex-1 lg:text-base text-xs"
				memberInfo={memberInfo}
			/>

			{/* Card menu */}
			<UserTeamCardMenu memberInfo={memberInfo} edition={taskEdition} />
		</Card>
	);
}

export function UserTeamCardSkeleton() {
	return (
		<div
			role="status"
			className="p-4 rounded-xl border divide-y divide-gray-200 shadow animate-pulse dark:divide-gray-700 md:p-6 dark:border-gray-700"
		>
			<div className="flex justify-between items-center">
				<div className="flex items-center space-x-3">
					<div className="w-5 h-5 mr-8 rounded-[50%] bg-gray-200 dark:bg-gray-700"></div>
					<div className="w-14 h-14 rounded-[50%] bg-gray-200 dark:bg-gray-700"></div>
					<div>
						<div className="h-3 bg-gray-200 rounded-full dark:bg-gray-700 w-32 mb-2"></div>
					</div>
				</div>
				<div className="h-2.5 bg-gray-300 rounded-full dark:bg-gray-600 w-24"></div>
				<div className="h-2.5 bg-gray-300 rounded-full dark:bg-gray-600 w-24"></div>
				<div className="h-2.5 bg-gray-300 rounded-full dark:bg-gray-600 w-24"></div>
				<div className="h-2.5 bg-gray-300 rounded-full dark:bg-gray-700 w-24"></div>
			</div>
		</div>
	);
}

export function InviteUserTeamSkeleton() {
	return (
		<div
			role="status"
			className="p-4 mt-3 rounded-xl border divide-y divide-gray-200 shadow animate-pulse dark:divide-gray-700 md:p-6 dark:border-gray-700"
		>
			<div className="flex justify-between items-center">
				<div className="flex items-center space-x-3">
					<div className="w-5 h-5 mr-8 rounded-[50%] bg-gray-200 dark:bg-gray-700"></div>
					<div className="w-24 h-9 rounded-xl bg-gray-200 dark:bg-gray-700"></div>
				</div>
			</div>
		</div>
	);
}
