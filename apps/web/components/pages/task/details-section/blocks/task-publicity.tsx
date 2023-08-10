import { detailedTaskState } from '@app/stores';
import React, { useCallback } from 'react';
import { useRecoilState } from 'recoil';
import { useTeamTasks } from '@app/hooks';
import { clsxm } from '@app/utils';
import { GlobIcon, LockIcon } from 'lib/components/svgs';

const TaskPublicity = () => {
	const [task] = useRecoilState(detailedTaskState);
	const { updatePublicity } = useTeamTasks();

	const handlePublicity = useCallback(
		(value: boolean) => {
			updatePublicity(value, task, true);
		},
		[task, updatePublicity]
	);

	return (
		<div
			className={clsxm(
				'h-[2.375rem] border-y border-solid border-color-[rgba(0,0,0,0.07)] dark:border-[#26272C] ',
				'bg-[#FBFAFA] dark:bg-dark--theme-light',
				'details-label px-4 flex justify-between'
			)}
		>
			{task?.public ? (
				<>
					<div className="text-[#293241] dark:text-white flex items-center gap-2">
						<GlobIcon className="stroke-black dark:stroke-[#a6a2b2] w-3" />
						<p className="text-[0.625rem]">This task is Public</p>
					</div>
					<div
						onClick={() => handlePublicity(false)}
						className="flex items-center cursor-pointer text-[0.625rem] text-[#A5A2B2]"
					>
						Make a private
					</div>
				</>
			) : (
				<>
					<div className="text-[#293241] dark:text-white flex items-center gap-2">
						<LockIcon className="stroke-black dark:stroke-[#a6a2b2] w-3" />
						<p className="text-[0.625rem]">This task is Private</p>
					</div>
					<div
						onClick={() => handlePublicity(true)}
						className="flex items-center cursor-pointer text-[0.625rem] text-[#A5A2B2]"
					>
						Make a public
					</div>
				</>
			)}
		</div>
	);
};

export default TaskPublicity;
