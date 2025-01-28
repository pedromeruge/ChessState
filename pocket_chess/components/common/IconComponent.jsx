import React from 'react';
import { StyleSheet } from 'react-native';
import { SvgUri } from 'react-native-svg';
import { Image } from 'react-native';

const IconComponent = ({ source, width, height, tintColor}) => {
  if (!source) {
    console.warn("Icon source is missing!");
    return null;
  }

  console.log("Got source", source);
//   return (
//       <SvgUri
//         width={width}
//         height={height}
//         uri={source}
//         fill={tintColor}
//       />
//   );j
  const styles = StyleSheet.create({
    icon: {
      width: width,
      height: height,
      tintColor: tintColor,
      objectFit: 'contain',
    },
  });

return (
  <Image 
    source={source} 
    style={styles.icon}
    resizeMode="contain"
  />
);

};
export default IconComponent;