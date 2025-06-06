import React, { useState } from 'react'
import { View, Text, StyleSheet, Image, Pressable, Alert } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import SecondaryButton from '../components/SecondaryButton'
import InputField from '../components/InputField'
import { useNavigation } from '@react-navigation/native'
import { getURL, login } from '../api/authAPI'

function LoginScreen() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const navigation = useNavigation()

  function emailTextHandler(text) {
    setEmail(text)
  }

  function passwordTextHandler(text) {
    setPassword(text)
  }

  async function loginHandler() {
    if(!email || !password) {
      Alert.alert('Invalid Input', 'Please enter a valid email and password.', [
        { text: 'OK', style: 'default' }
      ])
      return
    }
    try{
      const response = await login(email, password)
      if(response.status === 201) {
        console.log('Login successful:', response.data);
        navigation.navigate('Drawer')
      }
    }
    catch (error) {
      Alert.alert('Invalid Input', 'Please enter a valid email and password.', [
        { text: 'OK', style: 'default' }
      ])
    }
  }

  function signUpHandler() {
    navigation.navigate('CreateAccount')
    
  }



  return (
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
          <Text style={styles.welcomeText}>Welcome back!</Text>
          <InputField onChange={emailTextHandler} placeholder={"Email"}></InputField>
          <InputField onChange={passwordTextHandler} isPassword={true} placeholder={"Password"}></InputField>
          <View style={styles.footer}>
              <Pressable onPress={signUpHandler}>
            <Text>New user?
                <Text style={styles.blueText}> Sign Up</Text>
            </Text>
              </Pressable>
          </View>
          <SecondaryButton onPress={loginHandler}>Login</SecondaryButton>

        </View>
      </LinearGradient>
  )
}

const styles = StyleSheet.create({


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
  footer: {
    width: '80%',
    alignItems: 'center',
    marginBottom: 50,
  },
  blueText: {
    color: '#2F7EF5',

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

export default LoginScreen