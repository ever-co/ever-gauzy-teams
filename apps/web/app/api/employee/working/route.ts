import { authenticatedGuard } from '@app/services/server/guards/authenticated-guard-app';
import { getOrganizationEmployees } from '@app/services/server/requests';
import { NextResponse } from 'next/server';

export async function GET(req: Request) {
	const res = new NextResponse();
	const { $res, user, access_token, tenantId, organizationId } = await authenticatedGuard(req, res);

	if (!user) {
		return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
	}

	const { data } = await getOrganizationEmployees(access_token, tenantId, organizationId);

	return $res(data);
}
