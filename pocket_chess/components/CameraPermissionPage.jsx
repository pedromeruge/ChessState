import { COLORS, FONTS, SIZES, icons } from '../constants/index.js';
import IconComponent from './common/IconComponent.jsx';
import { Text, Button } from 'react-native';

const CameraPermissionPage = () => {
  return (
    <View>
      <IconComponent source={icons.camera} width={100} height={100} tintColor={COLORS.text_grey} />
      <Text>Need permissions to access camera</Text>
      <Button title="Give access" onPress={() => {
        console.log("Requesting camera permission");
      }} />
    </View>
  );
}

export default CameraPermissionPage;