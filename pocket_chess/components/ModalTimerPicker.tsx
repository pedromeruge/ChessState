import { useState, useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
import { SafeAreaView, View, StyleSheet, Modal, Pressable} from 'react-native'
import {Time} from '../classes/timers_base/Preset.js';
import * as Constants from '../constants/index.js';
import NewTimerScreenPicker from './NewTimerScreenPicker';

interface ModalTimerPickerRef {
    showModal: () => void;
    hideModal: () => void;
    getTime: () => Time;
}

interface ModalTimerPickerProps {
    time: Time;
    setTime: (time: Time) => void;
    hideHours?: boolean;
    fullScreen?: boolean;
    headerText?: string;
    headerLeftIcon?: any;
    headerRightIcon?: any;
}

const ModalTimerPicker = forwardRef<ModalTimerPickerRef, ModalTimerPickerProps>(
    ({time, setTime, hideHours=false, fullScreen=true, headerText="", headerLeftIcon=null, headerRightIcon=null}, ref) => { // expose the ref to the parent component

    //state of modal
    const [visible, setVisible] = useState(false); // state to show/hide the modal

    // refs for the time picker roulettes for base time and increment
    const timePickerRef = useRef(null);
    
    const showModal = () => {
        setVisible(true);
    }

    const hideModal = () => {
        setVisible(false);
    }

    const getTime = () => {
        return time;
    }
    
    useImperativeHandle(ref, () => ({ // expose functions to the parent component
        showModal,
        hideModal,
        getTime
    }));

    return (
        <Modal
            visible={visible}
            onRequestClose={hideModal}
            animationType="fade"
            transparent
        >
            <View style={styles.container}>
                <Pressable style={styles.overlay} onPress={hideModal} />
                    <NewTimerScreenPicker 
                        ref={timePickerRef} 
                        hideHours={hideHours}
                        onConfirm={hideModal} 
                        onBack={hideModal}
                        time={time}
                        setTime={setTime}
                        fullScreen={fullScreen}
                        headerText={headerText}
                        headerLeftIcon={headerLeftIcon}
                        headerRightIcon={headerRightIcon}
                    />
            </View>
        </Modal>
    )
});

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 10,
        width: '100%',
        height: '100%'

    },
    overlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0, 0, 0, 0.4)',
    },
});

export default ModalTimerPicker;
export type { ModalTimerPickerRef };