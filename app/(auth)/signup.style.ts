import { StyleSheet } from "react-native";

export const style = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
    },

    logo: {
        width: 100,
        height: 100,
    },

    heading: {
        fontSize: 18,
        fontWeight: 'bold',
    },

    subHeading: {
        fontSize: 14,
        marginTop: 8,
    },

    signupForm: {
        width: '100%',

        padding: 20,
        borderRadius: 10,
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 10,
    },

    input: {
        width: '100%',
        height: 40,
        borderColor: 'gray',
        borderWidth: 1,
        borderRadius: 5,
        padding: 10,
        marginTop: 10,
    },

    submitButton: {
        marginTop: 20,
        padding: 10,
        borderRadius: 5,
        width: '100%',
        height: 40,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#008080',
    },

    submitButtonText: {
        color: 'white',
        fontWeight: 'bold',
    },
    errorText: {
        color: "red",
        marginTop: 4,
        width: "100%",
        textAlign: "left",
    },
})