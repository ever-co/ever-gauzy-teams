import { useAuthenticateUser } from './useAuthenticateUser';
import { useAtom } from 'jotai';
import { timesheetRapportState } from '@/app/stores/time-logs';
import { useQuery } from '../useQuery';
import { useCallback, useEffect } from 'react';
import { getTaskTimesheetLogsApi } from '@/app/services/client/api/timer/timer-log';
import moment from 'moment';

interface TimesheetParams {
    startDate: Date | string;
    endDate: Date | string;
}

export function useTimesheet({
    startDate,
    endDate,
}: TimesheetParams) {
    const { user } = useAuthenticateUser();
    const [timesheet, setTimesheet] = useAtom(timesheetRapportState);

    const { loading: loadingTimesheet, queryCall: queryTimesheet } = useQuery(getTaskTimesheetLogsApi);

    const getTaskTimesheet = useCallback(
        ({ startDate, endDate }: TimesheetParams) => {
            if (!user) return;
            const from = moment(startDate).format('YYYY-MM-DD');
            const to = moment(endDate).format('YYYY-MM-DD')
            queryTimesheet({
                startDate: from,
                endDate: to,
                organizationId: user.employee?.organizationId,
                tenantId: user.tenantId ?? '',
                timeZone: user.timeZone?.split('(')[0].trim(),
            }).then((response) => {
                setTimesheet(response.data);
            }).catch((error) => {
                console.error('Error fetching timesheet:', error);
            });
        },
        [user, queryTimesheet, setTimesheet]
    );
    useEffect(() => {
        getTaskTimesheet({ startDate, endDate });
    }, [getTaskTimesheet, startDate, endDate]);
    return {
        loadingTimesheet,
        timesheet,
        getTaskTimesheet,
    };
}
