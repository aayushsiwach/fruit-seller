"use client";

import { createContext, useState, useContext, useEffect } from "react";
import { CartContextType, LayoutProps, ItemType } from "@/types/types";
import { Snackbar, Alert } from "@mui/material";

const CartContext = createContext<CartContextType | undefined>(undefined);

export function useCart() {
    const context = useContext(CartContext);
    if (!context) {
        throw new Error("useCart must be used within a CartProvider");
    }
    return context;
}

interface LocalCartItem {
    product_id: string;
    quantity: number;
}

export function CartProvider({ children }: LayoutProps) {
    const [cart, setCart] = useState<LocalCartItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [snackbar, setSnackbar] = useState<{
        open: boolean;
        message: string;
        severity: "success" | "error" | "warning";
    }>({ open: false, message: "", severity: "success" });

    // Load cart from localStorage on mount
    useEffect(() => {
        const savedCart = localStorage.getItem("cart");
        if (savedCart) {
            try {
                setCart(JSON.parse(savedCart));
            } catch (error) {
                console.error("Error parsing cart from localStorage:", error);
                showSnackbar("Error loading cart.", "error");
            }
        }
        setLoading(false);
    }, []);

    // Clean up invalid cart items after loading
    useEffect(() => {
        const cleanCart = async () => {
            const validCart: LocalCartItem[] = [];
            let hasInvalidItems = false;
            for (const item of cart) {
                try {
                    const response = await fetch(
                        `/api/products/${item.product_id}`
                    );
                    if (response.ok) {
                        const product: ItemType = await response.json();
                        // Also validate quantity against current stock
                        if (item.quantity > product.quantity) {
                            if (product.quantity === 0) {
                                hasInvalidItems = true;
                                continue; // Skip items that are out of stock
                            }
                            validCart.push({
                                ...item,
                                quantity: product.quantity,
                            }); // Adjust quantity to available stock
                            hasInvalidItems = true;
                        } else {
                            validCart.push(item);
                        }
                    } else {
                        hasInvalidItems = true;
                    }
                } catch {
                    console.warn(
                        `Product ${item.product_id} not found, removing from cart.`
                    );
                    hasInvalidItems = true;
                }
            }
            if (hasInvalidItems) {
                setCart(validCart);
                showSnackbar(
                    "Adjusted cart: removed or updated unavailable items.",
                    "warning"
                );
            }
        };
        if (!loading && cart.length > 0) {
            cleanCart();
        }
    }, [loading, cart]);

    // Save cart to localStorage whenever it changes
    useEffect(() => {
        if (!loading) {
            // console.log("Cart State:", cart);
            localStorage.setItem("cart", JSON.stringify(cart));
        }
    }, [cart, loading]);

    // Clean up invalid cart items (e.g., products that no longer exist)

    const addToCart = (product: ItemType, quantity: number = 1) => {
        if (quantity < 1 || product.quantity < quantity) {
            showSnackbar("Invalid quantity or insufficient stock.", "error");
            return;
        }

        setCart((prevCart) => {
            const existingItem = prevCart.find(
                (item) => item.product_id === product.id
            );

            if (existingItem) {
                const newQuantity = existingItem.quantity + quantity;
                if (newQuantity > product.quantity) {
                    showSnackbar(
                        "Cannot add: exceeds available stock.",
                        "error"
                    );
                    return prevCart;
                }
                showSnackbar(`${product.name} updated in cart.`, "success");
                return prevCart.map((item) =>
                    item.product_id === product.id
                        ? { ...item, quantity: newQuantity }
                        : item
                );
            } else {
                showSnackbar(`${product.name} added to cart.`, "success");
                return [...prevCart, { product_id: product.id, quantity }];
            }
        });
    };

    const updateQuantity = (
        productId: string,
        quantity: number,
        maxQuantity?: number
    ) => {
        if (quantity <= 0) {
            removeFromCart(productId);
            return;
        }

        if (maxQuantity !== undefined && quantity > maxQuantity) {
            showSnackbar("Cannot update: exceeds available stock.", "error");
            return;
        }

        setCart((prevCart) => {
            showSnackbar("Cart updated.", "success");
            return prevCart.map((item) =>
                item.product_id === productId ? { ...item, quantity } : item
            );
        });
    };

    const removeFromCart = (productId: string) => {
        setCart((prevCart) => {
            showSnackbar("Item removed from cart.", "success");
            return prevCart.filter((item) => item.product_id !== productId);
        });
    };

    const clearCart = () => {
        setCart([]);
        showSnackbar("Cart cleared.", "success");
    };

    const getCartTotal = (products: (ItemType | undefined)[]) => {
        return cart.reduce((total, item, index) => {
            const product = products[index];
            if (!product) return total;
            const itemPrice = product.discount
                ? product.price * (1 - product.discount / 100)
                : product.price;
            return total + itemPrice * item.quantity;
        }, 0);
    };

    const getCartItemCount = () => {
        return cart.reduce((count, item) => count + item.quantity, 0);
    };

    const showSnackbar = (
        message: string,
        severity: "success" | "error" | "warning"
    ) => {
        setSnackbar({ open: true, message, severity });
    };

    const handleCloseSnackbar = () => {
        setSnackbar((prev) => ({ ...prev, open: false }));
    };

    const value: CartContextType = {
        cart,
        loading,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        getCartTotal,
        getCartItemCount,
        showSnackbar,
    };

    return (
        <CartContext.Provider value={value}>
            {children}
            <Snackbar
                open={snackbar.open}
                autoHideDuration={3000}
                onClose={handleCloseSnackbar}
                anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
            >
                <Alert
                    onClose={handleCloseSnackbar}
                    severity={snackbar.severity}
                    sx={{ width: "100%" }}
                >
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </CartContext.Provider>
    );
}
