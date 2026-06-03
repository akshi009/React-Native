import { useAuth, useUser } from '@clerk/expo'
import { Ionicons } from '@expo/vector-icons'
import * as ImagePicker from 'expo-image-picker'
import { useFocusEffect } from 'expo-router'
import React, { useCallback, useState } from 'react'
import {
    ActivityIndicator,
    Alert,
    Dimensions,
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
import { createClerkSupabaseClient } from '../../../lib/supabase'
import { useProductStore } from '../../../store/productStore'
import { useUserStore } from '../../../store/userStore'

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window')
const CARD_WIDTH = (SCREEN_WIDTH - 44) / 2

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
    success: '#059669',
}

const PROPERTY_TYPES = ['Apartment', 'Villa', 'Plot', 'Commercial', 'Studio', 'Rent']

type Property = {
    id: string
    title: string
    description: string
    price: number
    type: string
    city: string
    address: string
    bedrooms: number
    bathrooms: number
    area_sqft: number
    images: string[]
    contact_number?: string
    owner_email?: string
    is_sold?: boolean

}

type FormState = {
    title: string
    price: string
    location: string
    description: string
    bedrooms: string
    bathrooms: string
    sqft: string
    contact_number: string
    owner_email: string
}

type SelectedImage = {
    id: string
    previewUri: string
    publicUrl: string | null
    status: 'uploading' | 'uploaded' | 'failed'
}

const EMPTY_FORM: FormState = {
    title: '',
    price: '',
    location: '',
    description: '',
    bedrooms: '',
    bathrooms: '',
    sqft: '',
    contact_number: '',
    owner_email: '',
}

function Field({
    label,
    value,
    onChangeText,
    placeholder,
    numeric,
    multiline,
}: {
    label: string
    value: string
    onChangeText: (v: string) => void
    placeholder?: string
    numeric?: boolean
    multiline?: boolean
}) {
    return (
        <View style={{ flex: 1 }}>
            <Text style={{ marginBottom: 6, color: C.textPrimary, fontWeight: '700', fontSize: 13 }}>
                {label}
            </Text>
            <TextInput
                value={value}
                onChangeText={onChangeText}
                placeholder={placeholder}
                placeholderTextColor={C.textMuted}
                keyboardType={numeric ? 'numeric' : 'default'}
                multiline={multiline}
                textAlignVertical={multiline ? 'top' : undefined}
                style={{
                    backgroundColor: C.surface,
                    borderRadius: 14,
                    paddingHorizontal: 14,
                    paddingTop: multiline ? 12 : 0,
                    height: multiline ? 110 : 50,
                    borderWidth: 1,
                    borderColor: C.border,
                    color: C.textPrimary,
                    fontSize: 14,
                }}
            />
        </View>
    )
}

export default function Create() {
    const { isAdmin } = useUserStore()
    const { user } = useUser()
    const { getToken } = useAuth()
    const supabase = createClerkSupabaseClient(getToken)

    // ── Create form state ──────────────────────────────────────────────────
    const [form, setForm] = useState<FormState>(EMPTY_FORM)
    const [selectedType, setSelectedType] = useState('Apartment')
    const [selectedImages, setSelectedImages] = useState<SelectedImage[]>([])
    const [publishing, setPublishing] = useState(false)
    const [uploadingImage, setUploadingImage] = useState(false)
    const [editImage, setEditImage] = useState<string | null>(null)

    const setField = (key: keyof FormState) => (val: string) =>
        setForm((prev) => ({ ...prev, [key]: val }))

    const [loading, setLoading] = useState(true)
    const [editingId, setEditingId] = useState<string | null>(null)
    const [editForm, setEditForm] = useState<Partial<FormState & { type: string }>>({})
    const [editUploadingImage, setEditUploadingImage] = useState(false)
    const [listingSearch, setListingSearch] = useState('')
    const [isPaid, setIsPaid] = useState(false)
    const [ispaymenterror, setIsPaymentError] = useState(false)

    useFocusEffect(
        useCallback(() => {
            const fetchErrorStatus = async () => {
                if (!user?.id) return
                const { data, error } = await supabase
                    .from('users')
                    .select('is_error_payment')
                    .eq('clerk_id', user.id)
                    .single()

                if (!error && data) {
                    setIsPaymentError(!!data)
                }
            }
            fetchErrorStatus()
        }, [user?.id])
    )

    useFocusEffect(
        useCallback(() => {
            const fetchErrorStatus = async () => {
                if (!user?.id) return
                const { data, error } = await supabase
                    .from('users')
                    .select('is_payment_open')
                    .eq('clerk_id', user.id)
                    .single()

                if (!error && data) {
                    setIsPaid(!!data)
                }
            }
            fetchErrorStatus()
        }, [user?.id])
    )

    const pickImages = async () => {
        const permission = await ImagePicker.requestMediaLibraryPermissionsAsync()

        if (!permission.granted) {
            Alert.alert(
                'Permission Required',
                'Please allow access to your photo library.'
            )
            return
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: 'images',
            allowsMultipleSelection: true,
            selectionLimit: 10,
            quality: 0.7,
            base64: true,
        })

        if (result.canceled || !result.assets?.length) return

        const pickedImages = result.assets.map((asset, index) => ({
            id: `${Date.now()}_${index}_${Math.random().toString(36).slice(2)}`,
            previewUri: asset.uri,
            publicUrl: null as string | null,
            status: 'uploading' as const,
        }))

        setSelectedImages((prev) => [...prev, ...pickedImages])
        setUploadingImage(true)

        const uploadSingleImage = async (asset: (typeof result.assets)[number], imageId: string) => {
            if (!asset.base64) {
                setSelectedImages((prev) =>
                    prev.map((item) =>
                        item.id === imageId
                            ? { ...item, status: 'failed' }
                            : item
                    )
                )
                return
            }

            const filename = `property_${Date.now()}_${Math.random().toString(36).slice(2)}.jpg`
            const buffer = Uint8Array.from(atob(asset.base64), (c) => c.charCodeAt(0))

            const { error } = await supabase.storage
                .from('property-images')
                .upload(filename, buffer, {
                    contentType: 'image/jpeg',
                    upsert: false,
                })

            if (error) {
                console.log('Upload error:', error)
                setSelectedImages((prev) =>
                    prev.map((item) =>
                        item.id === imageId
                            ? { ...item, status: 'failed' }
                            : item
                    )
                )
                return
            }

            const { data } = supabase.storage
                .from('property-images')
                .getPublicUrl(filename)

            setSelectedImages((prev) =>
                prev.map((item) =>
                    item.id === imageId
                        ? { ...item, publicUrl: data.publicUrl, status: 'uploaded' }
                        : item
                )
            )
        }

        try {
            await Promise.all(
                result.assets.map((asset, index) => uploadSingleImage(asset, pickedImages[index].id))
            )
        } catch (err) {
            console.log('Image upload error:', err)
            Alert.alert('Error', 'Failed to upload one or more images.')
        } finally {
            setUploadingImage(false)
        }
    }

    const removeSelectedImage = (imageId: string) => {
        setSelectedImages((prev) => prev.filter((item) => item.id !== imageId))
    }

    const retrySelectedImage = async (imageId: string) => {
        const image = selectedImages.find((item) => item.id === imageId)
        if (!image) return

        setSelectedImages((prev) =>
            prev.map((item) =>
                item.id === imageId
                    ? { ...item, status: 'uploading' }
                    : item
            )
        )

        try {
            const response = await fetch(image.previewUri)
            const blob = await response.blob()
            const arrayBuffer = await blob.arrayBuffer()
            const buffer = new Uint8Array(arrayBuffer)
            const filename = `property_${Date.now()}_${Math.random().toString(36).slice(2)}.jpg`

            const { error } = await supabase.storage
                .from('property-images')
                .upload(filename, buffer, {
                    contentType: 'image/jpeg',
                    upsert: false,
                })

            if (error) {
                setSelectedImages((prev) =>
                    prev.map((item) =>
                        item.id === imageId
                            ? { ...item, status: 'failed' }
                            : item
                    )
                )
                Alert.alert('Upload Failed', error.message)
                return
            }

            const { data } = supabase.storage
                .from('property-images')
                .getPublicUrl(filename)

            setSelectedImages((prev) =>
                prev.map((item) =>
                    item.id === imageId
                        ? { ...item, publicUrl: data.publicUrl, status: 'uploaded' }
                        : item
                )
            )
        } catch (err) {
            console.log('Retry upload error:', err)
            setSelectedImages((prev) =>
                prev.map((item) =>
                    item.id === imageId
                        ? { ...item, status: 'failed' }
                        : item
                )
            )
            return
        }
    }

    // ── Fetch all properties ───────────────────────────────────────────────

    const properties = useProductStore((state: any) => state.properties ?? [])

    useFocusEffect(
        useCallback(() => {
            if (isAdmin) {
                setLoading(true)
                fetchProperty()
                setLoading(false)
            }
        }, [isAdmin])
    )

    // ── Publish ────────────────────────────────────────────────────────────
    const onPublish = async () => {
        if (!form.title.trim() || !form.price || !form.location.trim()) {
            Alert.alert('Missing fields', 'Please fill in title, price and location.')
            return
        }

        if (uploadingImage || selectedImages.some((item) => item.status === 'uploading')) {
            Alert.alert('Please wait', 'Image is still uploading.')
            return
        }

        setPublishing(true)

        const imageUrls = selectedImages
            .filter((item) => item.status === 'uploaded' && item.publicUrl)
            .map((item) => item.publicUrl as string)

        const finalImages =
            imageUrls.length > 0
                ? imageUrls
                : [
                    'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=1200&q=80'
                ]

        // const [cityPart = '', ...addrParts] = form.location.split(',').map((s) => s.trim())

        const { error } = await supabase.from('properties').insert({
            title: form.title,
            description: form.description,
            price: Number(form.price) || 0,
            type: selectedType.toLowerCase(),
            // city: cityPart,
            address: form.location,
            bedrooms: Number(form.bedrooms) || 0,
            bathrooms: Number(form.bathrooms) || 0,
            area_sqft: Number(form.sqft) || 0,
            images: finalImages,
            contact_number: form.contact_number,
            owner_email: user?.emailAddresses?.[0]?.emailAddress ?? '',
        })

        setPublishing(false)
        if (error) {
            Alert.alert('Error', error.message)
        } else {
            setForm(EMPTY_FORM)
            setSelectedType('Apartment')
            setSelectedImages([])
            fetchProperty()
            Alert.alert('Success', 'Property published successfully!')
        }
    }


    // ── Start editing ──────────────────────────────────────────────────────
    const startEdit = (p: Property) => {
        setEditingId(p.id)

        setEditImage(
            p.images && p.images.length > 0
                ? p.images[0]
                : null
        )

        setEditForm({
            title: p.title,
            price: String(p.price),
            location: [p.city, p.address].filter(Boolean).join(', '),
            description: p.description,
            bedrooms: String(p.bedrooms),
            bathrooms: String(p.bathrooms),
            sqft: String(p.area_sqft),
            type: p.type,
        })
    }

    const setEditField = (key: string) => (val: string) =>
        setEditForm((prev) => ({ ...prev, [key]: val }))

    // ── Save edit ──────────────────────────────────────────────────────────
    const saveEdit = async (id: string) => {
        // FIX: Block save while image is still uploading
        if (editUploadingImage) {
            Alert.alert('Please wait', 'Image is still uploading.')
            return
        }

        const [cityPart = '', ...addrParts] = (editForm.location ?? '').split(',').map((s) => s.trim())

        // FIX: Include images so the newly uploaded image is actually saved to DB
        const updatePayload: Record<string, any> = {
            title: editForm.title,
            description: editForm.description,
            price: Number(editForm.price) || 0,
            type: editForm.type,
            city: cityPart,
            address: addrParts.join(', ') || cityPart,
            bedrooms: Number(editForm.bedrooms) || 0,
            bathrooms: Number(editForm.bathrooms) || 0,
            area_sqft: Number(editForm.sqft) || 0,
        }

        if (editImage) {
            updatePayload.images = [editImage]
        }

        const { error } = await supabase
            .from('properties')
            .update(updatePayload)
            .eq('id', id)

        if (error) {
            Alert.alert('Error', error.message)
        } else {
            setEditingId(null)
            fetchProperty()
        }
    }

    // ── Delete ─────────────────────────────────────────────────────────────
    const deleteProperty = (id: string) => {
        Alert.alert('Delete property', 'Are you sure you want to remove this listing?', [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Delete',
                style: 'destructive',
                onPress: async () => {
                    const { error } = await supabase.from('properties').delete().eq('id', id)
                    if (error) Alert.alert('Error', error.message)
                    else {
                        if (editingId === id) setEditingId(null)
                        fetchProperty()
                    }
                },
            },
        ])
    }

    const soldproperty = async (id: any) => {
        if (properties.find((x: any) => x.id === id)?.is_sold === false) {
            await supabase.from('properties').update({ is_sold: true }).eq('id', id)
            fetchProperty()
        }
        else {
            await supabase.from('properties').update({ is_sold: false }).eq('id', id)
            fetchProperty()
        }
    }

    // ── Menu Options ───────────────────────────────────────────────────────
    const showPropertyMenu = (p: Property) => {
        const soldButton = p.is_sold === false
            ? { text: 'Mark as Sold', onPress: () => soldproperty(p.id) }
            : { text: 'Mark as Unsold', onPress: () => soldproperty(p.id) }

        const iosButtons = [
            {
                text: 'Cancel',
                style: 'cancel' as const,
            },
            {
                text: 'Edit Listing',
                onPress: () => startEdit(p),
            },
            {
                text: 'Delete Listing',
                style: 'destructive' as const,
                onPress: () => deleteProperty(p.id),
            },
            soldButton,
        ]

        const androidButtons = [
            {
                text: 'Edit Listing',
                onPress: () => startEdit(p),
            },
            soldButton,
            {
                text: 'Delete Listing',
                style: 'destructive' as const,
                onPress: () => deleteProperty(p.id),
            },
        ]

        Alert.alert(
            p.title,
            'Manage this listing',
            Platform.OS === 'android' ? androidButtons : iosButtons,
            { cancelable: true }
        )
    }


    const handlePayment = async () => {
        const buttons: Array<{ text: string; style?: 'default' | 'cancel' | 'destructive'; onPress?: () => void }> = []
        buttons.push({
            text: 'Google Pay',
            style: 'default',
            onPress: () => openPayment('googlepay'),
        })
        buttons.push({
            text: 'PhonePe',
            style: 'default',
            onPress: () => openPayment('phonepe'),
        })
        buttons.push({
            text: 'Paytm',
            style: 'default',
            onPress: () => openPayment('paytm'),
        })
        if (Platform.OS !== 'android') {
            buttons.push({
                text: 'Cancel',
                style: 'cancel',
            })
        }

        Alert.alert(
            'Select Payment Method',
            'Choose your payment method',
            buttons,
            { cancelable: true }
        )
    }

    const openPayment = async (provider: string) => {
        try {
            const payeVPA = "8302192353@ptaxis";
            const payeeName = "kribb";
            const amount = "199.00";
            const currency = "INR";
            const transactionNote = "App Order Payment";

            const queryParams = `pa=${payeVPA}&pn=${encodeURIComponent(payeeName)}&am=${amount}&cu=${currency}&tn=${encodeURIComponent(transactionNote)}`;


            let url = '';
            if (provider === 'googlepay') {
                url = `tez://upi/pay?${queryParams}`;
            } else if (provider === 'paytm') {
                url = `paytmmp://upi/pay?${queryParams}`;
            } else {
                url = `upi://pay?${queryParams}`;
            }


            try {
                const isSupported = await Linking.canOpenURL(url);

                if (isSupported) {
                    await Linking.openURL(url);
                    await supabase
                        .from("users")
                        .update({ is_payment_open: true })
                        .eq("clerk_id", user?.id);
                    setIsPaid(true)
                } else {
                    Alert.alert("Error", `${provider} is not installed on this device.`);
                    setIsPaymentError(true)
                }
            } catch (error) {
                Alert.alert("Error", "An error occurred while opening the payment app.");
                setIsPaymentError(true)
            }
        } catch (error) {
            Alert.alert("Error", "An error occurred while opening the payment app.");
        }
    }


    // ── Not admin ──────────────────────────────────────────────────────────

    if (!isAdmin) {
        return (
            <View style={{ flex: 1, backgroundColor: '#111', marginBottom: 100 }}>
                <ScrollView
                    style={{
                        flex: 1,
                        backgroundColor: C.white,
                        borderTopLeftRadius: 28,
                        borderTopRightRadius: 28,
                        marginTop: -24,
                    }}
                    contentContainerStyle={{ paddingHorizontal: 24, paddingTop: 16, paddingBottom: 52 }}
                    showsVerticalScrollIndicator={false}
                >
                    <View style={{ height: SCREEN_HEIGHT * 0.30, position: 'relative' }}>
                        <Image
                            source={{ uri: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&q=80' }}
                            style={{ width: SCREEN_WIDTH, height: '100%' }}
                            resizeMode="cover"
                        />
                        <View style={{
                            position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
                            backgroundColor: 'rgba(0,0,0,0.42)',
                        }} />
                        <SafeAreaView style={{ position: 'absolute', bottom: 40, left: 22, right: 22 }}>
                            <Text style={{ color: '#fff', fontSize: 28, fontWeight: '800', lineHeight: 34, marginBottom: 8, letterSpacing: -0.5 }}>
                                List your properties.{'\n'}Reach real buyers.
                            </Text>
                            <Text style={{ color: 'rgba(255,255,255,0.65)', fontSize: 14 }}>
                                Upgrade to Pro and go live today.
                            </Text>
                        </SafeAreaView>
                    </View>

                    {/* Drag handle */}
                    <View style={{
                        width: 36, height: 4, borderRadius: 999,
                        backgroundColor: '#E0E0E0', alignSelf: 'center', marginBottom: 26,
                    }} />

                    {/* Plan badge */}
                    <View style={{
                        flexDirection: 'row', alignItems: 'center', gap: 6,
                        backgroundColor: C.surfaceAlt, alignSelf: 'flex-start',
                        borderRadius: 999, paddingHorizontal: 12, paddingVertical: 5, marginBottom: 18,
                    }}>
                        <Ionicons name="diamond-outline" size={13} color={C.textPrimary} />
                        <Text style={{ fontSize: 11, fontWeight: '700', color: C.textPrimary, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                            Pro Plan
                        </Text>
                    </View>

                    {/* Price */}
                    <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 5, marginBottom: 8 }}>
                        <Text style={{ fontSize: 52, fontWeight: '800', color: C.textPrimary, lineHeight: 52, letterSpacing: -1 }}>₹199</Text>
                    </View>
                    <Text style={{ fontSize: 14, color: C.textSecondary, marginBottom: 28, lineHeight: 22 }}>
                        Everything you need to list, manage and sell properties at scale.
                    </Text>

                    {/* Section label */}
                    <Text style={{
                        fontSize: 11, color: C.textMuted, fontWeight: '700',
                        textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 16,
                    }}>
                        What's included
                    </Text>

                    {/* Features */}
                    {[
                        { icon: 'infinite-outline', title: 'Unlimited property listings', sub: 'List as many properties as you want' },
                        { icon: 'images-outline', title: 'Multiple photos per listing', sub: 'Upload a full image gallery (up to 10)' },
                        { icon: 'call-outline', title: 'Direct buyer contact', sub: 'WhatsApp, call & email leads' },
                        { icon: 'location-outline', title: 'All cities & property types', sub: 'Residential, commercial & land' },
                    ].map((f, i) => (
                        <View key={i} style={{ flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: 16 }}>
                            <View style={{
                                width: 38, height: 38, borderRadius: 12,
                                backgroundColor: C.surfaceAlt,
                                alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                            }}>
                                <Ionicons name={f.icon as any} size={17} color={C.textPrimary} />
                            </View>
                            <View style={{ flex: 1 }}>
                                <Text style={{ fontSize: 14, fontWeight: '700', color: C.textPrimary, marginBottom: 2 }}>{f.title}</Text>
                                <Text style={{ fontSize: 12, color: C.textSecondary }}>{f.sub}</Text>
                            </View>
                        </View>
                    ))}

                    {/* Divider */}
                    <View style={{ borderTopWidth: 0.5, borderColor: C.border, marginVertical: 22 }} />

                    {/* ── Status banners ── */}
                    {isPaid && (
                        <View style={{
                            flexDirection: 'row', alignItems: 'flex-start', gap: 12,
                            backgroundColor: '#F0FDF4',
                            borderRadius: 14,
                            borderWidth: 1,
                            borderColor: '#BBF7D0',
                            padding: 14,
                            marginBottom: 16,
                        }}>
                            <Ionicons name="checkmark-circle" size={20} color="#16A34A" style={{ marginTop: 1 }} />
                            <View style={{ flex: 1 }}>
                                <Text style={{ fontSize: 13, fontWeight: '700', color: '#15803D', marginBottom: 3 }}>
                                    Payment received!
                                </Text>
                                <Text style={{ fontSize: 12, color: '#166534', lineHeight: 18 }}>
                                    Thanks! Your access will be activated within 24–48 hours. We'll notify you once it's live.
                                </Text>
                            </View>
                        </View>
                    )}

                    {ispaymenterror && (
                        <View style={{
                            flexDirection: 'row', alignItems: 'flex-start', gap: 12,
                            backgroundColor: '#FFF5F5',
                            borderRadius: 14,
                            borderWidth: 1,
                            borderColor: '#FECACA',
                            padding: 14,
                            marginBottom: 16,
                        }}>
                            <Ionicons name="alert-circle" size={20} color="#DC2626" style={{ marginTop: 1 }} />
                            <View style={{ flex: 1 }}>
                                <Text style={{ fontSize: 13, fontWeight: '700', color: '#B91C1C', marginBottom: 3 }}>
                                    Something went wrong
                                </Text>
                                <Text style={{ fontSize: 12, color: '#991B1B', lineHeight: 18 }}>
                                    Sorry, we couldn't complete the payment. Please try again or use a different app.
                                </Text>
                            </View>
                        </View>
                    )}

                    {/* CTA */}
                    <TouchableOpacity
                        activeOpacity={0.88}
                        onPress={handlePayment}
                        disabled={isPaid}
                        style={{
                            backgroundColor: isPaid ? C.surfaceAlt : C.accent,
                            borderRadius: 16,
                            paddingVertical: 18,
                            flexDirection: 'row',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: 9,
                            opacity: isPaid ? 0.6 : 1,
                        }}
                    >
                        <Text style={{ color: isPaid ? C.textMuted : C.white, fontWeight: '700', fontSize: 15 }}>
                            {isPaid ? 'Payment sent' : 'Get started for ₹199'}
                        </Text>
                        <Ionicons
                            name={isPaid ? 'checkmark' : 'arrow-forward'}
                            size={16}
                            color={isPaid ? C.textMuted : C.white}
                        />
                    </TouchableOpacity>

                </ScrollView>
            </View>
        )
    }


    const owner_property = properties.filter((p: any) => p.owner_email === user?.emailAddresses?.[0]?.emailAddress)
    const filteredOwnerProperties = owner_property.filter((p: any) => {
        const query = listingSearch.trim().toLowerCase()
        if (!query) return true

        return (
            p.title?.toLowerCase().includes(query) ||
            p.city?.toLowerCase().includes(query) ||
            p.address?.toLowerCase().includes(query) ||
            p.type?.toLowerCase().includes(query)
        )
    })

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: C.bg }}>
            <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
                <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 60 }}>

                    {/* ── Header ── */}
                    <View style={{ paddingHorizontal: 20, paddingTop: 16, paddingBottom: 20 }}>
                        <Text style={{ fontSize: 26, fontWeight: '800', color: C.textPrimary }}>
                            Admin Panel
                        </Text>
                        <Text style={{ color: C.textMuted, marginTop: 4, fontSize: 13 }}>
                            Publish and manage property listings
                        </Text>
                    </View>

                    {/* ══════════════════════════════════════════
                        CREATE FORM
                    ══════════════════════════════════════════ */}
                    <View style={{
                        marginHorizontal: 16,
                        backgroundColor: C.surface,
                        borderRadius: 20,
                        padding: 18,
                        borderWidth: 1,
                        borderColor: C.border,
                        marginBottom: 24,
                        gap: 14,
                    }}>
                        <Text style={{ fontSize: 14, fontWeight: '700', color: C.textPrimary }}>
                            New listing
                        </Text>

                        {/* Image Uploader */}
                        <View style={{ marginBottom: 6 }}>
                            <Text style={{ marginBottom: 8, color: C.textPrimary, fontWeight: '700', fontSize: 13 }}>
                                Property photos
                            </Text>

                            <TouchableOpacity
                                activeOpacity={0.8}
                                onPress={pickImages}
                                disabled={uploadingImage}
                                style={{
                                    height: 120,
                                    borderRadius: 16,
                                    backgroundColor: C.surfaceAlt,
                                    borderWidth: 1.5,
                                    borderColor: C.border,
                                    borderStyle: 'dashed',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: 6,
                                    opacity: uploadingImage ? 0.7 : 1,
                                }}
                            >
                                <Text style={{ fontSize: 28 }}>📸</Text>
                                <Text style={{ fontSize: 13, color: C.textSecondary, fontWeight: '700' }}>
                                    Add Property Photos
                                </Text>
                                <Text style={{ fontSize: 11, color: C.textMuted }}>
                                    Select up to 10 PNG/JPG images
                                </Text>
                            </TouchableOpacity>

                            {selectedImages.length > 0 && (
                                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 12 }}>
                                    {selectedImages.map((image) => (
                                        <View
                                            key={image.id}
                                            style={{
                                                width: '48%',
                                                height: 150,
                                                borderRadius: 16,
                                                overflow: 'hidden',
                                                position: 'relative',
                                                backgroundColor: C.surfaceAlt,
                                            }}
                                        >
                                            <Image
                                                source={{ uri: image.previewUri }}
                                                style={{ width: '100%', height: '100%' }}
                                                resizeMode="cover"
                                            />
                                            {image.status === 'uploading' && (
                                                <View style={{
                                                    ...StyleSheet_absoluteFill,
                                                    backgroundColor: 'rgba(0,0,0,0.45)',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                }}>
                                                    <ActivityIndicator color={C.white} size="small" />
                                                    <Text style={{ color: C.white, marginTop: 6, fontSize: 11, fontWeight: '600' }}>
                                                        Uploading...
                                                    </Text>
                                                </View>
                                            )}
                                            {image.status === 'uploaded' && (
                                                <View style={{
                                                    position: 'absolute',
                                                    top: 8,
                                                    left: 8,
                                                    backgroundColor: C.success,
                                                    paddingHorizontal: 8,
                                                    paddingVertical: 4,
                                                    borderRadius: 999,
                                                }}>
                                                    <Text style={{ color: C.white, fontSize: 11, fontWeight: '700' }}>
                                                        ✓ Uploaded
                                                    </Text>
                                                </View>
                                            )}
                                            {image.status === 'failed' && (
                                                <View style={{
                                                    position: 'absolute',
                                                    top: 8,
                                                    left: 8,
                                                    backgroundColor: C.danger,
                                                    paddingHorizontal: 8,
                                                    paddingVertical: 4,
                                                    borderRadius: 999,
                                                }}>
                                                    <Text style={{ color: C.white, fontSize: 11, fontWeight: '700' }}>
                                                        Failed
                                                    </Text>
                                                </View>
                                            )}
                                            <TouchableOpacity
                                                activeOpacity={0.7}
                                                onPress={() => removeSelectedImage(image.id)}
                                                style={{
                                                    position: 'absolute',
                                                    top: 8,
                                                    right: 8,
                                                    backgroundColor: 'rgba(15,23,42,0.65)',
                                                    width: 32,
                                                    height: 32,
                                                    borderRadius: 16,
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                }}
                                            >
                                                <Text style={{ color: C.white, fontSize: 14, fontWeight: 'bold' }}>✕</Text>
                                            </TouchableOpacity>
                                            {image.status === 'failed' && (
                                                <TouchableOpacity
                                                    activeOpacity={0.75}
                                                    onPress={() => retrySelectedImage(image.id)}
                                                    style={{
                                                        position: 'absolute',
                                                        bottom: 8,
                                                        left: 8,
                                                        backgroundColor: 'rgba(37,99,235,0.9)',
                                                        paddingHorizontal: 10,
                                                        paddingVertical: 5,
                                                        borderRadius: 999,
                                                    }}
                                                >
                                                    <Text style={{ color: C.white, fontSize: 11, fontWeight: '700' }}>
                                                        Retry
                                                    </Text>
                                                </TouchableOpacity>
                                            )}
                                        </View>
                                    ))}
                                </View>
                            )}
                        </View>

                        {/* Title */}
                        <Field
                            label="Property title"
                            value={form.title}
                            onChangeText={setField('title')}
                            placeholder="Modern Villa with Garden"
                        />

                        {/* Price */}
                        <Field
                            label="Price (₹)"
                            value={form.price}
                            onChangeText={setField('price')}
                            placeholder="4500000"
                            numeric
                        />

                        {/* Property Type */}
                        <View>
                            <Text style={{ marginBottom: 8, color: C.textPrimary, fontWeight: '700', fontSize: 13 }}>
                                Property type
                            </Text>
                            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
                                {PROPERTY_TYPES.map((item) => (
                                    <TouchableOpacity
                                        key={item}
                                        activeOpacity={0.8}
                                        onPress={() => setSelectedType(item)}
                                        style={{
                                            backgroundColor: selectedType === item ? C.accent : C.surface,
                                            paddingHorizontal: 16,
                                            paddingVertical: 8,
                                            borderRadius: 999,
                                            borderWidth: 1,
                                            borderColor: selectedType === item ? C.accent : C.border,
                                        }}
                                    >
                                        <Text style={{
                                            color: selectedType === item ? C.white : C.textSecondary,
                                            fontWeight: '700',
                                            fontSize: 13,
                                        }}>
                                            {item}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </ScrollView>
                        </View>

                        {/* Location */}
                        <Field
                            label="Location"
                            value={form.location}
                            onChangeText={setField('location')}
                            placeholder="Udaipur, Rajasthan"
                        />

                        {/* Beds / Baths / Sqft */}
                        <View style={{ flexDirection: 'row', gap: 10 }}>
                            <Field label="Bedrooms" value={form.bedrooms} onChangeText={setField('bedrooms')} placeholder="3" numeric />
                            <Field label="Bathrooms" value={form.bathrooms} onChangeText={setField('bathrooms')} placeholder="2" numeric />
                            <Field label="Sqft" value={form.sqft} onChangeText={setField('sqft')} placeholder="1200" numeric />
                        </View>

                        {/* Description */}
                        <Field
                            label="Description"
                            value={form.description}
                            onChangeText={setField('description')}
                            placeholder="Describe your property..."
                            multiline
                        />

                        <Field
                            label="Owner Contact Number"
                            value={form.contact_number}
                            onChangeText={setField('contact_number')}
                            placeholder="0987654321"
                            numeric
                        />

                        {/* Submit */}
                        <TouchableOpacity
                            activeOpacity={0.85}
                            onPress={onPublish}
                            disabled={publishing || uploadingImage}
                            style={{
                                backgroundColor: C.accent,
                                height: 52,
                                borderRadius: 16,
                                justifyContent: 'center',
                                alignItems: 'center',
                                marginTop: 4,
                                opacity: publishing || uploadingImage ? 0.7 : 1,
                            }}
                        >
                            {publishing ? (
                                <ActivityIndicator color={C.white} />
                            ) : (
                                <Text style={{ color: C.white, fontSize: 15, fontWeight: '800' }}>
                                    Publish Property
                                </Text>
                            )}
                        </TouchableOpacity>
                    </View>

                    {/* ══════════════════════════════════════════
                        LISTINGS
                    ══════════════════════════════════════════ */}
                    <View style={{ paddingHorizontal: 16 }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                            <Text style={{ fontSize: 14, fontWeight: '700', color: C.textPrimary }}>
                                All listings
                            </Text>
                            {!loading && (
                                <Text style={{ fontSize: 12, color: C.textMuted }}>
                                    {filteredOwnerProperties?.length} {filteredOwnerProperties?.length === 1 ? 'property' : 'properties'}
                                </Text>
                            )}
                        </View>

                        <View
                            style={{
                                backgroundColor: C.surface,
                                borderRadius: 16,
                                borderWidth: 1,
                                borderColor: C.border,
                                paddingHorizontal: 14,
                                paddingVertical: 12,
                                flexDirection: 'row',
                                alignItems: 'center',
                                gap: 10,
                                marginBottom: 14,
                            }}
                        >
                            <Text style={{ fontSize: 18, color: C.accent }}>⌕</Text>
                            <TextInput
                                value={listingSearch}
                                onChangeText={setListingSearch}
                                placeholder="Search my listings..."
                                placeholderTextColor={C.textMuted}
                                style={{ flex: 1, color: C.textPrimary, fontSize: 14 }}
                            />
                            {listingSearch.length > 0 && (
                                <TouchableOpacity
                                    activeOpacity={0.8}
                                    onPress={() => setListingSearch('')}
                                    style={{
                                        width: 24,
                                        height: 24,
                                        borderRadius: 999,
                                        backgroundColor: C.surfaceAlt,
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                    }}
                                >
                                    <Text style={{ color: C.textSecondary, fontSize: 14, fontWeight: '800' }}>
                                        ×
                                    </Text>
                                </TouchableOpacity>
                            )}
                        </View>

                        {loading ? (
                            <ActivityIndicator color={C.accent} style={{ marginTop: 24 }} />
                        ) : properties.length === 0 ? (
                            <View style={{
                                backgroundColor: C.surface,
                                borderRadius: 16,
                                padding: 32,
                                alignItems: 'center',
                                borderWidth: 1,
                                borderColor: C.border,
                            }}>
                                <Text style={{ fontSize: 32, marginBottom: 8 }}>🏘️</Text>
                                <Text style={{ color: C.textMuted, fontSize: 14 }}>No listings yet</Text>
                            </View>
                        ) : filteredOwnerProperties.length === 0 ? (
                            <View style={{
                                backgroundColor: C.surface,
                                borderRadius: 16,
                                padding: 24,
                                alignItems: 'center',
                                borderWidth: 1,
                                borderColor: C.border,
                            }}>
                                <Text style={{ fontSize: 28, marginBottom: 8 }}>🔎</Text>
                                <Text style={{ color: C.textPrimary, fontSize: 14, fontWeight: '700', marginBottom: 4 }}>
                                    No matching listings
                                </Text>
                                <Text style={{ color: C.textMuted, fontSize: 13, textAlign: 'center' }}>
                                    Try a different title, city, or property type.
                                </Text>
                            </View>
                        ) : (
                            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
                                {filteredOwnerProperties.map((p: any) => (
                                    <View
                                        key={p.id}
                                        style={{
                                            width: editingId === p.id ? '100%' : CARD_WIDTH,
                                            backgroundColor: C.surface,
                                            borderRadius: 24,
                                            borderWidth: 1,
                                            borderColor: editingId === p.id ? C.accent : 'rgba(226,229,236,0.9)',
                                            overflow: 'hidden',
                                            shadowColor: '#0F172A',
                                            shadowOpacity: 0.06,
                                            shadowRadius: 12,
                                            shadowOffset: { width: 0, height: 6 },
                                            elevation: 2,
                                        }}
                                    >
                                        {/* Property summary row */}
                                        <View style={{ paddingHorizontal: 12, paddingTop: 12, paddingBottom: 12 }}>
                                            <View
                                                style={{
                                                    flexDirection: 'row',
                                                    alignItems: 'center',
                                                    justifyContent: 'space-between',
                                                    marginBottom: 10,
                                                }}
                                            >
                                                {p.is_sold === true ? (
                                                    <View
                                                        style={{
                                                            backgroundColor: C.dangerLight,
                                                            paddingHorizontal: 10,
                                                            paddingVertical: 5,
                                                            borderRadius: 999,
                                                            alignSelf: 'flex-start',
                                                        }}
                                                    >
                                                        <Text style={{ fontSize: 9, fontWeight: '800', color: C.danger }}>
                                                            Sold
                                                        </Text>
                                                    </View>
                                                ) : (
                                                    <View style={{ flex: 1 }} />
                                                )}

                                                <TouchableOpacity
                                                    activeOpacity={0.7}
                                                    onPress={() => showPropertyMenu(p)}
                                                // style={{
                                                //     width: 32,
                                                //     height: 32,
                                                //     borderRadius: 999,
                                                //     backgroundColor: C.surfaceAlt,
                                                //     alignItems: 'center',
                                                //     justifyContent: 'center',
                                                // }}
                                                >
                                                    <Text
                                                        style={{
                                                            fontSize: 16,
                                                            color: C.textSecondary,
                                                            fontWeight: '900',
                                                        }}
                                                    >
                                                        •••
                                                    </Text>
                                                </TouchableOpacity>
                                            </View>

                                            <Image
                                                source={{ uri: (p.images && p.images.length > 0) ? p.images[0] : 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=1200&q=80' }}
                                                style={{
                                                    width: '100%',
                                                    height: 156,
                                                    borderRadius: 16,
                                                    backgroundColor: C.surfaceAlt,
                                                    marginBottom: 8,
                                                }}
                                                resizeMode="cover"
                                            />

                                            <View style={{ marginBottom: 4 }}>
                                                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10, marginBottom: 4 }}>
                                                    <View style={{ flex: 1 }}>

                                                        <Text numberOfLines={2} style={{ fontSize: 12, fontWeight: '700', color: C.textPrimary, lineHeight: 16 }}>
                                                            {p.title}
                                                        </Text>
                                                    </View>
                                                </View>
                                                <View>
                                                    <Text style={{ fontSize: 10, fontWeight: '700', color: C.textPrimary }}>
                                                        {p.type[0].toUpperCase() + p.type.slice(1)}
                                                    </Text>
                                                </View>
                                            </View>

                                            <Text numberOfLines={1} style={{ fontSize: 11, color: C.textSecondary, marginBottom: 8 }}>
                                                {[p.address, p.city].filter(Boolean).join(', ')}
                                            </Text>
                                            <View>
                                                <Text style={{ color: C.accent, fontSize: 13, fontWeight: '800', marginBottom: 4 }}>
                                                    ₹{p.price.toLocaleString('en-IN')}
                                                </Text>
                                            </View>

                                            {/* <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 2 }}>
                                                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
                                                    <Text style={{ color: C.textSecondary, fontSize: 10, fontWeight: '700' }}>
                                                        {p.bedrooms} beds
                                                    </Text>
                                                </View>

                                                <View style={{ width: 1, height: 12, backgroundColor: C.border }} />

                                                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
                                                    <Text style={{ color: C.textSecondary, fontSize: 10, fontWeight: '700' }}>
                                                        {p.bathrooms} baths
                                                    </Text>
                                                </View>
                                            </View> */}
                                        </View>

                                        {/* ── Inline edit panel ── */}
                                        {editingId === p.id && (
                                            <View style={{
                                                backgroundColor: C.surfaceAlt,
                                                borderTopWidth: 1,
                                                borderTopColor: C.border,
                                                padding: 16,
                                                gap: 12,
                                            }}>
                                                <Text style={{ fontSize: 13, fontWeight: '700', color: C.textPrimary, marginBottom: 2 }}>
                                                    Edit listing
                                                </Text>

                                                <Field label="Title" value={editForm.title ?? ''} onChangeText={setEditField('title')} placeholder="Property title" />
                                                <Field label="Price (₹)" value={editForm.price ?? ''} onChangeText={setEditField('price')} placeholder="4500000" numeric />
                                                <View>
                                                    <Text style={{
                                                        marginBottom: 8,
                                                        color: C.textPrimary,
                                                        fontWeight: '700',
                                                        fontSize: 13,
                                                    }}>
                                                        Property photo
                                                    </Text>

                                                    <View style={{ position: 'relative' }}>
                                                        <TouchableOpacity
                                                            activeOpacity={0.8}
                                                            onPress={async () => {
                                                                const result = await ImagePicker.launchImageLibraryAsync({
                                                                    mediaTypes: ['images'] as any,
                                                                    allowsEditing: true,
                                                                    aspect: [4, 3],
                                                                    quality: 0.8,
                                                                    base64: true,
                                                                })

                                                                if (result.canceled || !result.assets?.length) return

                                                                const asset = result.assets[0]
                                                                if (!asset.base64) return

                                                                // Show local preview immediately while uploading
                                                                setEditImage(asset.uri)
                                                                setEditUploadingImage(true)

                                                                try {
                                                                    const filename = `property_${Date.now()}_${Math.random()
                                                                        .toString(36)
                                                                        .slice(2)}.jpg`

                                                                    const buffer = Uint8Array.from(
                                                                        atob(asset.base64),
                                                                        (c) => c.charCodeAt(0)
                                                                    )

                                                                    const { error } = await supabase.storage
                                                                        .from('property-images')
                                                                        .upload(filename, buffer, {
                                                                            contentType: 'image/jpeg',
                                                                            upsert: false,
                                                                        })

                                                                    if (error) {
                                                                        Alert.alert('Upload Failed', error.message)
                                                                        return
                                                                    }

                                                                    const { data } = supabase.storage
                                                                        .from('property-images')
                                                                        .getPublicUrl(filename)

                                                                    // Store public URL — saveEdit will use this
                                                                    setEditImage(data.publicUrl)
                                                                } catch (err) {
                                                                    console.log('Edit image upload error:', err)
                                                                    Alert.alert('Error', 'Failed to upload image.')
                                                                } finally {
                                                                    setEditUploadingImage(false)
                                                                }
                                                            }}
                                                        >
                                                            <Image
                                                                source={{
                                                                    uri: editImage || p.images?.[0],
                                                                }}
                                                                style={{
                                                                    width: '100%',
                                                                    height: 180,
                                                                    borderRadius: 14,
                                                                    backgroundColor: C.surface,
                                                                }}
                                                                resizeMode="cover"
                                                            />
                                                        </TouchableOpacity>
                                                        {editUploadingImage && (
                                                            <View style={{
                                                                position: 'absolute',
                                                                top: 0, left: 0, right: 0, bottom: 0,
                                                                backgroundColor: 'rgba(0,0,0,0.45)',
                                                                borderRadius: 14,
                                                                alignItems: 'center',
                                                                justifyContent: 'center',
                                                            }}>
                                                                <ActivityIndicator color={C.white} size="large" />
                                                                <Text style={{ color: C.white, marginTop: 8, fontSize: 12, fontWeight: '600' }}>
                                                                    Uploading...
                                                                </Text>
                                                            </View>
                                                        )}
                                                    </View>
                                                </View>

                                                {/* Type pills for edit */}
                                                <View>
                                                    <Text style={{ marginBottom: 8, color: C.textPrimary, fontWeight: '700', fontSize: 13 }}>
                                                        Property type
                                                    </Text>
                                                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
                                                        {PROPERTY_TYPES.map((item) => (
                                                            <TouchableOpacity
                                                                key={item}
                                                                activeOpacity={0.8}
                                                                onPress={() => setEditForm((prev) => ({ ...prev, type: item }))}
                                                                style={{
                                                                    backgroundColor: editForm.type === item ? C.accent : C.surface,
                                                                    paddingHorizontal: 14,
                                                                    paddingVertical: 7,
                                                                    borderRadius: 999,
                                                                    borderWidth: 1,
                                                                    borderColor: editForm.type === item ? C.accent : C.border,
                                                                }}
                                                            >
                                                                <Text style={{
                                                                    color: editForm.type === item ? C.white : C.textSecondary,
                                                                    fontWeight: '700',
                                                                    fontSize: 12,
                                                                }}>
                                                                    {item}
                                                                </Text>
                                                            </TouchableOpacity>
                                                        ))}
                                                    </ScrollView>
                                                </View>

                                                <Field label="Location" value={editForm.location ?? ''} onChangeText={setEditField('location')} placeholder="City, Address" />

                                                <View style={{ flexDirection: 'row', gap: 10 }}>
                                                    <Field label="Bedrooms" value={editForm.bedrooms ?? ''} onChangeText={setEditField('bedrooms')} placeholder="3" numeric />
                                                    <Field label="Bathrooms" value={editForm.bathrooms ?? ''} onChangeText={setEditField('bathrooms')} placeholder="2" numeric />
                                                    <Field label="Sqft" value={editForm.sqft ?? ''} onChangeText={setEditField('sqft')} placeholder="1200" numeric />
                                                </View>

                                                <Field label="Description" value={editForm.description ?? ''} onChangeText={setEditField('description')} placeholder="Property description..." multiline />

                                                {/* Save / Cancel */}
                                                <View style={{ flexDirection: 'row', gap: 10, marginTop: 4 }}>
                                                    <TouchableOpacity
                                                        activeOpacity={0.8}
                                                        onPress={() => setEditingId(null)}
                                                        style={{
                                                            flex: 1,
                                                            backgroundColor: C.surfaceAlt,
                                                            height: 48,
                                                            borderRadius: 14,
                                                            justifyContent: 'center',
                                                            alignItems: 'center',
                                                            borderWidth: 1,
                                                            borderColor: C.border,
                                                        }}
                                                    >
                                                        <Text style={{ color: C.textSecondary, fontSize: 14, fontWeight: '700' }}>
                                                            Cancel
                                                        </Text>
                                                    </TouchableOpacity>

                                                    <TouchableOpacity
                                                        activeOpacity={0.85}
                                                        onPress={() => saveEdit(p.id)}
                                                        style={{
                                                            flex: 2,
                                                            backgroundColor: C.accent,
                                                            height: 48,
                                                            borderRadius: 14,
                                                            justifyContent: 'center',
                                                            alignItems: 'center',
                                                        }}
                                                    >
                                                        <Text style={{ color: C.white, fontSize: 14, fontWeight: '800' }}>
                                                            Save Changes
                                                        </Text>
                                                    </TouchableOpacity>
                                                </View>
                                            </View>
                                        )}
                                    </View>
                                ))}
                            </View>
                        )}
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView >
    )
}

// Helper used for the upload overlay (avoids importing StyleSheet just for this)
const StyleSheet_absoluteFill = {
    position: 'absolute' as const,
    top: 0, left: 0, right: 0, bottom: 0,
}
