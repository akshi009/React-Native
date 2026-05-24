import React, { useState } from 'react'
import {
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

const C = {
    bg: '#F5F6FA',
    surface: '#FFFFFF',
    surfaceAlt: '#EEF0F5',
    border: '#E2E5EC',
    accent: '#2563EB',
    accentLight: '#EBF2FF',
    accentText: '#1D4ED8',
    success: '#059669',
    danger: '#DC2626',
    textPrimary: '#0F172A',
    textSecondary: '#64748B',
    textMuted: '#94A3B8',
    white: '#FFFFFF',
}

const PROPERTY_TYPES = [
    'Apartment',
    'Villa',
    'Plot',
    'Commercial',
    'Studio',
]

export default function Create() {
    const [selectedType, setSelectedType] = useState('Apartment')

    return (
        <SafeAreaView
            style={{
                // flex: 1,/
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
                        List Your Property
                    </Text>

                    <Text
                        style={{
                            color: C.textMuted,
                            marginTop: 4,
                            fontSize: 14,
                            lineHeight: 22,
                        }}
                    >
                        Add your property details and reach buyers faster
                    </Text>
                </View>

                {/* Cover Image */}
                <View
                    style={{
                        marginHorizontal: 16,
                        backgroundColor: C.surface,
                        borderRadius: 24,
                        padding: 16,
                        borderWidth: 1,
                        borderColor: C.border,
                        marginBottom: 18,
                    }}
                >
                    <TouchableOpacity
                        activeOpacity={0.85}
                        style={{
                            height: 180,
                            borderRadius: 20,
                            backgroundColor: C.surfaceAlt,
                            justifyContent: 'center',
                            alignItems: 'center',
                            borderWidth: 1.5,
                            borderColor: C.border,
                            borderStyle: 'dashed',
                        }}
                    >
                        <Text style={{ fontSize: 42 }}>
                            🏡
                        </Text>

                        <Text
                            style={{
                                marginTop: 10,
                                fontSize: 16,
                                fontWeight: '700',
                                color: C.textPrimary,
                            }}
                        >
                            Upload Property Photos
                        </Text>

                        <Text
                            style={{
                                marginTop: 4,
                                fontSize: 12,
                                color: C.textMuted,
                            }}
                        >
                            JPG, PNG • Max 10 images
                        </Text>
                    </TouchableOpacity>
                </View>

                {/* Form */}
                <View
                    style={{
                        paddingHorizontal: 16,
                        gap: 16,
                    }}
                >
                    {/* Property Title */}
                    <View>
                        <Text
                            style={{
                                marginBottom: 8,
                                color: C.textPrimary,
                                fontWeight: '700',
                                fontSize: 14,
                            }}
                        >
                            Property Title
                        </Text>

                        <TextInput
                            placeholder="Modern Villa with Garden"
                            placeholderTextColor={C.textMuted}
                            style={{
                                backgroundColor: C.surface,
                                borderRadius: 16,
                                paddingHorizontal: 16,
                                height: 56,
                                borderWidth: 1,
                                borderColor: C.border,
                                color: C.textPrimary,
                                fontSize: 14,
                            }}
                        />
                    </View>

                    {/* Price */}
                    <View>
                        <Text
                            style={{
                                marginBottom: 8,
                                color: C.textPrimary,
                                fontWeight: '700',
                                fontSize: 14,
                            }}
                        >
                            Price
                        </Text>

                        <TextInput
                            placeholder="₹ 45,00,000"
                            placeholderTextColor={C.textMuted}
                            keyboardType="numeric"
                            style={{
                                backgroundColor: C.surface,
                                borderRadius: 16,
                                paddingHorizontal: 16,
                                height: 56,
                                borderWidth: 1,
                                borderColor: C.border,
                                color: C.textPrimary,
                                fontSize: 14,
                            }}
                        />
                    </View>

                    {/* Property Type */}
                    <View>
                        <Text
                            style={{
                                marginBottom: 10,
                                color: C.textPrimary,
                                fontWeight: '700',
                                fontSize: 14,
                            }}
                        >
                            Property Type
                        </Text>

                        <ScrollView
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            contentContainerStyle={{
                                gap: 10,
                            }}
                        >
                            {PROPERTY_TYPES.map((item) => (
                                <TouchableOpacity
                                    key={item}
                                    activeOpacity={0.85}
                                    onPress={() => setSelectedType(item)}
                                    style={{
                                        backgroundColor:
                                            selectedType === item
                                                ? C.accent
                                                : C.surface,
                                        paddingHorizontal: 18,
                                        paddingVertical: 10,
                                        borderRadius: 999,
                                        borderWidth: 1,
                                        borderColor:
                                            selectedType === item
                                                ? C.accent
                                                : C.border,
                                    }}
                                >
                                    <Text
                                        style={{
                                            color:
                                                selectedType === item
                                                    ? C.white
                                                    : C.textSecondary,
                                            fontWeight: '700',
                                            fontSize: 13,
                                        }}
                                    >
                                        {item}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </View>

                    {/* Location */}
                    <View>
                        <Text
                            style={{
                                marginBottom: 8,
                                color: C.textPrimary,
                                fontWeight: '700',
                                fontSize: 14,
                            }}
                        >
                            Location
                        </Text>

                        <TextInput
                            placeholder="Udaipur, Rajasthan"
                            placeholderTextColor={C.textMuted}
                            style={{
                                backgroundColor: C.surface,
                                borderRadius: 16,
                                paddingHorizontal: 16,
                                height: 56,
                                borderWidth: 1,
                                borderColor: C.border,
                                color: C.textPrimary,
                                fontSize: 14,
                            }}
                        />
                    </View>

                    {/* Description */}
                    <View>
                        <Text
                            style={{
                                marginBottom: 8,
                                color: C.textPrimary,
                                fontWeight: '700',
                                fontSize: 14,
                            }}
                        >
                            Description
                        </Text>

                        <TextInput
                            multiline
                            placeholder="Describe your property..."
                            placeholderTextColor={C.textMuted}
                            textAlignVertical="top"
                            style={{
                                backgroundColor: C.surface,
                                borderRadius: 16,
                                paddingHorizontal: 16,
                                paddingTop: 16,
                                height: 130,
                                borderWidth: 1,
                                borderColor: C.border,
                                color: C.textPrimary,
                                fontSize: 14,
                            }}
                        />
                    </View>

                    {/* Features */}
                    <View
                        style={{
                            flexDirection: 'row',
                            gap: 12,
                        }}
                    >
                        {[
                            {
                                label: 'Bedrooms',
                                placeholder: '3',
                            },
                            {
                                label: 'Bathrooms',
                                placeholder: '2',
                            },
                            {
                                label: 'Sqft',
                                placeholder: '1200',
                            },
                        ].map((item) => (
                            <View
                                key={item.label}
                                style={{
                                    flex: 1,
                                }}
                            >
                                <Text
                                    style={{
                                        marginBottom: 8,
                                        color: C.textPrimary,
                                        fontWeight: '700',
                                        fontSize: 14,
                                    }}
                                >
                                    {item.label}
                                </Text>

                                <TextInput
                                    placeholder={item.placeholder}
                                    placeholderTextColor={C.textMuted}
                                    keyboardType="numeric"
                                    style={{
                                        backgroundColor: C.surface,
                                        borderRadius: 16,
                                        paddingHorizontal: 16,
                                        height: 56,
                                        borderWidth: 1,
                                        borderColor: C.border,
                                        color: C.textPrimary,
                                        fontSize: 14,
                                    }}
                                />
                            </View>
                        ))}
                    </View>

                    {/* CTA */}
                    <TouchableOpacity
                        activeOpacity={0.88}
                        style={{
                            backgroundColor: C.accent,
                            height: 58,
                            borderRadius: 18,
                            justifyContent: 'center',
                            alignItems: 'center',
                            marginTop: 10,
                        }}
                    >
                        <Text
                            style={{
                                color: C.white,
                                fontSize: 16,
                                fontWeight: '800',
                            }}
                        >
                            Publish Property
                        </Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </SafeAreaView>
    )
}