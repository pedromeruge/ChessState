import React from 'react';
import { StyleSheet } from 'react-native';
import { SvgUri } from 'react-native-svg';
import { Image } from 'react-native';

const IconComponent = ({ source, width=null, tintColor=null, opacity=1.0, addStyle=null, ...props}) => {
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
      width: width ? width : '100%',
      height: width ? width : '100%',
      opacity: opacity,
      tintColor: tintColor ? tintColor : null

    } 
  });

return (
  <Image 
    source={source} 
    style={[styles.icon, addStyle]}
    resizeMode="contain"
    {...props} // pass any other props to the Image component
  />
);

};
export default IconComponent;