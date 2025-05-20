"use client";
import {
    Box,
    Container,
    Typography,
    Grid,
    Button,
    Divider,
    Paper,
    CircularProgress,
} from "@mui/material";
import { useCart } from "../src/contexts/CartContext";
import { useState } from "react";
import { FiCreditCard } from "react-icons/fi";
import { motion } from "framer-motion";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { useQueries } from "@tanstack/react-query";

const fetchProductDetails = async (id: string) => {
    const response = await fetch(`/api/products/${id}`);
    if (!response.ok) {
        throw new Error(`Failed to fetch product ${id}`);
    }
    return response.json();
};

export default function Checkout() {
    const { cart, getCartTotal, clearCart, showSnackbar, loading: cartLoading } = useCart();
    const { data: session, status } = useSession();
    const router = useRouter();
    const [processing, setProcessing] = useState(false);

    // Fetch product details for cart items
    const productQueries = useQueries({
        queries: cart.map((item:{product_id:string, quantity:number}) => ({
            queryKey: ["product", item.product_id],
            queryFn: () => fetchProductDetails(item.product_id),
            enabled: !cartLoading, // Wait for cart to load from localStorage
        })),
    });

    // Extract products directly from queries
    const products = productQueries.map((query) => query.data);
    const isLoadingProducts = productQueries.some((query) => query.isLoading);
    const hasError = productQueries.some((query) => query.error);

    // Redirect to login if unauthenticated
    if (status === "unauthenticated") {
        router.push("/login");
        showSnackbar("Please sign in to proceed to checkout.", "error");
        return null;
    }

    const handlePayNow = async () => {
        if (!session || status !== "authenticated") {
            showSnackbar("Please sign in to proceed.", "error");
            return;
        }

        // Validate stock
        for (let i = 0; i < cart.length; i++) {
            const item = cart[i];
            const product = products[i];
            if (!product) {
                showSnackbar(`Product ${item.product_id} not found.`, "error");
                return;
            }
            if (product.quantity < item.quantity) {
                showSnackbar(`Insufficient stock for ${product.name}.`, "error");
                return;
            }
        }

        setProcessing(true);
        try {
            const total = getCartTotal(products) + getCartTotal(products) * 0.1; // Including tax
            const response = await fetch("/api/orders", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ cart, total }),
            });

            if (!response.ok) {
                const { error } = await response.json();
                showSnackbar(error || "Failed to process order.", "error");
                setProcessing(false);
                return;
            }

            const { order } = await response.json();
            clearCart();
            showSnackbar("Order placed successfully!", "success");
            router.push(`/success?orderId=${order.id}`);
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
            showSnackbar(errorMessage, "error");
            setProcessing(false);
        }
    };

    if (status === "loading" || cartLoading) {
        return (
            <Container maxWidth="lg">
                <Box sx={{ py: 8, textAlign: "center" }}>
                    <CircularProgress />
                    <Typography>Loading...</Typography>
                </Box>
            </Container>
        );
    }

    return (
        <Container maxWidth="lg">
            <Box sx={{ py: 4 }}>
                <Typography
                    variant="h4"
                    gutterBottom
                    sx={{ fontWeight: 600, mb: 4 }}
                    component={motion.div}
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    Checkout
                </Typography>

                {cart.length === 0 ? (
                    <Box
                        sx={{ textAlign: "center", py: 8 }}
                        component={motion.div}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.5 }}
                    >
                        <FiCreditCard size={60} style={{ marginBottom: 16, opacity: 0.3 }} />
                        <Typography variant="h5" gutterBottom>
                            Your cart is empty
                        </Typography>
                        <Button
                            variant="contained"
                            color="primary"
                            href="/products"
                            sx={{ mt: 2 }}
                            component={motion.div}
                            whileHover={{ scale: 1.05 }}
                        >
                            Shop Now
                        </Button>
                    </Box>
                ) : isLoadingProducts ? (
                    <Box sx={{ textAlign: "center", py: 8 }}>
                        <CircularProgress />
                        <Typography>Loading products...</Typography>
                    </Box>
                ) : hasError ? (
                    <Box sx={{ textAlign: "center", py: 8 }}>
                        <Typography color="error">
                            Failed to load some product details. Please try again.
                        </Typography>
                    </Box>
                ) : (
                    <Grid container spacing={4} justifyContent="center">
                        {/* Order Summary */}
                        <Grid item xs={12} md={6}>
                            <Paper
                                elevation={3}
                                sx={{ p: 3, borderRadius: 2 }}
                                component={motion.div}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.5 }}
                            >
                                <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                                    Order Summary
                                </Typography>
                                {cart.map((item, index) => {
                                    const product = products[index];
                                    return (
                                        <Box
                                            key={item.product_id}
                                            sx={{
                                                display: "flex",
                                                justifyContent: "space-between",
                                                mb: 2,
                                            }}
                                            component={motion.div}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ duration: 0.3, delay: index * 0.1 }}
                                        >
                                            <Box sx={{ display: "flex", alignItems: "center" }}>
                                                <Box
                                                    component="img"
                                                    src={product?.image || "/placeholder-fruit.jpg"}
                                                    alt={product?.name || "Product"}
                                                    sx={{
                                                        width: 60,
                                                        height: 60,
                                                        objectFit: "cover",
                                                        borderRadius: 1,
                                                        mr: 2,
                                                    }}
                                                />
                                                <Box>
                                                    <Typography variant="subtitle2">
                                                        {product?.name || "Loading..."}
                                                    </Typography>
                                                    <Typography variant="body2" color="text.secondary">
                                                        Qty: {item.quantity}
                                                    </Typography>
                                                    {product?.discount > 0 && (
                                                        <Typography variant="body2" color="text.secondary">
                                                            Discount: {product.discount}% (Now Rs. {(product.price * (1 - product.discount / 100)).toFixed(2)} each)
                                                        </Typography>
                                                    )}
                                                </Box>
                                            </Box>
                                            <Typography variant="subtitle2">
                                                {product
                                                    ? `Rs. ${((product.discount ? product.price * (1 - product.discount / 100) : product.price) * item.quantity).toFixed(2)}`
                                                    : "-"}
                                            </Typography>
                                        </Box>
                                    );
                                })}
                                <Divider sx={{ my: 2 }} />
                                <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
                                    <Typography variant="body2">Subtotal</Typography>
                                    <Typography variant="body2">
                                        Rs. {getCartTotal(products).toFixed(2)}
                                    </Typography>
                                </Box>
                                <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
                                    <Typography variant="body2">Shipping</Typography>
                                    <Typography variant="body2">Rs. 0.00</Typography>
                                </Box>
                                <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
                                    <Typography variant="body2">Tax (10%)</Typography>
                                    <Typography variant="body2">
                                        Rs. {(getCartTotal(products) * 0.1).toFixed(2)}
                                    </Typography>
                                </Box>
                                <Divider sx={{ my: 2 }} />
                                <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                                    <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                                        Total
                                    </Typography>
                                    <Typography variant="subtitle1" color="primary" sx={{ fontWeight: 700 }}>
                                        Rs. {(getCartTotal(products) + getCartTotal(products) * 0.1).toFixed(2)}
                                    </Typography>
                                </Box>
                                <Button
                                    variant="contained"
                                    color="primary"
                                    fullWidth
                                    size="large"
                                    onClick={handlePayNow}
                                    disabled={processing || products.some((p) => !p) || hasError}
                                    sx={{ mt: 3, py: 1.5, fontWeight: 600 }}
                                    component={motion.div}
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                >
                                    {processing ? <CircularProgress size={24} /> : "Pay Now"}
                                </Button>
                            </Paper>
                        </Grid>
                    </Grid>
                )}
            </Box>
        </Container>
    );
}