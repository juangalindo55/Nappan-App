"use client"

import { useEffect, useState } from "react"
import { fetchAppConfig } from "@/services/config.service"
import { parseConfig } from "@/lib/config.parser"

export function useConfig() {
    const [config, setConfig] = useState<any>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function load() {
            try {
                const raw = await fetchAppConfig()
                const parsed = parseConfig(raw)
                setConfig(parsed)
            } catch (err) {
                console.error("CONFIG LOAD ERROR", err)
            } finally {
                setLoading(false)
            }
        }

        load()
    }, [])

    return { config, loading }
}