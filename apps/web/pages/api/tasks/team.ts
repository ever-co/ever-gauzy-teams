import { getActiveTeamIdCookie } from '@app/helpers/cookies';
import { authenticatedGuard } from '@app/services/server/guards/authenticated-guard';
import { createTaskRequest, getTeamTasksRequest } from '@app/services/server/requests';
import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
	const { $res, user, tenantId, organizationId, access_token, projectId } = await authenticatedGuard(req, res);
	if (!user) return $res();

	if (req.method === 'POST') {
		const body: Record<string, any> = req.body || {};

		const title = body.title?.trim() || '';
		if (title.trim().length < 2) {
			return res.status(400).json({ errors: { name: 'Invalid task name !' } });
		}
		const activeTeam = getActiveTeamIdCookie({ req, res });

		await createTaskRequest({
			bearer_token: access_token,
			data: {
				description: '',
				status: 'open',
				members: user?.employee?.id ? [{ id: user.employee.id }] : [],
				teams: [
					{
						id: activeTeam
					}
				],
				tags: [],
				organizationId,
				tenantId,
				projectId,
				estimate: 0,
				...body,
				title // this must be called after ...body
			}
		});
	}

	const { data: tasks } = await getTeamTasksRequest({
		tenantId,
		organizationId,
		projectId,
		bearer_token: access_token
	});

	$res.status(200).json(tasks);
}
