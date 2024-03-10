import { Tooltip } from 'lib/components';
import { useTranslations } from 'next-intl';

export function UserTeamCardSkeleton() {
	return (
		<div
			role="status"
			className="p-4 border divide-y divide-gray-200 shadow rounded-xl animate-pulse dark:divide-gray-700 md:p-6 dark:border-gray-700"
		>
			<div className="flex items-center justify-between">
				<div className="flex items-center space-x-3">
					<div className="w-5 h-5 mr-8 rounded-[50%] bg-gray-200 dark:bg-gray-700"></div>
					<div className="w-14 h-14 rounded-[50%] bg-gray-200 dark:bg-gray-700"></div>
					<div>
						<div className="w-32 h-3 mb-2 bg-gray-200 rounded-full dark:bg-gray-700"></div>
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
			className="p-4 mt-3 border divide-y divide-gray-200 shadow rounded-xl animate-pulse dark:divide-gray-700 md:p-6 dark:border-gray-700"
		>
			<div className="flex items-center justify-between">
				<div className="flex items-center space-x-3">
					<div className="w-5 h-5 mr-8 rounded-[50%] bg-gray-200 dark:bg-gray-700"></div>
					<div className="w-24 bg-gray-200 h-9 rounded-xl dark:bg-gray-700"></div>
				</div>
			</div>
		</div>
	);
}

export function UserTeamCardHeader() {
	const t = useTranslations();
	return (
		<div className="my-6 dark:text-[#7B8089] font-normal">
			<div className="relative m-0 flex items-center">
				<div className="flex 2xl:w-[20.625rem] w-1/4 justify-center items-center space-x-2 lg:space-x-4">
					<p>{t('common.NAME')}</p>
				</div>

				<div className="flex-grow self-stretch flex flex-1 justify-center items-center">{t('common.TASK')}</div>

				{/* <div className="flex w-[100%-_20px]"></div> */}

				<div className="w-1/5 gap-4 lg:px-3 2xl:w-52 max-w-[13rem] flex flex-col justify-center gap-y-[1.125rem]">
					<div className="lg:text-center text-left w-full mt-1.5">
						<Tooltip label={t('task.taskTableHead.TOTAL_WORKED_TODAY_HEADER_TOOLTIP')}>
							<div className="text-center">
								{t('task.taskTableHead.TASK_WORK.TITLE')}
								<br />
								<span>{t('common.TASK')}</span>
							</div>
						</Tooltip>
					</div>
				</div>
				<div className="w-1/5 lg:px-3 2xl:w-52 3xl:w-64 lg:text-center text-right">{t('common.ESTIMATE')}</div>
				<div className="w-1/5 gap-4 lg:px-3 2xl:w-52 max-w-[13rem] flex cursor-pointer items-center justify-center mt-1.5 ">
					<Tooltip label={t('task.taskTableHead.WORKED_ON_TASK_HEADER_TOOLTIP')}>
						{t('task.taskTableHead.TOTAL_WORK.TITLE')}
						<br />
						<span className="ml-6">{t('common.TODAY')}</span>
					</Tooltip>
				</div>
			</div>
		</div>
	);
}
