import {
  SafeAreaView,
  StyleSheet,
  TouchableOpacity,
  View,
  ActivityIndicator,
  Image,
  Dimensions,
  Text,
} from 'react-native'
import { TYPOGRAPHY } from '../styles/typography'
import React, { useState } from 'react'
import { CText } from '../elements/custom'
import ImagePicker from 'react-native-image-picker'
import Defaults from '../../config'
import Box from '../elements/Box'
import Switch from '../elements/Switch'
import * as Animatable from 'react-native-animatable'

const options = {
  title: 'Selecciona foto',
  storageOptions: {
    skipBackup: true,
    path: 'images',
  },
}
const WINDOWS_WIDTH = Dimensions.get('window').width

export type Person = {
  box: number[]
  person: string
  score: number
  drunk: boolean
  age: number
  gender: boolean
}

const Home: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false)
  const [image, setImage] = useState<any>(null)
  const [results, setResults] = useState<Person[] | null>(null)
  const [selectedPerson, setSelectedPerson] = useState<Person | null>(null)
  const [error, setError] = useState<string | null>(null)

  function onSelectPicture(response: any) {
    setError(null)
    setResults(null)
    setSelectedPerson(null)
    setImage(null)

    if (response.didCancel) {
      console.log('User cancelled image picker')
    } else if (response.error) {
      console.log('ImagePicker Error: ', response.error)
    } else {
      handleOnPictureTaken(response.uri)
      setImage(response)
    }
  }

  function handleOnPictureTaken(image: string) {
    const name = image.split('/').pop()
    const extension = name?.split('.').pop()
    const type = `image/${extension}`
    const source = { uri: image, type, name }
    // @ts-ignore
    uploadImage(source)
  }

  async function uploadImage(photoData: string | Blob) {
    const data = new FormData()
    data.append('photo', photoData)
    setIsLoading(true)
    try {
      const response = await fetch(
        `${Defaults.apis.baseUrl}/prediction/`,
        {
          method: 'post',
          body: data,
          headers: {
            Accept: 'application/json',
            'Content-Type': 'multipart/form-data ',
          },
        }
      )

      if (response.status === 200) {
        const persons = await response.json()
        setResults(persons)
        if (persons.length === 0) {
          setError('No results found')
        }
        if (persons.length === 1) {
          setSelectedPerson(persons[0])
        }
      } else {
        setError('An error occurred')
      }

    } catch (err) {
      setError('An error occurred')
    }
    setIsLoading(false)
  }


  let imgHeight = 0
  if (image?.width) {
    imgHeight = (image.height * WINDOWS_WIDTH) / image.width
  }

  return (
    <SafeAreaView style={styles.container}>
      <CText style={styles.title}>Find my Coworker</CText>
      <CText style={styles.subtitle}>(Celtiberian edition)</CText>
      <View style={styles.content}>
        <Switch condition={!!image?.uri}>
          <Animatable.View animation="fadeIn" style={[styles.imageContainer, { height: imgHeight }]}>
            <Image
              style={[styles.image, { height: imgHeight }]}
              source={{ uri: image?.uri }}
              resizeMode='contain'
              resizeMethod='resize'
            />
            <Switch condition={!!results}>
              {results?.map((person, index) => {
                return <Box key={index} height={image.height} width={image.width} person={person} imgHeight={imgHeight} onSelectPerson={() => setSelectedPerson(person)} />
              })}
            </Switch>
          </Animatable.View>
        </Switch>
        <View style={styles.data}>
          <Switch condition={!!error}>
            <CText style={styles.error}>{error}</CText>
          </Switch>
          <Switch condition={isLoading}>
          <Animatable.View animation="fadeIn">
            <ActivityIndicator size="large" color="white" />
            <CText style={styles.processing}>Processing image...</CText>
            </Animatable.View>
          </Switch>
          <Switch condition={!!selectedPerson}>
            <Animatable.View animation="fadeIn">
              <CText style={styles.buttonText}>Name: {selectedPerson?.person}</CText>
              <CText style={styles.buttonText}>Score: {selectedPerson?.score?.toFixed(2)}</CText>
              <CText style={styles.buttonText}>
                Drunk: {selectedPerson?.drunk ?
                  <Text style={{ color: TYPOGRAPHY.COLOR.Danger }}>Yes</Text> :
                  <Text style={{ color: TYPOGRAPHY.COLOR.Success }}>No</Text>
                }
              </CText>
              <CText style={styles.buttonText}>Age: {selectedPerson?.age}</CText>
            </Animatable.View>
          </Switch>
        </View>
      </View>
      <View style={styles.footer}>
        <TouchableOpacity style={styles.button} onPress={() => ImagePicker.launchCamera(options, onSelectPicture)}>
          <CText style={styles.buttonText}>Take Photo</CText>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={() => ImagePicker.launchImageLibrary(options, onSelectPicture)}>
          <CText style={styles.buttonText}>Select from Gallery</CText>
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
    justifyContent: 'center',
    flexDirection: 'column',
  },
  footer: {
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
  error: {
    fontSize: 18,
    marginTop: 16,
    textAlign: 'center',
  },
  processing: {
    fontSize: 18,
    marginTop: 16,
    textAlign: 'center',
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
    marginTop: 8,
  },
  subtitle: {
    fontSize: 18,
    marginTop: 8,
    marginBottom: 16,
  },
  image: {
    width: WINDOWS_WIDTH,
  },
  imageContainer: {
    height: 300,
    width: WINDOWS_WIDTH,
    position: 'relative',
  },
  data: {
    margin: 36,
    marginTop: 16
  },
})

export default Home


