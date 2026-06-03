import { Ionicons } from '@expo/vector-icons'
import { Dimensions, Image, Text, TouchableOpacity, View } from 'react-native'
import { Property } from '../types'

const { width: SCREEN_WIDTH } = Dimensions.get('window')
const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=1200&q=80'

const C = {
    surface: '#FFFFFF',
    surfaceAlt: '#F2F3F5',
    border: '#EBEBEB',
    textPrimary: '#111111',
    textSecondary: '#888888',
    textMuted: '#AAAAAA',
    danger: '#DC2626',
    dangerLight: '#FEE2E2',
    accent: '#111111',
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
    const imageHeight = isFeaturedVariant ? 220 : 160

    return (
        <TouchableOpacity
            activeOpacity={0.92}
            onPress={onPress}
            style={{
                width: cardWidth,
                backgroundColor: C.surface,
                borderRadius: 20,
                overflow: 'hidden',
                borderWidth: 1,
                borderColor: C.border,
            }}
        >
            {/* Image */}
            <View style={{ position: 'relative' }}>
                <Image
                    source={{ uri: item.images?.[0] || FALLBACK_IMAGE }}
                    style={{ width: '100%', height: imageHeight, backgroundColor: C.surfaceAlt }}
                    resizeMode="cover"
                />

                {/* Save button */}
                {onSave && (
                    <TouchableOpacity
                        onPress={onSave}
                        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                        style={{
                            position: 'absolute',
                            top: 12,
                            right: 12,
                            width: 34,
                            height: 34,
                            borderRadius: 999,
                            backgroundColor: 'rgba(255,255,255,0.90)',
                            alignItems: 'center',
                            justifyContent: 'center',
                            zIndex: 20,
                        }}
                    >
                        <Ionicons
                            name={isSaved ? 'heart' : 'heart-outline'}
                            size={17}
                            color={isSaved ? C.danger : '#333333'}
                        />
                    </TouchableOpacity>
                )}

                {/* Badges */}
                <View style={{ position: 'absolute', top: 12, left: 12, flexDirection: 'row', gap: 6 }}>
                    {item.is_featured && (
                        <View style={{ backgroundColor: 'rgba(255,255,255,0.92)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999 }}>
                            <Text style={{ color: '#111111', fontSize: 10, fontWeight: '700', letterSpacing: 0.2 }}>Featured</Text>
                        </View>
                    )}
                    {item.is_sold && (
                        <View style={{ backgroundColor: C.dangerLight, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999 }}>
                            <Text style={{ color: C.danger, fontSize: 10, fontWeight: '700' }}>Sold</Text>
                        </View>
                    )}
                </View>
            </View>

            {/* Info */}
            <View style={{ paddingHorizontal: 14, paddingTop: 12, paddingBottom: 14 }}>
                {item.type ? (
                    <Text style={{ color: C.textSecondary, fontSize: isFeaturedVariant ? 10 : 8, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 3 }}>
                        {item.type}
                    </Text>
                ) : null}
                <Text numberOfLines={1} style={{ color: C.textPrimary, fontSize: isFeaturedVariant ? 15 : 13, fontWeight: '700', marginBottom: 3 }}>
                    {item.title}
                </Text>
                <Text numberOfLines={1} style={{ color: C.textMuted, fontSize: 11, marginBottom: 10 }}>
                    {item.address}, {item.city}
                </Text>

                {isFeaturedVariant && (
                    <View style={{ flexDirection: 'row', gap: 8, marginBottom: 12 }}>
                        {item.bedrooms != null && (
                            <View style={{ backgroundColor: C.surfaceAlt, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 999 }}>
                                <Text style={{ color: C.textSecondary, fontSize: 11, fontWeight: '600' }}>{item.bedrooms} beds</Text>
                            </View>
                        )}
                        {item.bathrooms != null && (
                            <View style={{ backgroundColor: C.surfaceAlt, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 999 }}>
                                <Text style={{ color: C.textSecondary, fontSize: 11, fontWeight: '600' }}>{item.bathrooms} baths</Text>
                            </View>
                        )}
                        {item.area_sqft != null && (
                            <View style={{ backgroundColor: C.surfaceAlt, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 999 }}>
                                <Text style={{ color: C.textSecondary, fontSize: 11, fontWeight: '600' }}>{item.area_sqft} sqft</Text>
                            </View>
                        )}
                    </View>
                )}

                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Text style={{ color: C.textPrimary, fontSize: isFeaturedVariant ? 18 : 14, fontWeight: '800' }}>
                        {formatPrice(item.price)}
                    </Text>
                </View>
            </View>
        </TouchableOpacity>
    )
}