import { IRequestToJoinCreate, IValidateRequestToJoin } from '@app/interfaces';
import {
	requestToJoinAPI,
	validateRequestToJoinAPI,
	resendCodeRequestToJoinAPI,
} from '@app/services/client/api';
import { useCallback } from 'react';

import { useQuery } from '../useQuery';

export const useRequestToJoinTeam = () => {
	const { loading: requestToJoinLoading, queryCall: requestToJoinQueryCall } =
		useQuery(requestToJoinAPI);
	const {
		loading: validateRequestToJoinLoading,
		queryCall: validateRequestToJoinQueryCall,
	} = useQuery(validateRequestToJoinAPI);
	const {
		loading: resendCodeRequestToJoinLoading,
		queryCall: resendCodeRequestToJoinQueryCall,
	} = useQuery(resendCodeRequestToJoinAPI);

	const requestToJoinTeam = useCallback(
		(data: IRequestToJoinCreate) => {
			return requestToJoinQueryCall(data).then((res) => {
				return res.data;
			});
		},
		[requestToJoinQueryCall]
	);
	const validateRequestToJoinTeam = useCallback(
		(data: IValidateRequestToJoin) => {
			return validateRequestToJoinQueryCall(data).then((res) => {
				return res.data;
			});
		},
		[validateRequestToJoinQueryCall]
	);
	const resendCodeRequestToJoinTeam = useCallback(
		(data: IRequestToJoinCreate) => {
			return resendCodeRequestToJoinQueryCall(data).then((res) => {
				return res.data;
			});
		},
		[resendCodeRequestToJoinQueryCall]
	);

	return {
		requestToJoinLoading,
		requestToJoinQueryCall,
		validateRequestToJoinLoading,
		validateRequestToJoinQueryCall,
		resendCodeRequestToJoinLoading,
		resendCodeRequestToJoinQueryCall,
		requestToJoinTeam,
		validateRequestToJoinTeam,
		resendCodeRequestToJoinTeam,
	};
};
