import { COLORS, FONTS, SIZES, icons } from '../constants/index.js';
import IconComponent from './common/IconComponent.jsx';
import { Text, Button } from 'react-native';

const NoCameraDeviceError = () => {
  return (
    <View>
      <IconComponent source={icons.no_camera} width={100} height={100} tintColor={COLORS.text_grey} />
      <Text>No camera</Text>
    </View>
  );
}

export default NoCameraDeviceError;