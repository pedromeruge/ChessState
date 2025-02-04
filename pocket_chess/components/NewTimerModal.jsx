import { useState, forwardRef, useImperativeHandle } from 'react';
import { SafeAreaView, View, Text, StyleSheet, TouchableOpacity, Modal, Image, Pressable, TextInput } from 'react-native'
import * as Constants from '../constants/index.js';
import IconComponent from './common/IconComponent.jsx';
import ActionButton from './common/ActionButton.jsx';

// based on https://www.youtube.com/watch?v=GrLCS5ww030

const NewTimerModal = forwardRef(({}, ref) => { // expose the ref to the parent component
    const [visible, setVisible] = useState(false);

    const showModal = () => setVisible(true);
    const hideModal = () => setVisible(false);
    
    useImperativeHandle(ref, () => ({ // expose functions to the parent component
        showModal,
        hideModal
    }));

    const onStartTimer = () => {
        console.log("Timer started");
    }

    const onMoreOptions = () => {
        console.log("More options");
    }

    return (
        <Modal
            visible={visible}
            onRequestClose={hideModal}
            animationType="slide"
            transparent
        >
            <View style={styles.container}>
                <Pressable style={styles.overlay} onPress={hideModal}/>
                <SafeAreaView style={[styles.modal, Constants.SHADOWS.medium]}>
                    <View style={styles.modalHeader}>
                        <View style={styles.modalHeaderLeft}>
                            <IconComponent source={Constants.icons.clock_lines} width={20} tintColor={Constants.COLORS.black}/>
                            <Text style={styles.modalHeaderText}>New timer</Text>
                        </View>
                        <TouchableOpacity style={styles.modalHeaderRight} onPress={hideModal}>
                            <IconComponent source={Constants.icons.cross} width={14} tintColor={Constants.COLORS.black}/>
                        </TouchableOpacity>
                    </View>
                    <View style={styles.bannerWrapper}>
                        <Image source={Constants.images.banner1} resizeMode="contain" style={styles.banner}/>
                    </View>
                    <View style={styles.counter}>
                        <View style={styles.numberInputs}>
                            <View style={styles.time}>
                                <View style={styles.timeTitle}>
                                    <IconComponent source={Constants.icons.clock_full} width={15} />
                                    <Text style={styles.timeTitleText}>Base time</Text>
                                </View>
                                <TouchableOpacity >
                                    <TextInput placeholder="00:00:00" style={styles.timeInput}/>
                                </TouchableOpacity>
                            </View>
                            <View style={styles.time}>
                                <View style={styles.timeTitle}>
                                    <IconComponent source={Constants.icons.plus_thick} width={12} tintColor={Constants.COLORS.contrast_blue_light}/>
                                    <Text style={styles.timeTitleText}>Increment</Text>
                                </View>
                                <TouchableOpacity >
                                    <TextInput placeholder="00:00" style={styles.timeInput}/>
                                </TouchableOpacity>
                            </View>
                        </View>
                        <View style={styles.title}>
                            <Text style={styles.titleText}>Title:</Text>
                            <TextInput style={styles.titleInput} placeholder="New timer"/>
                        </View>
                        <ActionButton source={Constants.icons.hourglass} text="Start" size={45} iconSize={22} onPress={() => onStartTimer()} fontSize={Constants.SIZES.xxLarge}componentStyle={styles.startButton}/>
                        <TouchableOpacity style={styles.moreOptionsButton} onPress={() => onMoreOptions()}>
                            <Text style={styles.moreOptionsButtonText}>Advanced options</Text>
                        </TouchableOpacity>
                    </View>
                </SafeAreaView>
            </View>
        </Modal>
    )
});

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1,
        width: '100%',
        height: '100%'
    },
    overlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0, 0, 0, 0.4)',
    },

    modal: {
        backgroundColor: Constants.COLORS.white,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'column',
        maxWidth: '80%',
        maxHeight: '90%',
    },

    modalHeader: {
        width: '100%',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 10,
        minHeight: 40,
    },
    modalHeaderLeft: {
        flexDirection: 'row',
        justifyContent: 'flex-start',
        alignItems: 'center',
    },
    modalHeaderText: {
        fontFamily: Constants.FONTS.BASE_FONT_NAME,
        fontSize: Constants.SIZES.large,
        fontWeight: Constants.FONTS.bold,
        fontColor: Constants.COLORS.text_dark,
        marginLeft: 8
    },     
    modalHeaderRight: {
    },

    bannerWrapper: {
        width: '100%',
        aspectRatio: 16/9.3,
        overflow: 'hidden'
    },
    
    banner: {
        width: '100%',
        height: '100%',
        aspectRatio: 16/9.3
    },

    counter: {
        flexDirection: 'column',
        paddingHorizontal: 25,
        paddingVertical: 20,
        alignItems: 'center',
        width: '100%'
    },

    numberInputs: {
        width: '100%',
        flexDirection: 'row',
        justifyContent: 'space-between',
    },

    time: {
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'space-around',
        borderWidth: 1,
        borderColor: Constants.COLORS.line_light_grey,
        borderRadius: 10,
        paddingHorizontal: 12,
        paddingTop: 5,
        paddingBottom: 10,
        rowGap: 7
    },

    timeTitle: {
        flexDirection: 'row',
        alignItems: 'center'
    },

    timeTitleText: {
        fontFamily: Constants.FONTS.BASE_FONT_NAME,
        fontSize: Constants.SIZES.large,
        fontWeight: Constants.FONTS.medium,
        fontColor: Constants.COLORS.text_grey,
        marginLeft: 7,
        borderColor: Constants.COLORS.line_light_grey,
    },

    timeInput: {
        fontFamily: Constants.FONTS.BASE_FONT_NAME,
        fontSize: Constants.SIZES.large,
        fontWeight: Constants.FONTS.medium,
        fontColor: Constants.COLORS.text_grey,
        borderBottomWidth: 1,
        paddingBottom: 0,
        borderColor: Constants.COLORS.line_light_grey,
    },

    title: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 15,
    },
    titleText: {
        fontFamily: Constants.FONTS.BASE_FONT_NAME,
        fontSize: Constants.SIZES.large,
        fontWeight: Constants.FONTS.medium,
        fontColor: Constants.COLORS.text_grey,
    },
    titleInput: {
        flex: 1,
        fontFamily: Constants.FONTS.BASE_FONT_NAME,
        fontSize: Constants.SIZES.large,
        fontWeight: Constants.FONTS.medium,
        fontColor: Constants.COLORS.line_light_grey,
        marginLeft: 10,
        borderBottomWidth: 1,
        paddingBottom: 0,
        paddingTop: 0,
        borderColor: Constants.COLORS.line_light_grey,
    },
    startButton: {
        marginTop: 30
    },

    moreOptionsButton: {
        marginTop: 12
    },

    moreOptionsButtonText: {
        fontFamily: Constants.FONTS.BASE_FONT_NAME,
        fontSize: Constants.SIZES.medium,
        fontWeight: Constants.FONTS.regular,
        color: Constants.COLORS.contrast_blue_light,
    }
});

export default NewTimerModal;