"use client"

import { ColumnDef } from "@tanstack/react-table"

import { CellAction } from "./cell-action"

export type ProductColumn = {
    id: string
    name: string
    price: string
    // sizes: { productId: string, sizeId: string }[]
    category: string
    color: string
    isFeatured: boolean
    isArchived: boolean
    createdAt: string
    quantity: string
}

export const columns: ColumnDef<ProductColumn>[] = [
    {
        accessorKey: "name",
        header: "Name",
    },
    {
        accessorKey: "isArchived",
        header: "Archived",
    },
    {
        accessorKey: "isFeatured",
        header: "Featured",
    },
    {
        accessorKey: "price",
        header: "Price",
    },
    {
        accessorKey: "category",
        header: "Category",
    },
    {
        accessorKey: "quantity",
        header: "Quantity",
    },
    {
        accessorKey: "Color",
        header: "Color",
        cell: ({ row }) => (
            <div className="flex items-center gap-x-2">
                {row.original.color}
                <div className="w-6 h-6 rounded-full border" style={{ backgroundColor: row.original.color }} />
            </div>
        )

    },
    {
        accessorKey: "createdAt",
        header: "Date",
    },
    {
        id: 'actions',
        cell: ({ row }) => <CellAction data={row.original} />
    }
]
