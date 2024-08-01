'use client';

import { useCollaborative, useQuery } from '@app/hooks';
import { getMeetJwtAuthTokenAPI } from '@app/services/client/api';
import { withAuthentication } from 'lib/app/authenticator';
import { BackdropLoader, Meta } from 'lib/components';
import dynamic from 'next/dynamic';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useMemo, useRef, useState } from 'react';

const Meet = dynamic(() => import('lib/features/integrations/meet'), {
	ssr: false,
	loading: () => <BackdropLoader show />
});

function useMeetJwtToken() {
	const [token, setToken] = useState<string>();
	const { queryCall, loading } = useQuery(getMeetJwtAuthTokenAPI);

	useEffect(() => {
		queryCall().then((res) => setToken(res.data.token));
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	return { loading, token };
}

function MeetPage() {
	const router = useRouter();
	const pathname = usePathname();
	const { token } = useMeetJwtToken();
	const { randomMeetName } = useCollaborative();
	const replaced = useRef(false);

	const room = useMemo(() => {
		if (!pathname) {
			return false;
		}

		const urlParams = pathname.substring(pathname.indexOf('?'));
		const searchParams = new URLSearchParams(urlParams);

		return searchParams.get('room');
	}, [pathname]);

	useEffect(() => {
		if (!room && pathname?.startsWith('/meet/jitsi') && !replaced.current) {
			const url = new URL(window.location.href);
			url.searchParams.set('room', btoa(randomMeetName()));

			router.replace(url.pathname + url.search);
			replaced.current = true;
		}
	}, [room, router, randomMeetName, pathname]);

	const roomName = useMemo(() => {
		return room ? atob(room) : undefined;
	}, [room]);

	return (
		<>
			<Meta title="Meet" />
			{token && roomName && <Meet jwt={token} roomName={encodeURIComponent(roomName)} />}
		</>
	);
}

export default withAuthentication(MeetPage, {
	displayName: 'MeetPage',
	showPageSkeleton: false
});
