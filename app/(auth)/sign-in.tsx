import { supabase } from '@/lib/supabase'
import { useAuth, useSignIn, useUser } from '@clerk/expo'
import { Link, useRouter } from 'expo-router'
import React, { useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { Image, Keyboard, ScrollView, Text, TextInput, TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import Toast from 'react-native-toast-message'
import { style } from './signup.style'

const SignIn = () => {
    const { control, handleSubmit, reset } = useForm()
    const { signIn, fetchStatus, errors } = useSignIn()
    const [code, setCode] = useState<any>('')
    const { isSignedIn, isLoaded } = useAuth()
    const { user } = useUser()
    const router = useRouter()
    const loading = fetchStatus === "fetching"
    if (signIn.status === 'complete' || isSignedIn) {
        return null
    }



    const onSubmit = async (data: any) => {
        Keyboard.dismiss()
        try {
            const { error: usererror } = await supabase.from('user').select().eq('email', data.email).single()
            if (!usererror) {
                alert("Please create account before logging in")
                router.replace("/(auth)/sign-up")
                return
            }
            const { error } = await signIn?.password({
                emailAddress: data.email,
                password: data.password,
            })
            if (error) {
                alert(error.message)
                return
            }
            if (signIn.status === 'complete') {
                await signIn.finalize({
                    navigate: ({ session, decorateUrl }) => {
                        if (session.currentTask) {
                            console.log("current task", session.currentTask)
                            return
                        }
                        const url = decorateUrl("/")
                        router.replace(url as any)
                    }
                })
                Toast.show({
                    type: 'success',
                    text1: 'Logged In successfully',
                })
            }
            else if (signIn.status === 'needs_client_trust') {
                const emailcode = signIn.supportedSecondFactors.find((item) => item.strategy === 'email_code')
                if (emailcode) {
                    await signIn.mfa.sendEmailCode()
                }
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
            const { error } = await signIn?.mfa.verifyEmailCode({
                code,
            })
            if (error) {
                alert(error.message)
                return
            }
            if (signIn.status === 'complete') {

                signIn.finalize({
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

    if (signIn.status === 'needs_client_trust') {
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
                                            placeholderTextColor="#9CA3AF"
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
                                    <TouchableOpacity onPress={async () => { await signIn?.mfa.sendEmailCode(); setCode('') }}><Text style={{ color: "#008080", fontWeight: "bold" }}>
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

                        <Text style={style.heading}>Sign In</Text>

                        <Text style={style.subHeading}>
                            Welcome Back
                        </Text>

                        <View style={style.signupForm}>
                            <View style={style.row}>


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
                                                    placeholderTextColor="#9CA3AF"
                                                    autoCapitalize='none'
                                                />
                                                {error && <Text style={style.errorText}>{error.message}</Text>}
                                            </>
                                        )}
                                    />
                                </View>

                            </View>

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
                            <TouchableOpacity
                                disabled={loading}
                                style={style.submitButton}
                                onPress={handleSubmit(onSubmit)}
                            >
                                <Text style={style.submitButtonText}>
                                    Sign In
                                </Text>
                            </TouchableOpacity>
                            <View style={[style.row, { marginTop: 10, alignItems: "center", justifyContent: "center" }]}>
                                <Text>Still Don't have an account? </Text>
                                <Link href="/sign-up">
                                    <Text style={{ color: "#008080", fontWeight: "bold" }}>Sign Up</Text>
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

export default SignIn