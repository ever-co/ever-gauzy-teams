'use client';

import {
	getActiveTeamIdCookie,
	setActiveProjectIdCookie,
	setActiveTeamIdCookie,
	setOrganizationIdCookie
} from '@app/helpers/cookies';
import { IOrganizationTeamList, IOrganizationTeamUpdate, IOrganizationTeamWithMStatus } from '@app/interfaces';
import {
	createOrganizationTeamAPI,
	deleteOrganizationTeamAPI,
	editOrganizationTeamAPI,
	getOrganizationTeamAPI,
	getOrganizationTeamsAPI,
	removeUserFromAllTeamAPI,
	updateOrganizationTeamAPI
} from '@app/services/client/api';
import {
	activeTeamIdState,
	activeTeamManagersState,
	activeTeamState,
	isTeamMemberJustDeletedState,
	isTeamMemberState,
	organizationTeamsState,
	teamsFetchingState,
	timerStatusState
} from '@app/stores';
import { useCallback, useEffect } from 'react';
import { useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil';
import isEqual from 'lodash/isEqual';
import { useFirstLoad } from '../useFirstLoad';
import { useQuery } from '../useQuery';
import { useSyncRef } from '../useSyncRef';
import { useAuthenticateUser } from './useAuthenticateUser';

/**
 * It updates the `teams` state with the `members` status from the `team` status API
 * @returns An object with three properties:
 * teams: The current value of the teams state.
 * setTeams: A function that can be used to update the teams state.
 * setTeamUpdate: A function that can be used to update the teams state.
 */
function useTeamsState() {
	const [teams, setTeams] = useRecoilState(organizationTeamsState);
	const teamsRef = useSyncRef(teams);

	const setTeamsUpdate = useCallback(
		(team: IOrganizationTeamWithMStatus) => {
			// Update active teams fields with from team Status API
			setTeams((tms) => {
				return [...tms.filter((t) => t.id != team.id), team];
			});
		},
		[setTeams]
	);

	return {
		teams,
		setTeams,
		setTeamsUpdate,
		teamsRef
	};
}

/**
 * It creates a new team for the current organization
 * @returns An object with two properties:
 * 1. createOrganizationTeam: A function that takes a string as an argument and returns a promise.
 * 2. loading: A boolean value.
 */
function useCreateOrganizationTeam() {
	const { loading, queryCall } = useQuery(createOrganizationTeamAPI);
	const [teams, setTeams] = useRecoilState(organizationTeamsState);
	const teamsRef = useSyncRef(teams);
	const setActiveTeamId = useSetRecoilState(activeTeamIdState);
	const { refreshToken, $user } = useAuthenticateUser();
	const [isTeamMember, setIsTeamMember] = useRecoilState(isTeamMemberState);

	const createOrganizationTeam = useCallback(
		(name: string) => {
			const teams = teamsRef.current;
			const $name = name.trim();
			const exits = teams.find((t) => t.name.toLowerCase() === $name.toLowerCase());

			if (exits || $name.length < 2 || !$user.current) {
				return Promise.reject(new Error('Invalid team name !'));
			}

			return queryCall($name, $user.current).then(async (res) => {
				const dt = res.data?.items || [];
				setTeams(dt);
				const created = dt.find((t) => t.name === $name);
				if (created) {
					setActiveTeamIdCookie(created.id);
					setOrganizationIdCookie(created.organizationId);
					// This must be called at the end (Update store)
					setActiveTeamId(created.id);
					if (!isTeamMember) {
						setIsTeamMember(true);
					}

					/**
					 * DO NOT REMOVE
					 * Refresh Token needed for the first time when new Organization is created, As in backend permissions are getting updated
					 * */
					await refreshToken();
				}
				return res;
			});
		},
		// eslint-disable-next-line react-hooks/exhaustive-deps
		[isTeamMember, queryCall, refreshToken, setActiveTeamId, setIsTeamMember, setTeams, teamsRef]
	);

	return {
		createOrganizationTeam,
		loading
	};
}

/**
 * It takes a team and an optional data object and updates the team with the data
 */
function useUpdateOrganizationTeam() {
	const { loading, queryCall } = useQuery(updateOrganizationTeamAPI);
	const { setTeamsUpdate } = useTeamsState();

	const updateOrganizationTeam = useCallback(
		(team: IOrganizationTeamList, data: Partial<IOrganizationTeamUpdate> = {}) => {
			const members = team.members;

			const body: Partial<IOrganizationTeamUpdate> = {
				id: team.id,
				memberIds: members
					.map((t) => t.employee.id)
					.filter((value, index, array) => array.indexOf(value) === index), // To make the array Unique list of ids
				managerIds: members
					.filter((m) => m.role && m.role.name === 'MANAGER')
					.map((t) => t.employee.id)
					.filter((value, index, array) => array.indexOf(value) === index), // To make the array Unique list of ids
				name: team.name,
				tenantId: team.tenantId,
				organizationId: team.organizationId,
				tags: [],
				...data
			};

			/* Updating the team state with the data from the API. */
			queryCall(team.id, body).then((res) => {
				setTeamsUpdate(res.data);
			});
		},
		[queryCall, setTeamsUpdate]
	);

	return { updateOrganizationTeam, loading };
}

/**
 * It returns an object with all the data and functions needed to manage the teams in the organization
 */
export function useOrganizationTeams() {
	const { loading, queryCall, loadingRef } = useQuery(getOrganizationTeamsAPI);
	const {
		loading: loadingTeam,
		queryCall: queryCallTeam,
		loadingRef: loadingRefTeam
	} = useQuery(getOrganizationTeamAPI);
	const { teams, setTeams, setTeamsUpdate, teamsRef } = useTeamsState();
	const activeTeam = useRecoilValue(activeTeamState);

	const activeTeamManagers = useRecoilValue(activeTeamManagersState);

	const loadingTeamsRef = useSyncRef(loading);

	const [activeTeamId, setActiveTeamId] = useRecoilState(activeTeamIdState);
	const [teamsFetching, setTeamsFetching] = useRecoilState(teamsFetchingState);
	const [isTeamMemberJustDeleted, setIsTeamMemberJustDeleted] = useRecoilState(isTeamMemberJustDeletedState);
	// const [isTeamJustDeleted, setIsTeamJustDeleted] = useRecoilState(isTeamJustDeletedState);
	const { firstLoad, firstLoadData: firstLoadTeamsData } = useFirstLoad();
	const [isTeamMember, setIsTeamMember] = useRecoilState(isTeamMemberState);
	const { updateUserFromAPI, refreshToken, user } = useAuthenticateUser();
	const timerStatus = useRecoilValue(timerStatusState);

	// const setMemberActiveTaskId = useSetRecoilState(memberActiveTaskIdState);

	const currentUser = activeTeam?.members?.find((member) => member.employee.userId === user?.id);

	const memberActiveTaskId =
		(timerStatus?.running && timerStatus?.lastLog?.taskId) || currentUser?.activeTaskId || null;

	const isTrackingEnabled = activeTeam?.members?.find(
		(member) => member.employee.userId === user?.id && member.isTrackingEnabled
	)
		? true
		: false;

	// useEffect(() => {
	// 	setMemberActiveTaskId(memberActiveTaskId);
	// }, [setMemberActiveTaskId, memberActiveTaskId]);

	// Updaters
	const { createOrganizationTeam, loading: createOTeamLoading } = useCreateOrganizationTeam();

	const { updateOrganizationTeam, loading: updateOTeamLoading } = useUpdateOrganizationTeam();

	const { loading: editOrganizationTeamLoading, queryCall: editQueryCall } = useQuery(editOrganizationTeamAPI);

	const { loading: deleteOrganizationTeamLoading, queryCall: deleteQueryCall } = useQuery(deleteOrganizationTeamAPI);

	const { loading: removeUserFromAllTeamLoading, queryCall: removeUserFromAllTeamQueryCall } =
		useQuery(removeUserFromAllTeamAPI);

	useEffect(() => {
		setTeamsFetching(loading);
	}, [loading, setTeamsFetching]);

	const setActiveTeam = useCallback(
		(team: (typeof teams)[0]) => {
			setActiveTeamIdCookie(team?.id);
			setOrganizationIdCookie(team?.organizationId);
			// This must be called at the end (Update store)
			setActiveTeamId(team?.id);

			// Set Project Id to cookie
			// TODO: Make it dynamic when we add Dropdown in Navbar
			if (team && team?.projects && team.projects.length) {
				setActiveProjectIdCookie(team.projects[0].id);
			}
		},
		[setActiveTeamId]
	);

	const loadTeamsData = useCallback(() => {
		if (
			loadingRef.current ||
			loadingRefTeam.current ||
			!user?.employee.organizationId ||
			!user?.employee.tenantId
		) {
			return;
		}

		let teamId = getActiveTeamIdCookie();
		setActiveTeamId(teamId);

		return queryCall(user?.employee.organizationId, user?.employee.tenantId).then((res) => {
			if (res.data?.items && res.data?.items?.length === 0) {
				setIsTeamMember(false);
				setIsTeamMemberJustDeleted(true);
			}
			const latestTeams = res.data?.items || [];

			const latestTeamsSorted = latestTeams.slice().sort((a: any, b: any) => a.name.localeCompare(b.name));

			const teamsRefSorted = teamsRef.current.slice().sort((a, b) => a.name.localeCompare(b.name));

			/**
			 * Check deep equality,
			 * No need to update state if all the Team details are same
			 * (It prevents unnecessary re-rendering)
			 *
			 * Use teamsRef to make we always get the lastest value
			 */
			if (!teamId && !isEqual(latestTeamsSorted, teamsRefSorted)) {
				setTeams(latestTeams);
			}

			// Handle case where user might Remove Account from all teams,
			// In such case need to update active team with Latest list of Teams
			if (!latestTeams.find((team: any) => team.id === teamId) && latestTeams.length) {
				setIsTeamMemberJustDeleted(true);
				setActiveTeam(latestTeams[0]);
			} else if (!latestTeams.length) {
				teamId = '';
			}

			teamId &&
				user?.employee.organizationId &&
				user?.employee.tenantId &&
				queryCallTeam(teamId, user?.employee.organizationId, user?.employee.tenantId).then((res) => {
					const newTeam = res.data;

					/**
					 * Check deep equality,
					 * No need to update state if all the Team details are same
					 * (It prevents unnecessary re-rendering)
					 */
					if (!isEqual(latestTeamsSorted, teamsRefSorted)) {
						setTeams([newTeam, ...latestTeams.filter((team: any) => team.id !== newTeam.id)]);

						// Set Project Id to cookie
						// TODO: Make it dynamic when we add Dropdown in Navbar
						if (newTeam && newTeam.projects && newTeam.projects.length) {
							setActiveProjectIdCookie(newTeam.projects[0].id);
						}
					}
				});

			return res;
		});
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [queryCall, queryCallTeam, setActiveTeam, setActiveTeamId, setIsTeamMember, setTeams]);

	/**
	 * Get active team profile from api
	 */
	useEffect(() => {
		if (activeTeamId && firstLoad && user?.employee.organizationId && user?.employee.tenantId) {
			getOrganizationTeamAPI(activeTeamId, user?.employee.organizationId, user?.employee.tenantId).then((res) => {
				!loadingTeamsRef.current && setTeamsUpdate(res.data);
			});
		}
	}, [
		activeTeamId,
		firstLoad,
		loadingTeamsRef,
		setTeams,
		setTeamsUpdate,
		user?.employee?.organizationId,
		user?.employee?.tenantId
	]);

	const editOrganizationTeam = useCallback(
		(data: IOrganizationTeamUpdate) => {
			return editQueryCall(data).then((res) => {
				setTeamsUpdate(res.data);
				return res;
			});
		},
		[editQueryCall, setTeamsUpdate]
	);

	const deleteOrganizationTeam = useCallback(
		(id: string) => {
			return deleteQueryCall(id).then((res) => {
				loadTeamsData();
				return res;
			});
		},
		[deleteQueryCall, loadTeamsData]
	);

	const removeUserFromAllTeam = useCallback(
		(userId: string) => {
			return removeUserFromAllTeamQueryCall(userId).then((res) => {
				loadTeamsData();
				refreshToken().then(() => {
					updateUserFromAPI();
				});

				return res;
			});
		},
		[loadTeamsData, removeUserFromAllTeamQueryCall, refreshToken, updateUserFromAPI]
	);

	useEffect(() => {
		if (activeTeam?.projects && activeTeam?.projects?.length) {
			setActiveProjectIdCookie(activeTeam?.projects[0]?.id);
		}
	}, [activeTeam]);

	return {
		loadTeamsData,
		loading,
		teams,
		teamsFetching,
		activeTeam,
		setActiveTeam,
		createOrganizationTeam,
		createOTeamLoading,
		firstLoadTeamsData,
		editOrganizationTeam,
		editOrganizationTeamLoading,
		deleteOrganizationTeam,
		deleteOrganizationTeamLoading,
		activeTeamManagers,
		updateOrganizationTeam,
		updateOTeamLoading,
		setTeams,
		isTeamMember,
		removeUserFromAllTeamLoading,
		removeUserFromAllTeamQueryCall,
		removeUserFromAllTeam,
		loadingTeam,
		isTrackingEnabled,
		memberActiveTaskId,
		isTeamMemberJustDeleted,
		setIsTeamMemberJustDeleted
	};
}
