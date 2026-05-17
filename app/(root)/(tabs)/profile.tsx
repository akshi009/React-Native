import { useAuth } from '@clerk/expo'
import { useRouter } from 'expo-router'
import React from 'react'
import { Text, TouchableOpacity, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

const profile = () => {
    const { signOut } = useAuth()
    const router = useRouter()
    return (
        <SafeAreaView style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <View>
                <Text>profile</Text>
                <TouchableOpacity
                    style={{
                        backgroundColor: "#008080",
                        padding: 10,
                        borderRadius: 10,
                        marginTop: 10,
                        alignItems: "center",
                        width: '100%',
                    }}
                    onPress={async () => {
                        await signOut();
                        // router.replace('/sign-in')

                    }}>
                    <Text style={{ color: "#fff", fontWeight: 'bold' }}>Logout</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    )
}

export default profile