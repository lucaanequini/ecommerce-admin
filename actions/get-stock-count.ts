import prismadb from "@/lib/prismadb";

export const getStockCount = async (storeId: string) => {
    const products = await prismadb.product.findMany({
        where: {
            storeId,
            isArchived: false
        },
        select: {
            quantity: true
        }
    })

    const totalQuantity = Object.values(products).reduce((total, product: {quantity: number}) => total + product.quantity, 0);

    return totalQuantity
}