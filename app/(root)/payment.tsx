import { useAuth, useUser } from '@clerk/expo'
import { Ionicons } from '@expo/vector-icons'
import { useRouter } from 'expo-router'
import React, { useEffect, useRef, useState } from 'react'
import {
    ActivityIndicator,
    Alert,
    Animated,
    AppState,
    AppStateStatus,
    Dimensions,
    Linking,
    Modal,
    ScrollView,
    Text,
    TouchableOpacity,
    View
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { createClerkSupabaseClient } from '../../lib/supabase'

const { width: W, height: H } = Dimensions.get('window')

// ── Palette ────────────────────────────────────────────────────────────────
const C = {
    bg: '#0A0A0A',
    card: '#141414',
    cardBorder: '#242424',
    surface: '#1C1C1C',
    accent: '#FFFFFF',
    accentMuted: 'rgba(255,255,255,0.08)',
    textPrimary: '#FFFFFF',
    textSecondary: '#888888',
    textMuted: '#444444',
    success: '#22C55E',
    successBg: 'rgba(34,197,94,0.1)',
    successBorder: 'rgba(34,197,94,0.25)',
    danger: '#EF4444',
    dangerBg: 'rgba(239,68,68,0.1)',
    dangerBorder: 'rgba(239,68,68,0.25)',
    divider: '#1F1F1F',
}

// ── UPI providers ─────────────────────────────────────────────────────────
const UPI_PROVIDERS = [
    {
        id: 'googlepay',
        name: 'Google Pay',
        shortName: 'GPay',
        scheme: 'tez://upi/pay',
        emoji: '🟢',
        color: '#4285F4',
        bgColor: 'rgba(66,133,244,0.12)',
        borderColor: 'rgba(66,133,244,0.25)',
    },
    {
        id: 'phonepe',
        name: 'PhonePe',
        shortName: 'PhonePe',
        scheme: 'phonepe://pay',
        emoji: '🟣',
        color: '#7C3AED',
        bgColor: 'rgba(124,58,237,0.12)',
        borderColor: 'rgba(124,58,237,0.25)',
    },
    {
        id: 'paytm',
        name: 'Paytm',
        shortName: 'Paytm',
        scheme: 'paytmmp://upi/pay',
        emoji: '🔵',
        color: '#00BAF2',
        bgColor: 'rgba(0,186,242,0.12)',
        borderColor: 'rgba(0,186,242,0.25)',
    },
    {
        id: 'upi',
        name: 'Other UPI App',
        shortName: 'UPI',
        scheme: 'upi://pay',
        emoji: '💳',
        color: '#F59E0B',
        bgColor: 'rgba(245,158,11,0.12)',
        borderColor: 'rgba(245,158,11,0.25)',
    },
]

const FEATURES = [
    { icon: 'infinite-outline' as const, label: 'Unlimited listings' },
    { icon: 'images-outline' as const, label: 'Up to 10 photos/listing' },
    { icon: 'call-outline' as const, label: 'Direct buyer contact' },
    { icon: 'location-outline' as const, label: 'All cities & types' },
]

// ── Awaiting confirmation modal ────────────────────────────────────────────
function AwaitingModal({
    visible,
    providerName,
    onConfirm,
    onCancel,
}: {
    visible: boolean
    providerName: string
    onConfirm: () => void
    onCancel: () => void
}) {
    const pulse = useRef(new Animated.Value(1)).current

    useEffect(() => {
        if (!visible) return
        const loop = Animated.loop(
            Animated.sequence([
                Animated.timing(pulse, { toValue: 1.08, duration: 800, useNativeDriver: true }),
                Animated.timing(pulse, { toValue: 1, duration: 800, useNativeDriver: true }),
            ])
        )
        loop.start()
        return () => loop.stop()
    }, [visible])

    return (
        <Modal visible={visible} transparent animationType="fade">
            <View style={{
                flex: 1,
                backgroundColor: 'rgba(0,0,0,0.85)',
                alignItems: 'center',
                justifyContent: 'center',
                padding: 24,
            }}>
                <View style={{
                    backgroundColor: C.card,
                    borderRadius: 28,
                    borderWidth: 1,
                    borderColor: C.cardBorder,
                    padding: 32,
                    alignItems: 'center',
                    width: '100%',
                    maxWidth: 360,
                }}>
                    {/* Pulsing icon */}
                    <Animated.View style={{
                        transform: [{ scale: pulse }],
                        width: 72,
                        height: 72,
                        borderRadius: 36,
                        backgroundColor: 'rgba(255,255,255,0.06)',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginBottom: 20,
                    }}>
                        <Text style={{ fontSize: 32 }}>💸</Text>
                    </Animated.View>

                    <Text style={{ fontSize: 20, fontWeight: '800', color: C.textPrimary, marginBottom: 8, textAlign: 'center' }}>
                        Complete Payment
                    </Text>
                    <Text style={{ fontSize: 14, color: C.textSecondary, textAlign: 'center', lineHeight: 22, marginBottom: 28 }}>
                        Finish the ₹199 payment in{' '}
                        <Text style={{ color: C.textPrimary, fontWeight: '700' }}>{providerName}</Text>
                        {' '}and come back here to confirm.
                    </Text>

                    {/* Confirm button */}
                    <TouchableOpacity
                        activeOpacity={0.85}
                        onPress={onConfirm}
                        style={{
                            backgroundColor: C.accent,
                            borderRadius: 16,
                            paddingVertical: 16,
                            paddingHorizontal: 32,
                            width: '100%',
                            alignItems: 'center',
                            marginBottom: 12,
                        }}
                    >
                        <Text style={{ color: '#000', fontWeight: '800', fontSize: 15 }}>
                            I've completed the payment
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity activeOpacity={0.7} onPress={onCancel}>
                        <Text style={{ color: C.textMuted, fontSize: 13, fontWeight: '600' }}>
                            Cancel
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    )
}

// ── Success modal ──────────────────────────────────────────────────────────
function SuccessModal({ visible, onDone }: { visible: boolean; onDone: () => void }) {
    const scale = useRef(new Animated.Value(0.7)).current
    const opacity = useRef(new Animated.Value(0)).current

    useEffect(() => {
        if (!visible) return
        Animated.parallel([
            Animated.spring(scale, { toValue: 1, useNativeDriver: true, tension: 60, friction: 8 }),
            Animated.timing(opacity, { toValue: 1, duration: 300, useNativeDriver: true }),
        ]).start()
    }, [visible])

    return (
        <Modal visible={visible} transparent animationType="none">
            <Animated.View style={{
                flex: 1,
                backgroundColor: 'rgba(0,0,0,0.9)',
                alignItems: 'center',
                justifyContent: 'center',
                padding: 24,
                opacity,
            }}>
                <Animated.View style={{
                    transform: [{ scale }],
                    backgroundColor: C.card,
                    borderRadius: 28,
                    borderWidth: 1,
                    borderColor: C.successBorder,
                    padding: 36,
                    alignItems: 'center',
                    width: '100%',
                    maxWidth: 360,
                }}>
                    <View style={{
                        width: 80,
                        height: 80,
                        borderRadius: 40,
                        backgroundColor: C.successBg,
                        borderWidth: 1,
                        borderColor: C.successBorder,
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginBottom: 20,
                    }}>
                        <Ionicons name="checkmark" size={40} color={C.success} />
                    </View>

                    <Text style={{ fontSize: 24, fontWeight: '800', color: C.textPrimary, marginBottom: 10, textAlign: 'center' }}>
                        Payment sent!
                    </Text>
                    <Text style={{ fontSize: 14, color: C.textSecondary, textAlign: 'center', lineHeight: 22, marginBottom: 32 }}>
                        Thanks! Your Pro access will be activated within{' '}
                        <Text style={{ color: C.textPrimary, fontWeight: '700' }}>24–48 hours</Text>.
                        We'll notify you once it's live.
                    </Text>

                    <TouchableOpacity
                        activeOpacity={0.85}
                        onPress={onDone}
                        style={{
                            backgroundColor: C.success,
                            borderRadius: 16,
                            paddingVertical: 16,
                            width: '100%',
                            alignItems: 'center',
                        }}
                    >
                        <Text style={{ color: '#fff', fontWeight: '800', fontSize: 15 }}>
                            Got it
                        </Text>
                    </TouchableOpacity>
                </Animated.View>
            </Animated.View>
        </Modal>
    )
}

// ── Main PaymentScreen ─────────────────────────────────────────────────────
export default function PaymentScreen() {
    const { user } = useUser()
    const { getToken } = useAuth()
    const router = useRouter()
    const supabase = createClerkSupabaseClient(getToken)

    const [selectedProvider, setSelectedProvider] = useState<string | null>(null)
    const [loading, setLoading] = useState(false)
    const [awaitingModal, setAwaitingModal] = useState(false)
    const [successModal, setSuccessModal] = useState(false)
    const [activeProviderName, setActiveProviderName] = useState('')

    // ── Detect app returning to foreground after UPI ───────────────────────
    const appState = useRef<AppStateStatus>(AppState.currentState)
    const didOpenUPI = useRef(false)

    useEffect(() => {
        const sub = AppState.addEventListener('change', (nextState) => {
            // User came back from UPI app to our app
            if (
                appState.current.match(/inactive|background/) &&
                nextState === 'active' &&
                didOpenUPI.current
            ) {
                didOpenUPI.current = false
                // Show awaiting confirmation modal
                // (we can't know if they paid or not — UPI doesn't send a callback)
                setAwaitingModal(true)
            }
            appState.current = nextState
        })
        return () => sub.remove()
    }, [])

    // ── Open UPI app ───────────────────────────────────────────────────────
    const openUPIApp = async (provider: typeof UPI_PROVIDERS[number]) => {
        setLoading(true)

        const payeVPA = process.env.EXPO_PUBLIC_PAYE_VPA
        const amount = process.env.EXPO_PUBLIC_AMOUNT
        const currency = process.env.EXPO_PUBLIC_CURRENCY ?? 'INR'
        const transactionNote = 'Pro Plan - App Access'

        const queryParams = [
            `pa=${payeVPA}`,
            `pn=${encodeURIComponent(user?.firstName ?? 'User')}`,
            `am=${amount}`,
            `cu=${currency}`,
            `tn=${encodeURIComponent(transactionNote)}`,
        ].join('&')

        const url = `${provider.scheme}?${queryParams}`
        const fallbackUrl = `upi://pay?${queryParams}`

        try {
            setActiveProviderName(provider.name)
            didOpenUPI.current = true

            try {
                await Linking.openURL(url)
            } catch {
                try {
                    await Linking.openURL(fallbackUrl)
                } catch {
                    didOpenUPI.current = false
                    Alert.alert(
                        'App not found',
                        `${provider.name} doesn't seem to be installed. Try another payment app.`
                    )
                }
            }
        } catch (err) {
            didOpenUPI.current = false
            Alert.alert('Error', 'Something went wrong. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    // ── User confirms payment done ─────────────────────────────────────────
    const handleConfirmPayment = async () => {
        setAwaitingModal(false)
        setLoading(true)

        try {
            await supabase
                .from('users')
                .update({ is_payment_open: true, is_error_payment: false })
                .eq('clerk_id', user?.id)

            setSuccessModal(true)
        } catch {
            Alert.alert('Error', 'Could not save payment status. Please contact support.')
        } finally {
            setLoading(false)
        }
    }

    const handleSuccessDone = () => {
        setSuccessModal(false)
        // Navigate back — router.back() or wherever fits your nav structure
        router.back()
    }

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: C.bg }}>
            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 48 }}
            >
                {/* ── Nav bar ── */}
                <View style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    paddingHorizontal: 20,
                    paddingTop: 8,
                    paddingBottom: 16,
                }}>
                    <TouchableOpacity
                        activeOpacity={0.7}
                        onPress={() => router.back()}
                        style={{
                            width: 40,
                            height: 40,
                            borderRadius: 20,
                            backgroundColor: C.surface,
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}
                    >
                        <Ionicons name="arrow-back" size={20} color={C.textPrimary} />
                    </TouchableOpacity>
                    <Text style={{ flex: 1, textAlign: 'center', fontSize: 15, fontWeight: '700', color: C.textPrimary }}>
                        Upgrade to Pro
                    </Text>
                    <View style={{ width: 40 }} />
                </View>

                {/* ── Hero price card ── */}
                <View style={{ paddingHorizontal: 20, marginBottom: 24 }}>
                    <View style={{
                        backgroundColor: C.card,
                        borderRadius: 24,
                        borderWidth: 1,
                        borderColor: C.cardBorder,
                        padding: 24,
                        alignItems: 'center',
                    }}>
                        {/* Badge */}
                        <View style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            gap: 6,
                            backgroundColor: C.accentMuted,
                            borderRadius: 999,
                            paddingHorizontal: 14,
                            paddingVertical: 6,
                            marginBottom: 20,
                        }}>
                            <Ionicons name="diamond-outline" size={13} color={C.textPrimary} />
                            <Text style={{ fontSize: 11, fontWeight: '800', color: C.textPrimary, letterSpacing: 1, textTransform: 'uppercase' }}>
                                Pro Plan
                            </Text>
                        </View>

                        {/* Price */}
                        <Text style={{ fontSize: 64, fontWeight: '800', color: C.textPrimary, letterSpacing: -2, lineHeight: 68 }}>
                            ₹199
                        </Text>
                        <Text style={{ fontSize: 13, color: C.textSecondary, marginTop: 4, marginBottom: 24 }}>
                            One-time payment · Lifetime access
                        </Text>

                        {/* Divider */}
                        <View style={{ width: '100%', height: 1, backgroundColor: C.divider, marginBottom: 20 }} />

                        {/* Features */}
                        <View style={{ width: '100%', gap: 14 }}>
                            {FEATURES.map((f, i) => (
                                <View key={i} style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                                    <View style={{
                                        width: 32,
                                        height: 32,
                                        borderRadius: 10,
                                        backgroundColor: C.surface,
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                    }}>
                                        <Ionicons name={f.icon} size={15} color={C.textPrimary} />
                                    </View>
                                    <Text style={{ fontSize: 14, color: C.textSecondary, fontWeight: '500' }}>
                                        {f.label}
                                    </Text>
                                    <Ionicons name="checkmark" size={16} color={C.success} style={{ marginLeft: 'auto' }} />
                                </View>
                            ))}
                        </View>
                    </View>
                </View>

                {/* ── Choose payment method ── */}
                <View style={{ paddingHorizontal: 20 }}>
                    <Text style={{ fontSize: 13, fontWeight: '700', color: C.textMuted, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 14 }}>
                        Pay with UPI
                    </Text>

                    <View style={{ gap: 10 }}>
                        {UPI_PROVIDERS.map((p) => {
                            const isSelected = selectedProvider === p.id
                            return (
                                <TouchableOpacity
                                    key={p.id}
                                    activeOpacity={0.8}
                                    onPress={() => setSelectedProvider(p.id)}
                                    style={{
                                        flexDirection: 'row',
                                        alignItems: 'center',
                                        gap: 14,
                                        backgroundColor: isSelected ? p.bgColor : C.card,
                                        borderRadius: 18,
                                        borderWidth: 1.5,
                                        borderColor: isSelected ? p.borderColor : C.cardBorder,
                                        padding: 16,
                                    }}
                                >
                                    {/* Icon */}
                                    <View style={{
                                        width: 44,
                                        height: 44,
                                        borderRadius: 14,
                                        backgroundColor: isSelected ? p.bgColor : C.surface,
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                    }}>
                                        <Text style={{ fontSize: 22 }}>{p.emoji}</Text>
                                    </View>

                                    {/* Label */}
                                    <View style={{ flex: 1 }}>
                                        <Text style={{ fontSize: 15, fontWeight: '700', color: C.textPrimary }}>
                                            {p.name}
                                        </Text>
                                        <Text style={{ fontSize: 12, color: C.textSecondary, marginTop: 2 }}>
                                            Pay via {p.shortName}
                                        </Text>
                                    </View>

                                    {/* Radio */}
                                    <View style={{
                                        width: 22,
                                        height: 22,
                                        borderRadius: 11,
                                        borderWidth: 2,
                                        borderColor: isSelected ? p.color : C.textMuted,
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                    }}>
                                        {isSelected && (
                                            <View style={{
                                                width: 11,
                                                height: 11,
                                                borderRadius: 6,
                                                backgroundColor: p.color,
                                            }} />
                                        )}
                                    </View>
                                </TouchableOpacity>
                            )
                        })}
                    </View>

                    {/* ── Pay button ── */}
                    <TouchableOpacity
                        activeOpacity={0.85}
                        disabled={!selectedProvider || loading}
                        onPress={() => {
                            const provider = UPI_PROVIDERS.find(p => p.id === selectedProvider)
                            if (provider) openUPIApp(provider)
                        }}
                        style={{
                            marginTop: 24,
                            backgroundColor: selectedProvider ? C.accent : C.surface,
                            borderRadius: 18,
                            paddingVertical: 18,
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexDirection: 'row',
                            gap: 10,
                            opacity: !selectedProvider ? 0.5 : 1,
                        }}
                    >
                        {loading ? (
                            <ActivityIndicator color="#000" />
                        ) : (
                            <>
                                <Text style={{
                                    fontSize: 16,
                                    fontWeight: '800',
                                    color: selectedProvider ? '#000000' : C.textMuted,
                                }}>
                                    Pay ₹199
                                </Text>
                                <Ionicons
                                    name="arrow-forward"
                                    size={18}
                                    color={selectedProvider ? '#000000' : C.textMuted}
                                />
                            </>
                        )}
                    </TouchableOpacity>

                    {/* ── Security note ── */}
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, justifyContent: 'center', marginTop: 16 }}>
                        <Ionicons name="lock-closed-outline" size={13} color={C.textMuted} />
                        <Text style={{ fontSize: 12, color: C.textMuted }}>
                            Secured · UPI encrypted payment
                        </Text>
                    </View>
                </View>
            </ScrollView>

            {/* ── Modals ── */}
            <AwaitingModal
                visible={awaitingModal}
                providerName={activeProviderName}
                onConfirm={handleConfirmPayment}
                onCancel={() => {
                    setAwaitingModal(false)
                    didOpenUPI.current = false
                }}
            />

            <SuccessModal
                visible={successModal}
                onDone={handleSuccessDone}
            />
        </SafeAreaView>
    )
}