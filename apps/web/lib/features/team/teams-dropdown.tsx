import { useCallback, useEffect, useMemo, useState } from 'react';
import { Button, Dropdown } from 'lib/components';
import { mapTeamItems, TeamItem } from './team-item';
import { PlusIcon } from '@heroicons/react/24/solid';
import {
	useAuthenticateUser,
	useModal,
	useOrganizationTeams,
} from '@app/hooks';
import { clsxm } from '@app/utils';
import { CreateTeamModal } from './create-team-modal';

export const TeamsDropDown = ({ publicTeam }: { publicTeam?: boolean }) => {
	const { user } = useAuthenticateUser();
	const { teams, activeTeam, setActiveTeam, teamsFetching } =
		useOrganizationTeams();

	const items = useMemo(() => mapTeamItems(teams), [teams]);

	const [teamItem, setTeamItem] = useState<TeamItem | null>(null);

	const { isOpen, closeModal, openModal } = useModal();

	useEffect(() => {
		setTeamItem(items.find((t) => t.key === activeTeam?.id) || null);
	}, [activeTeam, items]);

	const onChangeActiveTeam = useCallback(
		(item: TeamItem) => {
			if (item.data) {
				setActiveTeam(item.data);
			}
		},
		[setActiveTeam]
	);

	return (
		<>
			<Dropdown
				className="md:w-[223px]"
				optionsClassName="md:w-[223px]"
				buttonClassName={clsxm(
					'py-0 font-medium',
					items.length === 0 && ['py-2']
				)}
				value={teamItem}
				onChange={onChangeActiveTeam}
				items={items}
				loading={teamsFetching}
				publicTeam={publicTeam}
			>
				{!publicTeam && (
					<Button
						className="w-full text-xs mt-3 dark:text-white dark:border-white"
						variant="outline"
						onClick={openModal}
					>
						<PlusIcon className="w-[16px] h-[16px]" /> Create new teams
					</Button>
				)}
			</Dropdown>

			{!publicTeam && (
				<CreateTeamModal
					open={isOpen && !!user?.isEmailVerified}
					closeModal={closeModal}
				/>
			)}
		</>
	);
};
