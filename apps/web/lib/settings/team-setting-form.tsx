/* eslint-disable no-mixed-spaces-and-tabs */
import { Button, InputField, Text, Tooltip } from 'lib/components';
import { useForm } from 'react-hook-form';
import { useCallback, useEffect, useState } from 'react';
import { userState } from '@app/stores';
import { useRecoilState } from 'recoil';
import { Edit2Icon } from 'lib/components/svgs';
import { useTranslation } from 'lib/i18n';
import TimeTrackingToggle from 'lib/components/switch';
import { useIsMemberManager, useOrganizationTeams } from '@app/hooks';

export const TeamSettingForm = () => {
	const [user] = useRecoilState(userState);
	const { register, setValue, handleSubmit, getValues } = useForm();
	const { trans } = useTranslation('settingsTeam');
	const { activeTeam, editOrganizationTeam } = useOrganizationTeams();
	const { isTeamManager, activeManager } = useIsMemberManager(user);
	const [copied, setCopied] = useState(false);
	useEffect(() => {
		setValue('teamName', activeTeam?.name || '');
		setValue('teamType', activeTeam?.public || false);
		setValue('timeTracking', activeManager?.isTrackingEnabled || false);
	}, [user, setValue, activeTeam, activeManager]);

	const onSubmit = useCallback(
		async (values: any) => {
			if (activeTeam) {
				editOrganizationTeam({
					...activeTeam,
					id: activeTeam?.id,
					name: values.teamName,
					organizationId: activeTeam.organizationId,
					tenantId: activeTeam.tenantId,
					public: values.teamType,
					memberIds: activeTeam.members
						.map((t) => t.employee.id)
						.filter((value, index, array) => array.indexOf(value) === index), // To make the array Unique list of ids
					managerIds: activeTeam.members
						.filter((m) => m.role && m.role.name === 'MANAGER')
						.map((t) => t.employee.id)
						.filter((value, index, array) => array.indexOf(value) === index), // To make the array Unique list of ids
				});
			}
		},
		[editOrganizationTeam, activeTeam]
	);

	const getTeamLink = useCallback(() => {
		if (typeof window !== 'undefined' && activeTeam) {
			return `${window.location.origin}/team/${activeTeam.id}/${activeTeam.profile_link}`;
		}
		return '';
	}, [activeTeam]);

	const handleTeamType = useCallback(
		(isPublic: boolean) => {
			setValue('teamType', isPublic);
			const latestFormData = getValues();
			onSubmit({
				...latestFormData,
				teamType: isPublic,
			});
		},
		[setValue, onSubmit, getValues]
	);

	return (
		<>
			<form
				className="w-[98%] md:w-[930px]"
				onSubmit={handleSubmit(onSubmit)}
				autoComplete="off"
			>
				<div className="flex flex-col justify-between items-center">
					<div className="w-full mt-5">
						<div className="">
							<div className="flex w-full items-center justify-between gap-12 lg:flex-row flex-col">
								<Text className="flex-none flex-grow-0 text-md text-gray-400 font-normal mb-2 sm:w-1/5 w-full sm:text-left text-center">
									{trans.TEAM_NAME}
								</Text>
								<div className="flex flex-row flex-grow-0 items-center justify-between lg:w-4/5">
									<InputField
										type="text"
										placeholder={trans.TEAM_NAME}
										{...register('teamName', { required: true, maxLength: 80 })}
										className=""
										trailingNode={
											<Button
												variant="ghost"
												className="p-0 m-0 mr-[0.5rem] min-w-0"
												type="submit"
											>
												<Edit2Icon />
											</Button>
										}
									/>
								</div>
							</div>
							<div className="flex w-full items-center  gap-12 mt-8 lg:flex-row flex-col">
								<Text className="flex-none flex-grow-0 text-md text-gray-400 font-normal mb-2 sm:w-1/5 w-full sm:text-left text-center">
									{trans.TEAM_TYPE}
								</Text>
								<div className="flex gap-x-[30px] lg:flex-row flex-col">
									<div className="items-center  w-full">
										<div>
											<input
												checked={activeTeam?.public}
												id="default-radio-1"
												type="radio"
												value="true"
												className="w-4 h-4 text-[#3826A6] bg-gray-100 border-gray-300 focus:ring-[#3826A6] dark:focus:ring-[#3826A6] dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
												name="r"
												onChange={() => {
													handleTeamType(true);
												}}
											/>
											<Text.Label>Public Team</Text.Label>
										</div>
										<div>
											<input
												checked={!activeTeam?.public}
												id="default-radio-2"
												type="radio"
												value="false"
												className="w-4 h-4 text-[#3826A6] bg-gray-100 border-gray-300 focus:ring-[#3826A6] dark:focus:ring-[#3826A6] dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
												name="r"
												onChange={() => {
													handleTeamType(false);
												}}
											/>
											<Text.Label>Private Team</Text.Label>
										</div>
									</div>
									<div className="flex gap-4 items-center lg:flex-row flex-col">
										<div className="flex flex-row flex-grow-0 items-center justify-between w-64 mb-0">
											<Tooltip
												label={getTeamLink()}
												placement="auto"
												enabled
												className="w-full"
											>
												<InputField
													type="text"
													placeholder={getTeamLink()}
													className="mb-0 h-[54px]"
													wrapperClassName="mb-0 h-[54px]"
													disabled={true}
												/>
											</Tooltip>
										</div>
										<div className="flex flex-row flex-grow-0 items-center justify-between w-1/5">
											<Button
												variant="outline"
												className="border-2 rounded-xl h-[54px] min-w-[105px] font-[600] text-[14px]"
												type="button"
												onClick={() => {
													navigator.clipboard.writeText(getTeamLink());
													setCopied(true);
													setTimeout(() => {
														setCopied(false);
													}, 1000 * 10 /** 10 Seconds */);
												}}
											>
												{!copied ? 'Copy Link' : 'Copied'}
											</Button>
										</div>
									</div>
								</div>
							</div>

							{isTeamManager ? (
								<div className="flex w-full items-center justify-between gap-12">
									<Text className="flex-none font-normal text-gray-400 flex-grow-0 text-md md-2 w-1/5">
										{trans.TIME_TRACKING}
									</Text>
									<div className="flex flex-row flex-grow-0 items-center justify-between w-4/5">
										<TimeTrackingToggle activeManager={activeManager} />
									</div>
								</div>
							) : (
								<></>
							)}
						</div>
					</div>
				</div>
			</form>
		</>
	);
};
