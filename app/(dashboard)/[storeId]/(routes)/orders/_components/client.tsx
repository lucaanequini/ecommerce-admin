'use client'

import { OrderColumn, columns } from "./columns"

import { Heading } from "@/components/ui/heading"
import { Separator } from "@/components/ui/separator"
import { DataTable } from "@/components/ui/data-table"
import { Order } from "@prisma/client"

interface OrderProps {
    data: OrderColumn[]
}

export const OrderClient: React.FC<OrderProps> = ({
    data
}) => {

    return (
        <>
            <Heading
                title={`Orders (${data.length})`}
                description="Manage orders for your store."
            />
            <Separator />
            <DataTable columns={columns} data={data} searchKey="products" />
        </>
    )
}