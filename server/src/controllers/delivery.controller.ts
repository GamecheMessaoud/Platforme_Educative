import { Response } from 'express';
import { prisma } from '../config/database';
import { AuthRequest } from '../middlewares/auth.middleware';

export const getDeliveryTariffs = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const tariffs = await prisma.deliveryTariff.findMany({
            orderBy: { wilaya_num: 'asc' }
        });
        res.json(tariffs);
    } catch (error: any) {
        res.status(500).json({ error: error.message || 'Error fetching delivery tariffs' });
    }
};

export const upsertDeliveryTariff = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { wilaya_num, wilaya_ar, fee, is_active } = req.body;
        const tariff = await prisma.deliveryTariff.upsert({
            where: { wilaya_num: String(wilaya_num) },
            update: {
                wilaya_ar,
                fee: typeof fee === 'string' ? parseFloat(fee) : fee,
                is_active: is_active === 'true' || is_active === true
            },
            create: {
                wilaya_num: String(wilaya_num),
                wilaya_ar,
                fee: typeof fee === 'string' ? parseFloat(fee) : fee,
                is_active: is_active === 'true' || is_active === true
            }
        });
        res.json(tariff);
    } catch (error: any) {
        res.status(500).json({ error: error.message || 'Error upserting delivery tariff' });
    }
};

export const deleteDeliveryTariff = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        await prisma.deliveryTariff.delete({ where: { id: id as string } });
        res.json({ success: true });
    } catch (error: any) {
        res.status(500).json({ error: error.message || 'Error deleting delivery tariff' });
    }
};
