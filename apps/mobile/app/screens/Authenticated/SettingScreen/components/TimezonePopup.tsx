import React, { FC, useEffect, useState } from "react"
import moment from "moment-timezone"
import { View, Text, ViewStyle, Modal, StyleSheet, Animated, Dimensions, TouchableWithoutFeedback, Pressable, FlatList } from "react-native"
import { AntDesign, FontAwesome } from "@expo/vector-icons"

// COMPONENTS

import { typography } from "../../../../theme"
import { translate } from "../../../../i18n";
import { useAppTheme } from "../../../../app";


export interface Props {
    visible: boolean
    onDismiss: () => unknown;
    onTimezoneSelect: (s: string) => unknown
}

export interface IFilter {

}

const { width, height } = Dimensions.get("window");
const ModalPopUp = ({ visible, children, onDismiss }) => {
    const [showModal, setShowModal] = React.useState(visible)
    const scaleValue = React.useRef(new Animated.Value(0)).current

    React.useEffect(() => {
        toggleModal()
    }, [visible])
    const toggleModal = () => {
        if (visible) {
            setShowModal(true)
            Animated.spring(scaleValue, {
                toValue: 1,
                useNativeDriver: true,
            }).start()
        } else {
            setTimeout(() => setShowModal(false), 200)
            Animated.timing(scaleValue, {
                toValue: 0,
                duration: 300,
                useNativeDriver: true,
            }).start()
        }
    }
    return (
        <Modal animationType="fade" transparent visible={showModal}>
            <TouchableWithoutFeedback onPress={() => onDismiss()}>
                <View style={$modalBackGround}>
                    <Animated.View style={[{ transform: [{ scale: scaleValue }] }]}>
                        {children}
                    </Animated.View>
                </View>
            </TouchableWithoutFeedback>
        </Modal>
    )
}

const TimezonePopup: FC<Props> = function FilterPopup({ visible, onDismiss, onTimezoneSelect}) {
    const { colors, dark } = useAppTheme()
    const [timezones, setTimezones] = useState([])
    const [selectedTimezone, setSelectedTimezone] = useState("");

    useEffect(() => {
        setTimezones(moment.tz.names)
    }, [])

    const handleTimezoneSelect=(item:string) => {
        onTimezoneSelect(item)
        onDismiss();
    }

    return (
        <ModalPopUp visible={visible} onDismiss={onDismiss}>
            <TouchableWithoutFeedback onPress={() => { }}>
                <View style={[styles.mainContainer, { backgroundColor: colors.background }]}>
                    <Text style={{ ...styles.mainTitle, color: colors.primary }}>{translate("settingScreen.changeTimezone.selectTimezoneTitle")}</Text>
                    <FlatList
                        style={styles.listContainer}
                        bounces={false}
                        data={timezones}
                        keyExtractor={(item, index) => item.toString()}
                        initialNumToRender={7}
                        renderItem={({ item }) => (
                            <Pressable style={{ ...styles.item, borderColor: colors.border }} onPress={() => handleTimezoneSelect(item)}>
                                <Text style={{ ...styles.tzTitle, color: colors.primary }}>{item}</Text>
                                {selectedTimezone === item ?
                                    <AntDesign name="checkcircle" color={"#27AE60"} size={24} />
                                    :
                                    <FontAwesome name="circle-thin" size={24} olor={dark ? "":"(40, 32, 72, 0.43)"} />
                                }
                            </Pressable>
                        )}
                    />
                </View>
            </TouchableWithoutFeedback>
        </ModalPopUp>
    )
}

export default TimezonePopup;

const $modalBackGround: ViewStyle = {
    flex: 1,
    backgroundColor: "#000000AA",
    justifyContent: "center",
}


const styles = StyleSheet.create({
    mainContainer: {
        width: "90%",
        height: height / 2,
        alignSelf: "center",
        shadowColor: "#1B005D0D",
        shadowOffset: { width: 10, height: 10 },
        shadowRadius: 10,
        borderTopRightRadius: 24,
        borderRadius: 24,
        paddingVertical: 16,
        backgroundColor: "yellow",
        borderColor: "#1B005D0D",
        borderWidth: 2,
        zIndex: 1000
    },
    mainTitle: {
        fontFamily: typography.primary.semiBold,
        fontSize: 24,
        marginBottom: 10,
        paddingHorizontal: 20
    },
    buttonText: {
        fontFamily: typography.primary.semiBold,
        fontSize: 18,
        color: "#FFF"
    },
    wrapForm: {
        width: "100%",
        marginTop: 16,
        zIndex: 100
    },
    statusContainer: {
        paddingHorizontal: 16,
        paddingVertical: 10,
        width: 156,
        height: 57,
        zIndex: 1000
    },
    item: {
        width: "100%",
        borderWidth: 1,
        flexDirection: "row",
        borderColor: "rgba(0,0,0,0.13)",
        height: 42,
        borderRadius: 10,
        marginBottom: 10,
        paddingHorizontal: 16,
        alignItems: "center",
        justifyContent: "space-between"
    },
    tzTitle: {
        fontSize: 14,
        fontFamily: typography.primary.semiBold
    },
    listContainer: {
        width: "100%",
        marginVertical: 16,
        paddingHorizontal: 20
    }
})

const $blurContainer: ViewStyle = {
    height: height,
    width: "100%",
    position: "absolute",
    top: 0,
    zIndex: 100
}