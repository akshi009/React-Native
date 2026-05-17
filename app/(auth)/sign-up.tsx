import { useAuth, useSignUp } from '@clerk/expo'
import { Link, useRouter } from 'expo-router'
import React from 'react'
import { Controller, useForm } from 'react-hook-form'
import { Image, Keyboard, ScrollView, Text, TextInput, TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import Toast from 'react-native-toast-message'
import { style } from './signup.style'

const SignUp = () => {
    const { control, handleSubmit, reset } = useForm()
    const { signUp, fetchStatus, errors } = useSignUp()
    const { isSignedIn } = useAuth()
    const router = useRouter()
    const loading = fetchStatus === "fetching"

    const onSubmit = async (data: any) => {
        Keyboard.dismiss()
        try {
            const { error } = await signUp?.password({
                firstName: data.fullName,
                emailAddress: data.email,
                password: data.password,
            })
            if (error) {
                alert(error.message)
                return
            }
            if (!error) {
                signUp?.verifications.sendEmailCode()
                Toast.show({
                    type: 'success',
                    text1: 'Verfication code sent to your email',
                })
            }

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
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
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
                            <View style={style.row}>

                                <View style={style.flexInput}>
                                    <Controller
                                        control={control}
                                        name="fullName"
                                        rules={{ required: "Full Name is required" }}
                                        render={({ field: { onChange, value }, fieldState: { error } }) => (
                                            <>
                                                <TextInput
                                                    style={style.input}
                                                    onChangeText={onChange}
                                                    value={value}
                                                    placeholder="Full Name"
                                                />
                                                {error && <Text style={style.errorText}>{error.message}</Text>}
                                            </>
                                        )}
                                    />
                                </View>

                                <View style={style.flexInput}>
                                    <Controller
                                        control={control}
                                        name="email"
                                        rules={{ required: "Email is required" }}
                                        render={({ field: { onChange, value, }, fieldState: { error } }) => (
                                            <>
                                                <TextInput
                                                    style={style.input}
                                                    onChangeText={onChange}
                                                    value={value}
                                                    placeholder="Email"
                                                    keyboardType='email-address'
                                                    autoCapitalize='none'
                                                />
                                                {error && <Text style={style.errorText}>{error.message}</Text>}
                                            </>
                                        )}
                                    />
                                </View>

                            </View>

                            {/* <Controller
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
                            /> */}
                            <Controller
                                control={control}
                                name='password'
                                rules={{
                                    required: "Password is required",
                                    minLength: { value: 8, message: "Minimum 6 characters" }
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

                                    </>
                                )}
                            />
                            <TouchableOpacity
                                disabled={loading}
                                style={style.submitButton}
                                onPress={handleSubmit(onSubmit)}
                            >
                                <Text style={style.submitButtonText}>
                                    Sign Up
                                </Text>
                            </TouchableOpacity>
                            <View style={[style.row, { marginTop: 10, alignItems: "center", justifyContent: "center" }]}>
                                <Text>Already have an account? </Text>
                                <Link href="/sign-in">
                                    <Text style={{ color: "#008080", fontWeight: "bold" }}>Sign In</Text>
                                </Link>
                            </View>
                            <View nativeID='clerk-captcha' />
                        </View>
                    </View>
                </ScrollView>
            </TouchableWithoutFeedback>
        </SafeAreaView>
    )
}

export default SignUp