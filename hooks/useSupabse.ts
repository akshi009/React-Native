
import { createClerkSupabaseClient } from "@/lib/supabase";
import { useAuth } from "@clerk/expo";
import { useMemo } from "react";
export default function useSupabase() {
    const {getToken}=useAuth()

    const client = useMemo(()=> createClerkSupabaseClient(()=>getToken()),[getToken])
    return client;

}
