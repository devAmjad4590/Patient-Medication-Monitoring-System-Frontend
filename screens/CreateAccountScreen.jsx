import React, { useState } from 'react'
import { View, Text, StyleSheet, Pressable, Alert } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import InputField from '../components/InputField'
import PrimaryButton from '../components/PrimaryButton';
import { useNavigation } from '@react-navigation/native'
import { signUp } from '../api/authAPI';


function CreateAccountScreen() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [phoneNumber, setPhoneNumber] = useState('')
  const navigation = useNavigation()

  function emailTextHandler(text) {
    setEmail(text)
  }

  function passwordTextHandler(text) {
    setPassword(text)
  }

  async function createAccountHandler() {
    // add your code here
    if(!email || !password || !fullName || !phoneNumber) {
      Alert.alert('Invalid Input', 'Please fill up all the fields.', [
        { text: 'OK', style: 'default' }
      ])
      return
    }
    const user = {
      name: fullName,
      email: email,
      password: password,
      fullName: fullName,
      phoneNumber: phoneNumber
    }

    try{
      const res = await signUp(user);
      if(res.status === 201) {
        console.log('Account created successfully:', res.data);
        navigation.navigate('Login')
      }
    }
    catch(err){
      Alert.alert('Invalid Credentials', err.response.data.message, [
        { text: 'OK', style: 'default' }
      ])
    }
  }

  function loginHandler() {
    navigation.navigate('Login')
  }

  function fullNameHandler(text){
    setFullName(text)
  }

  function phoneNumberHandler(text){
    setPhoneNumber(text)
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
        </View>
        {/* Bottom half */}
        <View style={styles.bottomHalf}>
          <Text style={styles.welcomeText}>Create Your Account</Text>
          <InputField onChange={fullNameHandler} placeholder={"Full Name"}></InputField>
          <InputField onChange={emailTextHandler} placeholder={"Email"}></InputField>
          <InputField onChange={phoneNumberHandler} placeholder={"Phone number"}></InputField>
          <InputField onChange={passwordTextHandler} isPassword={true} placeholder={"Password"}></InputField>
          <View style={styles.footer}>
              <Pressable onPress={loginHandler}>
            <Text>Already have an account?
                <Text style={styles.blueText}> Login</Text>
            </Text>
              </Pressable>
          </View>
          <PrimaryButton onPress={createAccountHandler}>Create Account</PrimaryButton>

        </View>
      </LinearGradient>
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
  footer: {
    width: '80%',
    alignItems: 'center',
    marginBottom: 50,
  },
  blueText: {
    color: '#2F7EF5',
  },
  bottomHalf: {
    flex: 8,
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

export default CreateAccountScreen