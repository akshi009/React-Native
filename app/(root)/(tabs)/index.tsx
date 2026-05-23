import { useUserStore } from '@/store/userStore'
import React from 'react'
import { Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

export default function Home() {
    const isAdmin = useUserStore(state => state.isAdmin)
    return (
        <SafeAreaView>
            <View>
                <Text>Home {isAdmin ? "Admin" : "User"}</Text>
            </View>
        </SafeAreaView>
    )
}