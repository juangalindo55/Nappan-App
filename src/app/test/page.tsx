"use client"

import { useCartStore } from "../../store/cart.store"
import { submitOrder } from "../../services/cart.service"
import { useState } from "react"
import { useConfig } from "@/hooks/useConfig"
import type { CartExtra } from "@/domain/cart.domain"

type ConfigExtra = CartExtra

export default function TestPage() {
    const { cart, addItem, removeItem, updateQuantity } = useCartStore()
    const { config } = useConfig()

    const [selectedExtras, setSelectedExtras] = useState<ConfigExtra[]>([])

    function toggleExtra(extra: ConfigExtra) {
        setSelectedExtras(prev => {
            const exists = prev.find(e => e.label === extra.label)

            if (exists) {
                return prev.filter(e => e.label !== extra.label)
            }

            return [...prev, extra]
        })
    }

    const handleAdd = () => {
        if (!config) return

        const includes = config.includes["LUNCHBOX-1"] || []

        addItem({
            type: "lunchbox",
            sku: "LUNCHBOX-1",
            name: "Lunchbox Básico",
            quantity: 20,
            base_price: 125,
            config: {
                art: "Osito",
                fruit: "Fresa"
            },
            includes,
            extras: selectedExtras
        })

        setSelectedExtras([])
    }

    const handleCheckout = async () => {
        try {
            await submitOrder(cart, {
                name: "Juan Test",
                phone: "8110000000"
            })
            alert("Pedido enviado 🚀")
        } catch (err) {
            console.error(err)
            alert(err instanceof Error ? err.message : "Error desconocido")
        }
    }

    return (
        <div style={{ padding: 20 }}>
            <h1>Test Carrito</h1>

            {/* EXTRAS */}
            <h3>Extras disponibles:</h3>

            {(config?.extras["LUNCHBOX-1"] ?? []).map((extra: ConfigExtra, i: number) => (
                <div key={i}>
                    <label>
                        <input
                            type="checkbox"
                            onChange={() => toggleExtra(extra)}
                        />
                        {extra.label} (${extra.price})
                    </label>
                </div>
            ))}

            {/* BOTÓN AGREGAR */}
            <button
                onClick={handleAdd}
                style={{
                    backgroundColor: "white",
                    color: "black",
                    padding: "10px 20px",
                    borderRadius: "8px",
                    marginBottom: "20px"
                }}
            >
                Agregar Lunchbox
            </button>

            <hr />

            {/* CARRITO */}
            <h2>Carrito:</h2>

            {cart.items.length === 0 && <p>Carrito vacío</p>}

            {cart.items.map(item => (
                <div
                    key={item.id}
                    style={{
                        border: "1px solid white",
                        padding: 10,
                        marginBottom: 10
                    }}
                >
                    <p><b>{item.name}</b></p>

                    {/* EXTRAS */}
                    {item.extras.map((extra, i) => (
                        <p key={i}>
                            + {extra.label} (${extra.price})
                        </p>
                    ))}

                    {/* CANTIDAD */}
                    <div style={{ display: "flex", gap: 10 }}>
                        <button onClick={() => updateQuantity(item.id, item.quantity - 1)}>
                            -
                        </button>

                        <span>{item.quantity}</span>

                        <button onClick={() => updateQuantity(item.id, item.quantity + 1)}>
                            +
                        </button>
                    </div>

                    {/* ELIMINAR */}
                    <button
                        onClick={() => removeItem(item.id)}
                        style={{
                            marginTop: 10,
                            backgroundColor: "red",
                            color: "white",
                            padding: "5px 10px",
                            borderRadius: "5px"
                        }}
                    >
                        Eliminar
                    </button>
                </div>
            ))}

            {/* TOTAL */}
            <h2>
                Total: $
                {cart.items.reduce((acc, item) => {
                    const base = Number(item.base_price) || 0
                    const qty = Number(item.quantity) || 0

                    const extrasTotal = item.extras.reduce((sum, extra) => {
                        return sum + (Number(extra.price) || 0)
                    }, 0)

                    return acc + (base + extrasTotal) * qty
                }, 0)}
            </h2>

            {/* CHECKOUT */}
            {cart.items.length > 0 && (
                <button
                    onClick={handleCheckout}
                    style={{
                        backgroundColor: "green",
                        color: "white",
                        padding: "10px 20px",
                        borderRadius: "8px",
                        marginTop: 20
                    }}
                >
                    Finalizar compra
                </button>
            )}
        </div>
    )
}
