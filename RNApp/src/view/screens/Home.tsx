import { SafeAreaView, StyleSheet, TouchableOpacity, View, ActivityIndicator, Image, Dimensions } from 'react-native'
import { TYPOGRAPHY } from '../styles/typography'
import React, { useState } from 'react'
import { CText } from '../elements/custom'
import ImagePicker from 'react-native-image-picker'
import Defaults from '../../config'
import Box from '../elements/Box'
import Switch from '../elements/Switch'

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
          setError('No se han encontrado resultados')
        }
        if (persons.length === 1) {
          setSelectedPerson(persons[0])
        }
      } else {
        setError('Error procesando imagen')
      }

    } catch (err) {
      setError('Error procesando imagen')
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
      <Switch condition={isLoading}>
        <ActivityIndicator size="large" color="white" />
        <CText style={styles.processing}>Procesando imagen...</CText>
      </Switch>
      <View style={styles.content}>
        <Switch condition={!!image?.uri}>
          <View style={[styles.imageContainer, { height: imgHeight }]}>
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
          </View>
        </Switch>
        <Switch condition={!!selectedPerson}>
          <View>
            <CText style={styles.buttonText}>Nombre: {selectedPerson?.person}</CText>
            <CText style={styles.buttonText}>Score: {selectedPerson?.score}</CText>
            <CText style={styles.buttonText}>Borracho: {selectedPerson?.drunk ? 'Si' : 'No'}</CText>
            <CText style={styles.buttonText}>Edad: {selectedPerson?.age}</CText>
          </View>
        </Switch>
      </View>
      <View style={styles.buttons}>
        <Switch condition={!!error}>
          <CText style={styles.error}>{error}</CText>
        </Switch>
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
  error: {
    fontSize: 18,
    marginBottom: 16,
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
    width: WINDOWS_WIDTH,
  },
  imageContainer: {
    height: 300,
    width: WINDOWS_WIDTH,
    position: 'relative',
  }
})

export default Home


