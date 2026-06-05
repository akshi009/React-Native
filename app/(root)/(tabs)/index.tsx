import { useAuth, useUser } from '@clerk/expo'
import { useQuery } from '@tanstack/react-query'
import { router, useFocusEffect } from 'expo-router'
import { useCallback, useMemo, useRef, useState } from 'react'
import {
    Dimensions,
    FlatList,
    Image,
    NativeScrollEvent,
    NativeSyntheticEvent,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { PropertyCard } from '../../../components/PropertyCard'
import { fetchProperty } from '../../../hooks/property'
import { fetchSavedIds, toggleSave } from '../../../hooks/save_property'
import { createClerkSupabaseClient } from '../../../lib/supabase'
import { useProductStore } from '../../../store/productStore'

const { width: SCREEN_WIDTH } = Dimensions.get('window')
const FEATURED_CARD_INTERVAL = SCREEN_WIDTH - 32

const openProperty = (id: string) => {
    router.push({ pathname: '/property/[id]', params: { id } })
}

const C = {
    bg: '#F7F7F7',
    surface: '#FFFFFF',
    surfaceAlt: '#F2F3F5',
    border: '#EBEBEB',
    accent: '#111111',
    textPrimary: '#111111',
    textSecondary: '#555555',
    textMuted: '#AAAAAA',
    white: '#FFFFFF',
    danger: '#DC2626',
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
                contentContainerStyle={{ paddingBottom: 40 }}
            >
                {/* ── Header ── */}
                <View style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    paddingHorizontal: 20,
                    // paddingTop: 12,
                    // paddingBottom: 4,
                }}>
                    <Image
                        source={require('../../../assets/images/bricknest.png')}
                        style={{
                            width: 100,
                            height: 100,
                            // alignSelf: 'flex-start',
                            marginLeft: -20,
                        }}
                        resizeMode='contain'
                    />

                    <TouchableOpacity
                        onPress={() => router.push('/(root)/(tabs)/profile')}
                        style={{
                            width: 40,
                            height: 40,
                            borderRadius: 20,
                            backgroundColor: C.surfaceAlt,
                            alignItems: 'center',
                            justifyContent: 'center',
                            borderWidth: 1,
                            borderColor: C.border,
                            overflow: 'hidden',
                            marginTop: -12
                        }}
                    >
                        <Text style={{ color: C.textPrimary, fontWeight: '700', fontSize: 14 }}>
                            {initials}
                        </Text>
                    </TouchableOpacity>

                    {/* <TouchableOpacity
                        style={{
                            width: 40,
                            height: 40,
                            borderRadius: 20,
                            backgroundColor: C.surface,
                            alignItems: 'center',
                            justifyContent: 'center',
                            borderWidth: 1,
                            borderColor: C.border,
                        }}
                    >
                        <View style={{ gap: 4 }}>
                            <View style={{ width: 16, height: 1.5, backgroundColor: C.textPrimary, borderRadius: 999 }} />
                            <View style={{ width: 11, height: 1.5, backgroundColor: C.textPrimary, borderRadius: 999 }} />
                            <View style={{ width: 7, height: 1.5, backgroundColor: C.textPrimary, borderRadius: 999 }} />
                        </View>
                    </TouchableOpacity> */}
                </View>

                <View style={{ paddingHorizontal: 20, paddingBottom: 24 }}>
                    <Text style={{ fontSize: 32, fontWeight: '800', color: C.textPrimary, lineHeight: 40, letterSpacing: -0.5 }}>
                        Start your home{'\n'}search now
                    </Text>
                </View>
                {/* ── Hero heading ── */}

                {/* ── Search Bar ── */}
                <View style={{
                    backgroundColor: C.surface,
                    borderRadius: 16,
                    marginHorizontal: 20,
                    marginBottom: 20,
                    paddingHorizontal: 16,
                    paddingVertical: 13,
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 10,
                    borderWidth: 1,
                    borderColor: C.border,
                }}>
                    <Text style={{ fontSize: 18, color: C.textMuted }}>⌕</Text>
                    <TextInput
                        onChangeText={setSearch}
                        value={search}
                        placeholder="Search properties, cities..."
                        placeholderTextColor={C.textMuted}
                        style={{ flex: 1, color: C.textPrimary, fontSize: 14 }}
                    />
                </View>

                {/* ── Filter Pills ── */}
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={{ paddingHorizontal: 20, gap: 8, paddingBottom: 4 }}
                    style={{ marginBottom: 28 }}
                >
                    {propertyTypes.map((cat: any) => (
                        <TouchableOpacity
                            key={cat}
                            onPress={() => setActiveFilter(cat)}
                            activeOpacity={0.8}
                            style={{
                                backgroundColor: activeFilter === cat ? C.accent : C.surface,
                                paddingHorizontal: 18,
                                paddingVertical: 9,
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
                                {cat.charAt(0).toUpperCase() + cat.slice(1)}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>

                {/* ── Featured Carousel ── */}
                {featuredProperties?.length > 0 && (
                    <View style={{ marginBottom: 32 }}>
                        <View style={{
                            flexDirection: 'row',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            marginBottom: 16,
                            paddingHorizontal: 20,
                        }}>
                            <Text style={{ fontSize: 18, fontWeight: '700', color: C.textPrimary }}>Featured</Text>
                            {/* <TouchableOpacity>
                                <Text style={{ fontSize: 13, fontWeight: '600', color: C.textMuted }}>See all</Text>
                            </TouchableOpacity> */}
                        </View>

                        <ScrollView
                            ref={carouselRef}
                            horizontal
                            pagingEnabled={false}
                            decelerationRate="fast"
                            snapToInterval={FEATURED_CARD_INTERVAL + 12}
                            snapToAlignment="start"
                            showsHorizontalScrollIndicator={false}
                            contentContainerStyle={{ paddingLeft: 20, paddingRight: 20 }}
                            onScroll={handleCarouselScroll}
                            scrollEventThrottle={16}
                        >
                            {featuredProperties.map((item: any) => (
                                <View key={item.id} style={{ marginRight: 12 }}>
                                    <PropertyCard
                                        item={item}
                                        variant="featured"
                                        onPress={() => openProperty(item.id)}
                                        isSaved={savedIds.has(item.id)}
                                        onSave={async () => {
                                            if (!user?.id) return
                                            await toggleSave(item.id, saved, refetch, supabase, user.id)
                                            refetch()
                                        }}
                                    />
                                </View>
                            ))}
                        </ScrollView>

                        {featuredProperties.length > 1 && (
                            <View style={{
                                flexDirection: 'row',
                                justifyContent: 'center',
                                alignItems: 'center',
                                gap: 5,
                                marginTop: 14,
                            }}>
                                {featuredProperties.map((_: any, i: number) => (
                                    <View
                                        key={i}
                                        style={{
                                            height: 4,
                                            borderRadius: 999,
                                            width: activeCarouselIndex === i ? 18 : 4,
                                            backgroundColor: activeCarouselIndex === i ? C.accent : C.border,
                                        }}
                                    />
                                ))}
                            </View>
                        )}
                    </View>
                )}

                {/* ── Recommended Grid ── */}
                <View style={{ paddingHorizontal: 20 }}>
                    <View style={{
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: 16,
                    }}>
                        <Text style={{ fontSize: 18, fontWeight: '700', color: C.textPrimary }}>Recommended</Text>
                        {/* <TouchableOpacity>
                            <Text style={{ fontSize: 13, fontWeight: '600', color: C.textMuted }}>See all</Text>
                        </TouchableOpacity> */}
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
                                        if (!user?.id) return
                                        await toggleSave(item.id, saved, refetch, supabase, user.id)
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