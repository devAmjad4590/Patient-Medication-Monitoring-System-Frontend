import React, { useState } from 'react'
import { View, Text, StyleSheet, Image, Pressable, Alert } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import SecondaryButton from '../components/SecondaryButton'
import InputField from '../components/InputField'
import { useNavigation } from '@react-navigation/native'
import { login } from '../api/authAPI'
import { useAuth } from '../AuthContext' // Import useAuth

function LoginScreen() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const navigation = useNavigation()
  const { login: setAuthUser } = useAuth() // Get login function from context

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
      setIsLoading(true)
      const response = await login(email, password)
      
      if(response.status === 201) {
        console.log('Login successful:', response.data);
        
        // Set user in auth context - this will automatically navigate to authenticated screens
        setAuthUser(response.data.user)
        
        // Note: No need to manually navigate since App.jsx will handle this based on isAuthenticated
      }
    }
    catch (error) {
      console.log('Login error:', error)
      Alert.alert('Login Failed', 'Please check your email and password.', [
        { text: 'OK', style: 'default' }
      ])
    } finally {
      setIsLoading(false)
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
          <InputField onChange={emailTextHandler} placeholder={"Email"} testID="email-input"></InputField>
          <InputField onChange={passwordTextHandler} isPassword={true} placeholder={"Password"} testID="password-input"></InputField>
          <View style={styles.footer}>
              <Pressable onPress={signUpHandler}>
            <Text style={{color: 'black'}}>New user?
                <Text style={styles.blueText}> Sign Up</Text>
            </Text>
              </Pressable>
          </View>
          <SecondaryButton onPress={loginHandler} disabled={isLoading}>
            {isLoading ? 'Logging in...' : 'Login'}
          </SecondaryButton>
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
    fontWeight: '600', // Fixed from 'semi-bold'
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
    color: 'black'
  }
})

export default LoginScreen