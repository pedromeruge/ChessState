import { Tabs } from 'expo-router';
import { COLORS, FONTS, SIZES, icons } from '../../constants/index.js';
import IconComponent from '../../components/common/IconComponent';
import BottomNavBar from '../../components/BottomNavBar.jsx';

// handles the tab navigation layout
const Layout = () => {
    return (
        <BottomNavBar />
    );
}

export default Layout;