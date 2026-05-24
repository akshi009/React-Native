import { fetchSavedIds } from '@/hooks/save_property'
import { createClerkSupabaseClient } from '@/lib/supabase'
import { useUserStore } from '@/store/userStore'
import { useAuth, useUser } from '@clerk/expo'
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

const C = {
    bg: '#F5F6FA',
    surface: '#FFFFFF',
    surfaceAlt: '#EEF0F5',
    border: '#E2E5EC',
    accent: '#2563EB',
    accentLight: '#EBF2FF',
    success: '#059669',
    danger: '#DC2626',
    textPrimary: '#0F172A',
    textSecondary: '#64748B',
    textMuted: '#94A3B8',
    white: '#FFFFFF',
}

const MENU_ITEMS = [
    {
        icon: '❤️',
        title: 'Saved Properties',
        subtitle: 'View your favourites',
        url: '/(root)/(tabs)/save'
    },
    {
        icon: '🏡',
        title: 'My Listings',
        subtitle: 'Manage your properties',
        url: '/listings'
    },

]

const Profile = () => {
    const { signOut } = useAuth()
    const router = useRouter()
    const { user } = useUser()
    const isAdmin = useUserStore(state => state.isAdmin)
    const { getToken } = useAuth();
    const supabase = createClerkSupabaseClient(getToken)
    const { data: saved, refetch } = useQuery({ queryKey: ['saved'], queryFn: () => fetchSavedIds(supabase, user?.id as string) })
    useFocusEffect(useCallback(() => { refetch() }, []))


    const initials =
        `${user?.firstName?.[0] ?? ''}${user?.lastName?.[0] ?? ''}`.toUpperCase()

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
                        paddingTop: 12,
                        paddingBottom: 24,
                    }}
                >
                    <Text
                        style={{
                            fontSize: 28,
                            fontWeight: '800',
                            color: C.textPrimary,
                        }}
                    >
                        My Profile
                    </Text>

                    <Text
                        style={{
                            color: C.textMuted,
                            marginTop: 4,
                            fontSize: 14,
                        }}
                    >
                        Manage your account and activity
                    </Text>
                </View>

                {/* Profile Card */}
                <View
                    style={{
                        marginHorizontal: 16,
                        backgroundColor: C.surface,
                        borderRadius: 28,
                        padding: 20,
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
                                    marginBottom: 14,
                                }}
                            />
                        ) : (
                            <View
                                style={{
                                    width: 96,
                                    height: 96,
                                    borderRadius: 999,
                                    backgroundColor: C.accent,
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    marginBottom: 14,
                                }}
                            >
                                <Text
                                    style={{
                                        color: C.white,
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
                                    color: C.accent,
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
                            borderRadius: 18,
                            overflow: 'hidden',
                        }}
                    >
                        {[
                            { label: 'Saved', value: saved?.length || 0 },
                            { label: 'Listed', value: '4' },
                        ].map((item, index) => (
                            <View
                                key={item.label}
                                style={{
                                    flex: 1,
                                    alignItems: 'center',
                                    paddingVertical: 16,
                                    borderRightWidth:
                                        index !== 2 ? 1 : 0,
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
                                        color: C.textMuted,
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
                                <Text style={{ fontSize: 22 }}>
                                    {item.icon}
                                </Text>
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

                            <Text
                                style={{
                                    fontSize: 18,
                                    color: C.textMuted,
                                }}
                            >
                                ›
                            </Text>
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
                            borderRadius: 18,
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