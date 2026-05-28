import { supabase } from "../lib/supabase";
import { useProductStore } from "../store/productStore";

export const fetchProperty = async () => {

    try {
        const { data: properties } = await supabase.from("properties").select("*").order("created_at", { ascending: false });
        useProductStore.getState().setProperties(properties!)
    } catch (error) {
        console.log(error);
    }
}
