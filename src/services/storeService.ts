import api from '../lib/api';

// Categories
export const getStoreCategories = async () => {
    const response = await api.get('/store/categories');
    return response.data;
};

export const createStoreCategory = async (data: any) => {
    const response = await api.post('/store/categories', data);
    return response.data;
};

export const updateStoreCategory = async (id: string, data: any) => {
    const response = await api.put(`/store/categories/${id}`, data);
    return response.data;
};

export const deleteStoreCategory = async (id: string) => {
    const response = await api.delete(`/store/categories/${id}`);
    return response.data;
};

// Products
export const getStoreProducts = async (categoryId?: string) => {
    const url = categoryId ? `/store/products?categoryId=${categoryId}` : '/store/products';
    const response = await api.get(url);
    return response.data;
};

export const createProduct = async (data: any) => {
    const response = await api.post('/store/products', data);
    return response.data;
};

export const updateProduct = async (id: string, data: any) => {
    const response = await api.put(`/store/products/${id}`, data);
    return response.data;
};

export const deleteProduct = async (id: string) => {
    const response = await api.delete(`/store/products/${id}`);
    return response.data;
};

// Orders
export const createOrder = async (data: any) => {
    const response = await api.post('/store/orders', data);
    return response.data;
};

export const getAdminOrders = async () => {
    const response = await api.get('/store/orders/admin');
    return response.data;
};

export const updateOrderStatus = async (id: string, status: string) => {
    const response = await api.put(`/store/orders/${id}/status`, { status });
    return response.data;
};

export const getMyOrders = async () => {
    const response = await api.get('/store/orders/my');
    return response.data;
};

// Delivery Tariffs
export const getDeliveryTariffs = async () => {
    const response = await api.get('/store/delivery/tariffs');
    return response.data;
};

export const upsertDeliveryTariff = async (data: any) => {
    const response = await api.post('/store/delivery/tariffs', data);
    return response.data;
};

export const deleteDeliveryTariff = async (id: string) => {
    const response = await api.delete(`/store/delivery/tariffs/${id}`);
    return response.data;
};
