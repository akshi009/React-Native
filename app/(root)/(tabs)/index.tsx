import { useAuth, useUser } from '@clerk/expo'
import { useQuery } from '@tanstack/react-query'
import { router, useFocusEffect } from 'expo-router'
import { useCallback, useMemo, useRef, useState } from 'react'
import {
    Dimensions,
    FlatList,
    NativeScrollEvent,
    NativeSyntheticEvent,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { fetchProperty } from '../../../hooks/property'
import { fetchSavedIds, toggleSave } from '../../../hooks/save_property'
import { createClerkSupabaseClient } from '../../../lib/supabase'
import { useProductStore } from '../../../store/productStore'
import { PropertyCard } from '../../../components/PropertyCard'

const { width: SCREEN_WIDTH } = Dimensions.get('window')
const FEATURED_CARD_INTERVAL = SCREEN_WIDTH - 16

const openProperty = (id: string) => {
    router.push({ pathname: '/property/[id]', params: { id } })
}

// ── Light theme tokens ──────────────────────────────────────────
const C = {
    bg: '#F5F6FA',   // page background
    surface: '#FFFFFF',   // cards, inputs
    surfaceAlt: '#eef0f570',   // stat chips, filter pills inactive
    border: '#E2E5EC',   // dividers
    accent: '#2563EB',   // primary blue
    accentLight: '#ebf2ffbb',   // badge bg, tint fills
    accentText: '#1D4ED8',   // text on accentLight
    success: '#059669',   // price green
    successLight: '#D1FAE5',
    danger: '#DC2626',   // sold badge
    dangerLight: '#fee2e29c',
    textPrimary: '#0F172A',
    textSecondary: '#3c4046ff',
    textMuted1: '#94A3B8',
    textMuted: '#707c8cff',
    white: '#FFFFFF',
}

export default function Home() {
    const { user } = useUser()
    const [search, setSearch] = useState('')
    const [loading, setLoading] = useState(false)
    const [activeFilter, setActiveFilter] = useState('All')
    const [activeCarouselIndex, setActiveCarouselIndex] = useState(0)
    const [savedIds, setSavedIds] = useState<Set<string>>(new Set())
    const { getToken } = useAuth()
    const supabase = createClerkSupabaseClient(getToken)
    const { data: saved, refetch } = useQuery({ queryKey: ['savedIds'], queryFn: () => fetchSavedIds(supabase, user?.id as string) })


    useFocusEffect(
        useCallback(() => {
            const savedIds = saved?.map((item: any) => item.property_id) ?? []
            setSavedIds(new Set(savedIds))
        }, [saved])
    )

    useFocusEffect(
        useCallback(() => {
            refetch()
        }, [refetch])
    )

    const carouselRef = useRef<ScrollView>(null)

    const properties = useProductStore((state: any) => state.properties ?? [])
    const propertyTypes = ["All", ...new Set(properties.map((item: any) => item.type))]

    const filteredProperties = useMemo(() => {
        return properties.filter((item: any) => {
            const matchesSearch =
                item.title?.toLowerCase().includes(search.toLowerCase()) ||
                item.city?.toLowerCase().includes(search.toLowerCase()) ||
                item.address?.toLowerCase().includes(search.toLowerCase())

            const matchesType = activeFilter === 'All' || item.type === activeFilter
            return matchesSearch && matchesType
        })
    }, [properties, search, activeFilter])



    const featuredProperties = useMemo(
        () => filteredProperties.filter((p: any) => p.is_featured),
        [filteredProperties]
    )
    const recommandedProperties = useMemo(
        () => filteredProperties.filter((p: any) => !p.is_featured),
        [filteredProperties]
    )

    useFocusEffect(
        useCallback(() => {
            let cancelled = false
            const load = async () => {
                setLoading(true)
                try {
                    await fetchProperty()
                } finally {
                    if (!cancelled) setLoading(false)
                }
            }
            load()
            return () => { cancelled = true }
        }, [])
    )

    const handleCarouselScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
        const index = Math.round(e.nativeEvent.contentOffset.x / FEATURED_CARD_INTERVAL)
        setActiveCarouselIndex(index)
    }

    const getGreeting = () => {
        const h = new Date().getHours()
        if (h < 12) return 'Good morning'
        if (h < 17) return 'Good afternoon'
        return 'Good evening'
    }

    const initials = user?.fullName
        ?.split(' ')
        .map((n) => n[0])
        .join('')
        .slice(0, 2)
        .toUpperCase() ?? 'GU'



    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: C.bg }}>
            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 32 }}
            >

                {/* ── Header ── */}
                <View style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    paddingHorizontal: 16,
                    paddingTop: 12,
                    paddingBottom: 16,
                }}>
                    <View>
                        <Text style={{ fontSize: 13, color: C.textMuted, fontWeight: '500', marginBottom: 2 }}>
                            {getGreeting()} 👋
                        </Text>
                        <Text style={{ fontSize: 22, fontWeight: '700', color: C.textPrimary }}>
                            {user?.fullName ?? 'Guest'}
                        </Text>
                    </View>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>

                        <View style={{
                            width: 40, height: 40, borderRadius: 20,
                            backgroundColor: C.accent,
                            alignItems: 'center', justifyContent: 'center',
                        }} >
                            <Text onPress={() => router.push('/(root)/(tabs)/profile')} style={{ color: C.white, fontWeight: '800', fontSize: 14 }}>
                                {initials}
                            </Text>
                        </View>
                    </View>
                </View>

                {/* ── Search Bar ── */}

                <TouchableOpacity
                    activeOpacity={0.8}
                    style={{
                        backgroundColor: C.surface,
                        borderRadius: 14,
                        marginHorizontal: 16,
                        marginBottom: 16,
                        paddingHorizontal: 16,
                        paddingVertical: 13,
                        flexDirection: 'row',
                        alignItems: 'center',
                        gap: 10,
                        borderWidth: 1,
                        borderColor: C.border,
                    }}
                >
                    <Text style={{ fontSize: 20, color: C.accent }}>⌕</Text>
                    <TextInput onChangeText={setSearch} value={search} placeholder='Search properties, cities...' placeholderTextColor={C.textMuted} style={{ color: C.textMuted, fontSize: 14 }}>

                    </TextInput>
                </TouchableOpacity>

                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={{ paddingHorizontal: 16, gap: 8, paddingBottom: 4 }}
                    style={{ marginBottom: 24 }}
                >
                    {propertyTypes.map((cat: any) => (
                        <TouchableOpacity
                            key={cat}
                            onPress={() => setActiveFilter(cat)}
                            activeOpacity={0.8}
                            style={{
                                backgroundColor: activeFilter === cat ? C.accent : C.surface,
                                paddingHorizontal: 18,
                                paddingVertical: 8,
                                borderRadius: 999,
                                borderWidth: 1,
                                borderColor: activeFilter === cat ? C.accent : C.border,
                            }}
                        >
                            <Text style={{
                                color: activeFilter === cat ? C.white : C.textSecondary,
                                fontSize: 13,
                                fontWeight: '600',
                            }}>
                                {(cat)}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>

                {/* ── Featured Carousel ── */}
                {featuredProperties?.length > 0 && (
                    <View style={{ marginBottom: 28 }}>
                        <View style={{
                            flexDirection: 'row',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            marginBottom: 14,
                            paddingHorizontal: 16,
                        }}>
                            <Text style={{ fontSize: 17, fontWeight: '700', color: C.textPrimary }}>✦ Featured</Text>

                        </View>

                        <ScrollView
                            ref={carouselRef}
                            horizontal
                            pagingEnabled={false}
                            decelerationRate="fast"
                            snapToInterval={FEATURED_CARD_INTERVAL}
                            snapToAlignment="start"
                            showsHorizontalScrollIndicator={false}
                            contentContainerStyle={{ paddingLeft: 16, paddingRight: 16 }}
                            onScroll={handleCarouselScroll}
                            scrollEventThrottle={16}
                        >
                            {featuredProperties.map((item: any) => (
                                <View key={item.id} style={{ marginRight: 16 }}>
                                    <PropertyCard
                                        item={item}
                                        variant="featured"
                                        onPress={() => openProperty(item.id)}
                                        isSaved={savedIds.has(item.id)}
                                        onSave={async () => {
                                            if (!user?.id) {
                                                return
                                            }

                                            await toggleSave(
                                                item.id,
                                                saved,
                                                refetch,
                                                supabase,
                                                user.id,
                                            )

                                            refetch()
                                        }}
                                    />
                                </View>
                            ))}
                        </ScrollView>

                        {/* Dot indicators */}
                        {featuredProperties.length > 1 && (
                            <View style={{
                                flexDirection: 'row',
                                justifyContent: 'center',
                                alignItems: 'center',
                                gap: 5,
                                marginTop: 12,
                            }}>
                                {featuredProperties.map((_: any, i: number) => (
                                    <View
                                        key={i}
                                        style={{
                                            height: 5,
                                            borderRadius: 999,
                                            width: activeCarouselIndex === i ? 16 : 5,
                                            backgroundColor: activeCarouselIndex === i ? C.accent : C.border,
                                        }}
                                    />
                                ))}
                            </View>
                        )}
                    </View>
                )}

                {/* ── Recommended Grid ── */}
                <View style={{ paddingHorizontal: 16 }}>
                    <View style={{
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: 14,
                    }}>
                        <Text style={{ fontSize: 17, fontWeight: '700', color: C.textPrimary }}>Recommended</Text>

                    </View>

                    {recommandedProperties?.length === 0 && !loading ? (
                        <Text style={{ color: C.textMuted, textAlign: 'center', marginTop: 40, fontSize: 15 }}>
                            No properties found
                        </Text>
                    ) : (
                        <FlatList
                            data={recommandedProperties}
                            keyExtractor={(item) => item.id}
                            numColumns={2}
                            scrollEnabled={false}
                            columnWrapperStyle={{ gap: 12 }}
                            contentContainerStyle={{ gap: 12 }}
                            renderItem={({ item }) => (
                                <PropertyCard
                                    item={item}
                                    onPress={() => router.push({ pathname: '/property/[id]', params: { id: item.id } })}
                                    isSaved={savedIds.has(item.id)}
                                    onSave={async () => {
                                        if (!user?.id) {
                                            return
                                        }

                                        await toggleSave(
                                            item.id,
                                            saved,
                                            refetch,
                                            supabase,
                                            user.id,
                                        )

                                        refetch()
                                    }}
                                />
                            )}
                        />
                    )}
                </View>

            </ScrollView>
        </SafeAreaView>
    )
}
