'use client';
import { RocketIcon } from '@radix-ui/react-icons';
import { Text } from 'lib/components';
import { useTranslations } from 'next-intl';
function Maintenance() {
	const t = useTranslations();
	return (
		<div className="h-screen flex flex-col gap-4 justify-center items-center ">
			<RocketIcon width={200} height={200} className="text-xl text-chetwodeBlue" />
			<div className="m-auto relative my-6 pt-12 flex justify-center items-center gap-4 text-center ">
				<Text className="text-[78px] text-center font-semibold text-chetwodeBlue">
					{t('pages.maintenance.HEADING_TITLE')}
				</Text>
			</div>

			<Text className="text-[40px] my-4 font-bold text-center text-[#282048] dark:text-light--theme">
				{t('pages.maintenance.HEADING_DESCRIPTION')}
			</Text>
		</div>
	);
}

export default Maintenance;