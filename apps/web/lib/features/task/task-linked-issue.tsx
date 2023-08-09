import { ITeamTask } from '@app/interfaces';
import { clsxm } from '@app/utils';
import { Card } from 'lib/components';
import Link from 'next/link';
import { TaskNameInfoDisplay } from './task-displays';
import { ActiveTaskStatusDropdown } from './task-status';

export function TaskLinkedIssue({
	task,
	className,
}: {
	task: ITeamTask;
	className?: string;
}) {
	return (
		<Card
			shadow="custom"
			className={clsxm(
				'flex justify-between items-center py-3 px-0 md:px-0',
				className
			)}
		>
			<Link href={`/task/${task.id}`}>
				<TaskNameInfoDisplay task={task} className="px-1 py-1 md:px-1" />
			</Link>

			<ActiveTaskStatusDropdown task={task} defaultValue={task.status} />
		</Card>
	);
}
