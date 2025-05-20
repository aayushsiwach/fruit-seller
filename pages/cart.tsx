"use client";

import {
    Box,
    Container,
    Typography,
    Card,
    CardContent,
    Button,
    IconButton,
    Divider,
    TextField,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    useMediaQuery,
    Chip,
    CircularProgress,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { useRouter } from "next/router";
import { useCart } from "@/src/contexts/CartContext";
import {
    FiTrash2,
    FiPlus,
    FiMinus,
    FiArrowLeft,
    FiShoppingCart,
} from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { useQueries } from "@tanstack/react-query";
import { ItemType } from "@/types/types";
import { useSession, signIn } from "next-auth/react";

const fetchProductDetails = async (id: string) => {
    const response = await fetch(`/api/products/${id}`);
    if (!response.ok) {
        throw new Error(`Failed to fetch product ${id}`);
    }
    return response.json();
};

export default function Cart() {
    const router = useRouter();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down("md"));
    const {
        cart,
        updateQuantity,
        removeFromCart,
        getCartTotal,
        clearCart,
        showSnackbar,
        loading: cartLoading,
    } = useCart();
    const { status } = useSession();

    // Fetch product details for each cart item
    const productQueries = useQueries({
        queries: cart.map((item) => ({
            queryKey: ["product", item.product_id],
            queryFn: () => fetchProductDetails(item.product_id),
            enabled: !cartLoading, // Wait for cart to load from localStorage
        })),
    });

    const products = productQueries.map((query) => query.data);
    const isLoadingProducts = productQueries.some((query) => query.isLoading);
    const hasError = productQueries.some((query) => query.error);

    const handleQuantityChange = (
        productId: string,
        newQuantity: number,
        maxQuantity: number
    ) => {
        if (newQuantity >= 1) {
            updateQuantity(productId, newQuantity, maxQuantity);
        } else {
            removeFromCart(productId);
        }
    };

    const handleRemoveItem = (productId: string) => {
        removeFromCart(productId);
    };

    const handleContinueShopping = () => {
        router.push("/products");
    };

    const handleCheckout = () => {
        if (status === "unauthenticated") {
            signIn(undefined, { callbackUrl: "/checkout" });
            showSnackbar("Please sign in to proceed to checkout.", "error");
            return;
        }
        router.push("/checkout");
    };

    return (
        <Container maxWidth="lg">
            <Box sx={{ mb: 4, mt: 2 }}>
                <Typography
                    variant="h4"
                    component="h1"
                    gutterBottom
                    sx={{ fontWeight: 600 }}
                >
                    Your Cart
                </Typography>
                <Typography variant="body1" color="text.secondary">
                    Review your items and proceed to checkout
                </Typography>
            </Box>

            {cartLoading ? (
                <Box sx={{ textAlign: "center", py: 8 }}>
                    <CircularProgress />
                    <Typography>Loading cart...</Typography>
                </Box>
            ) : cart.length === 0 ? (
                <Box
                    sx={{ textAlign: "center", py: 8 }}
                    component={motion.div}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5 }}
                >
                    <FiShoppingCart
                        size={60}
                        style={{ marginBottom: 16, opacity: 0.3 }}
                    />
                    <Typography variant="h5" gutterBottom>
                        Your cart is empty
                    </Typography>
                    <Typography
                        variant="body1"
                        color="text.secondary"
                        paragraph
                    >
                        Looks like you haven&apos;t added any products to your
                        cart yet.
                    </Typography>
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={handleContinueShopping}
                        sx={{ mt: 2 }}
                        component={motion.div}
                        whileHover={{ scale: 1.05 }}
                    >
                        Start Shopping
                    </Button>
                </Box>
            ) : (
                <Box
                    sx={{
                        display: "flex",
                        flexDirection: isMobile ? "column" : "row",
                        gap: 4,
                    }}
                >
                    {/* Cart Items */}
                    <Box
                        sx={{
                            width: { xs: "100%", md: "65%" },
                            // borderRadius: 1,
                            // boxShadow: 1,
                        }}
                    >
                        {/* <Card variant="outlined"> */}
                        {/* <CardContent sx={{ p: 0 }}> */}
                        {isLoadingProducts ? (
                            <Box
                                sx={{
                                    display: "flex",
                                    justifyContent: "center",
                                    py: 4,
                                }}
                            >
                                <CircularProgress />
                            </Box>
                        ) : hasError ? (
                            <Typography
                                color="error"
                                textAlign="center"
                                sx={{ py: 4 }}
                            >
                                Failed to load some product details.
                            </Typography>
                        ) : (
                            <>
                                {isMobile ? (
                                    <AnimatePresence>
                                        <Box sx={
                                          {
                                            display: "flex",
                                            flexDirection: "column",
                                            // gap: 2,
                                            borderRadius: 1,
                                            boxShadow: 2,
                                            overflow: "hidden",
                                          }
                                        }>
                                            {cart.map((item, index) => {
                                                const product = products[
                                                    index
                                                ] as ItemType | undefined;
                                                return (
                                                    <Box
                                                        key={item.product_id}
                                                        sx={{
                                                            p: 2,
                                                            borderBottom: 1,
                                                        }}
                                                        component={motion.div}
                                                        initial={{
                                                            opacity: 0,
                                                            y: 20,
                                                        }}
                                                        animate={{
                                                            opacity: 1,
                                                            y: 0,
                                                        }}
                                                        exit={{
                                                            opacity: 0,
                                                            y: 20,
                                                        }}
                                                        transition={{
                                                            duration: 0.3,
                                                        }}
                                                    >
                                                        <Box
                                                            sx={{
                                                                display: "flex",
                                                                mb: 2,
                                                            }}
                                                        >
                                                            <Image
                                                                src={
                                                                    product?.image ||
                                                                    "https://images.pexels.com/photos/5946103/pexels-photo-5946103.jpeg?auto=compress&cs=tinysrgb&w=80"
                                                                }
                                                                alt={
                                                                    product?.name ||
                                                                    "Product"
                                                                }
                                                                width={80}
                                                                height={80}
                                                                style={{
                                                                    objectFit:
                                                                        "cover",
                                                                    borderRadius: 4,
                                                                    marginRight: 16,
                                                                }}
                                                            />
                                                            <Box
                                                                sx={{
                                                                    flexGrow: 1,
                                                                }}
                                                            >
                                                                <Typography
                                                                    variant="subtitle1"
                                                                    sx={{
                                                                        fontWeight: 600,
                                                                    }}
                                                                >
                                                                    {product?.name ||
                                                                        "Loading..."}
                                                                </Typography>
                                                                <Typography
                                                                    variant="body2"
                                                                    color="text.secondary"
                                                                    gutterBottom
                                                                >
                                                                    {product
                                                                        ? `Rs.${product.price.toFixed(
                                                                              2
                                                                          )} per kg`
                                                                        : "-"}
                                                                </Typography>
                                                                {product &&
                                                                    typeof product.discount ===
                                                                        "number" &&
                                                                    product.discount >
                                                                        0 && (
                                                                        <Typography
                                                                            variant="body2"
                                                                            color="text.secondary"
                                                                            gutterBottom
                                                                        >
                                                                            Discount:{" "}
                                                                            {
                                                                                product.discount
                                                                            }
                                                                            %
                                                                            (Now
                                                                            Rs.
                                                                            {(
                                                                                product.price *
                                                                                (1 -
                                                                                    product.discount /
                                                                                        100)
                                                                            ).toFixed(
                                                                                2
                                                                            )}{" "}
                                                                            per
                                                                            kg)
                                                                        </Typography>
                                                                    )}
                                                                <Typography
                                                                    variant="body2"
                                                                    color="primary"
                                                                    sx={{
                                                                        fontWeight: 600,
                                                                    }}
                                                                >
                                                                    Subtotal:{" "}
                                                                    {product
                                                                        ? `Rs. ${(
                                                                              (product.discount
                                                                                  ? product.price *
                                                                                    (1 -
                                                                                        product.discount /
                                                                                            100)
                                                                                  : product.price) *
                                                                              item.quantity
                                                                          ).toFixed(
                                                                              2
                                                                          )}`
                                                                        : "-"}
                                                                </Typography>
                                                            </Box>
                                                        </Box>

                                                        <Box
                                                            sx={{
                                                                display: "flex",
                                                                justifyContent:
                                                                    "space-between",
                                                                alignItems:
                                                                    "center",
                                                            }}
                                                        >
                                                            <Box
                                                                sx={{
                                                                    display:
                                                                        "flex",
                                                                    alignItems:
                                                                        "center",
                                                                }}
                                                            >
                                                                <IconButton
                                                                    size="small"
                                                                    onClick={() =>
                                                                        handleQuantityChange(
                                                                            item.product_id,
                                                                            item.quantity -
                                                                                1,
                                                                            product?.quantity ||
                                                                                0
                                                                        )
                                                                    }
                                                                    disabled={
                                                                        item.quantity <=
                                                                        1
                                                                    }
                                                                    component={
                                                                        motion.div
                                                                    }
                                                                    whileHover={{
                                                                        scale: 1.1,
                                                                    }}
                                                                    aria-label="Decrease quantity"
                                                                >
                                                                    <FiMinus
                                                                        size={
                                                                            16
                                                                        }
                                                                    />
                                                                </IconButton>
                                                                <TextField
                                                                    value={
                                                                        item.quantity
                                                                    }
                                                                    onChange={(
                                                                        e
                                                                    ) => {
                                                                        const value =
                                                                            Number.parseInt(
                                                                                e
                                                                                    .target
                                                                                    .value
                                                                            );
                                                                        if (
                                                                            !isNaN(
                                                                                value
                                                                            )
                                                                        ) {
                                                                            handleQuantityChange(
                                                                                item.product_id,
                                                                                value,
                                                                                product?.quantity ||
                                                                                    0
                                                                            );
                                                                        }
                                                                    }}
                                                                    inputProps={{
                                                                        min: 0,
                                                                        style: {
                                                                            textAlign:
                                                                                "center",
                                                                        },
                                                                        "aria-label":
                                                                            "Cart quantity",
                                                                    }}
                                                                    sx={{
                                                                        width: 40,
                                                                        mx: 1,
                                                                    }}
                                                                    size="small"
                                                                />
                                                                <IconButton
                                                                    size="small"
                                                                    onClick={() =>
                                                                        handleQuantityChange(
                                                                            item.product_id,
                                                                            item.quantity +
                                                                                1,
                                                                            product?.quantity ||
                                                                                0
                                                                        )
                                                                    }
                                                                    disabled={
                                                                        !product ||
                                                                        item.quantity >=
                                                                            product.quantity
                                                                    }
                                                                    component={
                                                                        motion.div
                                                                    }
                                                                    whileHover={{
                                                                        scale: 1.1,
                                                                    }}
                                                                    aria-label="Increase quantity"
                                                                >
                                                                    <FiPlus
                                                                        size={
                                                                            16
                                                                        }
                                                                    />
                                                                </IconButton>
                                                            </Box>

                                                            <IconButton
                                                                color="error"
                                                                onClick={() =>
                                                                    handleRemoveItem(
                                                                        item.product_id
                                                                    )
                                                                }
                                                                component={
                                                                    motion.div
                                                                }
                                                                whileHover={{
                                                                    scale: 1.1,
                                                                }}
                                                                aria-label={`Remove ${
                                                                    product?.name ||
                                                                    "item"
                                                                } from cart`}
                                                            >
                                                                <FiTrash2 />
                                                            </IconButton>
                                                        </Box>
                                                    </Box>
                                                );
                                            })}
                                        </Box>
                                    </AnimatePresence>
                                ) : (
                                    <TableContainer component={Paper}>
                                        <Table>
                                            <TableHead>
                                                <TableRow>
                                                    <TableCell>
                                                        Product
                                                    </TableCell>
                                                    <TableCell align="center">
                                                        Price
                                                    </TableCell>
                                                    <TableCell align="center">
                                                        Quantity
                                                    </TableCell>
                                                    <TableCell align="right">
                                                        Subtotal
                                                    </TableCell>
                                                    <TableCell align="right">
                                                        Actions
                                                    </TableCell>
                                                </TableRow>
                                            </TableHead>
                                            <TableBody>
                                                <AnimatePresence>
                                                    {cart.map((item, index) => {
                                                        const product =
                                                            products[index] as
                                                                | ItemType
                                                                | undefined;
                                                        return (
                                                            <TableRow
                                                                key={
                                                                    item.product_id
                                                                }
                                                                component={
                                                                    motion.tr
                                                                }
                                                                initial={{
                                                                    opacity: 0,
                                                                    y: 20,
                                                                }}
                                                                animate={{
                                                                    opacity: 1,
                                                                    y: 0,
                                                                }}
                                                                exit={{
                                                                    opacity: 0,
                                                                    y: 20,
                                                                }}
                                                                transition={{
                                                                    duration: 0.3,
                                                                }}
                                                                sx={{
                                                                    "&:last-child td, &:last-child th":
                                                                        {
                                                                            border: 0,
                                                                        },
                                                                }}
                                                            >
                                                                <TableCell>
                                                                    <Box
                                                                        sx={{
                                                                            display:
                                                                                "flex",
                                                                            alignItems:
                                                                                "center",
                                                                        }}
                                                                    >
                                                                        <Image
                                                                            src={
                                                                                product?.image ||
                                                                                "https://images.pexels.com/photos/5946103/pexels-photo-5946103.jpeg?auto=compress&cs=tinysrgb&w=60"
                                                                            }
                                                                            alt={
                                                                                product?.name ||
                                                                                "Product"
                                                                            }
                                                                            width={
                                                                                60
                                                                            }
                                                                            height={
                                                                                60
                                                                            }
                                                                            style={{
                                                                                objectFit:
                                                                                    "cover",
                                                                                borderRadius: 4,
                                                                                marginRight: 16,
                                                                            }}
                                                                        />
                                                                        <Box>
                                                                            <Typography variant="subtitle2">
                                                                                {product?.name ||
                                                                                    "Loading..."}
                                                                            </Typography>
                                                                            {typeof product?.discount ===
                                                                                "number" &&
                                                                                product.discount >
                                                                                    0 && (
                                                                                    <Typography
                                                                                        variant="body2"
                                                                                        color="text.secondary"
                                                                                    >
                                                                                        Discount:{" "}
                                                                                        {
                                                                                            product.discount
                                                                                        }

                                                                                        %
                                                                                    </Typography>
                                                                                )}
                                                                        </Box>
                                                                    </Box>
                                                                </TableCell>
                                                                <TableCell align="center">
                                                                    {product
                                                                        ? `Rs. ${product.price.toFixed(
                                                                              2
                                                                          )}`
                                                                        : "-"}
                                                                    {typeof product?.discount ===
                                                                        "number" &&
                                                                        product.discount >
                                                                            0 && (
                                                                            <Typography
                                                                                variant="body2"
                                                                                color="text.secondary"
                                                                            >
                                                                                Now
                                                                                Rs.{" "}
                                                                                {(
                                                                                    product.price *
                                                                                    (1 -
                                                                                        product.discount /
                                                                                            100)
                                                                                ).toFixed(
                                                                                    2
                                                                                )}
                                                                            </Typography>
                                                                        )}
                                                                </TableCell>
                                                                <TableCell align="center">
                                                                    <Box
                                                                        sx={{
                                                                            display:
                                                                                "flex",
                                                                            alignItems:
                                                                                "center",
                                                                            justifyContent:
                                                                                "center",
                                                                        }}
                                                                    >
                                                                        <IconButton
                                                                            size="small"
                                                                            onClick={() =>
                                                                                handleQuantityChange(
                                                                                    item.product_id,
                                                                                    item.quantity -
                                                                                        1,
                                                                                    product?.quantity ||
                                                                                        0
                                                                                )
                                                                            }
                                                                            disabled={
                                                                                item.quantity <=
                                                                                1
                                                                            }
                                                                            component={
                                                                                motion.div
                                                                            }
                                                                            whileHover={{
                                                                                scale: 1.1,
                                                                            }}
                                                                            aria-label="Decrease quantity"
                                                                        >
                                                                            <FiMinus
                                                                                size={
                                                                                    16
                                                                                }
                                                                            />
                                                                        </IconButton>
                                                                        <TextField
                                                                            value={
                                                                                item.quantity
                                                                            }
                                                                            onChange={(
                                                                                e
                                                                            ) => {
                                                                                const value =
                                                                                    Number.parseInt(
                                                                                        e
                                                                                            .target
                                                                                            .value
                                                                                    );
                                                                                if (
                                                                                    !isNaN(
                                                                                        value
                                                                                    )
                                                                                ) {
                                                                                    handleQuantityChange(
                                                                                        item.product_id,
                                                                                        value,
                                                                                        product?.quantity ||
                                                                                            0
                                                                                    );
                                                                                }
                                                                            }}
                                                                            inputProps={{
                                                                                min: 0,
                                                                                style: {
                                                                                    textAlign:
                                                                                        "center",
                                                                                },
                                                                                "aria-label":
                                                                                    "Cart quantity",
                                                                            }}
                                                                            sx={{
                                                                                width: 40,
                                                                                mx: 1,
                                                                            }}
                                                                            size="small"
                                                                        />
                                                                        <IconButton
                                                                            size="small"
                                                                            onClick={() =>
                                                                                handleQuantityChange(
                                                                                    item.product_id,
                                                                                    item.quantity +
                                                                                        1,
                                                                                    product?.quantity ||
                                                                                        0
                                                                                )
                                                                            }
                                                                            disabled={
                                                                                !product ||
                                                                                item.quantity >=
                                                                                    product.quantity
                                                                            }
                                                                            component={
                                                                                motion.div
                                                                            }
                                                                            whileHover={{
                                                                                scale: 1.1,
                                                                            }}
                                                                            aria-label="Increase quantity"
                                                                        >
                                                                            <FiPlus
                                                                                size={
                                                                                    16
                                                                                }
                                                                            />
                                                                        </IconButton>
                                                                    </Box>
                                                                </TableCell>
                                                                <TableCell align="right">
                                                                    <Typography
                                                                        variant="subtitle2"
                                                                        color="primary"
                                                                        sx={{
                                                                            fontWeight: 600,
                                                                        }}
                                                                    >
                                                                        {product
                                                                            ? `Rs. ${(
                                                                                  (product.discount
                                                                                      ? product.price *
                                                                                        (1 -
                                                                                            product.discount /
                                                                                                100)
                                                                                      : product.price) *
                                                                                  item.quantity
                                                                              ).toFixed(
                                                                                  2
                                                                              )}`
                                                                            : "-"}
                                                                    </Typography>
                                                                </TableCell>
                                                                <TableCell align="right">
                                                                    <IconButton
                                                                        color="error"
                                                                        onClick={() =>
                                                                            handleRemoveItem(
                                                                                item.product_id
                                                                            )
                                                                        }
                                                                        component={
                                                                            motion.div
                                                                        }
                                                                        whileHover={{
                                                                            scale: 1.1,
                                                                        }}
                                                                        aria-label={`Remove ${
                                                                            product?.name ||
                                                                            "item"
                                                                        } from cart`}
                                                                    >
                                                                        <FiTrash2 />
                                                                    </IconButton>
                                                                </TableCell>
                                                            </TableRow>
                                                        );
                                                    })}
                                                </AnimatePresence>
                                            </TableBody>
                                        </Table>
                                    </TableContainer>
                                )}
                            </>
                        )}
                        {/* </CardContent> */}
                        {/* </Card> */}

                        <Box
                            sx={{
                                display: "flex",
                                justifyContent: "space-between",
                                mt: 3,
                                flexWrap: "wrap",
                                gap: 2,
                            }}
                        >
                            <Button
                                variant="outlined"
                                startIcon={<FiArrowLeft />}
                                onClick={handleContinueShopping}
                                component={motion.div}
                                whileHover={{ scale: 1.05 }}
                            >
                                Continue Shopping
                            </Button>
                            <Button
                                variant="outlined"
                                color="error"
                                onClick={clearCart}
                                component={motion.div}
                                whileHover={{ scale: 1.05 }}
                            >
                                Clear Cart
                            </Button>
                        </Box>
                    </Box>

                    {/* Order Summary */}
                    <Box sx={{ width: { xs: "100%", md: "30%" } }}>
                        <Card variant="outlined">
                            <CardContent>
                                <Typography variant="h6" gutterBottom>
                                    Order Summary
                                </Typography>

                                <Box sx={{ my: 2 }}>
                                    <Box
                                        sx={{
                                            display: "flex",
                                            justifyContent: "space-between",
                                            mb: 1,
                                        }}
                                    >
                                        <Typography variant="body2">
                                            Subtotal
                                        </Typography>
                                        <Typography variant="body2">
                                            Rs.{" "}
                                            {getCartTotal(products).toFixed(2)}
                                        </Typography>
                                    </Box>
                                    <Box
                                        sx={{
                                            display: "flex",
                                            justifyContent: "space-between",
                                            mb: 1,
                                        }}
                                    >
                                        <Typography variant="body2">
                                            Shipping
                                        </Typography>
                                        <Typography variant="body2">
                                            Rs. 0.00
                                        </Typography>
                                    </Box>
                                    <Box
                                        sx={{
                                            display: "flex",
                                            justifyContent: "space-between",
                                            mb: 1,
                                        }}
                                    >
                                        <Typography variant="body2">
                                            Tax (10%)
                                        </Typography>
                                        <Typography variant="body2">
                                            Rs.{" "}
                                            {(
                                                getCartTotal(products) * 0.1
                                            ).toFixed(2)}
                                        </Typography>
                                    </Box>
                                </Box>

                                <Divider sx={{ my: 2 }} />

                                <Box
                                    sx={{
                                        display: "flex",
                                        justifyContent: "space-between",
                                        mb: 3,
                                    }}
                                >
                                    <Typography
                                        variant="subtitle1"
                                        sx={{ fontWeight: 600 }}
                                    >
                                        Total
                                    </Typography>
                                    <Typography
                                        variant="subtitle1"
                                        color="primary"
                                        sx={{ fontWeight: 700 }}
                                    >
                                        Rs.{" "}
                                        {(
                                            getCartTotal(products) +
                                            getCartTotal(products) * 0.1
                                        ).toFixed(2)}
                                    </Typography>
                                </Box>

                                <Button
                                    variant="contained"
                                    color="primary"
                                    fullWidth
                                    size="large"
                                    startIcon={<FiShoppingCart />}
                                    onClick={handleCheckout}
                                    disabled={
                                        isLoadingProducts ||
                                        hasError ||
                                        cart.length === 0
                                    }
                                    component={motion.div}
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                >
                                    Proceed to Checkout
                                </Button>

                                <Box sx={{ mt: 3 }}>
                                    <Typography
                                        variant="body2"
                                        color="text.secondary"
                                        gutterBottom
                                    >
                                        We accept:
                                    </Typography>
                                    <Box
                                        sx={{
                                            display: "flex",
                                            gap: 1,
                                            flexWrap: "wrap",
                                        }}
                                    >
                                        {[
                                            "Visa",
                                            "Mastercard",
                                            "PayPal",
                                            "Apple Pay",
                                        ].map((method) => (
                                            <Chip
                                                key={method}
                                                label={method}
                                                size="small"
                                                variant="outlined"
                                            />
                                        ))}
                                    </Box>
                                </Box>
                            </CardContent>
                        </Card>
                    </Box>
                </Box>
            )}
        </Container>
    );
}
