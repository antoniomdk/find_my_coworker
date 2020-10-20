import { SafeAreaView, StyleSheet, TouchableOpacity, Image } from 'react-native'
import { TYPOGRAPHY } from '../styles/typography'
import React from 'react'
import { CText } from '../elements/custom'
import { Navigation } from 'react-native-navigation'

const Home: React.FC = () => {
  const showBurgerMenu = () => {
    Navigation.mergeOptions('drawerComponentId', {
      sideMenu: {
        left: {
          visible: true,
        },
      },
    });
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
      <CText>Home</CText>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    display: 'flex',
    backgroundColor: TYPOGRAPHY.COLOR.Default,
    marginHorizontal: 10,
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
  },
})

export default Home
