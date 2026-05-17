import React from 'react'
import { Controller, useForm } from 'react-hook-form'
import { Image, Keyboard, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import Toast from 'react-native-toast-message'
import { style } from './signup.style'

const SignUp = () => {
    const { handleSubmit, control, reset } = useForm()

    const onSubmit = async (data: any) => {
        Keyboard.dismiss()
        try {
            console.log(data)
            Toast.show({
                type: 'success',
                text1: 'Account created successfully!',
            })
            reset()
        } catch (error) {
            console.log(error)
            Toast.show({
                type: 'error',
                text1: 'Error creating account!',
            })
        }
    }

    return (
        <SafeAreaView style={{ flex: 1 }}>
            <ScrollView keyboardShouldPersistTaps="handled">
                <View style={style.container}>
                    <Image
                        source={require('../../assets/images/kribb.png')}
                        style={style.logo}
                        resizeMode='contain'
                    />

                    <Text style={style.heading}>Sign Up</Text>

                    <Text style={style.subHeading}>
                        Find Your Dream House Today!
                    </Text>

                    <View style={style.signupForm}>
                        <Controller
                            control={control}
                            name="fullName"
                            rules={{ required: "Full name is required" }}
                            render={({ field: { onChange, value }, fieldState: { error } }) => (
                                <>
                                    <TextInput
                                        style={style.input}
                                        onChangeText={onChange}
                                        value={value}
                                        placeholder="Full Name"
                                        placeholderTextColor="#9CA3AF"
                                        autoCapitalize='words'
                                    />
                                    {error && <Text style={style.errorText}>{error.message}</Text>}
                                </>
                            )}
                        />
                        <Controller
                            control={control}
                            name='email'
                            rules={{
                                required: "Email is required",
                                pattern: { value: /^\S+@\S+\.\S+$/, message: "Enter a valid email" }
                            }}
                            render={({ field: { onChange, value }, fieldState: { error } }) => (
                                <>
                                    <TextInput
                                        style={style.input}
                                        onChangeText={onChange}
                                        value={value}
                                        placeholder="Email Address"
                                        placeholderTextColor="#9CA3AF"
                                        autoCapitalize='none'
                                    />
                                    {error && <Text style={style.errorText}>{error.message}</Text>}
                                </>
                            )}
                        />
                        <Controller
                            control={control}
                            name='phone'
                            rules={{ required: "Phone number is required" }}
                            render={({ field: { onChange, value }, fieldState: { error } }) => (
                                <>
                                    <TextInput
                                        style={style.input}
                                        placeholder="Phone Number"
                                        onChangeText={onChange}
                                        value={value}
                                        placeholderTextColor="#9CA3AF"
                                    />
                                    {error && <Text style={style.errorText}>{error.message}</Text>}
                                </>
                            )}
                        />
                        <Controller
                            control={control}
                            name='password'
                            rules={{
                                required: "Password is required",
                                minLength: { value: 6, message: "Minimum 6 characters" }
                            }}
                            render={({ field: { onChange, value }, fieldState: { error } }) => (
                                <>
                                    <TextInput
                                        style={style.input}
                                        onChangeText={onChange}
                                        value={value}
                                        placeholder="Password"
                                        placeholderTextColor="#9CA3AF"
                                        autoCapitalize='none'
                                        secureTextEntry
                                    />
                                    {error && <Text style={style.errorText}>{error.message}</Text>}
                                </>
                            )}
                        />
                        <Controller
                            control={control}
                            name='confirmPassword'
                            rules={{ required: "Please confirm your password" }}
                            render={({ field: { onChange, value }, fieldState: { error } }) => (
                                <>
                                    <TextInput
                                        style={style.input}
                                        onChangeText={onChange}
                                        value={value}
                                        placeholder="Confirm Password"
                                        placeholderTextColor="#9CA3AF"
                                        autoCapitalize='none'
                                        secureTextEntry
                                    />
                                    {error && <Text style={style.errorText}>{error.message}</Text>}
                                </>
                            )}
                        />
                        <TouchableOpacity
                            style={style.submitButton}
                            onPress={handleSubmit(onSubmit)}
                        >
                            <Text style={style.submitButtonText}>
                                Sign Up
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    )
}

export default SignUp