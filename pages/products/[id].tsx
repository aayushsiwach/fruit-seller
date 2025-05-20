"use client";

import {
    Box,
    Container,
    Typography,
    Button,
    // Tabs,
    // Tab,
    Breadcrumbs,
    Link as MuiLink,
    IconButton,
    useMediaQuery,
    Divider,
    Alert,
    TextField,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { useRouter } from "next/router";
import { useQuery } from "@tanstack/react-query";
import { useCart } from "@/src/contexts/CartContext";
import Link from "next/link";
import CircularProgress from "@mui/material/CircularProgress";
import {
    FiShoppingCart,
    // FiHeart,
    FiShare2,
    FiPlus,
    FiMinus,
} from "react-icons/fi";
import { ItemType } from "@/types/types";
import ProductCard from "@/src/components/ProductCard";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { useState } from "react";

const fetchProductDetails = async (id: string) => {
    const response = await fetch(`/api/products/${id}`);
    if (!response.ok) {
        throw new Error("Failed to fetch product details");
    }
    return response.json();
};

const fetchRelatedProducts = async (id: string) => {
    const response = await fetch(`/api/products?related=${id}`);
    if (!response.ok) {
        throw new Error("Failed to fetch related products");
    }
    return response.json();
};

export default function ProductDetail() {
    const router = useRouter();
    const { id } = router.query;
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down("md"));
    const { cart, addToCart, updateQuantity, removeFromCart } = useCart();
    // const [activeTab, setActiveTab] = useState(0);
    const [error, setError] = useState<string | null>(null);

    const { data: product, isLoading: isLoadingProduct } = useQuery<ItemType>({
        queryKey: ["product", id],
        queryFn: () => fetchProductDetails(id as string),
        enabled: !!id,
    });

    const { data: relatedProducts } = useQuery<ItemType[]>({
        queryKey: ["relatedProducts", id],
        queryFn: () => fetchRelatedProducts(id as string),
        enabled: !!id,
    });

    // Check if the product is in the cart
    const cartItem = cart.find((item) => item.product_id === (id as string));
    const cartQuantity = cartItem ? cartItem.quantity : 0;

    const handleAddToCart = () => {
        if (product && product.quantity >= 1) {
            addToCart(product, 1); // Default quantity of 1
            setError(null);
        } else {
            setError("Cannot add to cart: out of stock.");
        }
    };

    const handleQuantityChange = (newQuantity: number) => {
        if (!product) return;

        if (newQuantity <= 0) {
            removeFromCart(product.id);
        } else {
            updateQuantity(product.id, newQuantity, product.quantity);
        }
    };

    // const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    //     setActiveTab(newValue);
    // };

    if (isLoadingProduct || !product) {
        return (
            <Container maxWidth="lg">
                <Box sx={{ py: 8, textAlign: "center" }}>
                    <CircularProgress />
                    <Typography>Loading product details...</Typography>
                </Box>
            </Container>
        );
    }

    return (
        <Container maxWidth="lg">
            <Breadcrumbs
                sx={{ my: 2 }}
                component={motion.div}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
            >
                <Link href="/" passHref>
                    <MuiLink underline="hover" color="inherit">
                        Home
                    </MuiLink>
                </Link>
                <Link href="/products" passHref>
                    <MuiLink underline="hover" color="inherit">
                        Products
                    </MuiLink>
                </Link>
                <Typography color="text.primary">{product.name}</Typography>
            </Breadcrumbs>

            {error && (
                <Alert
                    severity="error"
                    sx={{ mb: 2 }}
                    onClose={() => setError(null)}
                >
                    {error}
                </Alert>
            )}

            <Box
                sx={{
                    display: "flex",
                    flexDirection: isMobile ? "column" : "row",
                    gap: 4,
                }}
            >
                <Box sx={{ width: { xs: "100%", md: "50%" } }}>
                    <Box
                        sx={{
                            bgcolor: "background.paper",
                            // borderRadius: 2,
                            // p: 2,
                            display: "flex",
                            // justifyContent: "center",
                            // alignItems: "center",
                            minHeight: 400,
                            // minWidth: 400,
                            overflow: "hidden",
                        }}
                        component={motion.div}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.5 }}
                    >
                        <Image
                            src={
                                product.image ||
                                "https://images.pexels.com/photos/5946103/pexels-photo-5946103.jpeg?auto=compress&cs=tinysrgb&w=400"
                            }
                            alt={product.name}
                            width={400}
                            height={400}
                            // fill={true}
                            style={{ objectFit: "cover" }}
                        />
                    </Box>
                </Box>

                <Box
                    sx={{ width: { xs: "100%", md: "50%" } }}
                    component={motion.div}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <Typography
                        variant="h4"
                        component="h1"
                        gutterBottom
                        sx={{ fontWeight: 600 }}
                    >
                        {product.name}
                    </Typography>

                    <Box
                        sx={{
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "start",
                            mb: 2,
                        }}
                    >
                        <Typography
                            variant="h5"
                            color="green"
                            sx={{ fontWeight: 700 }}
                        >
                            Rs.{" "}
                            {(product.discount
                                ? product.price * (1 - product.discount / 100)
                                : product.price
                            ).toFixed(2)}
                        </Typography>
                        {product.discount > 0 && (
                            <Typography
                                component="span"
                                variant="body2"
                                color="text.secondary"
                                sx={{ textDecoration: "line-through" }}
                            >
                                M.R.P.: {product.price.toFixed(2)}
                            </Typography>
                        )}
                    </Box>

                    <Typography variant="body1" paragraph>
                        {product.description}
                    </Typography>

                    <Divider sx={{ my: 2 }} />

                    <Box
                        sx={{
                            display: "flex",
                            flexWrap: "wrap",
                            gap: 2,
                            mb: 3,
                        }}
                    >
                        <Box sx={{ minWidth: 120 }}>
                            <Typography variant="body2" color="text.secondary">
                                Category
                            </Typography>
                            <Typography variant="body1">
                                {product.category}
                            </Typography>
                        </Box>
                        <Box sx={{ minWidth: 120 }}>
                            <Typography variant="body2" color="text.secondary">
                                Availability
                            </Typography>
                            <Typography
                                variant="body1"
                                color={
                                    product.quantity > 0
                                        ? "success.main"
                                        : "error.main"
                                }
                            >
                                {product.quantity > 0
                                    ? `In Stock (${product.quantity})`
                                    : "Out of Stock"}
                            </Typography>
                        </Box>
                        <Box sx={{ minWidth: 120 }}>
                            <Typography variant="body2" color="text.secondary">
                                Seasonal
                            </Typography>
                            <Typography variant="body1">
                                {product.is_seasonal ? "Yes" : "No"}
                            </Typography>
                        </Box>
                    </Box>

                    <Divider sx={{ my: 2 }} />

                    <Box
                        sx={{
                            display: "flex",
                            gap: 2,
                            mb: 3,
                            alignItems: "center",
                        }}
                    >
                        {cartQuantity > 0 ? (
                            <Box
                                sx={{
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "space-between",
                                    gap: 1,
                                    flexGrow: 1,
                                }}
                                component={motion.div}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ duration: 0.3 }}
                            >
                                <IconButton
                                    size="small"
                                    onClick={() =>
                                        handleQuantityChange(cartQuantity - 1)
                                    }
                                    disabled={product.quantity === 0}
                                    component={motion.div}
                                    whileHover={{ scale: 1.1 }}
                                >
                                    <FiMinus />
                                </IconButton>
                                <TextField
                                    value={cartQuantity}
                                    onChange={(e) => {
                                        const value = Number.parseInt(
                                            e.target.value
                                        );
                                        if (!isNaN(value) && value >= 0) {
                                            handleQuantityChange(value);
                                        }
                                    }}
                                    inputProps={{
                                        min: 0,
                                        max: product.quantity,
                                        style: { textAlign: "center" },
                                    }}
                                    sx={{ width: 60 }}
                                    size="small"
                                />
                                <IconButton
                                    size="small"
                                    onClick={() =>
                                        handleQuantityChange(cartQuantity + 1)
                                    }
                                    disabled={cartQuantity >= product.quantity}
                                    component={motion.div}
                                    whileHover={{ scale: 1.1 }}
                                >
                                    <FiPlus />
                                </IconButton>
                            </Box>
                        ) : (
                            <Button
                                variant="contained"
                                color="primary"
                                size="large"
                                startIcon={<FiShoppingCart />}
                                onClick={handleAddToCart}
                                disabled={product.quantity === 0}
                                sx={{ flexGrow: 1 }}
                                component={motion.div}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                Add to Cart
                            </Button>
                        )}
                        {/* <IconButton
                            color="primary"
                            sx={{ border: 1, borderColor: "divider" }}
                            component={motion.div}
                            whileHover={{ scale: 1.1 }}
                        >
                            <FiHeart />
                        </IconButton> */}
                        <IconButton
                            color="primary"
                            sx={{ border: 1, borderColor: "divider" }}
                            component={motion.div}
                            whileHover={{ scale: 1.1 }}
                            onClick={() => {
                                navigator.clipboard
                                    .writeText(window.location.href)
                                    .then(() => {
                                        // Optional: show a success message (e.g., toast/snackbar)
                                        console.log(
                                            "Link copied to clipboard!"
                                        );
                                    })
                                    .catch((err) => {
                                        console.error("Failed to copy: ", err);
                                    });
                            }}
                        >
                            <FiShare2 />
                        </IconButton>
                    </Box>
                </Box>
            </Box>

            {/* <Box sx={{ mt: 6, mb: 4 }} component={motion.div} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5, delay: 0.2 }}>
                <Tabs
                    value={activeTab}
                    onChange={handleTabChange}
                    variant={isMobile ? "scrollable" : "standard"}
                    scrollButtons={isMobile ? "auto" : false}
                    sx={{ borderBottom: 1, borderColor: "divider", mb: 2 }}
                >
                    <Tab label="Description" />
                </Tabs>

                {activeTab === 0 && (
                    <Box sx={{ py: 2 }}>
                        <Typography variant="body1" paragraph>
                            {product.description}
                        </Typography>
                    </Box>
                )}
            </Box> */}

            {relatedProducts && relatedProducts.length > 0 && (
                <Box
                    sx={{ mt: 6, mb: 4 }}
                    component={motion.div}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5, delay: 0.4 }}
                >
                    <Typography
                        variant="h5"
                        gutterBottom
                        sx={{ fontWeight: 600 }}
                    >
                        Related Products
                    </Typography>
                    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 3 }}>
                        <AnimatePresence>
                            {relatedProducts.map((relatedProduct, index) => (
                                <Box
                                    key={relatedProduct.id}
                                    sx={{
                                        width: {
                                            xs: "100%",
                                            sm: "48%",
                                            md: "31%",
                                        },
                                    }}
                                    component={motion.div}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: 20 }}
                                    transition={{
                                        duration: 0.5,
                                        delay: index * 0.1,
                                    }}
                                >
                                    <ProductCard product={relatedProduct} />
                                </Box>
                            ))}
                        </AnimatePresence>
                    </Box>
                </Box>
            )}
        </Container>
    );
}
