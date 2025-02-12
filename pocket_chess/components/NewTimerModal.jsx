import { useState, useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
import { SafeAreaView, View, StyleSheet, Modal, Pressable} from 'react-native'

import * as Constants from '../constants/index.js';
import NewTimerScreenBase from './NewTimerScreenBase.jsx';
import NewTimerScreenPicker from './NewTimerScreenPicker.jsx';
import { Time, Stage, Timer } from '../classes/Timer.js';

const NewTimerModal = forwardRef(({onSubmit}, ref) => { // expose the ref to the parent component

    //state of modal
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

    const startTimer = () => {
        const newTimer = new Timer([new Stage(baseTime, incrementTime)], titleText);
        const customTimers = storage.getCustomTimers();

        customTimers.custom.timers.push(newTimer);
        storage.setCustomTimers(customTimers);

        onSubmit(customTimers);

        //reset input parameters
        setBaseTime(new Time());
        setIncrementTime(new Time());
        setTitleText('');
    }

    // auto-suggest title based on input time
    useEffect(() => {
        // TODO: userHasInputTitle not read correct, even though properly set in other component?
        if (!startScreenRef.current?.userHasInputTitle && (!baseTime.isDefault())) { 
            setTitleText(Time.toStringCleanBoth(baseTime, incrementTime));
        }
    }, [baseTime, incrementTime]);
    
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
                        onStart={startTimer}
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
                        time={baseTime}
                        setTime={setBaseTime}
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
                        time={incrementTime}
                        setTime={setIncrementTime}
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
        zIndex: 10,
        width: '100%',
        height: '100%'

    },
    overlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0, 0, 0, 0.4)',
    },
});

export default NewTimerModal;