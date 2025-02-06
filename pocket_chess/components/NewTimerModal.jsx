import { useState, useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
import { SafeAreaView, View, StyleSheet, Modal, Pressable} from 'react-native'

import * as Constants from '../constants/index.js';
import NewTimerScreenBase from './NewTimerScreenBase.jsx';
import NewTimerScreenPicker from './NewTimerScreenPicker.jsx';
import { Time } from '../classes/Timer.js';

const NewTimerModal = forwardRef(({}, ref) => { // expose the ref to the parent component

    
    const [visible, setVisible] = useState(false); // state to show/hide the modal
    const [baseTimePickerVisible, setBaseTimePickerVisible] = useState(false);
    const [incrementPickerVisible, setIncrementPickerVisible] = useState(false);

    const [modalSize, setModalSize] = useState({ width: 0, height: 0 }); // width and height of the modal, to keep consistent across modal sections
    const [baseTime, setBaseTime] = useState(new Time()); // track base time
    const [incrementTime, setIncrementTime] = useState(new Time()); // track increment time
    const [titleText, setTitleText] = useState('');

    // refs for the time picker roulettes for base time and increment
    const startScreenRef = useRef(null);
    const baseTimePickerRef = useRef(null);
    const incrementPickerRef = useRef(null);
    
    const showModal = () => {
        setVisible(true);
        startScreenRef.current?.showScreen();
        baseTimePickerRef.current?.hideScreen();
        incrementPickerRef.current?.hideScreen();
    }

    const hideModal = () => {
        setVisible(false);
        startScreenRef.current?.hideScreen();
        baseTimePickerRef.current?.hideScreen();
        incrementPickerRef.current?.hideScreen();
        setBaseTimePickerVisible(false);
        setIncrementPickerVisible(false);
    }
    
    useImperativeHandle(ref, () => ({ // expose functions to the parent component
        showModal,
        hideModal
    }));

    const showBaseTimePicker = () => {
        startScreenRef.current?.hideScreen();
        setBaseTimePickerVisible(true);
    }

    const showIncrementPicker = () => {
        setIncrementPickerVisible(true);
    }
    
    // hide base time picker or increment picker
    const hideTimePicker = () => {
        setBaseTimePickerVisible(false);
        setIncrementPickerVisible(false);
    }

    return (
        <Modal
            visible={visible}
            onRequestClose={hideModal}
            animationType="slide"
            transparent
        >
            <View style={styles.container}>
                <Pressable style={styles.overlay} onPress={hideModal} />
                {(!baseTimePickerVisible && !incrementPickerVisible) && (
                    <NewTimerScreenBase
                        ref={startScreenRef} 
                        onClose={hideModal} 
                        onShowBaseTimePicker={showBaseTimePicker} 
                        onShowIncrementPicker={showIncrementPicker} 
                        baseTime={baseTime}
                        increment={incrementTime}
                        titleText={titleText}
                        setTitleText={setTitleText}
                        onLayout={setModalSize}
                    />
                )}
                {baseTimePickerVisible && modalSize.width > 0 && modalSize.height > 0 && (
                    <NewTimerScreenPicker 
                        ref={baseTimePickerRef} 
                        width={modalSize.width} 
                        height={modalSize.height} 
                        onConfirm={hideTimePicker} 
                        onBack={hideTimePicker}
                        timer={baseTime}
                    />
                )}
                {incrementPickerVisible && modalSize.width > 0 && modalSize.height > 0 && (
                    <NewTimerScreenPicker 
                        ref={incrementPickerRef} 
                        width={modalSize.width} 
                        height={modalSize.height} 
                        hideHours={true}
                        onConfirm={hideTimePicker} 
                        onBack={hideTimePicker}
                        timer={incrementTime}
                    />
                )}
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
});

export default NewTimerModal;