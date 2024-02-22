import { INextParams } from '@app/interfaces';
import { authenticatedGuard } from '@app/services/server/guards/authenticated-guard-app';
import { deleteIssueTypesRequest, editIssueTypesRequest } from '@app/services/server/requests';
import { NextResponse } from 'next/server';

export async function PUT(req: Request, { params }: INextParams) {
	const res = new NextResponse();
	if (!params.id) {
		return;
	}

	const { $res, user, access_token, tenantId } = await authenticatedGuard(req, res);

	if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

	const body = await req.json();

	const response = await editIssueTypesRequest({
		id: params.id,
		datas: body,
		bearer_token: access_token,
		tenantId
	});

	return $res(response.data);
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
	const res = new NextResponse();
	const { $res, user, access_token, tenantId } = await authenticatedGuard(req, res);

	if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

	const { id } = params;

	const response = await deleteIssueTypesRequest({
		id,
		bearer_token: access_token,
		tenantId
	});

	return $res(response.data);
}
