import * as React from 'react'
import { SafeAreaView, StyleSheet } from 'react-native'
import { CText } from '../elements/custom'
import { TYPOGRAPHY } from '../styles/typography'

const Drawer: React.FC = () => {
  return (
    <SafeAreaView style={styles.container}>
      <CText>Drawer Menu</CText>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    display: 'flex',
    backgroundColor: TYPOGRAPHY.COLOR.Default,
  },
})

export default Drawer




