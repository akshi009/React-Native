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
import { PropertyCard } from '../../../components/PropertyCard'
import { fetchProperty } from '../../../hooks/property'
import { fetchSavedIds, toggleSave } from '../../../hooks/save_property'
import { createClerkSupabaseClient } from '../../../lib/supabase'
import { useProductStore } from '../../../store/productStore'
import { Property } from '../../../types'

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window')
const IMAGE_HEIGHT = SCREEN_HEIGHT * 0.52

const C = {
    bg: '#FFFFFF',
    surface: '#FFFFFF',
    surfaceAlt: '#F2F3F5',
    border: '#EBEBEB',
    textPrimary: '#111111',
    textSecondary: '#666666',
    textMuted: '#AAAAAA',
    danger: '#DC2626',
    dangerLight: '#FEE2E2',
    accent: '#111111',
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
    const [descExpanded, setDescExpanded] = useState(false)
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

        const phone = property.contact_number
        const email = property.owner_email

        if (!phone && !email) {
            Alert.alert('Contact unavailable', 'This listing does not have owner contact details yet.')
            return
        }

        const buttons: Array<{ text: string; style?: 'default' | 'cancel' | 'destructive'; onPress?: () => void }> = []

        if (phone) {
            buttons.push({
                text: 'Send WhatsApp Message',
                onPress: async () => {
                    const cleanPhone = String(phone).replace(/[^\d]/g, '')
                    const message = encodeURIComponent(
                        `Hello, I am interested in your property listing: ${property.title}. Can we discuss further?`
                    )
                    const url = `https://wa.me/${phone}?text=${message}`
                    try {
                        await Linking.openURL(url)
                    } catch {
                        Alert.alert('Error', 'Failed to open WhatsApp. Please check the phone number and try again.')
                    }
                }
            })

            buttons.push({
                text: 'Call Owner',
                onPress: async () => {
                    const url = `tel:${phone}`
                    try {
                        const supported = await Linking.canOpenURL(url)
                        if (supported) {
                            await Linking.openURL(url)
                        } else {
                            Alert.alert('Error', 'Unable to make phone calls on this device.')
                        }
                    } catch {
                        Alert.alert('Error', 'An error occurred while trying to make a call.')
                    }
                }
            })

        }

        if (email) {
            buttons.push({
                text: 'Send Email',
                onPress: async () => {
                    const url = `mailto:${email}`
                    try {
                        const supported = await Linking.canOpenURL(url)
                        if (supported) {
                            await Linking.openURL(url)
                        } else {
                            Alert.alert('Error', 'No email client configured on this device.')
                        }
                    } catch {
                        Alert.alert('Error', 'An error occurred while trying to send an email.')
                    }
                }
            })
        }


        if (Platform.OS === 'ios') {
            buttons.push({
                text: 'Cancel',
                style: 'cancel'
            })
        }

        Alert.alert(
            'Contact Owner',
            'How would you like to contact the owner of this property?',
            buttons
        )
    }


    if (loading && !property) {
        return (
            <SafeAreaView style={{ flex: 1, backgroundColor: C.bg, alignItems: 'center', justifyContent: 'center' }}>
                <Text style={{ color: C.textMuted }}>Loading property...</Text>
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
                    style={{ backgroundColor: C.accent, paddingVertical: 16, borderRadius: 16, alignItems: 'center' }}
                >
                    <Text style={{ color: C.white, fontWeight: '700' }}>Go Back</Text>
                </TouchableOpacity>
            </SafeAreaView>
        )
    }

    const images = property.images?.length ? property.images : [FALLBACK_IMAGE]
    const description = property.description || 'No description available for this listing yet.'
    const shortDesc = description.length > 120 ? description.slice(0, 120) + '...' : description

    return (
        <View style={{ flex: 1, backgroundColor: C.bg }}>
            <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
                <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>

                    {/* ── Full-bleed hero image ── */}
                    <View style={{ width: SCREEN_WIDTH, height: IMAGE_HEIGHT, position: 'relative' }}>
                        <FlatList
                            data={images}
                            keyExtractor={(_, i) => `img-${i}`}
                            horizontal
                            pagingEnabled
                            showsHorizontalScrollIndicator={false}
                            onMomentumScrollEnd={(e) => {
                                setActiveImageIndex(Math.round(e.nativeEvent.contentOffset.x / SCREEN_WIDTH))
                            }}
                            renderItem={({ item }) => (
                                <Image
                                    source={{ uri: item }}
                                    style={{ width: SCREEN_WIDTH, height: IMAGE_HEIGHT }}
                                    resizeMode="cover"
                                />
                            )}
                        />

                        {/* Overlay gradient hint */}
                        <View
                            style={{
                                position: 'absolute',
                                top: 0, left: 0, right: 0, bottom: 0,
                                backgroundColor: 'rgba(0,0,0,0.10)',
                            }}
                            pointerEvents="none"
                        />

                        {/* Top nav row */}
                        <SafeAreaView style={{ position: 'absolute', top: 0, left: 0, right: 0 }}>
                            <View style={{
                                flexDirection: 'row',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                paddingHorizontal: 16,
                                paddingTop: 8,
                            }}>
                                <TouchableOpacity
                                    onPress={() => router.back()}
                                    style={{
                                        width: 38,
                                        height: 38,
                                        borderRadius: 999,
                                        backgroundColor: 'rgba(255,255,255,0.85)',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                    }}
                                >
                                    <Ionicons name="chevron-back" size={20} color="#111111" />
                                </TouchableOpacity>

                                {/* Dot indicators */}
                                {images.length > 1 && (
                                    <View style={{ flexDirection: 'row', gap: 5, alignItems: 'center' }}>
                                        {images.map((_: any, i: number) => (
                                            <View
                                                key={i}
                                                style={{
                                                    height: 5,
                                                    width: activeImageIndex === i ? 16 : 5,
                                                    borderRadius: 999,
                                                    backgroundColor: activeImageIndex === i ? C.white : 'rgba(255,255,255,0.5)',
                                                }}
                                            />
                                        ))}
                                    </View>
                                )}

                                <TouchableOpacity
                                    onPress={async () => {
                                        if (!user?.id) {
                                            Alert.alert('Sign in required', 'Please sign in to save properties.')
                                            return
                                        }
                                        await toggleSave(property.id, saved, refetchSaved, supabase, user.id)
                                        refetchSaved()
                                    }}
                                    style={{
                                        width: 38,
                                        height: 38,
                                        borderRadius: 999,
                                        backgroundColor: 'rgba(255,255,255,0.85)',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                    }}
                                >
                                    <Ionicons
                                        name={isSaved ? 'heart' : 'heart-outline'}
                                        size={18}
                                        color={isSaved ? C.danger : '#111111'}
                                    />
                                </TouchableOpacity>
                            </View>
                        </SafeAreaView>
                    </View>

                    {/* ── White bottom sheet ── */}
                    <View
                        style={{
                            backgroundColor: C.white,
                            borderTopLeftRadius: 28,
                            borderTopRightRadius: 28,
                            marginTop: -24,
                            paddingHorizontal: 22,
                            paddingTop: 24,
                            paddingBottom: 8,
                        }}
                    >
                        {/* Drag handle */}
                        <View style={{ width: 36, height: 4, borderRadius: 999, backgroundColor: '#E0E0E0', alignSelf: 'center', marginBottom: 20 }} />

                        <Text style={{ color: C.textSecondary, fontSize: 8, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 3 }}>
                            {property.type}
                        </Text>
                        {/* Title row */}
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
                            <Text style={{ flex: 1, fontSize: 22, fontWeight: '800', color: C.textPrimary, letterSpacing: -0.3, marginRight: 12 }} numberOfLines={2}>
                                {property.title}
                            </Text>
                            {isSold && (
                                <View style={{ backgroundColor: C.dangerLight, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999, marginTop: 4 }}>
                                    <Text style={{ color: C.danger, fontSize: 11, fontWeight: '700' }}>Sold</Text>
                                </View>
                            )}
                        </View>

                        {/* Location */}
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5, marginBottom: 16 }}>
                            <Text style={{ color: C.textSecondary, fontSize: 13 }}>
                                {[property.address, property.city].filter(Boolean).join(', ')}
                            </Text>
                        </View>

                        {/* Description */}
                        <Text style={{ color: C.textSecondary, fontSize: 14, lineHeight: 22, marginBottom: 20 }}>
                            {descExpanded ? description : shortDesc}
                        </Text>
                        {description.length > 120 && (
                            <TouchableOpacity onPress={() => setDescExpanded(!descExpanded)} style={{ marginBottom: 20 }}>
                                <Text style={{ color: C.textPrimary, fontSize: 13, fontWeight: '700', textDecorationLine: 'underline' }}>
                                    {descExpanded ? 'Show less' : 'Read more'}
                                </Text>
                            </TouchableOpacity>
                        )}

                        {/* Stat chips */}
                        <View style={{ flexDirection: 'row', gap: 10, flexWrap: 'wrap', marginBottom: 22 }}>
                            {property.bathrooms != null && (
                                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: C.surfaceAlt, paddingHorizontal: 14, paddingVertical: 9, borderRadius: 999 }}>
                                    {/* <Ionicons name="water-outline" size={14} color={C.textSecondary} /> */}
                                    <Text style={{ color: C.textSecondary, fontSize: 13, fontWeight: '600' }}>{property.bathrooms} baths</Text>
                                </View>
                            )}
                            {property.bedrooms != null && (
                                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: C.surfaceAlt, paddingHorizontal: 14, paddingVertical: 9, borderRadius: 999 }}>
                                    {/* <Ionicons name="bed-outline" size={14} color={C.textSecondary} /> */}
                                    <Text style={{ color: C.textSecondary, fontSize: 13, fontWeight: '600' }}>{property.bedrooms} beds</Text>
                                </View>
                            )}
                            {property.area_sqft != null && (
                                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: C.surfaceAlt, paddingHorizontal: 14, paddingVertical: 9, borderRadius: 999 }}>
                                    {/* <Ionicons name="resize-outline" size={14} color={C.textSecondary} /> */}
                                    <Text style={{ color: C.textSecondary, fontSize: 13, fontWeight: '600' }}>{property.area_sqft} sqft</Text>
                                </View>
                            )}
                        </View>

                        {/* Price + CTA */}
                        <View style={{ marginBottom: 8 }}>
                            <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 6, marginBottom: 16 }}>
                                <Text style={{ fontSize: 32, fontWeight: '800', color: C.textPrimary, letterSpacing: -0.5 }}>
                                    {formatPrice(property.price)}
                                </Text>
                            </View>

                            <TouchableOpacity
                                activeOpacity={0.88}
                                onPress={openContact}
                                disabled={isSold}
                                style={{
                                    backgroundColor: isSold ? C.surfaceAlt : C.accent,
                                    paddingVertical: 18,
                                    borderRadius: 16,
                                    alignItems: 'center',
                                    flexDirection: 'row',
                                    justifyContent: 'center',
                                    gap: 8,
                                    opacity: isSold ? 0.55 : 1,
                                }}
                            >
                                {/* <Ionicons name="paper-plane-outline" size={16} color={isSold ? C.textMuted : C.white} /> */}
                                <Text style={{ color: isSold ? C.textMuted : C.white, fontWeight: '700', fontSize: 15 }}>
                                    {isSold ? 'Sold' : 'Contact Owner'}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* ── Related Properties ── */}
                    <View style={{ paddingHorizontal: 20, marginTop: 28 }}>
                        <Text style={{ fontSize: 18, fontWeight: '700', color: C.textPrimary, marginBottom: 14 }}>
                            Similar Properties
                        </Text>

                        <View style={{
                            backgroundColor: C.white,
                            borderRadius: 16,
                            paddingHorizontal: 14,
                            paddingVertical: 12,
                            borderWidth: 1,
                            borderColor: C.border,
                            marginBottom: 16,
                            flexDirection: 'row',
                            alignItems: 'center',
                            gap: 10,
                        }}>
                            <Ionicons name="search-outline" size={16} color={C.textMuted} />
                            <TextInput
                                value={search}
                                onChangeText={setSearch}
                                placeholder="Search by city, area, or title"
                                placeholderTextColor={C.textMuted}
                                style={{ flex: 1, color: C.textPrimary, fontSize: 14 }}
                            />
                        </View>

                        {relatedProperties.length === 0 ? (
                            <View style={{ backgroundColor: C.surfaceAlt, borderRadius: 16, padding: 18, alignItems: 'center' }}>
                                <Text style={{ color: C.textMuted, fontSize: 14 }}>No similar properties found.</Text>
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
                                        isSaved={saved?.some((s: any) => s.property_id === item.id) ?? false}
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
        </View>
    )
}
