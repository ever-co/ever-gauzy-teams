/* eslint-disable no-mixed-spaces-and-tabs */

'use client';

import React from 'react';
import { useOrganizationTeams } from '@app/hooks';
import { clsxm } from '@app/utils';
import NoTeam from '@components/pages/main/no-team';
import { withAuthentication } from 'lib/app/authenticator';
import { Breadcrumb, Card, Container, Tooltip } from 'lib/components';
import { PeopleIcon } from 'lib/components/svgs';
import {
	AuthUserTaskInput,
	TeamInvitations,
	TeamMembers,
	Timer,
	UnverifiedEmail,
	UserTeamCardHeader,
	UserTeamBlockHeader
} from 'lib/features';
import { MainHeader, MainLayout } from 'lib/layout';
import { useState } from 'react';
import { IssuesView } from '@app/constants';
import { TableCellsIcon, QueueListIcon, Squares2X2Icon } from '@heroicons/react/24/solid';
import { useNetworkState } from '@uidotdev/usehooks';
import KanbanIcon from '@components/ui/svgs/kanban';
import Offline from '@components/pages/offline';
import UserTeamTableHeader from 'lib/features/team/user-team-table/user-team-table-header';
import { useTranslations } from 'next-intl';
import Link from 'next/link';

import { Analytics } from '@vercel/analytics/react';
import ChatwootWidget from 'lib/features/integrations/chatwoot';

import 'react-loading-skeleton/dist/skeleton.css';
import '../../styles/globals.css';

import { useRecoilValue } from 'recoil';
import { fullWidthState } from '@app/stores/fullWidth';
import { ChevronDown } from 'lucide-react';

function MainPage() {
	const t = useTranslations();

	const { isTeamMember, isTrackingEnabled, activeTeam } = useOrganizationTeams();
	const fullWidth = useRecoilValue(fullWidthState);

	const breadcrumb = [
		{ title: JSON.parse(t('pages.home.BREADCRUMB')), href: '/' },
		{ title: activeTeam?.name || '', href: '/' }
	];
	const [view, setView] = useState<IssuesView>(IssuesView.CARDS);
	const { online } = useNetworkState();

	if (!online) {
		return <Offline />;
	}

	return (
		<>
			<MainLayout>
				<ChatwootWidget />
				<MainHeader className="pb-1" fullWidth={fullWidth}>
					<div className="flex flex-row items-start justify-between ">
						<div className="flex justify-center items-center gap-8 h-10">
							<PeopleIcon className="stroke-dark dark:stroke-[#6b7280] h-6 w-6" />
							<Breadcrumb paths={breadcrumb} className="text-sm" />
						</div>

						{/* <Collaborative /> */}
						<div className="flex h-10 w-max items-center justify-center   gap-1">
							<Tooltip label={'Cards'} placement="top-start">
								<button
									className={clsxm(
										'rounded-md px-3 py-1 text-sm font-medium',
										view === IssuesView.CARDS
											? 'bg-gray-100 text-gray-900 dark:bg-gray-800 dark:text-gray-100'
											: 'text-gray-700 dark:text-gray-300'
									)}
									onClick={() => setView(IssuesView.CARDS)}
								>
									<QueueListIcon className="w-5 h-5 inline" />
								</button>
							</Tooltip>
							<Tooltip label={'Table'} placement="top-start">
								<button
									className={clsxm(
										'rounded-md px-3 py-1 text-sm font-medium',
										view === IssuesView.TABLE
											? 'bg-gray-100 text-gray-900 dark:bg-gray-800 dark:text-gray-100'
											: 'text-gray-700 dark:text-gray-300'
									)}
									onClick={() => setView(IssuesView.TABLE)}
								>
									<TableCellsIcon className="w-5 h-5 inline" />
								</button>
							</Tooltip>
							<Tooltip label={'Blocks'} placement="top-start">
								<button
									className={clsxm(
										'rounded-md px-3 py-1 text-sm font-medium',
										view === IssuesView.BLOCKS
											? 'bg-gray-100 text-gray-900 dark:bg-gray-800 dark:text-gray-100'
											: 'text-gray-700 dark:text-gray-300'
									)}
									onClick={() => setView(IssuesView.BLOCKS)}
								>
									<Squares2X2Icon className="w-5 h-5 inline" />
								</button>
							</Tooltip>
							<Tooltip label={'Kanban'} placement="top-start">
								<Link
									href={'/kanban'}
									className={clsxm(
										'rounded-md px-3 py-1 text-sm font-medium',
										view === IssuesView.KANBAN
											? 'bg-gray-100 text-gray-900 dark:bg-gray-800 dark:text-gray-100'
											: 'text-gray-700 dark:text-gray-300'
									)}
								>
									<KanbanIcon />
								</Link>
							</Tooltip>
						</div>
					</div>

					<UnverifiedEmail />
					<TeamInvitations />
				</MainHeader>

				<div className={`z-50 bg-white dark:bg-[#191A20] pt-5 ${view !== IssuesView.CARDS ? 'pb-7' : ''}`}>
					<Container fullWidth={fullWidth}>
						{isTeamMember ? <TaskTimerSection isTrackingEnabled={isTrackingEnabled} /> : null}
						{view === IssuesView.CARDS && isTeamMember ? (
							<UserTeamCardHeader />
						) : view === IssuesView.BLOCKS ? (
							<UserTeamBlockHeader />
						) : view === IssuesView.TABLE ? (
							<UserTeamTableHeader />
						) : null}
					</Container>

					{/* Divider */}
					<div className="h-0.5 bg-[#FFFFFF14]"></div>
				</div>

				<Container className="" fullWidth={fullWidth}>
					{isTeamMember ? <TeamMembers kanbanView={view} /> : <NoTeam />}
				</Container>
			</MainLayout>

			<Analytics />
		</>
	);
}

function TaskTimerSection({ isTrackingEnabled }: { isTrackingEnabled: boolean }) {
	const [showInput, setShowInput] = React.useState(false);
	return (
		<Card
			shadow="bigger"
			className={clsxm(
				'w-full flex lg:flex-row flex-col-reverse justify-center md:justify-between items-center py-4',
				'border-[#00000008]  border-[0.125rem] dark:border-[#26272C] dark:shadow-lg dark:bg-[#1B1D22]'
			)}
		>
			<AuthUserTaskInput
				className={clsxm(
					'mx-auto w-full lg:w-3/4 lg:mr-10',
					!showInput && '!hidden md:!flex',
					!isTrackingEnabled && 'md:w-full'
				)}
			/>
			<div
				onClick={() => setShowInput((p) => !p)}
				className="border dark:border-[#26272C] w-full rounded p-2 md:hidden flex justify-center mt-2"
			>
				<ChevronDown className={clsxm('h-12  transition-all', showInput && 'rotate-180')}>
					{showInput ? 'hide the issue input' : 'show the issue input'}
				</ChevronDown>
			</div>
			{isTrackingEnabled ? (
				<div className="w-full lg:w-1/4">
					<Timer />
				</div>
			) : null}
		</Card>
	);
}
export default withAuthentication(MainPage, { displayName: 'MainPage' });
