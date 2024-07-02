import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import prismadb from "@/lib/prismadb";


export async function GET (
    req: Request,
    { params } : { params: { productId: string } }
) {
    try {  

        if (!params.productId) {
            return new NextResponse('Product ID is required', {status : 400})
        }

        const product = await prismadb.product.findUnique({
            where: {
                id: params.productId
            },
            include: {
                images: true,
                category: true,
                sizes: true,
                color: true,
            }
        })

        return NextResponse.json(product)

    } catch (error) {
        console.log('[PRODUCT]', error);
        return new NextResponse('Internal Error', { status: 500 })
    }
}

export async function PATCH (
    req: Request,
    { params } : { params: { storeId: string, productId: string } }
) {
    try {   
        const { userId } = auth()
        const body = await req.json()

        const { name, price, categoryId, sizes, colorId, images, isFeatured, isArchived } = body;

        if (!userId) {
            return new NextResponse('Unauthenticated', { status: 401 });
        }

        if (!name) {
            return new NextResponse('Name is required', { status: 400 });
        }

        if (!price) {
            return new NextResponse('Price is required', { status: 400 });
        }

        if (!categoryId) {
            return new NextResponse('CategoryID is required', { status: 400 });
        }

        if (!sizes || !sizes.length) {
            return new NextResponse('SizeID is required', { status: 400 });
        }

        if (!colorId) {
            return new NextResponse('ColorID is required', { status: 400 });
        }

        if (!images || !images.length) {
            return new NextResponse('Image is required', { status: 400 });
        }

        if (!params.productId) {
            return new NextResponse('ProductID is required', {status : 400})
        }

        const storeByUserId = await prismadb.store.findFirst({
            where: {
                id: params.storeId,
                userId
            }
        })

        if (!storeByUserId) {
            return new NextResponse('Unauthorized', { status: 403 });
        }

        await prismadb.product.update({
            where: {
                id: params.productId
            },
            data: {
                name,
                price,
                isFeatured,
                isArchived,
                sizes: {
                    deleteMany: {}
                },
                colorId,
                categoryId,
                images: {
                    deleteMany: {}
                }
            }
        })

        const product = await prismadb.product.update({
            where: {
                id: params.productId
            },
            data: {
                sizes: {
                    createMany: {
                        data: [
                            ...sizes.map((sizeId: string) => ({ sizeId }))
                        ]
                    }
                },
                images: {
                    createMany: {
                        data: [
                            ...images.map((image: {url: string}) => image)
                        ]
                    }
                }
            }
        })

        return NextResponse.json(product)

    } catch (error) {
        console.log('[PRODUCT_PATCH]', error);
        return new NextResponse('Internal Error', { status: 500 })
    }
}

export async function DELETE (
    req: Request,
    { params } : { params: { storeId: string, productId: string } }
) {
    try {   
        const { userId } = auth()

        if (!userId) {
            return new NextResponse('Unauthenticated', {status : 401})
        }

        if (!params.productId) {
            return new NextResponse('ProductID is required', {status : 400})
        }

        const storeByUserId = await prismadb.store.findFirst({
            where: {
                id: params.storeId,
                userId
            }
        })

        if (!storeByUserId) {
            return new NextResponse('Unauthorized', { status: 403 });
        }

        const product = await prismadb.product.delete({
            where: {
                id: params.productId
            }
        })

        console.log(product)
        return NextResponse.json(product)

    } catch (error) {
        console.log('[PRODUCT_DELETE]', error);
        return new NextResponse('Internal Error', { status: 500 })
    }
}