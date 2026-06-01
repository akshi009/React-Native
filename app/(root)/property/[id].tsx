import { useAuth, useUser } from '@clerk/expo'
import { Ionicons } from '@expo/vector-icons'
import { useQuery } from '@tanstack/react-query'
import { router, useFocusEffect, useLocalSearchParams } from 'expo-router'
import { useCallback, useEffect, useMemo, useState } from 'react'
import {
    Alert,
    Dimensions,
    FlatList,
    Image,
    KeyboardAvoidingView,
    Linking,
    Platform,
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
import { PropertyCard } from '../../../components/PropertyCard'
import { useProductStore } from '../../../store/productStore'
import { Property } from '../../../types'

const { width: SCREEN_WIDTH } = Dimensions.get('window')
const CAROUSEL_HEIGHT = Math.min(360, SCREEN_WIDTH * 0.9)

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
const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=1200&q=80'

const formatPrice = (price: number): string => {
    if (price >= 10000000) return `₹${(price / 10000000).toFixed(1).replace(/\.0$/, '')} Cr`
    if (price >= 100000) return `₹${(price / 100000).toFixed(1).replace(/\.0$/, '')} Lac`
    if (price >= 1000) return `₹${(price / 1000).toFixed(1).replace(/\.0$/, '')}K`
    return `₹${price}`
}

export default function PropertyDetails() {
    const { id } = useLocalSearchParams<{ id: string }>()
    const { user } = useUser()
    const { getToken } = useAuth()
    const supabase = createClerkSupabaseClient(getToken)
    const properties = useProductStore((state: any) => state.properties ?? [])
    const [activeImageIndex, setActiveImageIndex] = useState(0)
    const [search, setSearch] = useState('')
    const [loading, setLoading] = useState(false)
    const { data: saved, refetch: refetchSaved } = useQuery({
        queryKey: ['savedIds', user?.id],
        queryFn: () => fetchSavedIds(supabase, user?.id as string),
        enabled: !!user?.id,
    })

    useEffect(() => {
        if (!properties.length) {
            setLoading(true)
            fetchProperty().finally(() => setLoading(false))
        }
    }, [properties.length])

    useFocusEffect(
        useCallback(() => {
            setActiveImageIndex(0)
        }, [])
    )

    const property = useMemo(
        () => properties.find((item: Property) => item.id === id),
        [properties, id]
    )
    const isSaved = useMemo(
        () => saved?.some((item: any) => item.property_id === property?.id) ?? false,
        [saved, property?.id]
    )
    const isSold = property?.is_sold === true

    const relatedProperties = useMemo(() => {
        if (!property) return []
        const query = search.trim().toLowerCase()

        return properties.filter((item: Property) => {
            if (item.id === property.id) return false
            const matchesTheme = item.type === property.type || item.city === property.city
            const matchesQuery =
                !query ||
                item.title?.toLowerCase().includes(query) ||
                item.city?.toLowerCase().includes(query) ||
                item.address?.toLowerCase().includes(query)

            return matchesTheme && matchesQuery
        })
    }, [properties, property, search])

    const openContact = async () => {
        if (!property) return
        if (isSold) {
            Alert.alert('Sold listing', 'Contact details are disabled for sold properties.')
            return
        }

        const phone = (property.contact_number)

        try {
            if (phone) {
                const url = `tel:${phone}`
                const supported = await Linking.canOpenURL(url)
                if (supported) return Linking.openURL(url)
            }

            // if (email) {
            //     const url = `mailto:${email}?subject=${encodeURIComponent(`Inquiry about ${property.title}`)}`
            //     const supported = await Linking.canOpenURL(url)
            //     if (supported) return Linking.openURL(url)
            // }

            Alert.alert('Contact unavailable', 'This listing does not have owner contact details yet.')
        } catch {
            Alert.alert('Contact unavailable', 'Unable to open the contact app right now.')
        }
    }

    if (loading && !property) {
        return (
            <SafeAreaView style={{ flex: 1, backgroundColor: C.bg, alignItems: 'center', justifyContent: 'center' }}>
                <Text style={{ color: C.textSecondary }}>Loading property...</Text>
            </SafeAreaView>
        )
    }

    if (!property) {
        return (
            <SafeAreaView style={{ flex: 1, backgroundColor: C.bg, padding: 24, justifyContent: 'center' }}>
                <Text style={{ fontSize: 22, fontWeight: '800', color: C.textPrimary, marginBottom: 8 }}>
                    Property not found
                </Text>
                <Text style={{ color: C.textSecondary, marginBottom: 20 }}>
                    We could not find this listing. Try going back and opening another property.
                </Text>
                <TouchableOpacity
                    onPress={() => router.back()}
                    style={{
                        backgroundColor: C.accent,
                        paddingVertical: 14,
                        borderRadius: 16,
                        alignItems: 'center',
                    }}
                >
                    <Text style={{ color: C.white, fontWeight: '800' }}>Go Back</Text>
                </TouchableOpacity>
            </SafeAreaView>
        )
    }

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: C.bg }}>
            <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'} >
                <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 32 }}>
                    <View style={{ paddingHorizontal: 16, paddingTop: 10 }}>
                        <View
                            style={{
                                flexDirection: 'row',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                marginBottom: 14,
                            }}
                        >
                            <TouchableOpacity
                                onPress={() => router.back()}
                                style={{
                                    width: 42,
                                    height: 42,
                                    borderRadius: 14,
                                    backgroundColor: C.surface,
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    borderWidth: 1,
                                    borderColor: C.border,
                                }}
                            >
                                <Ionicons name="chevron-back" size={22} color={C.textPrimary} />
                            </TouchableOpacity>

                            <View
                                style={{
                                    backgroundColor: C.surface,
                                    borderWidth: 1,
                                    borderColor: C.border,
                                    borderRadius: 999,
                                    paddingHorizontal: 12,
                                    paddingVertical: 7,
                                }}
                            >
                                <Text style={{ color: C.textSecondary, fontSize: 12, fontWeight: '700' }}>
                                    {property.type}
                                </Text>
                            </View>

                            <TouchableOpacity
                                onPress={async () => {
                                    if (!user?.id) {
                                        Alert.alert('Sign in required', 'Please sign in to save properties.')
                                        return
                                    }

                                    await toggleSave(property.id, saved, refetchSaved, supabase, user.id)
                                }}
                                activeOpacity={0.85}
                                style={{
                                    width: 42,
                                    height: 42,
                                    borderRadius: 14,
                                    backgroundColor: isSaved ? 'rgba(254,242,242,0.96)' : C.surface,
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    borderWidth: 1,
                                    borderColor: isSaved ? 'rgba(220,38,38,0.18)' : C.border,
                                }}
                            >
                                <Ionicons
                                    name={isSaved ? 'heart' : 'heart-outline'}
                                    size={20}
                                    color={isSaved ? C.danger : C.textPrimary}
                                />
                            </TouchableOpacity>

                        </View>
                    </View>

                    <View style={{ paddingHorizontal: 16 }}>
                        <FlatList
                            data={property.images?.length ? property.images : [FALLBACK_IMAGE]}
                            keyExtractor={(_, index) => `${property.id}-image-${index}`}
                            horizontal
                            pagingEnabled
                            showsHorizontalScrollIndicator={false}
                            onMomentumScrollEnd={(event) => {
                                const index = Math.round(event.nativeEvent.contentOffset.x / SCREEN_WIDTH)
                                setActiveImageIndex(index)
                            }}
                            renderItem={({ item }) => (
                                <View
                                    style={{
                                        width: SCREEN_WIDTH - 32,
                                        height: CAROUSEL_HEIGHT,
                                        borderRadius: 28,
                                        overflow: 'hidden',
                                        marginRight: 12,
                                        backgroundColor: C.surfaceAlt,
                                    }}
                                >
                                    <Image source={{ uri: item }} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
                                </View>
                            )}
                        />

                        {property.images?.length > 1 && (
                            <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 6, marginTop: 12 }}>
                                {property.images.map((_: any, index: number) => (
                                    <View
                                        key={index}
                                        style={{
                                            height: 6,
                                            width: activeImageIndex === index ? 18 : 6,
                                            borderRadius: 999,
                                            backgroundColor: activeImageIndex === index ? C.accent : C.border,
                                        }}
                                    />
                                ))}
                            </View>
                        )}
                    </View>

                    <View style={{ paddingHorizontal: 16, marginTop: 18 }}>
                        <View
                            style={{
                                backgroundColor: C.surface,
                                borderRadius: 24,
                                padding: 14,
                                borderWidth: 1,
                                borderColor: C.border,
                            }}
                        >
                            <View
                                style={{
                                    borderRadius: 20,

                                }}
                            >
                                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
                                    <Text
                                        style={{
                                            flex: 1,
                                            color: C.textPrimary,
                                            fontSize: 18,
                                            fontWeight: '800',
                                        }}
                                        numberOfLines={2}
                                    >
                                        {property.title}
                                    </Text>
                                    <Text style={{ color: C.accentText, fontSize: 22, fontWeight: '900' }}>
                                        {formatPrice(property.price)}
                                    </Text>
                                </View>
                                {isSold && (
                                    <View style={{
                                        alignSelf: 'flex-start',
                                        marginTop: 10,
                                        marginBottom: 2,
                                        backgroundColor: C.dangerLight,
                                        paddingHorizontal: 10,
                                        paddingVertical: 5,
                                        borderRadius: 999,
                                    }}>
                                        <Text style={{ color: C.danger, fontSize: 11, fontWeight: '800' }}>
                                            Sold
                                        </Text>
                                    </View>
                                )}
                                <Text style={{ color: C.textSecondary, fontSize: 12, marginTop: 4 }}>
                                    {[property.address, property.city].filter(Boolean).join(', ')}
                                </Text>
                            </View>
                            <View style={{ flexDirection: 'row', gap: 10, marginVertical: 16, flexWrap: 'wrap' }}>
                                <View style={{ backgroundColor: C.surfaceAlt, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999 }}>
                                    <Text style={{ color: C.textSecondary, fontSize: 12, fontWeight: '700' }}>
                                        {property.bedrooms} Beds
                                    </Text>
                                </View>
                                <View style={{ backgroundColor: C.surfaceAlt, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999 }}>
                                    <Text style={{ color: C.textSecondary, fontSize: 12, fontWeight: '700' }}>
                                        {property.bathrooms} Baths
                                    </Text>
                                </View>
                                <View style={{ backgroundColor: C.surfaceAlt, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999 }}>
                                    <Text style={{ color: C.textSecondary, fontSize: 12, fontWeight: '700' }}>
                                        {property.area_sqft} sqft
                                    </Text>
                                </View>
                            </View>

                            <Text style={{ color: C.textPrimary, fontSize: 18, fontWeight: '800', marginBottom: 8 }}>
                                Description
                            </Text>
                            <Text style={{ color: C.textSecondary, lineHeight: 22, fontSize: 14 }}>
                                {property.description || 'No description available for this listing yet.'}
                            </Text>

                            <View style={{ marginTop: 18, padding: 14, borderRadius: 18, backgroundColor: C.surfaceAlt }}>
                                <Text style={{ color: C.textMuted, fontSize: 12, fontWeight: '700', marginBottom: 4 }}>
                                    Contact
                                </Text>
                                <Text style={{ color: C.textPrimary, fontSize: 16, fontWeight: '800' }}>
                                    {property.owner_name || 'Property Owner'}
                                </Text>

                                <TouchableOpacity
                                    activeOpacity={0.9}
                                    onPress={openContact}
                                    disabled={isSold}
                                    style={{
                                        marginTop: 16,
                                        backgroundColor: isSold ? C.surfaceAlt : C.accent,
                                        paddingVertical: 16,
                                        borderRadius: 18,
                                        alignItems: 'center',
                                        shadowColor: '#000',
                                        shadowOpacity: 0.1,
                                        shadowRadius: 12,
                                        shadowOffset: { width: 0, height: 8 },
                                        elevation: 3,
                                        opacity: isSold ? 0.65 : 1,
                                    }}
                                >
                                    <Text style={{ color: isSold ? C.textSecondary : C.white, fontWeight: '800', fontSize: 15 }}>
                                        {isSold ? 'Sold' : 'Contact Now'}
                                    </Text>
                                </TouchableOpacity>
                            </View>

                        </View>
                    </View>

                    <View style={{ paddingHorizontal: 16, marginTop: 22 }}>
                        <Text style={{ fontSize: 18, fontWeight: '800', color: C.textPrimary, marginBottom: 8 }}>
                            Search for more such properties
                        </Text>
                        <TextInput
                            value={search}
                            onChangeText={setSearch}
                            placeholder="Search by city, area, or title"
                            placeholderTextColor={C.textMuted}
                            style={{
                                backgroundColor: C.surface,
                                borderRadius: 16,
                                paddingHorizontal: 14,
                                paddingVertical: 14,
                                borderWidth: 1,
                                borderColor: C.border,
                                color: C.textPrimary,
                                marginBottom: 14,
                            }}
                        />

                        {relatedProperties.length === 0 ? (
                            <View
                                style={{
                                    backgroundColor: C.surface,
                                    borderRadius: 18,
                                    padding: 18,
                                    borderWidth: 1,
                                    borderColor: C.border,
                                }}
                            >
                                <Text style={{ color: C.textSecondary }}>
                                    No similar properties found right now.
                                </Text>
                            </View>
                        ) : (
                            <FlatList
                                data={relatedProperties}
                                numColumns={2}
                                scrollEnabled={false}
                                keyExtractor={(item) => item.id}
                                columnWrapperStyle={{ gap: 12 }}
                                contentContainerStyle={{ gap: 12 }}
                            renderItem={({ item }) => (
                                <PropertyCard
                                    item={item}
                                    onPress={() => router.push({ pathname: '/property/[id]', params: { id: item.id } })}
                                    isSaved={saved?.some((savedItem: any) => savedItem.property_id === item.id) ?? false}
                                    onSave={async () => {
                                        if (!user?.id) {
                                            Alert.alert('Sign in required', 'Please sign in to save properties.')
                                            return
                                        }

                                        await toggleSave(item.id, saved, refetchSaved, supabase, user.id)
                                        refetchSaved()
                                    }}

                                />
                            )}
                        />
                        )}
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    )
}
