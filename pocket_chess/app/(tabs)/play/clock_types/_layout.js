import { Stack} from 'expo-router';

const StackLayout = () => {
    return (
        <Stack
            screenOptions={{
                headerShown: false,
                animation: 'fade',
                gestureEnabled: false
            }}
        />
    );
}

export default StackLayout;