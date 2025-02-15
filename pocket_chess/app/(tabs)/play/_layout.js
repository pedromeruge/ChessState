import { Stack} from 'expo-router';

// handles the tab navigation layout
const StackLayout = () => {
    return (
        <Stack
            screenOptions={{
                headerShown: false,
                animation: 'fade',
            }}
        />
    );
}

export default StackLayout;