import { useUserSync } from "../../hooks/useUserSync";
import { useAuth } from "@clerk/expo";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Redirect, Slot } from "expo-router";


export default function RootRoutesLayout() {
    const { isSignedIn, isLoaded } = useAuth()
    useUserSync()
    const queryClient = new QueryClient()
    if (!isLoaded) return null

    if (!isSignedIn) return <Redirect href="/sign-in" />;
    return (
        <QueryClientProvider client={queryClient}>
            <Slot />
        </QueryClientProvider>
    );
}
