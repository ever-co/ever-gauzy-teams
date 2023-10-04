/* eslint-disable no-mixed-spaces-and-tabs */
import { Avatar, Button } from 'lib/components';
import { useCallback, useState } from 'react';
import { useAuthenticateUser, useImageAssets, useSettings } from '@app/hooks';
import { useForm } from 'react-hook-form';
import Image from 'next/image';
import { IImageAssets } from '@app/interfaces';
import { clsxm } from '@app/utils';
import stc from 'string-to-color';
import { imgTitle } from '@app/helpers';

export const ProfileAvatar = () => {
	const { register } = useForm();
	const [avatarBtn, setAvatarBtn] = useState(false);
	const { updateAvatar } = useSettings();
	const { createImageAssets } = useImageAssets();
	const { user } = useAuthenticateUser();

	const changeAvatarState = () => {
		if (avatarBtn) {
			setAvatarBtn(false);
		} else {
			setAvatarBtn(true);
		}
	};
	const onChangeAvatar = useCallback(
		async (e: any) => {
			if (e.target.files && user) {
				createImageAssets(
					e.target.files[0],
					'profile_pictures_avatars',
					user.tenantId as string,
					user?.employee?.organizationId
				)
					.then((d: IImageAssets) => {
						updateAvatar({ imageId: d.id, id: user.id });
					})
					.finally(() => {
						setAvatarBtn(false);
					});
			}
		},
		[updateAvatar, user, createImageAssets]
	);

	const onDeleteAvatar = useCallback(async () => {
		if (user) {
			await updateAvatar({ imageId: null, id: user.id });
			setAvatarBtn(false);
		}
	}, [updateAvatar, user]);

	return (
		<>
			<div className="flex flex-col justify-between items-center">
				<div className="w-full">
					<div className="">
						<div className="flex w-full items-center sm:justify-between justify-center gap-8">
							<div className="relative">
								<div
									className={clsxm(
										'w-[80px] h-[80px]',
										'flex justify-center items-center',
										'rounded-full text-xs text-default dark:text-white',
										'shadow-md text-4xl font-normal',
										'mt-8'
									)}
									style={{
										backgroundColor: `${stc(user?.name || '')}80`
									}}
								>
									{user?.imageId ? (
										<Avatar
											size={80}
											className="relative cursor-pointer"
											imageUrl={
												user?.image?.thumbUrl ||
												user?.image?.fullUrl ||
												user?.imageUrl
											}
											alt="User Avatar"
										/>
									) : user?.name ? (
										imgTitle(user?.name)
									) : (
										''
									)}
								</div>

								<span
									className="absolute top-[30px] right-[-4px] bg-[#282048] w-[27px] h-[27px] rounded-full flex justify-center items-center border-[3px] border-[#F7F7F8] cursor-pointer p-1"
									onClick={() => changeAvatarState()}
								>
									<Image
										src="/assets/svg/profile-edit.svg"
										alt={'user avatar'}
										width={'80'}
										height={'80'}
									/>
								</span>
							</div>
							{avatarBtn ? (
								<div className="flex w-full items-center gap-3">
									<div className="mt-6">
										<label className="flex flex-row items-center justify-center py-3 px-4 gap-3 rounded-xl min-w-[140px] text-primary border-2 border-primary font-medium dark:text-primary-light dark:border-primary-light disabled:opacity-40 cursor-pointer">
											<span>Change Avatar</span>
											<input
												type="file"
												{...register('imageUrl')}
												onChange={(e) => onChangeAvatar(e)}
												className="hidden"
											/>
										</label>
									</div>
									<div className="mt-6">
										<Button
											variant="grey"
											onClick={() => onDeleteAvatar()}
											className="rounded-xl"
										>
											Delete
										</Button>
									</div>
								</div>
							) : (
								<></>
							)}
						</div>
					</div>
				</div>
			</div>
		</>
	);
};
