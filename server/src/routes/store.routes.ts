import { Router } from 'express';
import {
    getStoreCategories, createStoreCategory, updateStoreCategory, deleteStoreCategory,
    getStoreProducts, createProduct, updateProduct, deleteProduct
} from '../controllers/store.controller';
import {
    createOrder, getAdminOrders, updateOrderStatus, getStudentOrders
} from '../controllers/order.controller';
import {
    getDeliveryTariffs, upsertDeliveryTariff, deleteDeliveryTariff
} from '../controllers/delivery.controller';
import { authMiddleware, roleMiddleware } from '../middlewares/auth.middleware';

const router = Router();

// Public/Student routes (authenticated)
router.use(authMiddleware);
router.get('/categories', getStoreCategories);
router.get('/products', getStoreProducts);
router.post('/orders', createOrder);
router.get('/orders/my', getStudentOrders);

// Admin only routes
router.post('/categories', roleMiddleware('ADMIN'), createStoreCategory);
router.put('/categories/:id', roleMiddleware('ADMIN'), updateStoreCategory);
router.delete('/categories/:id', roleMiddleware('ADMIN'), deleteStoreCategory);

router.post('/products', roleMiddleware('ADMIN'), createProduct);
router.put('/products/:id', roleMiddleware('ADMIN'), updateProduct);
router.delete('/products/:id', roleMiddleware('ADMIN'), deleteProduct);

router.get('/orders/admin', roleMiddleware('ADMIN'), getAdminOrders);
router.put('/orders/:id/status', roleMiddleware('ADMIN'), updateOrderStatus);

// Delivery routes
router.get('/delivery/tariffs', getDeliveryTariffs);
router.post('/delivery/tariffs', roleMiddleware('ADMIN'), upsertDeliveryTariff);
router.delete('/delivery/tariffs/:id', roleMiddleware('ADMIN'), deleteDeliveryTariff);

export default router;
