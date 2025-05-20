"use client";

import { useEffect, useState } from "react";
import { Container, Typography, Button, Box, Divider } from "@mui/material";
import { FiCheckCircle } from "react-icons/fi";
import { motion } from "framer-motion";
import { useRouter } from "next/router";
import { Order, CartItem, ItemType } from "@/types/types";

export default function Success() {
    const router = useRouter();
    const { orderId } = router.query;
    const [order, setOrder] = useState<Order | null>(null);
    const [products, setProducts] = useState<(ItemType | undefined)[]>([]);

    useEffect(() => {
        if (orderId) {
            const fetchOrder = async () => {
                try {
                    const response = await fetch(`/api/orders/${orderId}`);
                    if (response.ok) {
                        const data = await response.json();
                        setOrder(data);
                        // Fetch product details for order items
                        const productFetches = data.items.map((item: CartItem) =>
                            fetch(`/api/products/${item.product_id}`).then((res) => res.json())
                        );
                        const fetchedProducts = await Promise.all(productFetches);
                        setProducts(fetchedProducts);
                    }
                } catch (error) {
                    console.error("Failed to fetch order:", error);
                }
            };
            fetchOrder();
        }
    }, [orderId]);

    return (
        <Container maxWidth="lg" sx={{ py: 8, textAlign: "center" }}>
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
            >
                <FiCheckCircle size={60} color="green" style={{ marginBottom: 16 }} />
                <Typography variant="h4" gutterBottom>
                    Payment Successful
                </Typography>
                <Typography variant="body1" color="text.secondary" paragraph>
                    Thank you for your purchase! You&apos;ll receive a confirmation soon.
                </Typography>

                {order && (
                    <Box sx={{ maxWidth: 600, mx: "auto", mt: 4 }}>
                        <Typography variant="h6" gutterBottom>
                            Order Details (ID: {order.id})
                        </Typography>
                        {order.items.map((item: CartItem, index: number) => {
                            const product = products[index];
                            return (
                                <Box
                                    key={item.product_id}
                                    sx={{
                                        display: "flex",
                                        justifyContent: "space-between",
                                        mb: 2,
                                    }}
                                >
                                    <Box>
                                        <Typography variant="subtitle2">
                                            {product?.name || "Loading..."}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            Qty: {item.quantity}
                                        </Typography>
                                    </Box>
                                    <Typography variant="subtitle2">
                                        {product
                                            ? `$${((product.discount ? product.price * (1 - product.discount / 100) : product.price) * item.quantity).toFixed(2)}`
                                            : "-"}
                                    </Typography>
                                </Box>
                            );
                        })}
                        <Divider sx={{ my: 2 }} />
                        <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                                Total
                            </Typography>
                            <Typography variant="subtitle1" color="primary" sx={{ fontWeight: 700 }}>
                                ${order.total.toFixed(2)}
                            </Typography>
                        </Box>
                    </Box>
                )}

                <Button
                    variant="contained"
                    color="primary"
                    href="/products"
                    sx={{ mt: 4 }}
                    component={motion.div}
                    whileHover={{ scale: 1.05 }}
                    onClick={() => {
                      router.push("/products");
                    }}
                >
                    Continue Shopping
                </Button>
            </motion.div>
        </Container>
    );
}