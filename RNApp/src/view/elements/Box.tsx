import { StyleSheet, TouchableOpacity, Dimensions } from 'react-native'
import React from 'react'
import { Person } from '../screens/Home'
import { TYPOGRAPHY } from '../styles/typography'

const WINDOWS_WIDTH = Dimensions.get('window').width

type Props = {
    imgHeight: number
    person: Person
    onSelectPerson: () => void
    height: number
    width: number
}

const Box: React.FC<Props> = ({ imgHeight, person, onSelectPerson, width, height }) => {
    const { box, drunk } = person

    const firstVertexWidth = (box[0] * WINDOWS_WIDTH) / width
    const firstVertexHeight = (box[1] * imgHeight) / height
    const secondVertexWidth = (box[2] * WINDOWS_WIDTH) / width
    const secondVertexHeight = (box[3] * imgHeight) / height

    const boxWidth = secondVertexWidth - firstVertexWidth
    const boxHeight = secondVertexHeight - firstVertexHeight
    return (
        <TouchableOpacity onPress={onSelectPerson} style={[styles.container,{
            position: 'absolute',
            left: firstVertexWidth,
            top: firstVertexHeight,
            width: boxWidth,
            height: boxHeight,
            borderColor: drunk ?
                TYPOGRAPHY.COLOR.Danger :
                TYPOGRAPHY.COLOR.Success
        }]} />
    )
}

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        borderWidth: 1,
    },
})

export default Box
