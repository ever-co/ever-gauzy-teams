/* eslint-disable react-native/no-color-literals */
/* eslint-disable react-native/no-inline-styles */
import { Dimensions, ScrollView, Text, TextStyle, View } from "react-native"
import React, { FC, useMemo } from "react"
import { IUserProfile } from "../logics/useProfileScreenLogic"
import { ITaskFilter } from "../../../../services/hooks/features/useTaskFilters"
import ListCardItem from "./ListCardItem"
import { translate } from "../../../../i18n"
import { typography, useAppTheme } from "../../../../theme"
import { GLOBAL_STYLE as GS } from "../../../../../assets/ts/styles"
import { observer } from "mobx-react-lite"
import { useTimer } from "../../../../services/hooks/useTimer"
import WorkedOnTaskHours from "../../../../components/WorkedDayHours"
interface IUserProfileTasks {
	profile: IUserProfile
	content: ITaskFilter
}
const UserProfileTasks: FC<IUserProfileTasks> = observer(({ profile, content }) => {
	const { colors, dark } = useAppTheme()
	const { timerStatus } = useTimer()
	const tasks = useMemo(() => {
		return content.tasksFiltered
	}, [content, profile])

	return (
		<ScrollView
			style={{
				flex: 1,
				paddingHorizontal: 20,
				backgroundColor: dark ? "rgb(16,17,20)" : colors.background2,
			}}
			bounces={false}
		>
			{content.tab === "worked" &&
			profile.activeUserTeamTask &&
			(profile.member?.timerStatus === "running" ||
				(profile.isAuthUser && timerStatus?.running)) ? (
				<>
					<View
						style={{
							flexDirection: "row",
							justifyContent: "space-between",
							marginVertical: 20,
						}}
					>
						<Text style={[$textLabel, { color: colors.primary }]}>
							{translate("tasksScreen.now")}
						</Text>
						<View
							style={{
								width: width / 1.8,
								alignSelf: "center",
								borderBottomWidth: 1,
								borderBottomColor: colors.border,
							}}
						/>
						<View style={{ flexDirection: "row", alignItems: "center" }}>
							<Text
								style={{
									color: colors.primary,
									fontSize: 12,
									fontFamily: typography.secondary.medium,
								}}
							>
								{translate("tasksScreen.totalTimeLabel")}:
							</Text>
							<Text
								style={[
									$textLabel,
									{
										marginLeft: 5,
										color: colors.primary,
										fontFamily: typography.primary.semiBold,
										fontSize: 12,
									},
								]}
							></Text>
							<WorkedOnTaskHours
								memberTask={profile.activeUserTeamTask}
								containerStyle={{ alignItems: "center" }}
								totalTimeText={{ color: colors.primary, fontSize: 12 }}
							/>
						</View>
					</View>
					<ListCardItem
						task={profile.activeUserTeamTask}
						isAuthUser={profile.isAuthUser}
						isAssigned={true}
						activeAuthTask={true}
						profile={profile}
					/>
				</>
			) : null}

			{content.tab === "worked" && (
				<View>
					<View
						style={{
							flexDirection: "row",
							justifyContent: "space-between",
							marginVertical: 20,
						}}
					>
						<Text style={[$textLabel, { color: colors.primary }]}>
							{translate("tasksScreen.last24hours")} ({tasks.length})
						</Text>
						<View
							style={{
								width: width / 1.5,
								alignSelf: "center",
								top: 3,
								borderBottomWidth: 1,
								borderBottomColor: colors.border,
							}}
						/>
					</View>
					{tasks.map((task, index) => (
						<View key={index.toString()} style={{ ...GS.mb4 }}>
							<ListCardItem
								task={task}
								isAssigned={true}
								isAuthUser={profile.isAuthUser}
								activeAuthTask={false}
								profile={profile}
							/>
						</View>
					))}
				</View>
			)}

			{content.tab === "assigned" && (
				<View style={{ ...GS.mt4 }}>
					{content.tasksFiltered.map((task, index) => (
						<View key={index.toString()} style={{ ...GS.mb4 }}>
							<ListCardItem
								task={task}
								isAssigned={true}
								isAuthUser={profile.isAuthUser}
								activeAuthTask={false}
								profile={profile}
							/>
						</View>
					))}
				</View>
			)}

			{content.tab === "unassigned" && (
				<View style={{ ...GS.mt4 }}>
					{content.tasksFiltered.map((task, index) => (
						<View key={index.toString()} style={{ ...GS.mb4 }}>
							<ListCardItem
								task={task}
								isAssigned={false}
								isAuthUser={profile.isAuthUser}
								activeAuthTask={false}
								profile={profile}
							/>
						</View>
					))}
				</View>
			)}
		</ScrollView>
	)
})

export default UserProfileTasks

const { width } = Dimensions.get("window")

const $textLabel: TextStyle = {
	fontFamily: typography.primary.semiBold,
	fontSize: 12,
}
