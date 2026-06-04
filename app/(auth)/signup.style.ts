import { Dimensions, StyleSheet } from 'react-native'

const { width } = Dimensions.get('window')

export const style = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#F7F8FA',
    },

    backgroundImage: {
        width: '100%',
        height: 320,
        position: 'absolute',
        top: 0,
    },

    overlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.25)',
    },

    container: {
        flex: 1,
        paddingHorizontal: 24,
    },

    heroSection: {
        marginTop: 70,
    },

    logo: {
        width: 50,
        height: 50,
        marginBottom: 25,
    },

    heading: {
        fontSize: 42,
        fontWeight: '700',
        color: '#000000ff',
        lineHeight: 48,
        letterSpacing: -1,
    },

    subHeading: {
        color: 'rgba(35, 35, 35, 0.85)',
        fontSize: 16,
        marginTop: 10,
        lineHeight: 24,
        marginBottom: 15,
    },

    authCard: {
        marginTop: 50,
        backgroundColor: '#FFFFFF',
        borderRadius: 32,
        padding: 24,

        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 10,
        },
        shadowOpacity: 0.08,
        shadowRadius: 20,

        elevation: 10,
    },

    signupForm: {
        gap: 14,
    },

    row: {
        flexDirection: 'row',
        gap: 12,
    },

    flexInput: {
        flex: 1,
    },

    input: {
        height: 58,
        backgroundColor: '#F8F8F8',
        borderRadius: 18,
        paddingHorizontal: 18,
        fontSize: 15,
        color: '#111827',

        borderWidth: 1,
        borderColor: '#EEEEEE',
    },

    errorText: {
        color: '#EF4444',
        fontSize: 12,
        marginTop: 5,
        marginLeft: 4,
    },

    submitButton: {
        height: 60,
        backgroundColor: '#111827',
        borderRadius: 20,

        justifyContent: 'center',
        alignItems: 'center',

        marginTop: 8,
    },

    submitButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '700',
    },

    dividerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 20,
    },

    divider: {
        flex: 1,
        height: 1,
        backgroundColor: '#E5E7EB',
    },

    dividerText: {
        marginHorizontal: 10,
        color: '#9CA3AF',
        fontSize: 13,
    },

    socialButton: {
        height: 56,
        borderRadius: 18,
        borderWidth: 1,
        borderColor: '#E5E7EB',

        justifyContent: 'center',
        alignItems: 'center',

        flexDirection: 'row',
        gap: 10,
    },

    socialButtonText: {
        color: '#111827',
        fontWeight: '600',
        fontSize: 15,
    },

    footerRow: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 20,
    },

    footerText: {
        color: '#6B7280',
        fontSize: 15,
    },

    footerLink: {
        color: '#111827',
        fontSize: 15,
        fontWeight: '700',
    },

    verifyCard: {
        marginTop: 120,
        backgroundColor: '#FFF',
        borderRadius: 30,
        padding: 24,
    },

    codeInput: {
        height: 65,
        borderRadius: 18,
        backgroundColor: '#F8F8F8',
        textAlign: 'center',
        fontSize: 24,
        letterSpacing: 10,
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },

    resendText: {
        textAlign: 'center',
        marginTop: 15,
        color: '#6B7280',
        lineHeight: 22,
    },

    resendLink: {
        color: '#111827',
        fontWeight: '700',
    },
})