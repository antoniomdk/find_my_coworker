import { SafeAreaView, StyleSheet } from 'react-native'
import { TYPOGRAPHY } from '../styles/typography'
import React from 'react'
import { CText } from '../elements/custom'

const Settings: React.FC = () => {
  return (
    <SafeAreaView>
      <CText>Settings</CText>
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

export default Settings
