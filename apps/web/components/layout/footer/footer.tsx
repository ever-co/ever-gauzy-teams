import ToggleThemeContainer from '../toggleThemeBtns';
import { useTranslations } from 'next-intl';

const Footer = () => {
	const t = useTranslations();
	return (
		<footer className="flex flex-col items-center justify-between py-2 text-sm font-light text-center md:flex-row lg:text-base sm:text-start x-container-fluid">
			<div className="flex flex-col space-x-1 text-center text-light sm:flex-row md:flex-start sm:items-center md:flex-row">
				<div className="flex items-center justify-between space-x-1 sm:justify-start sm:space-x-2">
					<span className="px-1">{t('layout.footer.COPY_RIGHT1', { date: new Date().getFullYear() })}</span>
					<a
						href="https://gauzy.team"
						target="_blank"
						className="text-primary dark:text-gray-300"
						rel="noreferrer"
					>
						{t('layout.footer.COPY_RIGHT4')}
					</a>
					<div>by</div>
					<a
						href="https://ever.co"
						target="_blank"
						className="text-primary dark:text-gray-300"
						rel="noreferrer"
					>
						{t('layout.footer.COMPANY_NAME')}
					</a>{' '}
					<div className="hidden space-x-2 xs:flex sm:hidden">
						<ToggleThemeContainer />
					</div>
				</div>
				<div>{t('layout.footer.RIGHTS_RESERVED')}</div>
				<div className="hidden space-x-2 sm:flex md:hidden">
					<ToggleThemeContainer />
				</div>
			</div>

			<div className="flex flex-col items-center xs:flex-row sm:flex-col md:flex-row">
				<div className="flex justify-center w-full space-x-4 text-center">
					<a
						href="https://demo.gauzy.co/#/pages/legal/terms"
						target="_blank"
						className="text-primary dark:text-gray-300"
						rel="noreferrer"
					>
						{t('layout.footer.TERMS')}
					</a>
					<a
						href="https://demo.gauzy.co/#/pages/legal/privacy"
						target="_blank"
						className="text-primary dark:text-gray-300"
						rel="noreferrer"
					>
						{t('layout.footer.PRIVACY_POLICY')}
					</a>
				</div>
				<div className="flex px-4 space-x-2 xs:hidden md:flex">
					<ToggleThemeContainer />
				</div>
			</div>
		</footer>
	);
};

export default Footer;
