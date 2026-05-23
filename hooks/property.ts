import { supabase } from "@/lib/supabase";
import { useProductStore } from "@/store/productStore";

export const fetchProperty = async () => {

    try {
        const { data: properties } = await supabase.from("properties").select("*");
        useProductStore.getState().setProperties(properties!)
    } catch (error) {
        console.log(error);
    }
}