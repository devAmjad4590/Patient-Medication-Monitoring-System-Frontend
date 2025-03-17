import React from 'react'
import { View, Text, StyleSheet, Image, SafeAreaView } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import PrimaryButton from '../components/PrimaryButton'
import SecondaryButton from '../components/SecondaryButton'
import { StatusBar } from 'expo-status-bar';
import { useNavigation } from '@react-navigation/native'


function WelcomeScreen() {
    const navigation = useNavigation()
    function createAccountHandler(){
        navigation.navigate('CreateAccount')
    }
    function loginHandler(){
        navigation.navigate('Login')
    }
    return (
        <SafeAreaView style={styles.safeArea}>
            <StatusBar style="light" />
            <LinearGradient 
                colors={['#7313B2', '#2F7EF5']} 
                start={{ x: 0, y: 0 }} 
                end={{ x: 1, y: 0 }}
                style={styles.root}
            >
                {/* Top half */}
                <View style={styles.topHalf}>
                    <Image style={styles.image} source={require('../assets/app-icon.png')} />
                    <Text style={styles.title}>CareMate</Text>
                </View>
                {/* Bottom half */}
                <View style={styles.bottomHalf}>
                    <Text style={styles.welcomeText}>Welcome!</Text>
                    <PrimaryButton onPress={createAccountHandler}>Create Account</PrimaryButton>
                    <SecondaryButton onPress={loginHandler}>Login</SecondaryButton>
                </View>
            </LinearGradient>
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
    },
    root: {
        flex: 1,
        backgroundColor: 'red',
    },
    topHalf: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden',
    },
    bottomHalf: {
        flex: 2.3,
        alignItems: 'center',
        backgroundColor: 'white',
        borderTopLeftRadius: 40,
        borderTopRightRadius: 40,
        paddingTop: 50,
    },
    title: {
        fontSize: 40,
        fontWeight: 'semi-bold',
        bottom: 30,
        color: 'white',
    },
    image: {
        width: 150,
        height: 150,
    },
    welcomeText: {
        fontSize: 30,
        marginVertical: 20,
        marginBottom: 40,
    }
})

export default WelcomeScreen