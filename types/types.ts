// types.ts
export interface ItemType {
    id: string;
    name: string;
    price: number;
    quantity: number;
    image: string;
    description: string;
    category: string;
    discount: number;
    is_seasonal: boolean;
    created_at: string;
}

export interface CartItem {
    product_id: string;
    quantity: number;
}

export interface Order {
    id: string;
    userName: string;
    user_id: string;
    items: CartItem[];
    total: number;
    createdAt: string;
    status: string;
}

export interface CartContextType {
    cart: CartItem[];
    loading: boolean;
    addToCart: (product: ItemType, quantity?: number) => void;
    updateQuantity: (productId: string, quantity: number, maxQuantity: number) => void;
    removeFromCart: (productId: string) => void;
    clearCart: () => void;
    getCartTotal: (products: (ItemType | undefined)[]) => number;
    getCartItemCount: () => number;
    showSnackbar: (message: string, severity: "success" | "error") => void; // Add for Snackbar
}

export interface LayoutProps {
    children: React.ReactNode;
}