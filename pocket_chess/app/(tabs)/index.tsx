import { useState } from 'react';
import { Button, StyleSheet, Text, TextStyle, TouchableOpacity, View } from 'react-native';
import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import { SafeAreaView } from 'react-native-safe-area-context';

import * as Constants from '../../constants';
import IconComponent from '../../components/common/IconComponent.jsx';
import ActionButton from '../../components/common/ActionButton';

import React from 'react';
// import CameraPermissionPage from '../../components/CameraPermissionPage';
// import NoCameraDeviceError from '../../components/NoCameraDeviceError';

// based on https://docs.expo.dev/versions/latest/sdk/camera/

const Scan = () => {
  
  const [permission, requestPermission] = useCameraPermissions();

  function openHelpBox() {
    console.log('help box'); 
  }

  function openSettings() {
    console.log('settings');
  }

  function openGallery() {
    console.log('gallery');
  }

  function scanCamera() {
    console.log('scan');
  }

  function toggleFlash() {
    console.log('flash');
  }

  return (
    <View style={styles.container}>
      {/* Conditionally render the camera feed if permission is granted */}
      {permission?.granted && 
        <CameraView style={StyleSheet.absoluteFill} />}

        {/* Ui content in safe visible areas */}
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.iconRowTop}>
            <TouchableOpacity style={styles.button} onPress={openHelpBox}>
              <IconComponent source={Constants.icons.help} width={35}/>
            </TouchableOpacity>
            <TouchableOpacity style={styles.button} onPress={openSettings}>
              <IconComponent source={Constants.icons.settings} width={35}/>
            </TouchableOpacity>
          </View>

          {/* Permission explanation and button if not granted */}
          {!permission?.granted && (
            <View style={styles.permissionContainer}>
              <IconComponent source={Constants.icons.no_camera} width={100} tintColor={Constants.COLORS.text_grey} />
              <Text style={styles.message}>
                <Text> Without permission to access camera, </Text>
                <Text style={styles.bold_text}>Pocket Chess </Text>
                <Text>can't scan chessboard</Text>
              </Text>
              <ActionButton source={Constants.icons.camera} text="Give access" onPress={requestPermission} size={35}/>
            </View>
          )}

          <View style={styles.iconRowBottom}>
            <TouchableOpacity style={styles.button} onPress={openGallery}>
              <IconComponent source={Constants.icons.gallery} width={35}/>
            </TouchableOpacity>
            {/* Conditionally render scan and flash buttons
              NOTE: the <> is needed to group >=2 components in one conditional statement*/}
            {permission?.granted && (
              <>
                <TouchableOpacity style={styles.button} onPress={scanCamera}>
                  <IconComponent source={Constants.icons.scan_button} width={75} opacity={0.8}/>
                </TouchableOpacity>
                <TouchableOpacity style={styles.button} onPress={toggleFlash}>
                  <IconComponent source={Constants.icons.flash} width={35}/>
                </TouchableOpacity>
              </>
            )}
          </View>
        </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Constants.COLORS.text_dark
  },
  
  safeArea: {
    flex: 1,
    justifyContent: 'center'
  },
  
  permissionContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    padding: 100
  },

  message: {
    textAlign: 'center',
    lineHeight: 20,
    color: Constants.COLORS.text_grey,
    fontFamily: Constants.FONTS.BASE_FONT_NAME,
    fontSize: Constants.SIZES.large,
    fontWeight: Constants.FONTS.regular as TextStyle['fontWeight'],
    marginTop: 10,
    marginBottom: 50
  },

  bold_text: {
    fontWeight: Constants.FONTS.bold as TextStyle['fontWeight'], 
    color: Constants.COLORS.line_light_grey
  },
  
  iconRowTop: {
    position: 'absolute',
    top: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    padding: 35,
  },
  iconRowBottom: {
    position: 'absolute',
    bottom: 0,
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    paddingBottom: 40,
  },
  
  button: {
    alignItems: 'center',
  },
});

export default Scan