import Stripe from 'stripe'
import { headers } from 'next/headers'
import { NextResponse } from 'next/server'

import { stripe } from '../../../lib/stripe'
import prismadb from '../../../lib/prismadb'

export async function POST(req: Request) {
    const body = await req.text()
    const signature = headers().get('Stripe-Signature') as string

    let event: Stripe.Event

    try {
        event = stripe.webhooks.constructEvent(
            body,
            signature,
            process.env.STRIPE_WEBHOOK_SECRET!
        )
    } catch (error) {
        return new NextResponse('Webhook Error', { status: 400 })
    }

    const session = event.data.object as Stripe.Checkout.Session
    const address = session?.customer_details?.address

    const addressComponents = [
        address?.line1,
        address?.line2,
        address?.city,
        address?.state,
        address?.postal_code,
        address?.country
    ]

    const addressString = addressComponents.filter((c) => c !== null).join(', ')

    if (event.type === 'checkout.session.completed') {
        const order = await prismadb.order.update({
            where: {
                id: session?.metadata?.orderId
            },
            data: {
                isPaid: true,
                address: addressString,
                phone: session?.customer_details?.phone || ''
            },
            include: {
                orderItems: true
            }
        })

        const productIds = order.orderItems.map((orderItem) => orderItem.productId)

        const products = await prismadb.product.findMany({
            where: {
                id: {
                    in: [...productIds]
                }
            }
        })

        const qtd = products.map((product) => product.quantity)
        
        await prismadb.product.updateMany({
            where: {
                id: {
                    in: [...productIds]
                }
            },
            data: {
                quantity: {
                    decrement: 1
                },
                isArchived: qtd.some((qtd) => qtd === 1 ? true : false)
            }
        })
    }
    
    return new NextResponse(null, {status: 200})
}