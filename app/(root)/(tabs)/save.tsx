import { useAuth, useUser } from '@clerk/expo'
import { useQuery } from '@tanstack/react-query'
import { router, useFocusEffect } from 'expo-router'
import React, { useCallback, useMemo } from 'react'
import {
    FlatList,
    Text,
    View,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { PropertyCard } from '../../../components/PropertyCard'
import { fetchSavedIds, toggleSave } from '../../../hooks/save_property'
import { createClerkSupabaseClient } from '../../../lib/supabase'
const C = {
    bg: '#F5F6FA',
    surface: '#FFFFFF',
    surfaceAlt: '#EEF0F5',
    border: '#E2E5EC',
    accent: '#2563EB',
    accentLight: '#EBF2FF',
    accentText: '#1D4ED8',
    success: '#059669',
    successLight: '#D1FAE5',
    danger: '#DC2626',
    dangerLight: '#FEE2E2',
    textPrimary: '#0F172A',
    textSecondary: '#64748B',
    textMuted: '#94A3B8',
    white: '#FFFFFF',
}

const Save = () => {
    const { user } = useUser()
    const { getToken } = useAuth()

    const supabase = useMemo(
        () => createClerkSupabaseClient(getToken),
        [getToken]
    )

    const {
        data: saved,
        refetch,
        isLoading,
    } = useQuery({
        queryKey: ['saved'],
        queryFn: () => fetchSavedIds(supabase, user?.id as string),
        enabled: !!user?.id,
    })

    useFocusEffect(
        useCallback(() => {
            refetch()
        }, [refetch])
    )


    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: C.bg }} >
            <FlatList
                data={saved || []}
                keyExtractor={(item: any) => item.id}
                numColumns={2}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{
                    paddingHorizontal: 16,
                    paddingBottom: 30,
                    gap: 12,
                }}
                columnWrapperStyle={{
                    gap: 12,
                }}
                ListHeaderComponent={
                    <View
                        style={{
                            paddingTop: 10,
                            paddingBottom: 18,
                        }}
                    >
                        <Text
                            style={{
                                fontSize: 24,
                                fontWeight: '800',
                                color: C.textPrimary,
                            }}
                        >
                            Saved Properties ❤️
                        </Text>

                        <Text
                            style={{
                                fontSize: 13,
                                color: C.textMuted,
                                marginTop: 4,
                            }}
                        >
                            Your favourite saved listings
                        </Text>
                    </View>
                }
                ListEmptyComponent={
                    !isLoading ? (
                        <View
                            style={{
                                flex: 1,
                                justifyContent: 'center',
                                alignItems: 'center',
                                paddingHorizontal: 32,
                                marginTop: 120,
                            }}
                        >
                            <Text
                                style={{
                                    fontSize: 50,
                                    marginBottom: 12,
                                }}
                            >
                                🤍
                            </Text>

                            <Text
                                style={{
                                    fontSize: 18,
                                    fontWeight: '700',
                                    color: C.textPrimary,
                                    marginBottom: 6,
                                }}
                            >
                                No saved properties
                            </Text>

                            <Text
                                style={{
                                    textAlign: 'center',
                                    color: C.textMuted,
                                    lineHeight: 22,
                                }}
                            >
                                Save properties from the home page and they’ll appear here.
                            </Text>
                        </View>
                    ) : null
                }
                renderItem={({ item }: any) => {
                    const property = item.properties

                    if (!property) return null

                    return (
                        <PropertyCard
                            item={property}
                            onPress={() => router.push({ pathname: '/property/[id]', params: { id: property.id } })}
                            isSaved={true}
                            onSave={async () => {
                                await toggleSave(
                                    property.id,
                                    saved,
                                    refetch,
                                    supabase,
                                    user?.id as string
                                )

                                refetch()
                            }}
                        />
                    )
                }}
            />
        </SafeAreaView>
    )
}

export default Save
