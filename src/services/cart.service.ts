// /services/cart.service.ts

import { createClient } from "@supabase/supabase-js"
import { Cart } from "@/domain/cart.domain"

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function submitOrder(cart: Cart, customer: any) {
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