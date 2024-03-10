'use client';

import { authFormValidate } from '@app/helpers/validations';
import { ISigninEmailConfirmResponse, ISigninEmailConfirmWorkspaces } from '@app/interfaces';
import {
	sendAuthCodeAPI,
	signInEmailAPI,
	signInEmailConfirmAPI,
	signInWithEmailAndCodeAPI,
	signInWorkspaceAPI
} from '@app/services/client/api';
import { AxiosError, isAxiosError } from 'axios';
import { usePathname, useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useQuery } from '../useQuery';
import { useRouter } from 'next/navigation';

type AuthCodeRef = {
	focus: () => void;
	clear: () => void;
};

export function useAuthenticationPasscode() {
	const pathname = usePathname();
	const query = useSearchParams();
	const queryTeamId = useMemo(() => {
		return query?.get('teamId');
	}, [query]);

	const queryEmail = useMemo(() => {
		const emailQuery = query?.get('email') || '';

		if (typeof localStorage !== 'undefined') {
			localStorage?.setItem('ever-teams-start-email', emailQuery);
		}
		return emailQuery;
	}, [query]);

	const queryCode = useMemo(() => {
		return query?.get('code');
	}, [query]);

	const loginFromQuery = useRef(false);
	const inputCodeRef = useRef<AuthCodeRef | null>(null);
	const [screen, setScreen] = useState<'email' | 'passcode' | 'workspace'>('email');
	const [workspaces, setWorkspaces] = useState<ISigninEmailConfirmWorkspaces[]>([]);
	const [authenticated, setAuthenticated] = useState(false);

	const [formValues, setFormValues] = useState({
		email: queryEmail,
		code: ''
	});

	const [errors, setErrors] = useState({} as { [x: string]: any });
	const router = useRouter();
	// Queries
	const { queryCall: sendCodeQueryCall, loading: sendCodeLoading } = useQuery(sendAuthCodeAPI);

	const { queryCall: signInEmailQueryCall, loading: signInEmailLoading } = useQuery(signInEmailAPI);
	const { queryCall: signInEmailConfirmQueryCall, loading: signInEmailConfirmLoading } =
		useQuery(signInEmailConfirmAPI);
	const {
		queryCall: signInWorkspaceQueryCall,
		loading: signInWorkspaceLoading,
		infiniteLoading: infiniteWLoading
	} = useQuery(signInWorkspaceAPI);

	const { queryCall, loading, infiniteLoading } = useQuery(signInWithEmailAndCodeAPI);

	const handleChange = (e: any) => {
		const { name, value } = e.target;
		setFormValues((prevState) => ({ ...prevState, [name]: value }));
	};

	/**
	 * Verify auth request
	 */
	const verifySignInEmailConfirmRequest = async ({ email, code }: { email: string; code: string }) => {
		signInEmailConfirmQueryCall(email, code)
			.then((res) => {
				const checkError: {
					message: string;
				} = res.data as any;
				const isError = checkError.message === 'Unauthorized';
				if (isError) {
					setErrors({
						code: 'Invalid code. Please try again.'
					});
				} else {
					setErrors({});
				}
				const data = res.data as ISigninEmailConfirmResponse;
				if (!data.workspaces) {
					return;
				}

				if (data && Array.isArray(data.workspaces) && data.workspaces.length > 0) {
					setWorkspaces(data.workspaces);

					setScreen('workspace');
				}

				// If user tries to login from public Team Page as an Already a Member
				// Redirect to the current team automatically
				if (pathname === '/team/[teamId]/[profileLink]' && data.workspaces.length) {
					if (queryTeamId) {
						const currentWorkspace = data.workspaces.find((workspace) =>
							workspace.current_teams.map((item) => item.team_id).includes(queryTeamId as string)
						);

						signInToWorkspaceRequest({
							email: email,
							token: currentWorkspace?.token as string,
							selectedTeam: queryTeamId as string
						});
					}
				}

				// if (res.data?.status !== 200 && res.data?.status !== 201) {
				// 	setErrors({ code: t('pages.auth.INVALID_INVITE_CODE_MESSAGE') });
				// }
			})
			.catch((err: AxiosError<{ errors: Record<string, any> }, any> | { errors: Record<string, any> }) => {
				if (isAxiosError(err)) {
					if (err.response?.status === 400) {
						setErrors(err.response.data?.errors || {});
					}
				} else {
					setErrors(err.errors || {});
				}
			});
	};

	const verifyPasscodeRequest = useCallback(
		({ email, code }: { email: string; code: string }) => {
			queryCall(email, code)
				.then((res) => {
					const errors = (res.data as any).errors ?? {};

					if (errors.email) {
						setErrors(errors);
						return;
					}

					window.location.reload();
					setAuthenticated(true);
				})
				.catch((err: AxiosError) => {
					if (err.response?.status === 400) {
						setErrors((err.response?.data as any)?.errors || {});
					}

					inputCodeRef.current?.clear();
				});
		},
		[queryCall]
	);

	const signInToWorkspaceRequest = ({
		email,
		token,
		selectedTeam
	}: {
		email: string;
		token: string;
		selectedTeam: string;
	}) => {
		signInWorkspaceQueryCall(email, token, selectedTeam)
			.then(() => {
				setAuthenticated(true);
				router.push('/');
			})
			.catch((err: AxiosError) => {
				if (err.response?.status === 400) {
					setErrors((err.response?.data as any)?.errors || {});
				}

				inputCodeRef.current?.clear();
			});
	};

	const handleCodeSubmit = (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		setErrors({});
		const { errors, valid } = authFormValidate(['email', 'code'], formValues as any);
		if (!valid) {
			setErrors(errors);
			return;
		}
		infiniteLoading.current = true;

		verifySignInEmailConfirmRequest({
			email: formValues.email,
			code: formValues.code
		});
	};

	const handleSubmit = (e: any) => {
		e.preventDefault();
		setErrors({});
		const { errors, valid } = authFormValidate(['email', 'code'], formValues as any);

		if (!valid) {
			setErrors(errors);
			return;
		}

		infiniteLoading.current = true;

		verifyPasscodeRequest({
			email: formValues.email,
			code: formValues.code
		});
	};

	const handleWorkspaceSubmit = (e: any, token: string, selectedTeam: string) => {
		e.preventDefault();
		setErrors({});
		const { errors, valid } = authFormValidate(['email'], formValues as any);

		if (!valid) {
			setErrors(errors);
			return;
		}

		infiniteWLoading.current = true;

		signInToWorkspaceRequest({
			email: formValues.email,
			token,
			selectedTeam
		});
	};

	/**
	 * Verifiy immediatly passcode if email and code were passed from url
	 */
	useEffect(() => {
		if (queryEmail && queryCode && !loginFromQuery.current) {
			setScreen('passcode');
			verifyPasscodeRequest({
				email: queryEmail as string,
				code: queryCode as string
			});
			loginFromQuery.current = true;
		}
	}, [query, verifyPasscodeRequest, queryEmail, queryCode]);

	/**
	 * send a fresh auth request handler
	 * STEP1
	 */
	const sendAuthCodeHandler = useCallback(() => {
		const promise = signInEmailQueryCall(formValues['email']);

		promise.then(() => setErrors({}));
		promise.catch((err: AxiosError) => {
			if (err.response?.status === 400) {
				setErrors((err.response?.data as any)?.errors || {});
			}
		});

		return promise;
	}, [formValues, signInEmailQueryCall]);

	return {
		sendAuthCodeHandler,
		errors,
		sendCodeLoading,
		handleSubmit,
		handleChange,
		loading,
		formValues,
		setFormValues,
		inputCodeRef,
		setErrors,
		authScreen: { screen, setScreen },
		authenticated,
		setAuthenticated,
		handleCodeSubmit,
		signInEmailQueryCall,
		signInEmailLoading,
		signInEmailConfirmQueryCall,
		signInEmailConfirmLoading,
		workspaces,
		sendCodeQueryCall,
		signInWorkspaceLoading,
		queryCall,
		handleWorkspaceSubmit
	};
}

export type TAuthenticationPasscode = ReturnType<typeof useAuthenticationPasscode>;
