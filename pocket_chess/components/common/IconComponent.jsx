import React from 'react';
import { StyleSheet } from 'react-native';
import { SvgUri } from 'react-native-svg';
import { Image } from 'react-native';

const IconComponent = ({ source, width, tintColor=null, opacity=1.0}) => {
  if (!source) {
    console.warn("Icon source is missing!");
    return null;
  }
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
      height: width,
      opacity: opacity
    } 
  });

return (
  <Image 
    source={source} 
    style={[styles.icon, tintColor ? {tintColor: tintColor} : null, width ? {width: width} : null]}
    resizeMode="contain"
  />
);

};
export default IconComponent;