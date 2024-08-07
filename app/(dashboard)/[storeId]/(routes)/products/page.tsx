import { format } from 'date-fns'
import prismadb from "@/lib/prismadb"
import { formatter } from '@/lib/utils'

import { ProductClient } from "./_components/client"
import { ProductColumn } from "./_components/columns"

const ProductsPage = async ({
    params
}: { params: { storeId: string } }) => {
    const products = await prismadb.product.findMany({
        where: {
            storeId: params.storeId
        },
        include: {
            category: true,
            sizes: true,
            color: true
        },
        orderBy: {
            createdAt: 'desc'
        }
    })

    const formattedProducts: ProductColumn[] = products.map((item) => ({
        id: item.id,
        name: item.name,
        isFeatured: item.isFeatured,
        isArchived: item.isArchived,
        price: formatter.format(item.price.toNumber()),
        category: item.category.name,
        quantity: item.quantity.toString(),
        color: item.color.value,
        createdAt: format(item.createdAt, 'MMMM do, yyyy')
    }))
    return (
        <div className="flex-col">
            <div className="flex-1 space-y-4 p-8 pt-6">
                <ProductClient data={formattedProducts} />
            </div>
        </div>
    )
}

export default ProductsPage