import { Stack} from 'expo-router';

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