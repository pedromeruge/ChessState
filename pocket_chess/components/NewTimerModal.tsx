import { useState, useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
import { SafeAreaView, View, StyleSheet, Modal, Pressable} from 'react-native'

import * as Constants from '../constants/index.js';
import NewTimerScreenBase, {NewTimerScreenBaseRef} from './NewTimerScreenBase';
import NewTimerScreenPicker, {NewTimerScreenPickerRef} from './NewTimerScreenPicker';
import { Time, Preset } from '../classes/timers_base/Preset.js';
import { FischerIncrementStage, FischerIncrementTimer } from '../classes/timers_base/Preset.js';
import {router} from 'expo-router'
import storage from '../classes/Storage';

interface NewTimerModalRef {
    showModal: () => void;
    hideModal: () => void;
}

interface NewTimerModalProps {
    onSubmit: (presets: any) => void;
}

const NewTimerModal = forwardRef<NewTimerModalRef, NewTimerModalProps>(
    ({onSubmit}, ref) => { // expose the ref to the parent component

    //state of modal
    const [visible, setVisible] = useState<boolean>(false); // state to show/hide the modal
    const [baseTimePickerVisible, setBaseTimePickerVisible] = useState<boolean>(false);
    const [incrementPickerVisible, setIncrementPickerVisible] = useState<boolean>(false);

    const [modalSize, setModalSize] = useState<{ width: number, height: number }>({ width: 0, height: 0 }); // width and height of the modal, to keep consistent across modal sections
    const [baseTime, setBaseTime] = useState<Time>(new Time()); // track base time
    const [incrementTime, setIncrementTime] = useState<Time>(new Time()); // track increment time
    const [titleText, setTitleText] = useState<string>('');

    // refs for the time picker roulettes for base time and increment
    const startScreenRef = useRef<NewTimerScreenBaseRef>(null);
    const baseTimePickerRef = useRef<NewTimerScreenPickerRef>(null);
    const incrementPickerRef = useRef<NewTimerScreenPickerRef>(null);

    const showModal = () : void => {
        setVisible(true);
        startScreenRef.current?.showScreen();
        baseTimePickerRef.current?.hideScreen();
        incrementPickerRef.current?.hideScreen();
    }

    const hideModal = () : void => {
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

    const showBaseTimePicker = () : void => {
        startScreenRef.current?.hideScreen();
        setBaseTimePickerVisible(true);
    }

    const showIncrementPicker = () : void => {
        setIncrementPickerVisible(true);
    }
    
    // hide base time picker or increment picker
    const hideTimePicker = () : void => {
        setBaseTimePickerVisible(false);
        setIncrementPickerVisible(false);
    }

    const resetParameters = () : void => {
        setBaseTime(new Time());
        setIncrementTime(new Time());
        setTitleText('');
    }

    const onStartPreset = () : void => {
        const newPreset = Preset.samePlayerTimers(new FischerIncrementTimer([new FischerIncrementStage(baseTime, incrementTime)]), titleText, true);
        const customPresets = storage.getCustomPresets();

        customPresets.custom.presets.push(newPreset);
        storage.setCustomPresets(customPresets);

        onSubmit(customPresets);

        //reset input parameters
        resetParameters();

        //immediately navigate to the created preset screen
        router.push(
            { pathname: '/play_more/timer_interact/interact', 
            params: {preset_id: newPreset.id}
        });
    }

    // ✅ Add debugging for visibility changes
    useEffect(() => {
        console.log('NewTimerModal visible state changed to:', visible);
    }, [visible]);

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
            animationType="fade"
            transparent
        >
            <View style={styles.container}>
                <Pressable style={styles.overlay} onPress={hideModal} />
                {(!baseTimePickerVisible && !incrementPickerVisible) && (
                    <NewTimerScreenBase
                        ref={startScreenRef} 
                        onStart={onStartPreset}
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
        width: '100%',
        height: '100%',
        zIndex: 100,
    },
    overlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0, 0, 0, 0.4)',
    },
});

export default NewTimerModal;
export type { NewTimerModalRef };