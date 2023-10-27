/* eslint-disable react-native/no-inline-styles */
/* eslint-disable react-native/no-color-literals */
import { View, TextInput, StyleSheet, TouchableOpacity } from "react-native"
import React, { SetStateAction, useCallback, useEffect, useState } from "react"
import { useStores } from "../../../models"
import { useAppTheme } from "../../../theme"
import { SvgXml } from "react-native-svg"
import * as Clipboard from "expo-clipboard"
import { closeIconLight, copyIcon, editIcon, tickIconLight } from "../../svgs/icons"
import { useTeamTasks } from "../../../services/hooks/features/useTeamTasks"
import { showMessage } from "react-native-flash-message"
import { translate } from "../../../i18n"

const TaskTitleBlock = () => {
	const {
		TaskStore: { detailedTask: task },
	} = useStores()

	const { dark, colors } = useAppTheme()

	const [title, setTitle] = useState<string>("")
	const [edit, setEdit] = useState<boolean>(false)

	const { updateTitle } = useTeamTasks()

	const saveTitle = useCallback((newTitle: string) => {
		if (newTitle.length > 255) {
			showMessage({
				message: translate("taskDetailsScreen.characterLimitErrorTitle"),
				description: translate("taskDetailsScreen.characterLimitErrorDescription"),
				type: "danger",
			})
			return
		}
		updateTitle(newTitle, task, true)
		setEdit(false)
	}, [])

	useEffect(() => {
		if (!edit) {
			task && setTitle(task?.title)
		}
	}, [task?.title, edit])

	const copyTitle = () => {
		Clipboard.setStringAsync(title)
		showMessage({
			message: translate("taskDetailsScreen.copyTitle"),
			type: "info",
			backgroundColor: colors.secondary,
		})
	}

	return (
		<View>
			<View style={{ flexDirection: "row", gap: 5 }}>
				<TextInput
					multiline
					editable={edit}
					style={[
						styles.textInput,
						{
							color: colors.primary,
							borderColor: edit ? (dark ? "#464242" : "#e5e7eb") : "transparent",
						},
					]}
					onChangeText={(text) => setTitle(text)}
					value={title}
				/>
				<TitleIcons
					dark={dark}
					edit={edit}
					setEdit={setEdit}
					copyTitle={copyTitle}
					saveTitle={() => saveTitle(title)}
				/>
			</View>
		</View>
	)
}

export default TaskTitleBlock

interface ITitleIcons {
	dark: boolean
	edit: boolean
	setEdit: React.Dispatch<SetStateAction<boolean>>
	copyTitle: () => void
	saveTitle: () => void
}

const TitleIcons: React.FC<ITitleIcons> = ({ dark, edit, setEdit, copyTitle, saveTitle }) => {
	return (
		<>
			{edit ? (
				<View style={{ gap: 5 }}>
					<TouchableOpacity
						onPress={saveTitle}
						style={[
							styles.saveCancelButtons,
							{
								borderColor: dark ? "#464242" : "#e5e7eb",
							},
						]}
					>
						<SvgXml xml={tickIconLight} />
					</TouchableOpacity>
					<TouchableOpacity
						onPress={() => setEdit(false)}
						style={[
							styles.saveCancelButtons,
							{
								borderColor: dark ? "#464242" : "#e5e7eb",
							},
						]}
					>
						<SvgXml xml={closeIconLight} />
					</TouchableOpacity>
				</View>
			) : (
				<View style={{ alignItems: "center", justifyContent: "center" }}>
					<TouchableOpacity onPress={() => setEdit(true)} style={styles.editButton}>
						<SvgXml xml={editIcon} />
					</TouchableOpacity>
					<TouchableOpacity onPress={copyTitle} style={styles.copyButton}>
						<SvgXml xml={copyIcon} />
					</TouchableOpacity>
				</View>
			)}
		</>
	)
}

const styles = StyleSheet.create({
	copyButton: {
		alignItems: "center",
		height: 30,
		justifyContent: "center",
		width: 30,
	},
	editButton: {
		alignItems: "center",
		backgroundColor: "#EDEDED",
		borderRadius: 100,
		height: 30,
		justifyContent: "center",
		padding: 5,
		width: 30,
	},
	saveCancelButtons: {
		borderRadius: 5,
		borderWidth: 1,
		padding: 3,
	},
	textInput: {
		borderRadius: 5,
		borderWidth: 1,
		flex: 1,
		fontSize: 20,
		fontWeight: "600",
		maxHeight: 150,
		textAlignVertical: "top",
	},
})
