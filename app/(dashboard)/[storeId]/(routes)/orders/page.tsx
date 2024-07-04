import { format } from 'date-fns'
import prismadb from "@/lib/prismadb"
import { formatter } from '@/lib/utils'

import { OrderClient } from "./_components/client"
import { OrderColumn } from "./_components/columns"
import { Size } from '@prisma/client'

const OrdersPage = async ({
    params
}: { params: { storeId: string } }) => {
    const orders = await prismadb.order.findMany({
        where: {
            storeId: params.storeId
        },
        include: {
            orderItems: {
                include: {
                    product: true,
                    size: true
                }
            }
        },
        orderBy: {
            createdAt: 'desc'
        }
    })

    const sizes = orders.flatMap((item) => item.orderItems.map((orderItem) => orderItem.sizeId))

    const sizeName = await prismadb.size.findFirst({
        where: {
            id: {
                in: sizes.flatMap((item) => item)
            }
        }
    })

    const formattedOrders: OrderColumn[] = orders.map((item) => ({
        id: item.id,
        size: item.orderItems.map((orderItem) => orderItem.size?.name || 'N/A').join(', '),
        phone: item.phone,
        address: item.address,
        products: item.orderItems.map((orderItem) => orderItem.product.name).join(', '),
        totalPrice: formatter.format(item.orderItems.reduce((total, item) => {
            return total + Number(item.product.price)
        }, 0)),
        isPaid: item.isPaid,
        createdAt: format(item.createdAt, 'MMMM do, yyyy')
    }))
    return (
        <div className="flex-col">
            <div className="flex-1 space-y-4 p-8 pt-6">
                <OrderClient data={formattedOrders} />
            </div>
        </div>
    )
}

export default OrdersPage