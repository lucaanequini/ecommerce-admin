'use client'

import { MoreHorizontal, Edit, Copy, Trash } from "lucide-react"
import toast from "react-hot-toast"
import { useParams, useRouter } from "next/navigation"
import axios from "axios"
import { useState } from "react"

import {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuLabel,
    DropdownMenuItem
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { AlertModal } from "@/components/modals/alert-modal"

import { ProductColumn } from "./columns"

interface CellActionProps {
    data: ProductColumn
}

export const CellAction: React.FC<CellActionProps> = ({
    data
}) => {
    const router = useRouter()
    const params = useParams()

    const [loading, setLoading] = useState(false)
    const [open, setOpen] = useState(false)

    const onCopy = (id: string) => {
        navigator.clipboard.writeText(id)
        toast.success('Product ID copied to the clipboard.')
    }

    const onDelete = async () => {
        try {
            setLoading(true)
            console.log(params.storeId, data.id)
            await axios.delete(`/api/${params.storeId}/products/${data.id}`)
            router.push(`/${params.storeId}/products`)
            router.refresh()
            toast.success('Product deleted.')
        } catch (error) {
            toast.error('Something went wrong.')
        } finally {
            setLoading(false)
            setOpen(false)
        }
    }

    return (
        <>
            <AlertModal
                isOpen={open}
                onClose={() => setOpen(false)}
                onConfirm={onDelete}
                loading={loading}
            />
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant='ghost' className="h-8 w-8 p-0">
                        <span className="sr-only">Open menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                    <DropdownMenuLabel>
                        Actions
                        <DropdownMenuItem className='font-medium' onClick={() => router.push(`/${params.storeId}/products/${data.id}`)}>
                            <Edit className='mr-2 h-4 w-4' />
                            Update
                        </DropdownMenuItem>
                        <DropdownMenuItem className='font-medium' onClick={() => onCopy(data.id)}>
                            <Copy className='mr-2 h-4 w-4' />
                            Copy Id
                        </DropdownMenuItem>
                        <DropdownMenuItem className='font-medium' onClick={() => setOpen(true)}>
                            <Trash className='mr-2 h-4 w-4' />
                            Delete
                        </DropdownMenuItem>
                    </DropdownMenuLabel>
                </DropdownMenuContent>
            </DropdownMenu>
        </>
    )
}