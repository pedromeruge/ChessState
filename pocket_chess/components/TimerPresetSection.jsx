import { useState, useRef } from 'react';
import { View, Text, StyleSheet, FlatList, Dimensions } from 'react-native'
import * as Constants from '../constants/index.js';
import TimerPreset from './TimerPreset.jsx';
import IconComponent from './common/IconComponent.jsx';
import {LinearGradient} from 'expo-linear-gradient';

// based on https://www.youtube.com/watch?v=GrLCS5ww030

const TimerPresetSection = ({timersList}) =>{
    
    //gradien to appear on right of flatlist to indicate there are more elements to the right, that the user can scroll to
    const [showGradient, setShowGradient] = useState(false);
    
    //if the full width of the flatlist is bigger than the screen, the gradient should be shown initially
    const handleContentSizeChange = (contentWidth, contentHeight) => {
        const windowWidth = Dimensions.get('window').width;
        setShowGradient(contentWidth > windowWidth);
      };

    const flatListRef = useRef(null);
    
    const handleScroll = (event) => {
        const { contentOffset, layoutMeasurement, contentSize } = event.nativeEvent;
        const bufferDistance = 30 // how far away from the end of a list we want to show the gradient
        
        const endReached = contentOffset.x + layoutMeasurement.width >= contentSize.width - bufferDistance;
        setShowGradient(!endReached);
    };

    const onPressTimer = (timer) => {
        console.log("Pressed timer", timer);
    }

    return (
        <>
        <View style={styles.presetsSectionHeader}>
            <IconComponent source={timersList.icon} width={12} tintColor={timersList.iconColor}/>
            <Text style={styles.textPresetsSectionHeader}>{timersList.title}</Text>
        </View>
        <View style={styles.listWrapper}>
            <FlatList
                horizontal={true}
                showsHorizontalScrollIndicator={false}
                keyExtractor={(item) => item.id}
                ref={flatListRef}
                data={timersList.timers}
                renderItem={({item}) => (<TimerPreset timer={item} onPress={() => onPressTimer(item)}/>)}
                onScroll={handleScroll}
                onContentSizeChange={handleContentSizeChange}
                scrollEventThrottle={16} // delay scroll events
                contentContainerStyle={styles.presetsSectionContent}
                style={styles.flatList} // allow shadows of timers to overflow
            />
            {showGradient && 
                <LinearGradient
                colors={[
                    'rgba(255, 255, 255, 1.0)', 
                    'rgba(255, 255, 255, 0.95)', 
                    'rgba(255, 255, 255, 0)'
                  ]}
                style={styles.moreContentGradient}
                start={{ x: 1, y: 0 }}
                end={{ x: 0, y: 0 }}
                locations={[0, 0.7, 1]}
                />
            }
        </View>
        </>
    )
}

const styles = StyleSheet.create({ 
    presetsSectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 5
      },
    
    textPresetsSectionHeader: {
        color: Constants.COLORS.text_dark,
        fontFamily: Constants.FONTS.BASE_FONT_NAME,
        fontSize: Constants.SIZES.medium,
        fontWeight: Constants.FONTS.medium,
        marginLeft: 5
    },

    presetsSectionContent: {
        columnGap: 18,
    },

    flatList: {
        overflow: 'visible'
    },

    listWrapper: {
        position: 'relative',
        marginBottom: 20,
    },

    moreContentGradient: {
        position: 'absolute',
        top: '50%',
        right: -30,
        width: '22%',
        height: '140%',
        transform: [{translateY: '-50%'}],
        zIndex: 1
    }
});

export default TimerPresetSection;