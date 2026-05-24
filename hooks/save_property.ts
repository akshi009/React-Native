import { SupabaseClient } from "@supabase/supabase-js"

export const fetchSavedIds = async (supabase: SupabaseClient, userId: string): Promise<any[]> => {
    try {
        const res = await supabase.from('saved_properties').select(`*,properties (*)`).eq('user_clerk_id', userId)
        if (res.error) {
            alert(res.error.message)
            return []
        }
        return res.data || []
    } catch (error) {
        alert(error instanceof Error ? error.message : String(error))
        return []
    }
}


export const toggleSave = async (id: string, saved: any, refetch: any, supabase: SupabaseClient, userId: string) => {



    try {
        if (!saved?.map((item: any) => item.property_id).includes(id)) {
            const { data, error } = await supabase.from('saved_properties').insert({ property_id: id, user_clerk_id: userId }).select()
            if (error) return alert(error.message)

        }
        else {
            const { data, error } = await supabase.from('saved_properties').delete().eq('property_id', id).eq('user_clerk_id', userId).select()
            if (error) return alert(error.message)
        }
        refetch()

    } catch (error) {
        alert(error)
    }
}



