import { Ionicons } from '@expo/vector-icons'
import { Dimensions, Image, Text, TouchableOpacity, View } from 'react-native'
import { Property } from '../types'

const { width: SCREEN_WIDTH } = Dimensions.get('window')
const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=1200&q=80'

const C = {
    surface: '#FFFFFF',
    surfaceAlt: '#EEF0F5',
    border: '#E2E5EC',
    accentLight: '#EBF2FF',
    accentText: '#1D4ED8',
    danger: '#DC2626',
    dangerLight: '#FEE2E2',
    textPrimary: '#0F172A',
    textSecondary: '#64748B',
    white: '#FFFFFF',
}

const formatPrice = (price: number): string => {
    if (price >= 10000000) return `₹${(price / 10000000).toFixed(1).replace(/\.0$/, '')} Cr`
    if (price >= 100000) return `₹${(price / 100000).toFixed(1).replace(/\.0$/, '')} Lac`
    if (price >= 1000) return `₹${(price / 1000).toFixed(1).replace(/\.0$/, '')}K`
    return `₹${price}`
}

type PropertyCardProps = {
    item: Property
    onPress: () => void
    onSave?: () => void
    isSaved?: boolean
    variant?: 'grid' | 'featured'
}

export function PropertyCard({
    item,
    onPress,
    onSave,
    isSaved = false,
    variant = 'grid',
}: PropertyCardProps) {
    const isFeaturedVariant = variant === 'featured'
    const cardWidth = isFeaturedVariant ? SCREEN_WIDTH - 32 : (SCREEN_WIDTH - 44) / 2
    const imageHeight = isFeaturedVariant ? 182 : 156

    return (
        <TouchableOpacity
            activeOpacity={0.88}
            onPress={onPress}
            style={{
                width: cardWidth,
                backgroundColor: C.surface,
                borderRadius: 24,
                overflow: 'hidden',
                borderWidth: 1,
                borderColor: 'rgba(226,229,236,0.9)',
                shadowColor: '#0F172A',
                shadowOpacity: 0.06,
                shadowRadius: 12,
                shadowOffset: { width: 0, height: 6 },
                elevation: 2,
            }}
        >
            <Image
                source={{ uri: item.images?.[0] || FALLBACK_IMAGE }}
                style={{ width: '100%', height: imageHeight, backgroundColor: C.surfaceAlt }}
                resizeMode="cover"
            />

            {onSave && (
                <TouchableOpacity
                    onPress={onSave}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    style={{
                        position: 'absolute',
                        top: 10,
                        right: 10,
                        width: 32,
                        height: 32,
                        borderRadius: 999,
                        backgroundColor: isSaved ? 'rgba(254,242,242,0.96)' : 'rgba(255,255,255,0.24)',
                        alignItems: 'center',
                        justifyContent: 'center',
                        borderWidth: 1,
                        borderColor: isSaved ? 'rgba(220,38,38,0.18)' : 'rgba(255,255,255,0.3)',
                        zIndex: 20,
                    }}
                >
                    <Ionicons
                        name={isSaved ? 'heart' : 'heart-outline'}
                        size={18}
                        color={isSaved ? C.danger : C.white}
                    />
                </TouchableOpacity>
            )}

            <View
                style={{
                    position: 'absolute',
                    top: 10,
                    left: 10,
                    flexDirection: 'row',
                    gap: 6,
                    flexWrap: 'wrap',
                    right: 8,
                }}
            >
                {item.is_featured && (
                    <View style={{ backgroundColor: C.accentLight, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 999 }}>
                        <Text style={{ color: C.accentText, fontSize: 9, fontWeight: '800' }}>Featured</Text>
                    </View>
                )}
                {item.is_sold && (
                    <View style={{ backgroundColor: C.dangerLight, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 999 }}>
                        <Text style={{ color: C.danger, fontSize: 9, fontWeight: '700' }}>Sold</Text>
                    </View>
                )}
            </View>

            <View style={{ paddingHorizontal: 12, paddingTop: 10, paddingBottom: 12 }}>
                <View style={{ flexDirection: 'column', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 4 }}>

                    <Text numberOfLines={2} style={{ color: C.textPrimary, fontSize: 12, fontWeight: '700', lineHeight: 16 }}>
                        {item.title}
                    </Text>
                    <View >
                        <Text style={{ color: C.textPrimary, fontSize: 10, fontWeight: '700', marginVertical: 4 }}>
                            {item.type[0].toUpperCase() + item.type.slice(1)}
                        </Text>
                    </View>
                </View>

                <Text numberOfLines={1} style={{ color: C.textSecondary, fontSize: 10, marginBottom: 6 }}>
                    {item.address}, {item.city}
                </Text>

                <View style={{ flexDirection: 'row', justifyContent: 'space-between', width: '100%', marginBottom: 4 }}>
                    <Text style={{ color: C.accentText, fontSize: 13, fontWeight: '800' }}>
                        {formatPrice(item.price)}
                    </Text>
                </View>

                {/* <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 4 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
                      
                        <Text style={{ color: C.textSecondary, fontSize: 10, fontWeight: '700' }}>
                            {item.bedrooms} beds
                        </Text>
                    </View>

                    <View style={{ width: 1, height: 12, backgroundColor: C.border }} />

                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
                       
                        <Text style={{ color: C.textSecondary, fontSize: 10, fontWeight: '700' }}>
                            {item.bathrooms} baths
                        </Text>
                    </View>
                </View> */}
            </View>
        </TouchableOpacity>
    )
}
