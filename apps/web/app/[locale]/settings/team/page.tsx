'use client';

import { withAuthentication } from 'lib/app/authenticator';
import { Breadcrumb, Card, Container } from 'lib/components';
import { MainLayout } from 'lib/layout';

import SettingsTeamSkeleton from '@components/shared/skeleton/SettingsTeamSkeleton';
import { DangerZoneTeam, LeftSideSettingMenu, TeamAvatar, TeamSettingForm } from 'lib/settings';

import { useIsMemberManager, useOrganizationTeams } from '@app/hooks';
import { userState } from '@app/stores';
import NoTeam from '@components/pages/main/no-team';
import { ArrowLeft } from 'lib/components/svgs';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { useRecoilState, useRecoilValue } from 'recoil';
import { Accordian } from 'lib/components/accordian';
import { IntegrationSetting } from 'lib/settings/integration-setting';
import { InvitationSetting } from 'lib/settings/invitation-setting';
import { IssuesSettings } from 'lib/settings/issues-settings';
import { MemberSetting } from 'lib/settings/member-setting';

import { fullWidthState } from '@app/stores/fullWidth';

const Team = () => {
	const t = useTranslations();
	const [user] = useRecoilState(userState);
	const { isTeamMember, activeTeam } = useOrganizationTeams();
	const { isTeamManager } = useIsMemberManager(user);
	const breadcrumb = [
		{ title: JSON.parse(t('pages.home.BREADCRUMB')), href: '/' },
		{ title: JSON.parse(t('pages.settings.BREADCRUMB')), href: '/settings/team' }
	];
	const fullWidth = useRecoilValue(fullWidthState);
	return (
		<>
			{!user ? (
				<SettingsTeamSkeleton />
			) : (
				<MainLayout
					className="items-start pb-1 h-screen "
					childrenClassName="overflow-hidden h-full w-screen flex flex-col items-start"
				>
					<div className="pt-12 w-full pb-4 bg-white dark:bg-dark--theme">
						<Container fullWidth={fullWidth}>
							<div className="flex flex-row items-center justify-start gap-8">
								<Link href="/">
									<ArrowLeft className="w-6 h-6" />
								</Link>

								<Breadcrumb paths={breadcrumb} className="text-sm" />
							</div>
						</Container>
					</div>

					<Container fullWidth={fullWidth} className="mb-10 flex-1">
						<div className="flex flex-col w-full h-full lg:flex-row">
							<LeftSideSettingMenu className="h-[72vh] pb-4" />
							{isTeamMember ? (
								<div className="flex flex-col flex-1 h-[72vh] sm:mr-[20px] lg:mr-0 overflow-y-scroll">
									<Link href={'/settings/personal'} className="w-full">
										<button className="w-full lg:hidden hover:bg-white rounded-xl border border-dark text-dark p-4 mt-2">
											Go to Personnal settings
										</button>
									</Link>
									{/* General Settings */}
									<Accordian
										title={t('pages.settingsTeam.HEADING_TITLE')}
										className="w-full md:min-w-[50vw] lg:min-w-[60vw] xl:min-w-[75vw] max-w-[80vw] p-4 mt-8 dark:bg-dark--theme"
										id="general-settings"
									>
										<div className="flex flex-col">
											<TeamAvatar disabled={!isTeamManager} bgColor={activeTeam?.color} />
											<TeamSettingForm />
										</div>
									</Accordian>

									{/* Invitations */}
									{isTeamManager ? (
										<Accordian
											title={t('pages.settingsTeam.INVITATION_HEADING_TITLE')}
											className="w-full md:min-w-[50vw] lg:min-w-[60vw] xl:min-w-[75vw] max-w-[80vw] overflow-y-auto p-4 mt-4 dark:bg-dark--theme"
											id="invitations"
										>
											<InvitationSetting />
										</Accordian>
									) : (
										''
									)}

									{/* Members */}
									{isTeamManager ? (
										<Accordian
											title={t('pages.settingsTeam.MEMBER_HEADING_TITLE')}
											className="w-full md:min-w-[50vw] lg:min-w-[60vw] xl:min-w-[75vw] max-w-[80vw]  p-4 mt-4 dark:bg-dark--theme"
											id="member"
										>
											<MemberSetting />
										</Accordian>
									) : (
										<></>
									)}

									{isTeamManager && (
										<Accordian
											title={t('pages.settingsTeam.INTEGRATIONS')}
											className="w-full md:min-w-[50vw] lg:min-w-[60vw] xl:min-w-[75vw] max-w-[80vw] p-4 mt-4 dark:bg-dark--theme"
											id="integrations"
										>
											<IntegrationSetting />
										</Accordian>
									)}

									{/* Issues Settings */}
									<Accordian
										title={t('pages.settingsTeam.ISSUES_HEADING_TITLE')}
										className="w-full md:min-w-[50vw] lg:min-w-[60vw] xl:min-w-[75vw] max-w-[80vw] overflow-y-auto p-4 mt-4 dark:bg-dark--theme"
										id="issues-settings"
									>
										<IssuesSettings />
									</Accordian>

									{/* TODO */}
									{/* Notification Settings */}
									{/* <Accordian
										title={t('pages.settingsTeam.NOTIFICATION_HEADING_TITLE')}
										className="p-4 mt-4 dark:bg-dark--theme"
									>
										<NotificationSettings />
									</Accordian> */}

									{/* Danger Zone */}
									<Accordian
										title={t('pages.settings.DANDER_ZONE')}
										className="w-full md:min-w-[50vw] lg:min-w-[60vw] xl:min-w-[75vw] max-w-[80vw] p-4 mt-4 dark:bg-dark--theme"
										isDanger={true}
										id="danger-zones"
									>
										<DangerZoneTeam />
									</Accordian>
								</div>
							) : (
								<div className="flex flex-col w-full sm:mr-[20px] lg:mr-0">
									<Card className="dark:bg-dark--theme p-[32px] mt-[36px]" shadow="bigger">
										<NoTeam className="p-5 mt-0 xs:mt-0" />
									</Card>
								</div>
							)}
						</div>
					</Container>
				</MainLayout>
			)}
		</>
	);
};

export default withAuthentication(Team, { displayName: 'Team' });
