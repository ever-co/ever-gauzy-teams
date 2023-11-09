import { IIntegrationTenant, PaginationResponse, CreateResponse, DeleteResponse } from '@app/interfaces';
import api from '../../axios';

export function getIntegrationTenantAPI(name: string) {
	return api.get<CreateResponse<PaginationResponse<IIntegrationTenant>>>(
		`/integration-tenant/remember/state?name=${name}`
	);
}

export function deleteIntegrationTenantAPI(integrationId: string) {
	return api.delete<DeleteResponse>(`/integration-tenant/${integrationId}`);
}
