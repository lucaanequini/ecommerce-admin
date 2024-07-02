import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

import prismadb from "@/lib/prismadb";

export async function POST (
    req: Request,
    { params }: { params: { storeId: string } }
) {
    try {
        const { userId } = auth();
        const body = await req.json();
        
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

        if (!params.storeId) {
            return new NextResponse('StoreId is required', { status: 400 });
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

        const isValidSizes = sizes.every((sizeId: string) => typeof sizeId === 'string' && sizeId.trim());
        if (!isValidSizes) {
             return new NextResponse('IDs de tamanho inválidos', { status: 400 });
        }

        const product = await prismadb.product.create({
            data: {
                name,
                price,
                isFeatured,
                isArchived,
                sizes: {
                    createMany: {
                        data: sizes.map((sizeId: string) => ({ sizeId }))
                    }
                },
                colorId,
                categoryId,
                storeId: params.storeId,
                images: {
                    createMany: {
                        data: [
                            ...images.map((image: {url: string}) => image)
                        ]
                    }
                }
            }
        })

        return NextResponse.json(product);

    } catch (error) {
        console.log('[PRODUCTS_POST]', error);
        return new NextResponse('Internal Error', { status: 500 })
    }
}

export async function GET (
    req: Request,
    { params }: { params: { storeId: string } }
) {
    try {
        const { searchParams } = new URL(req.url)
        const categoryId = searchParams.get('categoryId') || undefined
        const colorId = searchParams.get('colorId') || undefined
        const isFeatured = searchParams.get('isFeatured')

        if (!params.storeId) {
            return new NextResponse('StoreId is required', { status: 400 });
        }

        const products = await prismadb.product.findMany({
            where: {
                storeId: params.storeId,
                categoryId,
                colorId,
                isFeatured: isFeatured ? true : undefined,
                isArchived: false
            },
            include: {
                images: true,
                category: true,
                sizes: true,
                color: true
            },
            orderBy: {
                createdAt: 'desc'
            }
        })

        return NextResponse.json(products);

    } catch (error) {
        console.log('[PRODUCTS_GET]', error);
        return new NextResponse('Internal Error', { status: 500 })
    }
}