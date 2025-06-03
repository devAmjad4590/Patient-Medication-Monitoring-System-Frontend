import React from 'react'
import { View, Text, StyleSheet } from 'react-native'
import FontAwesome from '@expo/vector-icons/FontAwesome';

function ProfileCard({fullName, email}) {
  return (
    <View style={styles.profileContainer}>
        <View style={styles.iconContainer}>
        <FontAwesome name="user-circle" size={60} color="black" />
        </View>
        <View style={styles.userContainer}>
            <Text style={styles.nameText}>{fullName}</Text>
            <Text style={styles.emailText}>{email}</Text>
        </View>
    </View>
  )
}

const styles = StyleSheet.create({
    profileContainer:{
        flexDirection: 'row',
        flex: 1,
        paddingHorizontal: 10,
        gap: 0,
        justifyContent: 'center',
        alignContent: 'center'
    },
    iconContainer:{
        flex: 1.3,
        justifyContent: 'center',
        alignContent: 'center'
    },
    userContainer:{
        flex: 4,
        gap: 5,
        justifyContent: 'center',
        alignContent: 'center'
    },
    nameText:{
        fontSize: 20,
        fontWeight: 'bold',
        color: 'black'
    },
    emailText:{
        fontSize: 10,
        color: 'black'
    }
})

export default ProfileCard
