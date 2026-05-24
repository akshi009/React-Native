import { fetchSavedIds, toggleSave } from '@/hooks/save_property'
import { createClerkSupabaseClient } from '@/lib/supabase'
import { useAuth, useUser } from '@clerk/expo'
import { useQuery } from '@tanstack/react-query'
import { useFocusEffect } from 'expo-router'
import React, { useCallback, useMemo } from 'react'
import {
    Dimensions,
    FlatList,
    Image,
    ScrollView,
    Text,
    TouchableOpacity,
    View,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
const { width: SCREEN_WIDTH } = Dimensions.get('window')

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

const formatPrice = (price: number): string => {
    if (price >= 10000000) return `₹${(price / 10000000).toFixed(1).replace(/\.0$/, '')} Cr`
    if (price >= 100000) return `₹${(price / 100000).toFixed(1).replace(/\.0$/, '')} Lac`
    if (price >= 1000) return `₹${(price / 1000).toFixed(1).replace(/\.0$/, '')}K`
    return `₹${price}`
}

const Save = () => {
    const { user } = useUser()
    const { getToken } = useAuth()

    const supabase = useMemo(
        () => createClerkSupabaseClient(getToken),
        []
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
        }, [])
    )


    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: C.bg }} >
            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 32 }}
            >
                <View
                    style={{
                        paddingHorizontal: 16,
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

                {saved?.length === 0 && !isLoading ? (
                    <View
                        style={{
                            flex: 1,
                            justifyContent: 'center',
                            alignItems: 'center',
                            paddingHorizontal: 32,
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
                ) : (
                    <FlatList
                        data={saved}
                        keyExtractor={(item: any) => item.id}
                        numColumns={2}
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={{
                            paddingHorizontal: 16,
                            paddingBottom: 30,
                            gap: 12,
                            marginTop: 10
                        }}
                        columnWrapperStyle={{
                            gap: 12,
                        }}
                        renderItem={({ item }: any) => {
                            const property = item.properties

                            return (
                                <TouchableOpacity
                                    activeOpacity={0.85}
                                    style={{
                                        width: (SCREEN_WIDTH - 44) / 2,
                                        backgroundColor: C.surface,
                                        borderRadius: 18,
                                        overflow: 'hidden',
                                        borderWidth: 1,
                                        borderColor: C.border,
                                    }}
                                >
                                    <Image
                                        source={{ uri: property?.images?.[0] }}
                                        style={{
                                            width: '100%',
                                            height: 115,
                                            backgroundColor: C.surfaceAlt,
                                        }}
                                        resizeMode="cover"
                                    />

                                    {/* Featured badge */}
                                    <View
                                        style={{
                                            position: 'absolute',
                                            top: 8,
                                            left: 8,
                                            flexDirection: 'row',
                                            gap: 4,
                                            flexWrap: 'wrap',
                                        }}
                                    >
                                        {property?.is_featured && (
                                            <View
                                                style={{
                                                    backgroundColor: C.accentLight,
                                                    paddingHorizontal: 8,
                                                    paddingVertical: 3,
                                                    borderRadius: 999,
                                                }}
                                            >
                                                <Text
                                                    style={{
                                                        color: C.accentText,
                                                        fontSize: 9,
                                                        fontWeight: '700',
                                                    }}
                                                >
                                                    Featured
                                                </Text>
                                            </View>
                                        )}

                                        {property?.is_sold && (
                                            <View
                                                style={{
                                                    backgroundColor: C.dangerLight,
                                                    paddingHorizontal: 8,
                                                    paddingVertical: 3,
                                                    borderRadius: 999,
                                                }}
                                            >
                                                <Text
                                                    style={{
                                                        color: C.danger,
                                                        fontSize: 9,
                                                        fontWeight: '700',
                                                    }}
                                                >
                                                    Sold
                                                </Text>
                                            </View>
                                        )}
                                    </View>

                                    {/* Save button */}
                                    <TouchableOpacity
                                        onPress={async () => {
                                            await toggleSave(
                                                property.id,
                                                saved,
                                                refetch,
                                                supabase,
                                                user?.id as string
                                            )

                                            refetch()
                                        }}
                                        style={{
                                            position: 'absolute',
                                            top: 8,
                                            right: 8,
                                            width: 28,
                                            height: 28,
                                            borderRadius: 999,
                                            backgroundColor: C.accentLight,
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            zIndex: 10,
                                        }}
                                    >
                                        <Text style={{ fontSize: 14 }}>
                                            ❤️
                                        </Text>
                                    </TouchableOpacity>

                                    {/* Body */}
                                    <View style={{ padding: 10 }}>
                                        <Text
                                            style={{
                                                color: C.success,
                                                fontSize: 14,
                                                fontWeight: '800',
                                                marginBottom: 2,
                                            }}
                                        >
                                            {formatPrice(property?.price)}
                                        </Text>

                                        <Text
                                            numberOfLines={1}
                                            style={{
                                                color: C.textPrimary,
                                                fontSize: 13,
                                                fontWeight: '700',
                                                marginBottom: 4,
                                            }}
                                        >
                                            {property?.title}
                                        </Text>

                                        <Text
                                            numberOfLines={1}
                                            style={{
                                                color: C.textMuted,
                                                fontSize: 11,
                                                marginBottom: 8,
                                            }}
                                        >
                                            {property?.address}, {property?.city}
                                        </Text>

                                        {/* Stats */}
                                        <View
                                            style={{
                                                flexDirection: 'row',
                                                backgroundColor: C.surfaceAlt,
                                                borderRadius: 10,
                                                overflow: 'hidden',
                                            }}
                                        >
                                            {[
                                                {
                                                    value: property?.bedrooms,
                                                    label: 'Beds',
                                                },
                                                {
                                                    value: property?.bathrooms,
                                                    label: 'Baths',
                                                },
                                                {
                                                    value: property?.area_sqft,
                                                    label: 'Sqft',
                                                },
                                            ].map((stat, index) => (
                                                <View
                                                    key={stat.label}
                                                    style={{
                                                        flex: 1,
                                                        flexDirection: 'row',
                                                    }}
                                                >
                                                    {index !== 0 && (
                                                        <View
                                                            style={{
                                                                width: 1,
                                                                backgroundColor:
                                                                    C.border,
                                                                marginVertical: 6,
                                                            }}
                                                        />
                                                    )}

                                                    <View
                                                        style={{
                                                            flex: 1,
                                                            alignItems: 'center',
                                                            paddingVertical: 6,
                                                        }}
                                                    >
                                                        <Text
                                                            style={{
                                                                color:
                                                                    C.textPrimary,
                                                                fontSize: 12,
                                                                fontWeight: '700',
                                                            }}
                                                        >
                                                            {stat.value}
                                                        </Text>

                                                        <Text
                                                            style={{
                                                                color: C.textMuted,
                                                                fontSize: 9,
                                                                marginTop: 1,
                                                            }}
                                                        >
                                                            {stat.label}
                                                        </Text>
                                                    </View>
                                                </View>
                                            ))}
                                        </View>
                                    </View>
                                </TouchableOpacity>
                            )
                        }}
                    />
                )}
            </ScrollView>
        </SafeAreaView>
    )
}

export default Save