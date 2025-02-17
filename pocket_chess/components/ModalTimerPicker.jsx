import { useState, useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
import { SafeAreaView, View, StyleSheet, Modal, Pressable} from 'react-native'

import * as Constants from '../constants/index.js';
import NewTimerScreenPicker from './NewTimerScreenPicker.jsx';

const ModalTimerPicker = forwardRef(({time, setTime, hideHours=false}, ref) => { // expose the ref to the parent component

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
            animationType="slide"
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