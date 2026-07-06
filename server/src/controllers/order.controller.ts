import { Response } from 'express';
import { prisma } from '../config/database';
import { AuthRequest } from '../middlewares/auth.middleware';

export const createOrder = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const userId = req.user?.id;
        const { items, total_amount, full_name, phone_number, wilaya, baladia, delivery_address, shipping_fee, payment_type } = req.body;

        let student = await prisma.student.findUnique({ where: { user_id: userId } });
        if (!student) {
            // Auto-create student profile for admins/teachers testing the store
            student = await prisma.student.create({
                data: {
                    user_id: userId as string,
                    current_level: 1,
                    total_xp: 0
                }
            });
        }

        // Create order with items in a transaction
        const result = await prisma.$transaction(async (tx) => {
            const order = await tx.order.create({
                data: {
                    student_id: student.id,
                    total_amount: parseFloat(total_amount),
                    full_name,
                    phone_number,
                    wilaya,
                    baladia,
                    delivery_address,
                    shipping_fee: parseFloat(shipping_fee || 0),
                    payment_type: payment_type || 'COD',
                    status: 'PENDING',
                    items: {
                        create: items.map((item: any) => ({
                            product_id: item.product_id,
                            quantity: item.quantity,
                            price: parseFloat(item.price)
                        }))
                    }
                }
            });

            // Update stock
            for (const item of items) {
                await tx.product.update({
                    where: { id: item.product_id },
                    data: { stock: { decrement: item.quantity } }
                });
            }

            return order;
        });

        res.status(201).json(result);
    } catch (error: any) {
        res.status(500).json({ error: error.message || 'Error creating order' });
    }
};

export const getAdminOrders = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const orders = await prisma.order.findMany({
            include: {
                student: { include: { user: true } },
                items: { include: { product: true } }
            },
            orderBy: { created_at: 'desc' }
        });
        res.json(orders);
    } catch (error: any) {
        res.status(500).json({ error: error.message || 'Error fetching orders' });
    }
};

export const updateOrderStatus = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        const order = await prisma.order.update({
            where: { id: id as string },
            data: { status }
        });
        res.json(order);
    } catch (error: any) {
        res.status(500).json({ error: error.message || 'Error updating order status' });
    }
};

export const getStudentOrders = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const userId = req.user?.id;
        const student = await prisma.student.findUnique({ where: { user_id: userId } });
        if (!student) {
            res.json([]);
            return;
        }

        const orders = await prisma.order.findMany({
            where: { student_id: student.id },
            include: { items: { include: { product: true } } },
            orderBy: { created_at: 'desc' }
        });
        res.json(orders);
    } catch (error: any) {
        res.status(500).json({ error: error.message || 'Error fetching student orders' });
    }
};
