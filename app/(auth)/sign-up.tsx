import { useAuth, useSignUp } from '@clerk/expo'
import { Link, useRouter } from 'expo-router'
import React, { useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { Image, Keyboard, ScrollView, Text, TextInput, TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import Toast from 'react-native-toast-message'
import { style } from './signup.style'

const SignUp = () => {
    const { control, handleSubmit, reset } = useForm()
    const { signUp, fetchStatus, errors } = useSignUp()
    const [code, setCode] = useState<any>('')
    const { isSignedIn } = useAuth()
    const router = useRouter()
    const loading = fetchStatus === "fetching"
    if (signUp.status === 'complete' || isSignedIn) {
        return null
    }

    const onSubmit = async (data: any) => {
        Keyboard.dismiss()
        try {
            const { error } = await signUp?.password({
                firstName: data.firstName,
                lastName: data.lastName,
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
            setCode('')
        } catch (error) {
            console.log(error)
            Toast.show({
                type: 'error',
                text1: 'Error creating account!',
            })
        }
    }

    const handleVerifyCode = async () => {
        Keyboard.dismiss()
        try {
            const { error } = await signUp?.verifications.verifyEmailCode({
                code,
            })
            if (error) {
                alert(error.message)
                return
            }
            if (signUp.status === 'complete') {

                signUp.finalize({
                    navigate: ({ decorateUrl }) => {
                        const url = decorateUrl("/")
                        console.log(url)
                        router.replace(url as any)
                    }
                })
                Toast.show({
                    type: 'success',
                    text1: 'Account created successfully',
                })
                setCode('')

            }
        }
        catch (error) {
            console.log(error)
            Toast.show({
                type: 'error',
                text1: 'Error creating account!',
            })
        }
    }

    if (signUp.status === 'missing_requirements' && signUp.unverifiedFields.includes('email_address') && signUp.missingFields.length === 0) {
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
                                Enter Verfication Code sent to your email
                            </Text>
                            <View style={style.signupForm}>
                                <View style={style.row}>

                                    <View style={style.flexInput}>
                                        <TextInput
                                            style={style.input}
                                            onChangeText={setCode}
                                            value={code}
                                            placeholder="Enter Verification Code"
                                            keyboardType='number-pad'
                                        />

                                    </View>

                                </View>
                                <TouchableOpacity
                                    style={style.submitButton}
                                    onPress={handleVerifyCode}
                                    disabled={loading}
                                >
                                    <Text style={style.submitButtonText}>
                                        {loading ? 'Verifying...' : 'Verify Account'}
                                    </Text>
                                </TouchableOpacity>
                                <Text style={{
                                    marginTop: 10,
                                    textAlign: 'center',
                                }}>
                                    Didn't receive a verification code?
                                    (Even Though We send you but still..)
                                    <TouchableOpacity onPress={async () => { await signUp?.verifications.sendEmailCode(); setCode('') }}><Text style={{ color: "#008080", fontWeight: "bold" }}>
                                        Resend Code</Text></TouchableOpacity>
                                </Text>
                            </View>
                        </View>
                    </ScrollView>
                </TouchableWithoutFeedback>
            </SafeAreaView>
        )
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
                                        name="firstName"
                                        rules={{ required: "First Name is required" }}
                                        render={({ field: { onChange, value }, fieldState: { error } }) => (
                                            <>
                                                <TextInput
                                                    style={style.input}
                                                    onChangeText={onChange}
                                                    value={value}
                                                    placeholder="First Name"
                                                    placeholderTextColor="#9CA3AF"
                                                />
                                                {error && <Text style={style.errorText}>{error.message}</Text>}
                                            </>
                                        )}
                                    />
                                </View>

                                <View style={style.flexInput}>
                                    <Controller
                                        control={control}
                                        name="lastName"
                                        rules={{ required: "Last Name is required" }}
                                        render={({ field: { onChange, value }, fieldState: { error } }) => (
                                            <>
                                                <TextInput
                                                    style={style.input}
                                                    onChangeText={onChange}
                                                    value={value}
                                                    placeholder="Last Name"
                                                    placeholderTextColor="#9CA3AF"
                                                />
                                                {error && <Text style={style.errorText}>{error.message}</Text>}
                                            </>
                                        )}
                                    />
                                </View>
                            </View>


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
                                            placeholderTextColor="#9CA3AF"
                                        />
                                        {error && <Text style={style.errorText}>{error.message}</Text>}
                                    </>
                                )}
                            />




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
                            {/* <Controller
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
                                            secureTextEntr
                                        />

                                    </>
                                )}
                            /> */}
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