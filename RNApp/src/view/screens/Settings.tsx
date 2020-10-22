import { SafeAreaView, StyleSheet, TouchableOpacity, Image, View, Text } from 'react-native'
import { TYPOGRAPHY } from '../styles/typography'
import React, { useRef } from 'react'
import { CText } from '../elements/custom'
import { Navigation } from 'react-native-navigation'
import { RNCamera } from 'react-native-camera'

const Settings: React.FC = () => {
  const showBurgerMenu = () => {
    Navigation.mergeOptions('drawerComponentId', {
      sideMenu: {
        left: {
          visible: true,
        },
      },
    });
  }

  async function takePicture(){
    if (this.cameraRef) {
      const options = { quality: 0.5, base64: true };
      const data = await this.cameraRef.takePictureAsync(options);
      console.log(data.uri)
      //TODO: GO TO OTHER SCREEN 
      //SHOW THE IMAGE 
      //SEND TO API 
      //SPINNER WHILE API IS PROCESSING 
      //SHOW RESULT
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <TouchableOpacity onPress={() => showBurgerMenu()}>
        <Image
          style={styles.image}
          resizeMode="contain"
          source={require('../assets/images/burger-menu.png')}
        />
      </TouchableOpacity>
      <View style={styles.container}>
        <RNCamera
          ref={(ref) => this.cameraRef = ref}
          style={styles.preview}
          type={RNCamera.Constants.Type.back}
          flashMode={RNCamera.Constants.FlashMode.off}
          androidCameraPermissionOptions={{
            title: 'Permission to use camera',
            message: 'We need your permission to use your camera',
            buttonPositive: 'Ok',
            buttonNegative: 'Cancel',
          }}
          androidRecordAudioPermissionOptions={{
            title: 'Permission to use audio recording',
            message: 'We need your permission to use your audio',
            buttonPositive: 'Ok',
            buttonNegative: 'Cancel',
          }}
        />
        <View style={{ flex: 0, flexDirection: 'row', justifyContent: 'center' }}>
          <TouchableOpacity onPress={takePicture} style={styles.capture}>
            <Text style={{ fontSize: 14 }}> {'SNAP'} </Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    backgroundColor: 'white',
  },
  preview: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  capture: {
    flex: 0,
    backgroundColor: '#fff',
    borderRadius: 5,
    padding: 15,
    paddingHorizontal: 20,
    alignSelf: 'center',
    margin: 20,
  },
  image: {
    marginBottom: 20,
    width: 40,
    height: 40,
  },
  button: {
    alignSelf: 'center',
    marginTop: 50,
    width: 250,
  }
})

export default Settings
