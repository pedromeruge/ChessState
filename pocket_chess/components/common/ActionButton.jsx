import React from 'react';
import { StyleSheet } from 'react-native';
import { SvgUri } from 'react-native-svg';
import { Image } from 'react-native';

const IconComponent = ({ source, tintColor=null, opacity=1.0}) => {
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
      opacity: opacity,
      objectFit: 'contain',
    },
    tint: {
      tintColor: tintColor
    }
  });

return (
  <Image 
    source={source} 
    style={[styles.icon, tintColor ? styles.tint : null]}
    resizeMode="contain"
  />
);

};
export default IconComponent;