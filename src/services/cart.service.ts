// /services/cart.service.ts

import { createClient } from "@supabase/supabase-js"
import { Cart } from "@/domain/cart.domain"

type CustomerData = {
    name: string
    phone: string
}

export async function submitOrder(cart: Cart, customer: CustomerData) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl) {
        throw new Error("Falta configurar NEXT_PUBLIC_SUPABASE_URL.")
    }

    if (!supabaseKey) {
        throw new Error("Falta configurar NEXT_PUBLIC_SUPABASE_ANON_KEY.")
    }

    const supabase = createClient(supabaseUrl, supabaseKey)

    const orderNumber = `ORD-${Date.now()}-${Math.floor(Math.random() * 10000)}`

    const { error } = await supabase.from("orders").insert({
        order_number: orderNumber, // 👈 COMA AQUÍ

        total: cart.summary.total,
        raw_cart: cart,
        customer_data: customer,

        section: cart.type,

        customer_name: customer.name,
        customer_phone: customer.phone
    })

    if (error) {
        console.error("SUPABASE ERROR:", error)
        throw new Error(error.message)
    }

    return true
}
