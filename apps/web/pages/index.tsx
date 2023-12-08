import { useOrganizationTeams } from '@app/hooks';
import { clsxm } from '@app/utils';
import NoTeam from '@components/pages/main/no-team';
import { withAuthentication } from 'lib/app/authenticator';
import { Breadcrumb, Card, Container } from 'lib/components';
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
import { useTranslation } from 'react-i18next';
import { useState } from 'react';
import { IssuesView } from '@app/constants';
import { TableCellsIcon, QueueListIcon, Squares2X2Icon } from '@heroicons/react/24/solid';
import { useNetworkState } from '@uidotdev/usehooks';
import Offline from '@components/pages/offline';

function MainPage() {
	const { t } = useTranslation();
	const { isTeamMember, isTrackingEnabled, activeTeam } = useOrganizationTeams();
	const breadcrumb = [...(t('pages.home.BREADCRUMB', { returnObjects: true }) as any), activeTeam?.name || ''];
	const [view, setView] = useState<IssuesView>(IssuesView.CARDS);
	const { online } = useNetworkState();

	if (!online) {
		return <Offline />;
	}

	return (
		<MainLayout>
			<MainHeader className="pb-1">
				<div className="flex items-start justify-between h-5">
					<div className="flex items-center gap-8">
						<PeopleIcon className="stroke-dark dark:stroke-[#6b7280] h-6 w-6" />
						<Breadcrumb paths={breadcrumb} className="text-sm" />
					</div>

					{/* <Collaborative /> */}
					<div className="flex items-end gap-1">
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
					</div>
				</div>

				<UnverifiedEmail />
				<TeamInvitations />
			</MainHeader>

			<div
				className={`sticky top-20 z-50 bg-white dark:bg-[#191A20] pt-5 ${
					view !== IssuesView.CARDS ? 'pb-7' : ''
				}`}
			>
				<Container>
					{isTeamMember ? <TaskTimerSection isTrackingEnabled={isTrackingEnabled} /> : null}
					{/* Header user card list */}
					{view === IssuesView.CARDS && isTeamMember ? (
						<UserTeamCardHeader />
					) : view === IssuesView.BLOCKS ? (
						<UserTeamBlockHeader />
					) : null}
				</Container>

				{/* Divider */}
				<div className="h-0.5 bg-[#FFFFFF14]"></div>
			</div>

			<Container className="">{isTeamMember ? <TeamMembers kanbanView={view} /> : <NoTeam />}</Container>
		</MainLayout>
	);
}

function TaskTimerSection({ isTrackingEnabled }: { isTrackingEnabled: boolean }) {
	return (
		<Card
			shadow="bigger"
			className={clsxm(
				'w-full flex md:flex-row flex-col-reverse justify-between items-center py-4',
				'border-[#00000008]  border-[0.125rem] dark:border-[#26272C] dark:shadow-lg dark:bg-[#1B1D22]'
			)}
		>
			{/* Task inputs */}
			<AuthUserTaskInput className="w-4/5 md:w-1/2 2xl:w-full " />

			{/* Timer  */}
			{isTrackingEnabled ? <Timer /> : null}
		</Card>
	);
}
export default withAuthentication(MainPage, { displayName: 'MainPage' });
