import { useAuthenticateUser, useModal, useTMCardTaskEdit, useTeamMemberCard } from '@app/hooks';
import { useRoles } from '@app/hooks/features/useRoles';
import { OT_Member } from '@app/interfaces';
import { Popover, Transition } from '@headlessui/react';
import { useDropdownAction } from 'lib/features/team/user-team-card/user-team-card-menu';
import { Fragment, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { ConfirmationModal } from './confirmation-modal';
import { ThreeCircleOutlineHorizontalIcon } from 'assets/svg';

type Props = {
	member: OT_Member;
	handleEdit: (member: OT_Member) => void;
};

export const TableActionPopover = ({ member, handleEdit }: Props) => {
	// const [isOpen, setIsOpen] = useState(false);

	const t = useTranslations();
	const { user } = useAuthenticateUser();
	const memberInfo = useTeamMemberCard(member);
	const taskEdition = useTMCardTaskEdit(memberInfo.memberTask);
	const { onRemoveMember } = useDropdownAction({
		edition: taskEdition,
		memberInfo
	});

	const { isOpen, openModal, closeModal } = useModal();

	const isCurrentUser = user?.employee.id === memberInfo.member?.employeeId;

	// const handleClick = () => {
	// 	setIsOpen(!isOpen);
	// };
	return (
		<Popover className="w-full relative no-underline border-none">
			{() => (
				<>
					<Transition
						as={Fragment}
						enter="transition ease-out duration-200"
						enterFrom="opacity-0 translate-y-1"
						enterTo="opacity-100 translate-y-0"
						leave="transition ease-in duration-150"
						leaveFrom="opacity-100 translate-y-0"
						leaveTo="opacity-0 translate-y-1"
					>
						<Popover.Panel className="z-10 absolute right-10 bg-white rounded-2xl w-[7.5rem] flex flex-col pl-5 pr-5 pt-2 pb-2 shadow-xlcard dark:bg-[#1B1D22] dark:border dark:border-[#FFFFFF33]">
							{/* TODO Dynamic */}
							{/* Edit */}
							<div
								className="flex items-center w-auto h-8 hover:cursor-pointer"
								onClick={() => {
									handleEdit(member);
								}}
							>
								<span className="text-[#282048] text-xs font-semibold dark:text-white">
									{t('common.EDIT')}
								</span>
							</div>

							{/* TODO Dynamic */}
							{/* Change Role */}
							{/* <div className="flex items-center w-auto h-8 hover:cursor-pointer">
								<span className="text-[#282048] text-xs font-semibold dark:text-white">
									Change Role
								</span>
							</div> */}
							<RolePopover />

							{/* TODO Dynamic */}
							{/* Need to integrate with API */}
							{/* Permission */}
							{/* <div className="flex items-center w-auto h-8 hover:cursor-pointer">
								<Link href={'/permissions'}>
									<span className="text-[#282048] text-xs font-semibold dark:text-white">
										Permission
									</span>
								</Link>
							</div> */}

							{/* Delete */}
							<div
								className={`flex items-center h-8 w-auto ${
									!isCurrentUser ? 'hover:cursor-pointer' : ''
								}`}
								onClick={isCurrentUser ? () => undefined : () => openModal()}
							>
								<span className={`${!isCurrentUser ? 'text-[#E27474]' : ''} text-xs font-semibold`}>
									{t('common.DELETE')}
								</span>
							</div>
						</Popover.Panel>
					</Transition>
					<Popover.Button className="w-full mt-2 outline-none">
						<ThreeCircleOutlineHorizontalIcon className="w-6 text-[#292D32] relative dark:text-white" strokeWidth="2.5" />
					</Popover.Button>
					<ConfirmationModal
						open={isOpen}
						close={closeModal}
						title={t('pages.settings.ARE_YOU_SURE_TO_DELETE_USER')}
						loading={false}
						onAction={isCurrentUser ? () => undefined : () => onRemoveMember({})}
					/>
				</>
			)}
		</Popover>
	);
};

const RolePopover = () => {
	const { getRoles, roles } = useRoles();
	useEffect(() => {
		getRoles();
	}, [getRoles]);

	return (
		<Popover className="relative w-full no-underline border-none">
			<Transition
				as={Fragment}
				enter="transition ease-out duration-200"
				enterFrom="opacity-0 translate-y-1"
				enterTo="opacity-100 translate-y-0"
				leave="transition ease-in duration-150"
				leaveFrom="opacity-100 translate-y-0"
				leaveTo="opacity-0 translate-y-1"
			>
				<Popover.Panel
					className="z-10 absolute right-0 bg-white dark:bg-[#202023] rounded-2xl w-[9.5rem] flex flex-col pl-5 pr-5 pt-2 pb-2 mt-10 mr-10"
					style={{ boxShadow: ' rgba(0, 0, 0, 0.12) -24px 17px 49px' }}
				>
					{roles.map((role) => (
						<div className="flex items-center w-auto h-8 hover:cursor-pointer" key={role.id}>
							<span className="text-[#282048] text-xs font-semibold dark:text-white">{role.name}</span>
						</div>
					))}
				</Popover.Panel>
			</Transition>
			{/* <Popover.Button className="flex items-center w-auto h-8 outline-none hover:cursor-pointer">
				<span className="text-[#282048] text-xs font-semibold dark:text-white">
					Change Role
				</span>
			</Popover.Button> */}
		</Popover>
	);
};
