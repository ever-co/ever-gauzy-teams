import { useOrganizationProjects } from '@/app/hooks';
import { IProject } from '@/app/interfaces';
import { Button, Card, InputField, Modal, Text } from 'lib/components';
import { useTranslations } from 'next-intl';
import { useCallback, useEffect, useState } from 'react';

interface ICreateProjectModalProps {
	open: boolean;
	closeModal: () => void;
	onSuccess?: (project: IProject) => void;
}
/**
 * A modal that allow to create a new project
 *
 * @param {Object} props - The props Object
 * @param {boolean} props.open - If true open the modal otherwise close the modal
 * @param {() => void} props.closeModal - A function to close the modal
 *
 * @returns {JSX.Element} The modal element
 */
export function CreateProjectModal(props: ICreateProjectModalProps) {
	const t = useTranslations();
	const { open, closeModal, onSuccess } = props;
	const { createOrganizationProject, createOrganizationProjectLoading } = useOrganizationProjects();
	const [name, setName] = useState('');

	// Cleanup
	useEffect(() => {
		return () => {
			setName('');
		};
	}, []);

	const handleCreateProject = useCallback(async () => {
		try {
			if (name.trim() === '') {
				return;
			}
			const data = await createOrganizationProject({ name });

			if (data) {
				onSuccess?.(data);
			}

			closeModal();
		} catch (error) {
			console.error(error);
		}
	}, [closeModal, createOrganizationProject, name, onSuccess]);

	return (
		<Modal isOpen={open} closeModal={closeModal} alignCloseIcon>
			<Card className=" sm:w-[33rem] w-[20rem]" shadow="custom">
				<div className="flex flex-col items-center justify-between gap-8">
					<Text.Heading as="h3" className="text-center">
						{t('common.CREATE_PROJECT')}
					</Text.Heading>

					<div className="w-full">
						<InputField
							name="name"
							autoCustomFocus
							value={name}
							onChange={(e) => setName(e.target.value)}
							placeholder={'Please enter the project name'}
							required
							className="w-full"
							wrapperClassName=" h-full border border-blue-500"
							noWrapper
						/>
					</div>

					<div className="flex items-center justify-between w-full">
						<Button
							disabled={createOrganizationProjectLoading}
							onClick={closeModal}
							className="h-[2.75rem]"
							variant="outline"
						>
							{t('common.CANCEL')}
						</Button>
						<Button
							disabled={createOrganizationProjectLoading}
							loading={createOrganizationProjectLoading}
							className="h-[2.75rem]"
							type="submit"
							onClick={handleCreateProject}
						>
							{t('common.CREATE')}
						</Button>
					</div>
				</div>
			</Card>
		</Modal>
	);
}