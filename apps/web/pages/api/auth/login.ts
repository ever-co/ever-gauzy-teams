import { setAuthCookies, setNoTeamPopupShowCookie } from '@app/helpers/cookies';
import { generateToken } from '@app/helpers/generate-token';
import { authFormValidate } from '@app/helpers/validations';
import { ILoginDataAPI, ILoginResponse as ILoginResponse } from '@app/interfaces/IAuthentication';
import {
	acceptInviteRequest,
	getAllOrganizationTeamRequest,
	getUserOrganizationsRequest,
	verifyAuthCodeRequest,
	verifyInviteCodeRequest
} from '@app/services/server/requests';
import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
	const body = req.body as ILoginDataAPI;
	let loginResponse: ILoginResponse | null = null;

	const { errors, valid: formValid } = authFormValidate(['email', 'code'], body as any);

	if (!formValid) {
		return res.status(400).json({ errors });
	}

	/**
	 * Verify first if matches with invite code
	 */
	const inviteReq = await verifyInviteCodeRequest({
		email: body.email,
		code: body.code
	}).catch(() => void 0);
	/**
	 * If the invite code verification failed then try again with the Auth code
	 */
	if (!inviteReq || !inviteReq.response.ok || (inviteReq.data as any).response?.statusCode) {
		try {
			const authReq = await verifyAuthCodeRequest(body.email, body.code);
			if (
				!authReq.response.ok ||
				(authReq.data as any).status === 404 ||
				(authReq.data as any).status === 400 ||
				(authReq.data as any).status === 401
			) {
				return res.status(200).json({
					errors: {
						email: 'Authentication code or email address invalid'
					}
				});
			}

			loginResponse = authReq.data;
		} catch (error) {
			// return notFound(res);
			return res.status(200).json({
				errors: {
					email: 'Authentication code or email address invalid'
				}
			});
		}

		/**
		 * If the provided code is an invite code and
		 * verified then accept and register the related user
		 */
	} else {
		// General a random password with 8 chars
		const password = generateToken(8);
		const names = inviteReq.data.fullName.split(' ');
		const acceptInviteRes = await acceptInviteRequest({
			code: body.code,
			email: inviteReq.data.email,
			password: password,
			user: {
				firstName: names[0],
				lastName: names[1] || '',
				email: body.email
			}
		}).catch(() => void 0);

		if (
			!acceptInviteRes ||
			!acceptInviteRes.response.ok ||
			acceptInviteRes.response.status === 401 ||
			acceptInviteRes.response.status === 400 ||
			(acceptInviteRes.data as any).response?.statusCode
		) {
			return res.status(400).json({
				errors: {
					email: 'Authentication code or email address invalid'
				}
			});
		}

		loginResponse = acceptInviteRes.data;
	}

	if (!loginResponse) {
		return res.status(400).json({
			errors: {
				email: 'Authentication code or email address invalid'
			}
		});
	}

	/**
	 * Get the first team from the first organization
	 */
	const tenantId = loginResponse.user?.tenantId || '';
	const access_token = loginResponse.token;
	const userId = loginResponse.user?.id;

	const { data: organizations } = await getUserOrganizationsRequest({ tenantId, userId }, access_token);

	const organization = organizations?.items[0];

	if (!organization) {
		return res.status(400).json({
			errors: {
				email: 'Your account is not yet ready to be used on the Ever Teams Platform'
			}
		});
	}

	const { data: teams } = await getAllOrganizationTeamRequest(
		{ tenantId, organizationId: organization.organizationId },
		access_token
	);

	const team = teams.items[0];

	if (!team) {
		setNoTeamPopupShowCookie(true);		
	}

	setAuthCookies(
		{
			access_token: loginResponse.token,
			refresh_token: {
				token: loginResponse.refresh_token
			},
			teamId: team?.id,
			tenantId,
			organizationId: organization?.organizationId,
			languageId: 'en', // TODO: not sure what should be here
			noTeamPopup: true,
			userId
		},
		req,
		res
	);

	res.status(200).json({ team, loginResponse });
}
