/* eslint-disable no-mixed-spaces-and-tabs */
import { Button, InputField, Text } from 'lib/components';
import { useForm } from 'react-hook-form';
import { useCallback, useEffect, useState } from 'react';
import { userState } from '@app/stores';
import { useRecoilState } from 'recoil';
import { PlusIcon } from '@heroicons/react/20/solid';
import { IColor, IIcon, ITaskLabelsItemList } from '@app/interfaces';
import { useTaskLabels } from '@app/hooks';
import { StatusesListCard } from './list-card';
import { Spinner } from '@components/ui/loaders/spinner';
import { useTranslation } from 'lib/i18n';
import { ColorDropdown } from './color-dropdown';
import { generateIconList } from './icon-items';
import IconPopover from './icon-popover';

export const TaskLabelForm = () => {
	const [user] = useRecoilState(userState);
	const { register, setValue, handleSubmit } = useForm();
	const [createNew, setCreateNew] = useState(false);
	const [edit, setEdit] = useState<ITaskLabelsItemList | null>(null);
	const { trans } = useTranslation('settingsTeam');

	const taskStatusIconList: IIcon[] = generateIconList('task-statuses', [
		'open',
		'in-progress',
		'ready',
		'in-review',
		'blocked',
		'completed',
	]);
	const taskSizesIconList: IIcon[] = generateIconList('task-sizes', [
		'x-large',
		'large',
		'medium',
		'small',
		'tiny',
	]);
	const taskPrioritiesIconList: IIcon[] = generateIconList('task-priorities', [
		'urgent',
		'high',
		'medium',
		'low',
	]);

	const iconList: IIcon[] = [
		...taskStatusIconList,
		...taskSizesIconList,
		...taskPrioritiesIconList,
	];

	const {
		loading,
		taskLabels,
		deleteTaskLabels,
		createTaskLabels,
		editTaskLabels,
	} = useTaskLabels();

	useEffect(() => {
		if (!edit) {
			setValue('name', '');
			setValue('color', '');
			setValue('icon', '');
		}
	}, [edit, setValue]);

	useEffect(() => {
		if (edit) {
			setValue('name', edit.name);
			setValue('color', edit.color);
			setValue('icon', edit.icon);
		} else {
			setValue('name', '');
			setValue('color', '');
			setValue('icon', '');
		}
	}, [edit, setValue]);

	const onSubmit = useCallback(
		async (values: any) => {
			if (createNew) {
				createTaskLabels({
					name: values.name,
					color: values.color,
					// description: '',
					organizationId: user?.employee.organizationId,
					tenantId: user?.tenantId,
					icon: values.icon,
					// projectId: '',
				})?.then(() => {
					setCreateNew(false);
				});
			}
			if (
				edit &&
				(values.name !== edit.name ||
					values.color !== edit.color ||
					values.icon !== edit.icon)
			) {
				editTaskLabels(edit.id, {
					name: values.name,
					color: values.color,
					icon: values.icon,
				})?.then(() => {
					setEdit(null);
				});
			}
		},
		[edit, createNew, editTaskLabels, user, createTaskLabels]
	);

	return (
		<>
			<form
				className="w-full"
				onSubmit={handleSubmit(onSubmit)}
				autoComplete="off"
			>
				<div className="flex justify-center sm:justify-start">
					<div className="rounded-md m-h-64 p-[32px] flex gap-x-[2rem] flex-col sm:flex-row items-center sm:items-start">
						<Text className="flex-none flex-grow-0 text-md text-gray-400 font-medium mb-2 w-[200px] text-center sm:text-left">
							{trans.TASK_LABELS}
						</Text>

						<div className="flex flex-col items-center sm:items-start">
							{!createNew && !edit && (
								<Button
									variant="outline"
									className="font-normal justify-start border-2 rounded-[10px] text-md w-[230px] h-[46px] gap-0"
									onClick={() => {
										setEdit(null);
										setCreateNew(true);
									}}
								>
									<span className="mr-[11px]">
										<PlusIcon className=" font-normal w-[16px] h-[16px]" />
									</span>
									{trans.CREATE_NEW_LABELS}
								</Button>
							)}

							{(createNew || edit) && (
								<>
									<Text className="flex-none flex-grow-0 text-md text-gray-400 font-medium mb-2">
										{createNew && 'New'}
										{edit && 'Edit'} Labels
									</Text>
									<div className="flex w-full gap-x-5 items-center mt-3">
										<InputField
											type="text"
											placeholder="Create Label"
											className="mb-0 min-w-[350px]"
											wrapperClassName="mb-0"
											{...register('name')}
										/>

										<IconPopover
											iconList={iconList}
											setValue={setValue}
											active={
												edit
													? (iconList.find(
															(icon) => icon.path === edit.icon
													  ) as IIcon)
													: null
											}
										/>

										<ColorDropdown
											setValue={setValue}
											active={
												edit
													? ({ title: edit.color, color: edit.color } as IColor)
													: null
											}
										/>
									</div>
									<div className="flex gap-x-4 mt-5">
										<Button
											variant="primary"
											className="font-normal py-4 px-4 rounded-xl text-md"
											type="submit"
										>
											{edit ? 'Save' : 'Create'}
										</Button>
										<Button
											variant="grey"
											className="font-normal py-4 px-4 rounded-xl text-md"
											onClick={() => {
												setCreateNew(false);
												setEdit(null);
											}}
										>
											Cancel
										</Button>
									</div>
								</>
							)}

							<Text className="flex-none flex-grow-0 text-md text-gray-400 font-medium mb-[1rem] w-full mt-[2.4rem] text-center sm:text-left">
								{trans.LIST_OF_LABELS}
							</Text>
							<div className="flex flex-wrap w-full gap-3 justify-center sm:justify-start">
								{loading && !taskLabels?.length && <Spinner dark={false} />}
								{taskLabels && taskLabels?.length ? (
									taskLabels.map((label) => (
										<StatusesListCard
											statusTitle={
												label?.name ? label?.name?.split('-').join(' ') : ''
											}
											bgColor={label?.color || ''}
											statusIcon={label?.fullIconUrl || ''}
											onEdit={() => {
												setCreateNew(false);
												setEdit(label);
											}}
											onDelete={() => {
												deleteTaskLabels(label.id);
											}}
											key={label.id}
										/>
									))
								) : (
									<></>
								)}
							</div>
						</div>
					</div>
				</div>
			</form>
		</>
	);
};
