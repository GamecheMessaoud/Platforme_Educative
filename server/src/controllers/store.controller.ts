import { Response } from 'express';
import { prisma } from '../config/database';
import { AuthRequest } from '../middlewares/auth.middleware';

// ─────────────────────────────────────────────────────────────────
//                         CATEGORIES
// ─────────────────────────────────────────────────────────────────

export const getStoreCategories = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const categories = await prisma.storeCategory.findMany({
            include: { _count: { select: { products: true } } }
        });
        res.json(categories);
    } catch (error: any) {
        res.status(500).json({ error: error.message || 'Error fetching store categories' });
    }
};

export const createStoreCategory = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { name_ar, name_en, slug, icon } = req.body;
        const category = await prisma.storeCategory.create({
            data: { name_ar, name_en, slug, icon }
        });
        res.status(201).json(category);
    } catch (error: any) {
        console.error('Error in createStoreCategory:', error);
        res.status(500).json({ error: error.message || 'Error creating category' });
    }
};

export const updateStoreCategory = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const { name_ar, name_en, slug, icon } = req.body;
        const category = await prisma.storeCategory.update({
            where: { id: id as string },
            data: { name_ar, name_en, slug, icon }
        });
        res.json(category);
    } catch (error: any) {
        res.status(500).json({ error: error.message || 'Error updating category' });
    }
};

export const deleteStoreCategory = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        await prisma.storeCategory.delete({ where: { id: id as string } });
        res.json({ success: true });
    } catch (error: any) {
        res.status(500).json({ error: error.message || 'Error deleting category' });
    }
};

// ─────────────────────────────────────────────────────────────────
//                         PRODUCTS
// ─────────────────────────────────────────────────────────────────

export const getStoreProducts = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { categoryId } = req.query;
        const where = categoryId ? { category_id: String(categoryId) } : {};
        const products = await prisma.product.findMany({
            where,
            include: { category: true },
            orderBy: { created_at: 'desc' }
        });
        res.json(products);
    } catch (error: any) {
        res.status(500).json({ error: error.message || 'Error fetching products' });
    }
};

export const createProduct = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { name_ar, description, price, stock, category_id, image_url } = req.body;
        const product = await prisma.product.create({
            data: {
                name_ar,
                description,
                price: parseFloat(price),
                stock: parseInt(stock),
                category_id,
                image_url
            }
        });
        res.status(201).json(product);
    } catch (error: any) {
        res.status(500).json({ error: error.message || 'Error creating product' });
    }
};

export const updateProduct = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const { name_ar, description, price, stock, category_id, image_url } = req.body;
        const product = await prisma.product.update({
            where: { id: id as string },
            data: {
                name_ar,
                description,
                price: price !== undefined ? parseFloat(price) : undefined,
                stock: stock !== undefined ? parseInt(stock) : undefined,
                category_id,
                image_url
            }
        });
        res.json(product);
    } catch (error: any) {
        res.status(500).json({ error: error.message || 'Error updating product' });
    }
};

export const deleteProduct = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        await prisma.product.delete({ where: { id: id as string } });
        res.json({ success: true });
    } catch (error: any) {
        res.status(500).json({ error: error.message || 'Error deleting product' });
    }
};
