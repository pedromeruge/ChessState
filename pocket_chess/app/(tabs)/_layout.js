import { Tabs } from 'expo-router';
import { COLORS, FONTS, SIZES, icons } from '../../constants/index.js';
import IconComponent from '../../components/common/IconComponent'; // not working, dont know how to get it working either..

const Layout = () => {
    console.log("Icons path", icons.play);
    return (
        <Tabs
            screenOptions={{
                tabBarActiveTintColor: COLORS.contrast_red_light,
                tabBarStyle: {
                    height: 70,
                    borderWidth: 1,
                    borderRadius: 0,
                    borderColor: COLORS.line_light_grey,
                    borderTopColor: COLORS.line_light_grey,
                    backgroundColor: COLORS.white,
                    paddingBottom: 10,
                    alignItems: "center",
                    justifyContent: "center"
                },
                tabBarLabelStyle: {
                    fontSize: SIZES.xSmall,
                    fontWeight: FONTS.medium,
                    fontFamily: FONTS.BASE_FONT_NAME
                },
            }}
        >
            <Tabs.Screen 
                name="play"
                options={{
                    title: "Play",
                    tabBarIcon: ({ focused }) => (
                        <IconComponent
                          source={icons.play}
                          width={15}
                          height={24}
                          tintColor={focused ? COLORS.contrast_red_light : COLORS.text_grey}
                        />
                    ),
                }}
            />
            <Tabs.Screen 
                name="index"
                options={{
                    title: "Scan",
                    tabBarIcon: ({ focused }) => (
                        <IconComponent
                          source={icons.scan}
                          width={24}
                          height={24}
                          tintColor={focused ? COLORS.contrast_red_light : COLORS.text_grey}
                        />
                    ),
                }}
            />
            <Tabs.Screen 
                name="storage"
                options={{
                    title: "Storage",
                    tabBarIcon: ({ focused }) => (
                        <IconComponent
                          source={icons.storage}
                          width={24}
                          height={24}
                          tintColor={focused ? COLORS.contrast_red_light : COLORS.text_grey}
                        />
                    )
                }}
            />
        </Tabs>
    );
}

export default Layout;