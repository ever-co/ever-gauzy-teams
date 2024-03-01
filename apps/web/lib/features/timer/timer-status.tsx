/* eslint-disable no-mixed-spaces-and-tabs */
import { IClassName, ITimerStatus, ITimerStatusEnum, OT_Member } from '@app/interfaces';
import { clsxm } from '@app/utils';
import { Tooltip } from 'lib/components';
import { StopCircleIcon, PauseIcon, TimerPlayIcon } from 'assets/svg';
import { capitalize } from 'lodash';
import moment from 'moment';

type Props = {
	status: ITimerStatusEnum;
	showIcon?: boolean;
	tooltipClassName?: string;
	labelContainerClassName?: string;
} & IClassName;

export function TimerStatus({ status, className, showIcon = true, tooltipClassName, labelContainerClassName }: Props) {
	return (
		<Tooltip
			label={status === 'online' ? 'Online and Tracking Time' : capitalize(status)}
			enabled
			placement="auto"
			className={tooltipClassName}
			labelClassName="whitespace-nowrap"
			labelContainerClassName={labelContainerClassName}
		>
			<div
				className={clsxm(
					'flex items-center justify-center rounded-full',
					status === 'running' && ['bg-green-300'],
					status === 'online' && ['bg-green-300'],
					status === 'pause' && ['bg-[#EFCF9E]'],
					status === 'idle' && ['bg-[#F5BEBE]'],
					status === 'suspended' && ['bg-[#DCD6D6]'],
					className
				)}
			>
				{status === 'running' && showIcon && <TimerPlayIcon className="w-5 h-5 p-1 fill-green-700" />}
				{status === 'pause' && showIcon && <PauseIcon className="w-5 h-5 p-1 text-[#B87B1E]" />}
				{status === 'idle' && showIcon && <StopCircleIcon className="w-5 h-5 p-1 text-[#E65B5B]" />}

				{/* For now until we have realtime we will saw UserOnlineAndTrackingTimeIcon insted of UserOnlineIcon*/}
				{status === 'online' && showIcon && <TimerPlayIcon className="w-5 h-5 p-1 text-green-700" />}
				{/* <UserOnlineIcon className="w-5 h-5 p-1 fill-green-700" /> */}

				{status === 'suspended' && showIcon && <StopCircleIcon className="w-5 h-5 p-1 text-white" />}
			</div>
		</Tooltip>
	);
}

export function getTimerStatusValue(
	timerStatus: ITimerStatus | null,
	member: OT_Member | undefined,
	publicTeam?: boolean
): ITimerStatusEnum {
	return !member?.employee?.isActive && !publicTeam
		? 'suspended'
		: member?.timerStatus === 'pause'
		? 'pause'
		: !timerStatus?.running &&
		  timerStatus?.lastLog &&
		  timerStatus?.lastLog?.startedAt &&
		  timerStatus?.lastLog?.employeeId === member?.employeeId &&
		  moment().diff(moment(timerStatus?.lastLog?.startedAt), 'hours') < 24 &&
		  timerStatus?.lastLog?.source !== 'TEAMS'
		? 'pause'
		: member?.employee?.isOnline && member?.timerStatus === 'running'
		? 'online'
		: !member?.totalTodayTasks?.length
		? 'idle'
		: member?.timerStatus || 'idle';
}
