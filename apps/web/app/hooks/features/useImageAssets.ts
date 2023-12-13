import { getAccessTokenCookie } from '@app/helpers';
import { useCallback, useState } from 'react';
import axios, { AxiosResponse } from 'axios';
import { GAUZY_API_BASE_SERVER_URL } from '@app/constants';

export function useImageAssets() {
	const [loading, setLoading] = useState(false);

	const createImageAssets = useCallback(
		async (file: File, folder: string, tenantId: string, organizationId: string) => {
			const bearer_token = getAccessTokenCookie();
			const formData = new FormData();
			formData.append('file', file);
			formData.append('tenantId', tenantId);
			formData.append('organizationId', organizationId);
			setLoading(true);

			return axios
				.post(GAUZY_API_BASE_SERVER_URL.value + `/api/image-assets/upload/${folder}`, formData, {
					headers: {
						'tenant-id': tenantId,
						authorization: `Bearer ${bearer_token}`
					}
				})
				.then(async (res: AxiosResponse) => {
					return res.data;
				})
				.catch((e) => {
					console.log(e);
				})
				.finally(() => {
					setLoading(false);
				});
		},
		[]
	);

	return {
		loading,
		createImageAssets
	};
}
