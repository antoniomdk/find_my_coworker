import { SafeAreaView, StyleSheet, TouchableOpacity, View, ActivityIndicator, Image } from 'react-native'
import { TYPOGRAPHY } from '../styles/typography'
import React, { useState } from 'react'
import { CText } from '../elements/custom'
import ImagePicker from 'react-native-image-picker'
import Defaults from '../../config'

const options = {
  title: 'Selecciona foto',
  storageOptions: {
    skipBackup: true,
    path: 'images',
  },
}


const Home: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false)
  const [image, setImage] = useState<any>(null)

  function onSelectPicture(response: any) {
    if (response.didCancel) {
      console.log('User cancelled image picker')
    } else if (response.error) {
      console.log('ImagePicker Error: ', response.error)
    } else {
      const source = { uri: response.uri }

      setIsLoading(true)
      uploadImage(response)
      setTimeout(() => {
        setIsLoading(false)
        setImage(source)
      }, 3000)
      // You can also display the image using data:
      // const source = { uri: 'data:image/jpegbase64,' + response.data }

      /*       this.setState({
              avatarSource: source,
            }) */
    }
  }

  async function uploadImage(photoData: string | Blob) {
    const data = new FormData()
    try {
      const res = await fetch(
        `${Defaults.apis.baseUrl}/prediction/`,
        {
          method: 'post',
          body: data,
          headers: {
            'Content-Type': 'multipart/form-data ',
          },
        }
      )
    } catch (err) {
      console.log('Error procesando imagen')
    }
  }
  return (
    <SafeAreaView style={styles.container}>
      <CText style={styles.title}>Find my Coworker</CText>
      <CText style={styles.subtitle}>(Celtiberian edition)</CText>
      <View style={styles.content}>
        {isLoading && (
          <>
            <ActivityIndicator size="large" color="white" />
            <CText style={styles.processing}>Procesando imagen...</CText>
          </>
        )}
        {!!image && (
          <Image style={styles.image} source={image} resizeMode='contain' />
        )}
      </View>
      <View style={styles.buttons}>
        <TouchableOpacity style={styles.button} onPress={() => ImagePicker.launchCamera(options, onSelectPicture)}>
          <CText style={styles.buttonText}>Haz una foto</CText>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={() => ImagePicker.launchImageLibrary(options, onSelectPicture)}>
          <CText style={styles.buttonText}>Selecciona una foto</CText>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignContent: 'center',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: TYPOGRAPHY.COLOR.Blue,
  },
  content: {
    flex: 1,
    display: 'flex',
    justifyContent: 'center',
  },
  buttons: {
    flex: 1,
    display: 'flex',
    width: '100%',
    flexDirection: 'column',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 18,
  },
  processing: {
    fontSize: 18,
    marginTop: 16,
  },
  button: {
    borderWidth: 2,
    borderColor: 'white',
    borderRadius: 8,
    paddingVertical: 16,
    width: '80%',
    marginBottom: 24,
    alignItems: 'center',
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    marginTop: 32,
  },
  subtitle: {
    fontSize: 24,
    marginTop: 12,
    marginBottom: 24,
  },
  image: {
    height: 200,
    width: 300,
  }
})

export default Home
