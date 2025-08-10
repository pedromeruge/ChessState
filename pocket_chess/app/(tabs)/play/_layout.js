import { Slot, useRouter, usePathname } from 'expo-router';
import { View, Text, ScrollView, StyleSheet, TextStyle, TouchableOpacity} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context';

import * as Constants from '../../../constants/index';
import IconComponent from '../../../components/common/IconComponent.jsx';
import {tabStyles} from '../../../components/common/styles.jsx';

// handles the tab navigation layout
const Layout = () => {
    const router = useRouter();
    const pathname = usePathname();

    const isPreset = pathname.endsWith('/timers_preset') || pathname === '/play';
    const isCustom = pathname.endsWith('/timers_custom');
  
    function openHelpBox() {
        console.log('help box'); 
    }

    function openSettings() {
        console.log('settings');
    }

    return (
        <SafeAreaView style={styles.container}>
            {(isPreset || isCustom) && ( // only display the header if we are in the preset or custom timers screen
                <>
                {/* Header */}
                <View style={styles.iconRowTop}>
                    <TouchableOpacity onPress={openHelpBox}>
                    <IconComponent source={Constants.icons.help} width={30} tintColor={Constants.COLORS.text_dark}/>
                    </TouchableOpacity>
                    <Text style={styles.textRowTop}>Play</Text>
                    <TouchableOpacity onPress={openSettings}>
                    <IconComponent source={Constants.icons.settings} width={30} tintColor={Constants.COLORS.text_dark}/>
                    </TouchableOpacity>
                </View>

                {/* Tab Bar*/}

                    <View style={tabStyles.tabBarStyle}>
                        <TouchableOpacity
                            onPress={() => router.replace('/play/timers_preset')}
                            style={[tabStyles.tabBarItem, styles.tabBarItem]}
                        >
                        <View style={tabStyles.labelContainer}>
                            <IconComponent
                                source={Constants.icons.hourglass}
                                width={15}
                                tintColor={ isPreset ? Constants.COLORS.contrast_red_light : Constants.COLORS.text_grey
                            }
                            />
                            <Text
                                style={[
                                    tabStyles.labelText,
                                    {
                                    fontWeight: isPreset ? Constants.FONTS.semi_bold : Constants.FONTS.regular,
                                    color: isPreset ? Constants.COLORS.contrast_red_light : Constants.COLORS.text_grey,
                                    },
                            ]}
                            >
                            Preset timers
                            </Text>
                        </View>
                        {isPreset && <View style={[tabStyles.tabBarIndicatorStyle, styles.tabBarIndicatorStyle]} />}
                        </TouchableOpacity>

                        <TouchableOpacity
                            onPress={() => router.replace('/play/timers_custom')}
                            style={[tabStyles.tabBarItem, styles.tabBarItem]}
                        >
                        <View style={tabStyles.labelContainer}>
                            <IconComponent
                                source={Constants.icons.hourglass}
                                width={15}
                                tintColor={ isCustom ? Constants.COLORS.contrast_red_light : Constants.COLORS.text_grey}
                            />
                            <Text
                                style={[
                                    tabStyles.labelText,
                                    {
                                    fontWeight: isCustom ? Constants.FONTS.semi_bold : Constants.FONTS.regular,
                                    color: isCustom ? Constants.COLORS.contrast_red_light : Constants.COLORS.text_grey,
                                    },
                                ]}
                            >
                            Custom timers
                            </Text>
                        </View>
                        {isCustom && <View style={[tabStyles.tabBarIndicatorStyle, styles.tabBarIndicatorStyle]} />}
                        </TouchableOpacity>
                    </View>
                </>
            )}

            {/* tab content */}
            <Slot />
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Constants.COLORS.white
    },

    iconRowTop: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: '100%',
        padding: 30,
        paddingBottom: 20
    },

    textRowTop: {
        color: Constants.COLORS.text_dark,
        fontFamily: Constants.FONTS.BASE_FONT_NAME,
        fontSize: Constants.SIZES.xxLarge,
        fontWeight: Constants.FONTS.medium
    },

    tabBarItem: {
        flex: 1,
        paddingTop: 10,
        paddingBottom: 12,
    },

    tabBarIndicatorStyle: {
        width: '100%',
        position: 'absolute',
        bottom: 0,
    },
})

export default Layout;