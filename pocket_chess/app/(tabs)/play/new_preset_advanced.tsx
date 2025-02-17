import { useState, useEffect, useRef, forwardRef, useImperativeHandle, useCallback, useReducer, useMemo } from 'react';
import { SafeAreaView, ScrollView, View, StyleSheet, TextInput, Image, Text } from 'react-native'
import { router} from 'expo-router';

import * as Constants from '../../../constants/index.js';
import * as Styles from '../../../styles/index.js';
import { Time, Stage, Timer, Preset } from '../../../classes/Preset.js';
import Header from '../../../components/Header.jsx';
import ActionButton from '../../../components/common/ActionButton.jsx';
import storage from '../../../classes/Storage.js';
import TabNavigator from '../../../components/TabNavigator.jsx';
import StagesSelection from '../../../components/StagesSelection.jsx';

const NewPresetAdvanced = ({}) => { // expose the ref to the parent component

    const [title, setTitle] = useState(''); // title of the preset
    const titleTextRef = useRef(''); // reference to the title input, used in textInput to prevent re-rendering, instead of using state directly

    const [playersStages, setPlayersStages] = useState({
        "Player White": [],
        "Player Black": []
    });

    const updateStages = useCallback((player: string, stages: Stage[]) => {
        setPlayersStages(prev => ({
            ...prev,
            [player]: stages
          }));
    }, []);

    const allPlayersHaveStages = useCallback(() =>  {
        return Object.values(playersStages)
            .every(stages => 
                stages?.length > 0
        );
    }, [playersStages]);

    const resetParameters = () => {
        setTitle('');
        setPlayersStages({
            "Player White": [],
            "Player Black": []
        });
        titleTextRef.current = '';
    }

    const onStartPreset = () => {

        const title = titleTextRef.current;
        const timers = Object.values(playersStages).map(stages => {
            return new Timer(stages);
        })
        const newPreset = new Preset(timers, title, undefined, undefined, true, Object.keys(playersStages));
        const customPresets = storage.getCustomPresets();
        customPresets.custom.presets.push(newPreset);
        storage.setCustomPresets(customPresets);

        onBack(true);
    }

    const onBack = (refreshPrevPage=false) => {

        //reset input parameters
        resetParameters();

        //back to previous component
        router.back() 
        router.setParams({ refresh: refreshPrevPage ? 'true' : 'false' }); // indicate to other component if it should refresh
    }

    const onChangeTitle = (text: string) => {
        titleTextRef.current = text;
        setTitle(text);
    };

    return (
        <SafeAreaView style={styles.container}>
            <Header leftIcon={Constants.icons.clock_lines} leftIconSize={16} text={'New preset'} rightIcon={Constants.icons.arrow_left} rightIconSize={18} 
                onPressRightIcon={onBack}
            />
            <View style={styles.scrollContainer}>
                <ScrollView 
                    contentContainerStyle={styles.scrollView}>
                    <View style={styles.bannerWrapper}>
                        <Image source={Constants.images.banner1} style={styles.banner}/>
                    </View>
                    <View style={styles.tabNavigatorWrapper}>
                        {useMemo(() => (
                            <TabNavigator 
                                tabs = {{
                                    "Player White": (props) => <StagesSelection {...props} onUpdateStages={(stages: Stage[]) => updateStages("Player White", stages)}/>,
                                    "Player Black": (props) => <StagesSelection {...props} onUpdateStages={(stages: Stage[]) => updateStages("Player Black", stages)}/>
                                }}
                                icons = {{
                                    "Player White": Constants.icons.pawn,
                                    "Player Black": Constants.icons.pawn_full
                                }}
                                swipeEnabled={false}
                            />
                        ), [updateStages])
                        }
                    </View>
                    {/* <View style={styles.separationLine}></View> */}
                    <View style={Styles.newPreset.sectionContainer}>
                        <View style={Styles.newPreset.sectionTitleContainer}>
                            <Text style={Styles.newPreset.sectionTitleText}>Title</Text>
                        </View>
                        <View style={styles.titleSectionContent}>
                            <Text style={styles.titleSectionText}>Name:</Text>
                            <TextInput 
                                style={Styles.newPreset.titleInput} 
                                placeholder="New preset" 
                                placeholderTextColor={Constants.COLORS.line_light_grey}
                                onChangeText={onChangeTitle}
                                value={title}
                            />
                        </View>
                    </View>
                    <View style={styles.startButtonContainer}>
                        <ActionButton source={Constants.icons.hourglass} text="Start" height={45} iconSize={20} fontSize={Constants.SIZES.xxLarge} componentStyle={styles.startButton}
                            onPress={onStartPreset}
                            disabled={!allPlayersHaveStages() || title === ''}
                            />
                    </View>
                </ScrollView>
            </View>
        </SafeAreaView>
    )
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Constants.COLORS.white,
    },

    scrollContainer: {
        flex:1
    },

    scrollView: {
        justifyContent: 'flex-start',
        flexGrow: 1
    },

    bannerWrapper: {
        aspectRatio: 16/9.3,
        overflow: 'hidden'
    },

    banner: {
        width: '100%',
        height: '100%',
        resizeMode: 'contain'
    },
    
    tabNavigatorWrapper: {
        width: '100%',
        flexGrow: 1
    },

    titleSectionContent: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginRight: 10
    },
    
    titleSectionText: {
        fontFamily: Constants.FONTS.BASE_FONT_NAME,
        fontSize: Constants.SIZES.large,
        fontWeight: Constants.FONTS.medium,
        color: Constants.COLORS.text_grey,
    },

    separationLine: {
        marginVertical: 5,
        width: '45%',
        height: 2,
        alignSelf: 'center',
        backgroundColor: Constants.COLORS.line_light_grey,
        borderRadius: 5,
        
    },

    startButtonContainer: {
        width: '100%',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 40
    },

    startButton: {
        marginTop: 30
    },
});

export default NewPresetAdvanced;