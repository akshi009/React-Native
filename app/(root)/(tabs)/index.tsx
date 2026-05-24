import { fetchSavedIds, toggleSave } from '@/hooks/save_property'
import { createClerkSupabaseClient } from '@/lib/supabase'
import { useAuth, useUser } from '@clerk/expo'
import { useQuery } from '@tanstack/react-query'
import { useFocusEffect } from 'expo-router'
import { useCallback, useMemo, useRef, useState } from 'react'
import {
    Dimensions,
    FlatList,
    Image,
    NativeScrollEvent,
    NativeSyntheticEvent,
    ScrollView,
    Text,
    TouchableOpacity,
    View,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { fetchProperty } from '../../../hooks/property'
import { useProductStore } from '../../../store/productStore'

const { width: SCREEN_WIDTH } = Dimensions.get('window')
const CARD_WIDTH = SCREEN_WIDTH - 64

const FILTER_CATEGORIES = ['All', 'Apartment', 'Villa', 'Plot', 'Commercial', 'Studio']

const formatPrice = (price: number): string => {
    if (price >= 10000000) return `₹${(price / 10000000).toFixed(1).replace(/\.0$/, '')} Cr`
    if (price >= 100000) return `₹${(price / 100000).toFixed(1).replace(/\.0$/, '')} Lac`
    if (price >= 1000) return `₹${(price / 1000).toFixed(1).replace(/\.0$/, '')}K`
    return `₹${price}`
}

// ── Light theme tokens ──────────────────────────────────────────
const C = {
    bg: '#F5F6FA',   // page background
    surface: '#FFFFFF',   // cards, inputs
    surfaceAlt: '#EEF0F5',   // stat chips, filter pills inactive
    border: '#E2E5EC',   // dividers
    accent: '#2563EB',   // primary blue
    accentLight: '#EBF2FF',   // badge bg, tint fills
    accentText: '#1D4ED8',   // text on accentLight
    success: '#059669',   // price green
    successLight: '#D1FAE5',
    danger: '#DC2626',   // sold badge
    dangerLight: '#FEE2E2',
    textPrimary: '#0F172A',
    textSecondary: '#64748B',
    textMuted: '#94A3B8',
    white: '#FFFFFF',
}

export default function Home() {
    const { user } = useUser()

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
        }, [])
    )

    const carouselRef = useRef<ScrollView>(null)

    const properties = useProductStore((state: any) => state.properties ?? [])

    const featuredProperties = useMemo(
        () => properties.filter((p: any) => p.is_featured),
        [properties]
    )
    const recommandedProperties = useMemo(
        () => properties.filter((p: any) => !p.is_featured),
        [properties]
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
        const index = Math.round(e.nativeEvent.contentOffset.x / (CARD_WIDTH + 16))
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
                        <TouchableOpacity style={{
                            width: 40, height: 40, borderRadius: 20,
                            backgroundColor: C.surface,
                            borderWidth: 1, borderColor: C.border,
                            alignItems: 'center', justifyContent: 'center',
                        }}>
                            <Text style={{ fontSize: 18 }}>🔔</Text>
                        </TouchableOpacity>
                        <View style={{
                            width: 40, height: 40, borderRadius: 20,
                            backgroundColor: C.accent,
                            alignItems: 'center', justifyContent: 'center',
                        }}>
                            <Text style={{ color: C.white, fontWeight: '800', fontSize: 14 }}>
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
                    <Text style={{ fontSize: 18, color: C.accent }}>⌕</Text>
                    <Text style={{ color: C.textMuted, fontSize: 14 }}>Search properties, cities...</Text>
                </TouchableOpacity>

                {/* ── Filter Pills ── */}
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={{ paddingHorizontal: 16, gap: 8, paddingBottom: 4 }}
                    style={{ marginBottom: 24 }}
                >
                    {FILTER_CATEGORIES.map((cat) => (
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
                                {cat}
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
                            <TouchableOpacity>
                                <Text style={{ fontSize: 13, color: C.accent, fontWeight: '600' }}>See all</Text>
                            </TouchableOpacity>
                        </View>

                        <ScrollView
                            ref={carouselRef}
                            horizontal
                            pagingEnabled={false}
                            decelerationRate="fast"
                            snapToInterval={CARD_WIDTH + 16}
                            snapToAlignment="start"
                            showsHorizontalScrollIndicator={false}
                            contentContainerStyle={{ paddingLeft: 16, paddingRight: 16 }}
                            onScroll={handleCarouselScroll}
                            scrollEventThrottle={16}
                        >
                            {featuredProperties.map((item: any) => (
                                <TouchableOpacity
                                    key={item.id}
                                    activeOpacity={0.9}
                                    style={{
                                        width: CARD_WIDTH,
                                        height: 210,
                                        borderRadius: 22,
                                        overflow: 'hidden',
                                        marginRight: 16,
                                        backgroundColor: C.surfaceAlt,
                                    }}
                                >
                                    <Image
                                        source={{ uri: item.images?.[0] }}
                                        style={{ width: '100%', height: '100%', position: 'absolute' }}
                                        resizeMode="cover"
                                    />

                                    {/* Overlay on bottom half */}
                                    <View style={{
                                        position: 'absolute',
                                        bottom: 0, left: 0, right: 0,
                                        top: '38%',
                                        backgroundColor: 'rgba(15,23,42,0.72)',
                                        borderBottomLeftRadius: 22,
                                        borderBottomRightRadius: 22,
                                    }} />


                                    {/* Save Button */}
                                    <TouchableOpacity
                                        onPress={async () => {
                                            await toggleSave(
                                                item.id,
                                                saved,
                                                refetch,
                                                supabase,
                                                user?.id as string,
                                            )

                                            refetch()
                                        }}
                                        hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
                                        style={{
                                            position: 'absolute',
                                            top: 14,
                                            right: 14,
                                            width: 34,
                                            height: 34,
                                            borderRadius: 999,
                                            backgroundColor: savedIds.has(item.id)
                                                ? 'rgba(255,255,255,0.95)'
                                                : 'rgba(255,255,255,0.22)',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            backdropFilter: 'blur(8px)',
                                            zIndex: 10,
                                        }}
                                    >
                                        <Text style={{ fontSize: 16 }}>
                                            {savedIds.has(item.id) ? '❤️' : '🤍'}
                                        </Text>
                                    </TouchableOpacity>

                                    {/* Featured badge */}
                                    <View style={{
                                        position: 'absolute',
                                        top: 14, left: 14,
                                        backgroundColor: C.white,
                                        paddingHorizontal: 12,
                                        paddingVertical: 5,
                                        borderRadius: 999,
                                    }}>
                                        <Text style={{ color: C.accent, fontSize: 11, fontWeight: '700' }}>
                                            ✦ Featured
                                        </Text>
                                    </View>

                                    {/* Card content */}
                                    <View style={{
                                        position: 'absolute',
                                        bottom: 0, left: 0, right: 0,
                                        padding: 16,
                                    }}>
                                        <Text style={{ color: '#6EE7B7', fontSize: 18, fontWeight: '800', marginBottom: 2 }}>
                                            {formatPrice(item.price)}
                                        </Text>
                                        <Text numberOfLines={1} style={{ color: C.white, fontSize: 15, fontWeight: '700', marginBottom: 2 }}>
                                            {item.title}
                                        </Text>
                                        <Text style={{ color: '#CBD5E1', fontSize: 12, marginBottom: 10 }}>
                                            {item.city}
                                        </Text>
                                        <View style={{ flexDirection: 'row', gap: 6 }}>
                                            {[`${item.bedrooms} Beds`, `${item.bathrooms} Baths`, `${item.area_sqft} sqft`].map((label) => (
                                                <View key={label} style={{
                                                    backgroundColor: 'rgba(255,255,255,0.18)',
                                                    paddingHorizontal: 10,
                                                    paddingVertical: 4,
                                                    borderRadius: 999,
                                                }}>
                                                    <Text style={{ color: C.white, fontSize: 11, fontWeight: '600' }}>
                                                        {label}
                                                    </Text>
                                                </View>
                                            ))}
                                        </View>
                                    </View>
                                </TouchableOpacity>
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
                        <TouchableOpacity>
                            <Text style={{ fontSize: 13, color: C.accent, fontWeight: '600' }}>See all</Text>
                        </TouchableOpacity>
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
                                <TouchableOpacity
                                    activeOpacity={0.85}
                                    style={{
                                        flex: 1,
                                        backgroundColor: C.surface,
                                        borderRadius: 18,
                                        overflow: 'hidden',
                                        borderWidth: 1,
                                        borderColor: C.border,
                                    }}
                                >
                                    {/* Property image */}
                                    <Image
                                        source={{ uri: item.images?.[0] }}
                                        style={{ width: '100%', height: 115, backgroundColor: C.surfaceAlt }}
                                        resizeMode="cover"
                                    />

                                    {/* Badges overlaid on image */}
                                    <View style={{
                                        position: 'absolute',
                                        top: 8, left: 8,
                                        flexDirection: 'row',
                                        gap: 4,
                                        flexWrap: 'wrap',
                                    }}>
                                        {item.is_featured && (
                                            <View style={{
                                                backgroundColor: C.accentLight,
                                                paddingHorizontal: 8,
                                                paddingVertical: 3,
                                                borderRadius: 999,
                                            }}>
                                                <Text style={{ color: C.accentText, fontSize: 9, fontWeight: '700' }}>
                                                    Featured
                                                </Text>
                                            </View>
                                        )}
                                        {item.is_sold && (
                                            <View style={{
                                                backgroundColor: C.dangerLight,
                                                paddingHorizontal: 8,
                                                paddingVertical: 3,
                                                borderRadius: 999,
                                            }}>
                                                <Text style={{ color: C.danger, fontSize: 9, fontWeight: '700' }}>
                                                    Sold
                                                </Text>
                                            </View>
                                        )}
                                    </View>

                                    {/* Save Button overlaid on image */}
                                    <TouchableOpacity
                                        onPress={() => toggleSave(item.id, saved, refetch, supabase, user?.id as string)}
                                        hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
                                        style={{
                                            position: 'absolute',
                                            top: 8,
                                            right: 8,
                                            width: 28, height: 28,
                                            borderRadius: 999,
                                            backgroundColor: savedIds.has(item.id) ? C.accentLight : C.surfaceAlt,
                                            alignItems: 'center', justifyContent: 'center',
                                            zIndex: 10,
                                        }}
                                    >
                                        <Text style={{ fontSize: 14 }}>
                                            {savedIds.has(item.id) ? '❤️' : '🤍'}
                                        </Text>
                                    </TouchableOpacity>

                                    {/* Card body */}
                                    <View style={{ padding: 10 }}>
                                        <Text style={{ color: C.success, fontSize: 14, fontWeight: '800', marginBottom: 2 }}>
                                            {formatPrice(item.price)}
                                        </Text>
                                        <Text numberOfLines={1} style={{ color: C.textPrimary, fontSize: 13, fontWeight: '700', marginBottom: 4 }}>
                                            {item.title}
                                        </Text>
                                        <Text numberOfLines={1} style={{ color: C.textMuted, fontSize: 11, marginBottom: 8 }}>
                                            {item.address}, {item.city}
                                        </Text>

                                        {/* Stats row */}
                                        <View style={{
                                            flexDirection: 'row',
                                            backgroundColor: C.surfaceAlt,
                                            borderRadius: 10,
                                            overflow: 'hidden',
                                        }}>
                                            {[
                                                { value: item.bedrooms, label: 'Beds' },
                                                { value: item.bathrooms, label: 'Baths' },
                                                { value: item.area_sqft, label: 'Sqft' },
                                            ].map((stat, index) => (
                                                <View key={stat.label} style={{ flex: 1, flexDirection: 'row' }}>
                                                    {index !== 0 && (
                                                        <View style={{
                                                            width: 1,
                                                            backgroundColor: C.border,
                                                            marginVertical: 6,
                                                        }} />
                                                    )}
                                                    <View style={{ flex: 1, alignItems: 'center', paddingVertical: 6 }}>
                                                        <Text style={{ color: C.textPrimary, fontSize: 12, fontWeight: '700' }}>
                                                            {stat.value}
                                                        </Text>
                                                        <Text style={{ color: C.textMuted, fontSize: 9, marginTop: 1 }}>
                                                            {stat.label}
                                                        </Text>
                                                    </View>
                                                </View>
                                            ))}
                                        </View>
                                    </View>
                                </TouchableOpacity>
                            )}
                        />
                    )}
                </View>

            </ScrollView>
        </SafeAreaView>
    )
}