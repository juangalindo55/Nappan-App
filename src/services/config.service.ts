import { supabase } from "@/lib/supabase"

export type AppConfigItem = {
    key: string
    value: string
}

export async function fetchAppConfig(): Promise<AppConfigItem[]> {
    const { data, error } = await supabase
        .from("app_config")
        .select("key, value")

    if (error) {
        console.error("CONFIG ERROR:", error)
        throw error
    }

    return data || []
}