'use client';
import { useAuthenticateUser, useDailyPlan } from '@app/hooks';
import { IDailyPlan, IEmployee, IUser } from '@app/interfaces';
import { Cross2Icon, EyeOpenIcon } from '@radix-ui/react-icons';
import { Tooltip } from 'lib/components';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { useEffect, useState } from 'react';

interface IEmployeeWithOutstanding {
	employeeId: string | undefined;
	employee: IEmployee | undefined;
}

export function TeamOutstandingNotifications() {
	const { getAllDayPlans, dailyPlan, getEmployeeDayPlans, outstandingPlans } = useDailyPlan();

	const { isTeamManager, user } = useAuthenticateUser();

	useEffect(() => {
		getAllDayPlans();
		getEmployeeDayPlans(user?.employee.id || '');
	}, [getAllDayPlans, getEmployeeDayPlans, user?.employee.id]);

	return (
		<div className="flex flex-col gap-4">
			{outstandingPlans && outstandingPlans.length > 0 && (
				<UserOutstandingNotification outstandingTasks={outstandingPlans} user={user} />
			)}

			{dailyPlan.items && dailyPlan.items.length > 0 && isTeamManager && (
				<ManagerOutstandingUsersNotification outstandingTasks={dailyPlan.items} />
			)}
		</div>
	);
}

function UserOutstandingNotification({ outstandingTasks, user }: { outstandingTasks: IDailyPlan[]; user?: IUser }) {
	const t = useTranslations();

	// Notification will be displayed 6 hours after the user closed it
	const REAPPEAR_INTERVAL = 6 * 60 * 60 * 1000; // 6 hours in milliseconds;
	const DISMISSAL_TIMESTAMP_KEY = 'user-saw-notif';

	const name = user?.name || user?.firstName || user?.lastName || user?.username;

	const [visible, setVisible] = useState(false);
	const tasks = outstandingTasks.flatMap((plan) => plan.tasks);

	useEffect(() => {
		const checkNotification = () => {
			const alreadySeen = window && parseInt(window?.localStorage.getItem(DISMISSAL_TIMESTAMP_KEY) || '0', 10);
			const currentTime = new Date().getTime();

			if (!alreadySeen || currentTime - alreadySeen > REAPPEAR_INTERVAL) {
				setVisible(true);
			}
		};

		checkNotification();
		const intervalId = setInterval(checkNotification, REAPPEAR_INTERVAL);
		return () => clearInterval(intervalId);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const onClose = () => {
		window && window?.localStorage.setItem(DISMISSAL_TIMESTAMP_KEY, new Date().getTime().toString());
		setVisible(false);
	};

	return (
		<>
			{visible && (
				<div className="rounded-2xl dark:border-dark--theme-light border py-2 px-6 flex justify-between items-center text-xs mb-2">
					<div>
						{t('pages.home.OUTSTANDING_NOTIFICATIONS.SUBJECT')} {tasks?.length}{' '}
						{t('pages.home.OUTSTANDING_NOTIFICATIONS.USER_LABEL')}{' '}
						<span className="font-medium">
							{t('pages.home.OUTSTANDING_NOTIFICATIONS.OUTSTANDING_VIEW')}
						</span>
					</div>
					<div className="flex items-center gap-5">
						<div>
							<Link
								href={`/profile/${user?.id}?name=${name || ''}`}
								className="bg-primary text-white py-2 px-4 flex gap-2 items-center rounded-xl"
								onClick={() => {
									onClose();
									window && window.localStorage.setItem('task-tab', 'dailyplan');
									window && window.localStorage.setItem('daily-plan-tab', 'Outstanding');
								}}
							>
								<EyeOpenIcon />
								<span>{t('pages.home.OUTSTANDING_NOTIFICATIONS.VIEW_BUTTON')}</span>
							</Link>
						</div>
						<Tooltip label={t('common.CLOSE')}>
							<Cross2Icon className="text-xl cursor-pointer" onClick={onClose} />
						</Tooltip>
					</div>
				</div>
			)}
		</>
	);
}

function ManagerOutstandingUsersNotification({ outstandingTasks }: { outstandingTasks: IDailyPlan[] }) {
	const t = useTranslations();

	// Notification will be displayed 6 hours after the user closed it
	const REAPPEAR_INTERVAL = 6 * 60 * 60 * 1000; // 6 hours in milliseconds;
	const MANAGER_DISMISSAL_TIMESTAMP_KEY = 'manager-saw-outstanding-notif';

	const [visible, setVisible] = useState(false);

	const employeeWithOutstanding = outstandingTasks
		.filter((plan) => !plan.date?.toString()?.startsWith(new Date()?.toISOString().split('T')[0]))

		.filter((plan) => {
			const planDate = new Date(plan.date);
			const today = new Date();
			today.setHours(23, 59, 59, 0);
			return planDate.getTime() <= today.getTime();
		})
		.map((plan) => ({
			...plan,
			tasks: plan.tasks?.filter((task) => task.status !== 'completed')
		}))
		.filter((plan) => plan.tasks?.length && plan.tasks.length > 0)
		.map((plan) => ({ employeeId: plan.employeeId, employee: plan.employee }));

	const uniqueEmployees: IEmployeeWithOutstanding[] = employeeWithOutstanding.reduce(
		(acc: IEmployeeWithOutstanding[], current) => {
			const existingEmployee = acc.find((emp) => emp.employeeId === current.employeeId);

			if (!existingEmployee) {
				acc.push({
					employeeId: current.employeeId,
					employee: current.employee
				});
			}

			return acc;
		},
		[]
	);

	useEffect(() => {
		const checkNotification = () => {
			const alreadySeen =
				window && parseInt(window?.localStorage.getItem(MANAGER_DISMISSAL_TIMESTAMP_KEY) || '0', 10);
			const currentTime = new Date().getTime();

			if (!alreadySeen || currentTime - alreadySeen > REAPPEAR_INTERVAL) {
				setVisible(true);
			}
		};

		checkNotification();
		const intervalId = setInterval(checkNotification, REAPPEAR_INTERVAL);
		return () => clearInterval(intervalId);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const onClose = () => {
		window && window?.localStorage.setItem(MANAGER_DISMISSAL_TIMESTAMP_KEY, new Date().getTime().toString());
		setVisible(false);
	};
	return (
		<>
			{visible && (
				<div className="rounded-2xl dark:border-dark--theme-light border py-4 px-6 flex justify-between items-center text-xs mb-2">
					<div>
						{t('pages.home.OUTSTANDING_NOTIFICATIONS.SUBJECT')} {uniqueEmployees?.length} team member(s)
						with uncompleted tasks, please see{' '}
						<span>
							{uniqueEmployees?.map((em) => (
								<Link
									href={`/profile/${em.employee?.user?.id}?name=${em.employee?.user?.name || em.employee?.user?.firstName || em.employee?.user?.lastName || em.employee?.user?.username}`}
									key={em.employeeId}
									className="text-primary font-semibold underline"
								>
									{em.employee?.fullName},{' '}
								</Link>
							))}
						</span>
					</div>
					<div className="flex items-center gap-5">
						<Tooltip label={t('common.CLOSE')}>
							<Cross2Icon className="text-xl cursor-pointer" onClick={onClose} />
						</Tooltip>
					</div>
				</div>
			)}
		</>
	);
}
