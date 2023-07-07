import { useTranslation } from 'lib/i18n';
import { Breadcrumb, Container } from 'lib/components';
import { MainLayout } from 'lib/layout';
import {
	useOrganizationTeams,
	useTeamTasks,
	useUserProfilePage,
} from '@app/hooks';
import { withAuthentication } from 'lib/app/authenticator';
import TaskDetailsAside from '@components/pages/task/task-details-aside';
import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useRecoilState } from 'recoil';
import { detailedTaskState } from '@app/stores';
import TaskDescriptionBlock from '@components/pages/task/description-block/task-description-block';
import TaskTitleBlock from '@components/pages/task/title-block/task-title-block';
import { ArrowLeft } from 'lib/components/svgs';
// import IssueCard from '@components/pages/task/IssueCard';
// import CompletionBlock from '@components/pages/task/CompletionBlock';
// import ActivityBlock from '@components/pages/task/ActivityBlock';

const TaskDetails = () => {
	const profile = useUserProfilePage();
	const { tasks } = useTeamTasks();
	const [, setTask] = useRecoilState(detailedTaskState);
	const { trans } = useTranslation('taskDetails');
	const router = useRouter();
	const { isTrackingEnabled } = useOrganizationTeams();

	useEffect(() => {
		if (router.isReady && router.query?.id && tasks.length > 0) {
			const foundTask = tasks.find(
				(x) => x.id === (router.query?.id as string)
			);
			// console.log(foundTask);
			foundTask && setTask(foundTask);
		}
	}, [tasks, router.isReady, router.query?.id, setTask]);

	return (
		<MainLayout showTimer={!profile.isAuthUser && isTrackingEnabled}>
			<div className="pt-16 pb-4 -mt-8 bg-white dark:bg-dark--theme">
				<Container>
					<div className="flex items-center space-x-5">
						<button
							onClick={() => {
								router.back();
							}}
						>
							<ArrowLeft />
						</button>

						<Breadcrumb paths={trans.BREADCRUMB} className="text-sm" />
					</div>
				</Container>
			</div>

			<Container className="mb-10">
				<div className="flex flex-col w-full min-h-screen pt-5">
					<section className="flex justify-between lg:flex-row flex-col lg:items-start">
						<section className="mr-5 max-w-[900px] xl:w-full mb-4 md:mb-0">
							<TaskTitleBlock />
							<TaskDescriptionBlock />
							{/* <IssueCard related={false} /> */}
							{/* <IssueCard related={true} /> */}
							{/* <CompletionBlock /> */}
							{/* <ActivityBlock /> */}
						</section>
						<div className="bg-white dark:bg-dark--theme flex flex-col text-red-700 lg:w-[400px] rounded-xl mt-4 lg:mt-0">
							<TaskDetailsAside />
						</div>
					</section>
				</div>
				{/*<div className="flex sm:justify-end justify-center mt-8">
					<Button
						variant="grey"
						className="font-normal py-4 px-4 rounded-xl text-md mr-8"
					>
						Cancel
					</Button>
					<Button
						variant="primary"
						className="font-normal py-4 px-4 rounded-xl text-md"
						type="submit"
					>
						Save
					</Button>
						</div>*/}
			</Container>
		</MainLayout>
	);
};

export default withAuthentication(TaskDetails, { displayName: 'TaskDetails' });
