import { useState, useRef } from 'react';
import { View, Text, StyleSheet, FlatList, Dimensions } from 'react-native'
import * as Constants from '../../constants/index.js';
import TimerPreset from './TimerPreset.jsx';
import IconComponent from '../common/IconComponent.jsx';
import {LinearGradient} from 'expo-linear-gradient';
import {router} from 'expo-router'

const TimerPresetSection = ({presetsList, singleLine=false, style = {}}) =>{
    
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

    const onPressPreset = (preset) => {
        console.log("Pressed preset", preset);
        //note: its an anti-pattern to send a full object in params. Should just send id, and fetch it in the next screen
        router.push({ 
            pathname: '/play_more/timer_interact/interact', 
            params: {preset_id: preset.id}
        });
    }

    return (
        <View style={style}>
            <View style={styles.presetsSectionHeader}>
                <IconComponent source={presetsList.icon} width={12} tintColor={presetsList.iconColor}/>
                <Text style={styles.textPresetsSectionHeader}>{presetsList.title}</Text>
            </View>
            {presetsList.presets.length === 0 && (
                <Text style={styles.textNoPresets}>No presets defined</Text>
            )}
            {singleLine ? (
                <View style={styles.listWrapper}>
                    <FlatList
                        horizontal={true}
                        showsHorizontalScrollIndicator={false}
                        keyExtractor={(item) => item.id}
                        ref={flatListRef}
                        data={presetsList.presets}
                        renderItem={({item}) => (<TimerPreset preset={item} onPress={() => onPressPreset(item)}/>)}
                        onScroll={handleScroll}
                        onContentSizeChange={handleContentSizeChange}
                        scrollEventThrottle={16} // delay scroll events
                        contentContainerStyle={styles.presetsSectionContent}
                        style={styles.flatListSingleLine} // allow shadows of presets to overflow
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
            ) : (
                <View style={[styles.flatListGrid, styles.presetsSectionContent]}>
                    {presetsList.presets.map((item) => (
                        <TimerPreset key={item.id} preset={item} onPress={() => onPressPreset(item)} />
                    ))}
                </View>
            )}
        </View>
    )
}

const styles = StyleSheet.create({ 
    presetsSectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10
      },
    
    textPresetsSectionHeader: {
        color: Constants.COLORS.text_dark,
        fontFamily: Constants.FONTS.BASE_FONT_NAME,
        fontSize: Constants.SIZES.medium,
        fontWeight: Constants.FONTS.medium,
        marginLeft: 5
    },

    textNoPresets: {
        fontFamily: Constants.FONTS.BASE_FONT_NAME,
        fontSize: Constants.SIZES.medium,
        fontWeight: Constants.FONTS.light,
        color: Constants.COLORS.line_light_grey,
    },

    presetsSectionContent: {
        columnGap: 18,
    },

    flatListSingleLine: {
        overflow: 'visible'
    },

    flatListGrid: {
        overflow: 'visible',
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'flex-start',
        alignItems: 'center',
        flex: 1,
        gap: 18,
    },

    listWrapper: {
        position: 'relative',
        marginBottom: 25,
    },

    moreContentGradient: {
        position: 'absolute',
        top: '50%',
        right: -30,
        width: '22%',
        height: '120%',
        transform: [{translateY: '-50%'}],
        zIndex: 1
    }
});

export default TimerPresetSection;