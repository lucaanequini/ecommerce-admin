'use client'

import { Plus } from "lucide-react"
import { useRouter, useParams } from "next/navigation"
import { ProductColumn, columns } from "./columns"

import { Heading } from "@/components/ui/heading"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { DataTable } from "@/components/ui/data-table"
import { ApiList } from "@/components/ui/api-list"

interface ProductProps {
    data: ProductColumn[]
}

export const ProductClient: React.FC<ProductProps> = ({
    data
}) => {
    const router = useRouter()
    const params = useParams()

    return (
        <>
            <div className="flex items-center justify-between">
                <Heading
                    title={`Products (${data.length})`}
                    description="Manage products for your store."
                />
                <Button onClick={() => router.push(`/${params.storeId}/products/new`)}>
                    <Plus className='mr-2 h-4 w-4' />
                    Add New
                </Button>
            </div>
            <Separator />
            <DataTable columns={columns} data={data} searchKey="name" />
            <Heading
                title="API"
                description="API calls for Products"
            />
            <Separator />
            <ApiList entityName="products" entityIdName="productId" />
        </>
    )
}