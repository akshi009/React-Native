import { useAuth, useUser } from '@clerk/expo'
import { Ionicons } from '@expo/vector-icons'
import { useQuery } from '@tanstack/react-query'
import { useFocusEffect, useRouter } from 'expo-router'
import React, { useCallback } from 'react'
import {
    Image,
    ScrollView,
    Text,
    TouchableOpacity,
    View,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { fetchSavedIds } from '../../../hooks/save_property'
import { createClerkSupabaseClient } from '../../../lib/supabase'
import { useProductStore } from '../../../store/productStore'
import { useUserStore } from '../../../store/userStore'

const C = {
    bg: '#F7F7F7',
    surface: '#FFFFFF',
    surfaceAlt: '#F2F3F5',
    border: '#EBEBEB',
    accent: '#111111',
    accentLight: '#F2F3F5',
    success: '#059669',
    danger: '#DC2626',
    textPrimary: '#111111',
    textSecondary: '#555555',
    textMuted: '#AAAAAA',
    white: '#FFFFFF',
}

const MENU_ITEMS = [
    {
        icon: 'heart-outline',
        title: 'Saved Properties',
        subtitle: 'View your favourites',
        url: '/(root)/(tabs)/save'
    },
    {
        icon: 'home-outline',
        title: 'My Listings',
        subtitle: 'Manage your properties',
        url: '/(root)/(tabs)/create'
    },
]

const Profile = () => {
    const { signOut } = useAuth()
    const router = useRouter()
    const { user } = useUser()
    const isAdmin = useUserStore(state => state.isAdmin)
    const { getToken } = useAuth()
    const supabase = createClerkSupabaseClient(getToken)
    const { data: saved, refetch } = useQuery({ queryKey: ['saved'], queryFn: () => fetchSavedIds(supabase, user?.id as string) })
    useFocusEffect(useCallback(() => { refetch() }, []))

    const initials =
        `${user?.firstName?.[0] ?? ''}${user?.lastName?.[0] ?? ''}`.toUpperCase()

    const properties = useProductStore((state: any) => state.properties ?? [])
    const owner_property = properties?.filter((p: any) => p.owner_email === user?.emailAddresses?.[0]?.emailAddress)

    return (
        <SafeAreaView
            style={{
                flex: 1,
                backgroundColor: C.bg,
            }}
        >
            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{
                    paddingBottom: 40,
                }}
            >
                {/* Header */}
                <View
                    style={{
                        paddingHorizontal: 20,
                        paddingTop: 20,
                        paddingBottom: 24,
                    }}
                >
                    {/* <Text
                        style={{
                            fontSize: 28,
                            fontWeight: '800',
                            color: C.textPrimary,
                            lineHeight: 40,
                            letterSpacing: -0.5,
                        }}
                    >
                        My Profile
                    </Text> */}


                </View>

                {/* Profile Card */}
                <View
                    style={{
                        marginHorizontal: 16,
                        backgroundColor: C.surface,
                        borderRadius: 24,
                        padding: 24,
                        borderWidth: 1,
                        borderColor: C.border,
                        marginBottom: 22,
                    }}
                >
                    {/* Top section */}
                    <View
                        style={{
                            alignItems: 'center',
                        }}
                    >
                        {user?.imageUrl ? (
                            <Image
                                source={{ uri: user.imageUrl }}
                                style={{
                                    width: 96,
                                    height: 96,
                                    borderRadius: 999,
                                    borderWidth: 1,
                                    borderColor: C.border,
                                    marginBottom: 14,
                                }}
                            />
                        ) : (
                            <View
                                style={{
                                    width: 96,
                                    height: 96,
                                    borderRadius: 999,
                                    backgroundColor: C.surfaceAlt,
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    borderWidth: 1,
                                    borderColor: C.border,
                                    marginBottom: 14,
                                }}
                            >
                                <Text
                                    style={{
                                        color: C.textPrimary,
                                        fontSize: 28,
                                        fontWeight: '800',
                                    }}
                                >
                                    {initials}
                                </Text>
                            </View>
                        )}

                        <Text
                            style={{
                                fontSize: 22,
                                fontWeight: '800',
                                color: C.textPrimary,
                            }}
                        >
                            {user?.fullName}
                        </Text>

                        <Text
                            style={{
                                color: C.textSecondary,
                                fontSize: 14,
                                marginTop: 4,
                            }}
                        >
                            {user?.emailAddresses?.[0]?.emailAddress}
                        </Text>

                        <View
                            style={{
                                marginTop: 14,
                                backgroundColor: C.accentLight,
                                paddingHorizontal: 14,
                                paddingVertical: 6,
                                borderRadius: 999,
                            }}
                        >
                            <Text
                                style={{
                                    color: C.textPrimary,
                                    fontWeight: '700',
                                    fontSize: 12,
                                }}
                            >
                                {isAdmin ? 'Admin' : 'Member'}
                            </Text>
                        </View>
                    </View>

                    {/* Stats */}
                    <View
                        style={{
                            flexDirection: 'row',
                            marginTop: 24,
                            backgroundColor: C.surfaceAlt,
                            borderRadius: 16,
                            overflow: 'hidden',
                        }}
                    >
                        {[
                            { label: 'Saved', value: saved?.length || 0 },
                            { label: 'Listed', value: owner_property?.length || 0 },
                        ].map((item, index) => (
                            <View
                                key={item.label}
                                style={{
                                    flex: 1,
                                    alignItems: 'center',
                                    paddingVertical: 14,
                                    borderRightWidth: index === 0 ? 1 : 0,
                                    borderColor: C.border,
                                }}
                            >
                                <Text
                                    style={{
                                        fontSize: 18,
                                        fontWeight: '800',
                                        color: C.textPrimary,
                                    }}
                                >
                                    {item.value}
                                </Text>

                                <Text
                                    style={{
                                        fontSize: 12,
                                        color: C.textSecondary,
                                        marginTop: 3,
                                    }}
                                >
                                    {item.label}
                                </Text>
                            </View>
                        ))}
                    </View>
                </View>

                {/* Menu */}
                <View
                    style={{
                        paddingHorizontal: 16,
                        gap: 12,
                    }}
                >
                    {MENU_ITEMS.map((item) => (
                        <TouchableOpacity
                            key={item.title}
                            activeOpacity={0.85}
                            onPress={() => router.push(item.url as any)}
                            style={{
                                backgroundColor: C.surface,
                                borderRadius: 20,
                                padding: 16,
                                flexDirection: 'row',
                                alignItems: 'center',
                                borderWidth: 1,
                                borderColor: C.border,
                            }}
                        >
                            <View
                                style={{
                                    width: 48,
                                    height: 48,
                                    borderRadius: 14,
                                    backgroundColor: C.surfaceAlt,
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    marginRight: 14,
                                }}
                            >
                                <Ionicons name={item.icon as any} size={20} color={C.textPrimary} />
                            </View>

                            <View style={{ flex: 1 }}>
                                <Text
                                    style={{
                                        fontSize: 15,
                                        fontWeight: '700',
                                        color: C.textPrimary,
                                    }}
                                >
                                    {item.title}
                                </Text>

                                <Text
                                    style={{
                                        fontSize: 12,
                                        color: C.textMuted,
                                        marginTop: 2,
                                    }}
                                >
                                    {item.subtitle}
                                </Text>
                            </View>

                            <Ionicons name="chevron-forward" size={18} color={C.textMuted} />
                        </TouchableOpacity>
                    ))}
                </View>

                {/* Logout */}
                <View
                    style={{
                        paddingHorizontal: 16,
                        marginTop: 28,
                    }}
                >
                    <TouchableOpacity
                        activeOpacity={0.85}
                        style={{
                            backgroundColor: C.textPrimary,
                            paddingVertical: 16,
                            borderRadius: 16,
                            alignItems: 'center',
                        }}
                        onPress={async () => {
                            await signOut()
                            router.replace('/(auth)/sign-in')
                        }}
                    >
                        <Text
                            style={{
                                color: C.white,
                                fontWeight: '800',
                                fontSize: 15,
                            }}
                        >
                            Logout
                        </Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </SafeAreaView>
    )
}

export default Profile
