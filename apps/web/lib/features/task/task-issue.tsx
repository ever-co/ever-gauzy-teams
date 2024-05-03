import { useModal } from '@app/hooks';
import { IClassName, IssueType, ITaskIssue, ITeamTask, Nullable } from '@app/interfaces';
import { clsxm } from '@app/utils';
import { BackButton, Button, Card, InputField, Modal, Text } from 'lib/components';
import { NoteIcon, BugIcon, Square4StackIcon, Square4OutlineIcon } from 'assets/svg';
import {
	IActiveTaskStatuses,
	StatusDropdown,
	TaskStatus,
	TStatus,
	TStatusItem,
	TTaskVersionsDropdown,
	useActiveTaskStatus,
	useStatusValue
} from './task-status';
import { useTranslations } from 'next-intl';

export const taskIssues: TStatus<ITaskIssue> = {
	Bug: {
		icon: <BugIcon className="w-full max-w-[12px] text-white" />,
		name: 'Bug',
		bgColor: '#923535',
		className: 'min-w-[5rem]'
	},
	Task: {
		icon: <Square4StackIcon className="w-full max-w-[12px] text-white" />,
		name: 'Task',
		bgColor: '#5483BA',
		className: 'min-w-[5rem]'
	},
	Story: {
		icon: <NoteIcon className="w-full max-w-[12px] text-white" />,
		name: 'Story',
		bgColor: '#66BB97',
		className: 'min-w-[5rem]'
	},
	Epic: {
		icon: <Square4OutlineIcon className="w-full max-w-[12px] text-white" />,
		name: 'Custom',
		bgColor: '#8154BA',
		className: 'min-w-[5rem]'
	}
};

/**
 * It's a dropdown that allows you to select an issue from a list of issues, and it also allows you to
 * create a new issue
 * @param  - `className` - the class name for the dropdown
 * @returns A dropdown menu with a button that opens a modal.
 */
export function TaskIssuesDropdown({
	className,
	defaultValue,
	onValueChange,
	showIssueLabels = true,
	taskStatusClassName
}: TTaskVersionsDropdown<'issueType'> & {
	showIssueLabels?: boolean;
	taskStatusClassName?: string;
}) {
	const { isOpen, closeModal } = useModal();
	const { item, items, onChange } = useStatusValue<'issueType'>({
		status: taskIssues,
		value: defaultValue,
		onValueChange
	});

	return (
		<>
			<StatusDropdown
				className={className}
				items={items}
				value={item}
				onChange={onChange}
				issueType="issue"
				showIssueLabels={showIssueLabels}
				taskStatusClassName={taskStatusClassName}
			>
				{/* <Button
					onClick={openModal}
					className="min-w-[100px] text-xs px-1 py-2 gap-0 w-full"
					variant="outline-danger"
				>
					<PlusIcon className="w-4 h-4" />
					{t('common.NEW_ISSUE')}
				</Button> */}
			</StatusDropdown>
			<CreateTaskIssueModal open={isOpen} closeModal={closeModal} />
		</>
	);
}

/**
 * It's a dropdown that lets you change the issue status of an active task
 * @param props - IActiveTaskStatuses<'issue'>
 * @returns A dropdown component that allows the user to select a status for the task.
 */
export function ActiveTaskIssuesDropdown({ ...props }: IActiveTaskStatuses<'issueType'>) {
	const t = useTranslations();
	const { item, items, onChange, field } = useActiveTaskStatus(props, taskIssues, 'issueType');

	const validTransitions: Record<IssueType, TStatusItem[]> = {
		[IssueType.EPIC]: [],
		[IssueType.STORY]: items.filter((it) => [IssueType.TASK, IssueType.BUG].includes(it.value as IssueType)),

		[IssueType.TASK]: items.filter((it) => [IssueType.STORY, IssueType.BUG].includes(it.value as IssueType)),

		[IssueType.BUG]: items.filter((it) => [IssueType.STORY, IssueType.TASK].includes(it.value as IssueType))
	};

	let updatedItemsBasedOnTaskIssueType: TStatusItem[] = [];

	if (props.task && props.task?.issueType && props.task.parent) {
		updatedItemsBasedOnTaskIssueType = validTransitions[props.task?.issueType];

		// If parent task is already Story then user can not assign current task as a Story
		if (props.task.parent.issueType === 'Story') {
			updatedItemsBasedOnTaskIssueType = updatedItemsBasedOnTaskIssueType.filter((it) => it.value !== 'Story');
		}
	} else if (props.task && props.task?.issueType) {
		updatedItemsBasedOnTaskIssueType = validTransitions[props.task?.issueType];
	} else {
		// Default show types in Dropdown
		updatedItemsBasedOnTaskIssueType = items;
	}

	return (
		<StatusDropdown
			sidebarUI={props.sidebarUI}
			className={props.className}
			items={props.forParentChildRelationship ? updatedItemsBasedOnTaskIssueType : items}
			value={item || (taskIssues['Task'] as Required<TStatusItem>)}
			defaultItem={!item ? field : undefined}
			onChange={onChange}
			issueType="issue"
			enabled={item?.name !== 'Epic'}
			showIssueLabels={props.showIssueLabels}
			disabledReason={item?.name === 'Epic' ? t('pages.taskDetails.TASK_IS_ALREADY_EPIC') : ''}
			taskStatusClassName={props.taskStatusClassName}
		/>
	);
}

/**
 * It returns a TaskStatus component with the taskIssues[task?.issue || 'Task'] object as props, and
 * the className prop set to 'rounded-md px-2 text-white'
 * @param  - `taskIssues` - an object that contains the status of each issue.
 * @returns A TaskStatus component with the taskIssues[task?.issue || 'Task'] props.
 */
export function TaskIssueStatus({
	task,
	className,
	showIssueLabels
}: { task: Nullable<ITeamTask>; showIssueLabels?: boolean } & IClassName) {
	return (
		<TaskStatus
			{...taskIssues[task?.issueType || 'Task']}
			showIssueLabels={showIssueLabels}
			issueType="issue"
			className={clsxm('rounded-md px-2 text-white', className)}
		/>
	);
}

/**
 * It's a modal that allows you to create a new issue
 * @param  - `open` - a boolean that determines whether the modal is open or not
 * @returns A modal that allows the user to create a task issue.
 */
export function CreateTaskIssueModal({ open, closeModal }: { open: boolean; closeModal: () => void }) {
	const t = useTranslations();
	const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
	};

	return (
		<Modal isOpen={open} closeModal={closeModal}>
			<form className="w-[98%] md:w-[430px]" autoComplete="off" onSubmit={handleSubmit}>
				<Card className="w-full" shadow="custom">
					<div className="flex flex-col items-center justify-between">
						<Text.Heading as="h3" className="text-center">
							{t('common.CREATE_ISSUE')}
						</Text.Heading>

						<div className="w-full mt-5">
							<InputField
								name="name"
								autoCustomFocus
								placeholder={t('form.ISSUE_NAME_PLACEHOLDER')}
								required
							/>
						</div>

						<div className="flex items-center justify-between w-full mt-3">
							<BackButton onClick={closeModal} />
							<Button type="submit">{t('common.CREATE')}</Button>
						</div>
					</div>
				</Card>
			</form>
		</Modal>
	);
}
