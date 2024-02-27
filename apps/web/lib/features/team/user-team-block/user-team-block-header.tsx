import React from 'react';
import { useOrganizationTeams, useAuthenticateUser, useModal, useUserProfilePage } from '@app/hooks';
import { clsxm } from '@app/utils';
import { InviteFormModal } from '../invite/invite-form-modal';
import { taskBlockFilterState } from '@app/stores/task-filter';
import { SearchNormalIcon, TimerPlayIcon } from 'assets/svg';
import { CheckCircleTickIcon, CrossCircleIcon, StopCircleIcon, PauseIcon } from 'assets/svg';
import { Button, VerticalSeparator } from 'lib/components';
import { useTaskFilter, TaskNameFilter } from 'lib/features';
import { useRecoilState } from 'recoil';

interface IFilter {
	running: number;
	online: number;
	pause: number;
	idle: number;
	suspended: number;
}

export function UserTeamBlockHeader() {
	// const t = useTranslations();
	const { activeTeam } = useOrganizationTeams();
	const { user } = useAuthenticateUser();
	const { openModal, isOpen, closeModal } = useModal();
	const [activeFilter, setActiveFilter] = useRecoilState<
		'all' | 'running' | 'online' | 'pause' | 'idle' | 'suspended'
	>(taskBlockFilterState);

	const profile = useUserProfilePage();
	const hook = useTaskFilter(profile);

	const membersStatusNumber: IFilter = {
		running: 0,
		online: 0,
		pause: 0,
		idle: 0,
		suspended: 0
	};

	const members = activeTeam?.members ? activeTeam?.members : [];
	members?.map((item) => {
		// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
		membersStatusNumber[item.timerStatus!]++;
	});

	return (
		<>
			<div className="hidden sm:flex row font-normal pt-4 justify-between hidde dark:text-[#7B8089]">
				<div className="flex items-center w-9/12">
					<div
						className={clsxm(
							'w-1/6 text-center flex items-center justify-center gap-2 py-4 cursor-pointer text-sm border-b-4 border-transparent',
							activeFilter == 'all' && 'border-primary dark:border-white  text-primary dark:text-white'
						)}
						onClick={() => setActiveFilter('all')}
					>
						<StopCircleIcon
							className={clsxm(
								'w-7 h-7 p-1 !text-gray-300 dark:!text-white',
								activeFilter == 'all' && 'text-primary dark:text-white'
							)}
						/>
						<p>All members </p>
						<span
							className={clsxm(
								' bg-gray-500/40 p-1 px-2 text-xs rounded-md',
								activeFilter == 'all' && 'bg-primary dark:bg-[#47484D] text-white'
							)}
						>
							{members?.length}
						</span>
					</div>
					<div
						className={clsxm(
							'w-1/6 text-center flex items-center justify-center gap-2 py-4 cursor-pointer text-sm border-b-4 border-transparent',
							activeFilter == 'idle' && 'border-primary dark:border-white  text-primary dark:text-white'
						)}
						onClick={() => setActiveFilter('idle')}
					>
						<CrossCircleIcon
							className={clsxm(
								'w-7 h-7 p-1 !text-gray-300  dark:!text-white',
								activeFilter == 'idle' && '!text-primary !fill-white  dark:!text-white dark:!fill-white'
							)}
						/>
						<p>Not working </p>
						<span
							className={clsxm(
								' bg-gray-500/40 p-1 px-2 text-xs rounded-md',
								activeFilter == 'idle' && 'bg-primary dark:bg-[#47484D] text-white'
							)}
						>
							{membersStatusNumber.idle}
						</span>
					</div>
					<div
						className={clsxm(
							'w-1/6 text-center flex items-center justify-center gap-2 py-4 cursor-pointer text-sm border-b-4 border-transparent',
							activeFilter == 'running' &&
								'border-primary dark:border-white  text-primary dark:text-white'
						)}
						onClick={() => setActiveFilter('running')}
					>
						<TimerPlayIcon
							className={clsxm(
								'w-7 h-7 p-1 !text-gray-300 !fill-gray-400 dark:!text-white',
								activeFilter == 'running' &&
									'!text-primary !fill-primary  dark:!text-white dark:!fill-white'
							)}
						/>
						<p>Working </p>
						<span
							className={clsxm(
								' bg-gray-500/40 p-1 px-2 text-xs rounded-md',
								activeFilter == 'running' && 'bg-primary dark:bg-[#47484D] text-white'
							)}
						>
							{membersStatusNumber.running}
						</span>
					</div>
					<div
						className={clsxm(
							'w-1/6 text-center flex items-center justify-center gap-2 py-4 cursor-pointer text-sm border-b-4 border-transparent',
							activeFilter == 'pause' && 'border-primary dark:border-white  text-primary dark:text-white'
						)}
						onClick={() => setActiveFilter('pause')}
					>
						<PauseIcon
							className={clsxm(
								'w-7 h-7 p-1 text-gray-400 dark:text-white',
								activeFilter == 'pause' &&
									'text-primary dark:text-white'
							)}
						/>
						<p>Paused </p>
						<span
							className={clsxm(
								' bg-gray-500/40 p-1 px-2 text-xs rounded-md',
								activeFilter == 'pause' && 'bg-primary dark:bg-[#47484D] text-white'
							)}
						>
							{membersStatusNumber.pause}
						</span>
					</div>
					<div
						className={clsxm(
							'w-1/6 text-center flex items-center justify-center gap-2 py-4 cursor-pointer text-sm border-b-4 border-transparent',
							activeFilter == 'online' && 'border-primary dark:border-white  text-primary dark:text-white'
						)}
						onClick={() => setActiveFilter('online')}
					>
						<CheckCircleTickIcon
							className={clsxm(
								'w-7 h-7 p-1 !text-gray-400  dark:!text-white',
								activeFilter == 'online' &&
									'!text-primary !fill-white  dark:!text-primary dark:!fill-white'
							)}
						/>
						<p>Online</p>
						<span
							className={clsxm(
								' bg-gray-500/40 p-1 px-2 text-xs rounded-md',
								activeFilter == 'online' && 'bg-primary dark:bg-[#47484D] text-white'
							)}
						>
							{membersStatusNumber.online}
						</span>
					</div>
				</div>

				<div className="3/12 flex justify-end gap-2 items-center">
					{/* <Invite /> */}
					{hook.filterType === 'search' ? (
						<TaskNameFilter
							fullWidth={true}
							value={hook.taskName}
							setValue={hook.setTaskName}
							close={() => {
								hook.toggleFilterType('search');
							}}
						/>
					) : (
						<div className="flex gap-6">
							<button
								ref={hook.outclickFilterCard.ignoreElementRef}
								className={clsxm('outline-none')}
								onClick={() => hook.toggleFilterType('search')}
							>
								<SearchNormalIcon
									className={clsxm(
										'dark:stroke-white w-4'
										// hook.filterType === 'search' && ['stroke-primary-light dark:stroke-primary-light']
									)}
								/>
							</button>

							<VerticalSeparator />

							<Button className="py-3.5 px-4 gap-3 rounded-xl outline-none w-44" onClick={openModal}>
								Invite
							</Button>
						</div>
					)}
				</div>
			</div>
			{/* <div className="hidden sm:flex w-1/2 row font-normal  justify-end hidde dark:text-[#7B8089]">
				<Transition
					show={hook.filterType !== undefined}
					enter="transition duration-100 ease-out"
					enterFrom="transform scale-95 opacity-0"
					enterTo="transform scale-100 opacity-100"
					leave="transition duration-75 ease-out"
					leaveFrom="transform scale-100 opacity-100"
					leaveTo="transform scale-95 opacity-0 ease-out"
					// className="pb-3"
					ref={hook.outclickFilterCard.targetEl}
				>
					{hook.filterType === 'search' && (
						<TaskNameFilter
							fullWidth={true}
							value={hook.taskName}
							setValue={hook.setTaskName}
							close={() => {
								hook.toggleFilterType('search');
							}}
						/>
					)}
				</Transition>
			</div> */}
			<InviteFormModal open={isOpen && !!user?.isEmailVerified} closeModal={closeModal} />
		</>
	);
}
