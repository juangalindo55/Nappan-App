// /services/cart.service.ts

import { Cart } from "@/domain/cart.domain"
import { getSupabaseClient } from "@/lib/supabase"

type CustomerData = {
    name: string
    phone: string
}

export async function submitOrder(cart: Cart, customer: CustomerData) {
    const supabase = getSupabaseClient()

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
