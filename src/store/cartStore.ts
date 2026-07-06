import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface CartItem {
    id: string;
    name_ar: string;
    price: number;
    image_url?: string;
    quantity: number;
    icon?: string;
}

interface CartState {
    items: CartItem[];
    addItem: (item: { id: string; name_ar: string; price: number; image_url?: string; category?: { icon: string } }) => void;
    removeItem: (id: string) => void;
    updateQuantity: (id: string, quantity: number) => void;
    clearCart: () => void;
    getTotal: () => number;
}

export const useCartStore = create<CartState>()(
    persist(
        (set, get) => ({
            items: [],
            addItem: (product) => {
                const items = get().items;
                const existing = items.find(i => i.id === product.id);
                if (existing) {
                    set({
                        items: items.map(i => i.id === product.id ? { ...i, quantity: i.quantity + 1 } : i)
                    });
                } else {
                    set({
                        items: [...items, {
                            id: product.id,
                            name_ar: product.name_ar,
                            price: product.price,
                            image_url: product.image_url,
                            icon: product.category?.icon || '📦',
                            quantity: 1
                        }]
                    });
                }
            },
            removeItem: (id) => set({ items: get().items.filter(i => i.id !== id) }),
            updateQuantity: (id, quantity) => set({
                items: get().items.map(i => i.id === id ? { ...i, quantity } : i)
            }),
            clearCart: () => set({ items: [] }),
            getTotal: () => get().items.reduce((sum, item) => sum + (item.price * item.quantity), 0),
        }),
        {
            name: 'sadeem-cart',
        }
    )
);
