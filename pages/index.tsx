"use client";

import {
    Box,
    Typography,
    Grid,
    Button,
    Container,
    Card,
    CardContent,
    CardMedia,
    // useMediaQuery,
    CircularProgress,
    // TextField,
    // Alert,
} from "@mui/material";
// import { useTheme } from "@mui/material/styles";
import { useRouter } from "next/router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import ProductCard from "@/src/components/ProductCard";
import { FiArrowRight } from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";
import { ItemType } from "@/types/types";
import Newsletter from "@/src/components/NewsLetter";

const fetchFeaturedProducts = async () => {
    const response = await fetch("/api/products?featured=true");
    if (!response.ok) {
        throw new Error("Failed to fetch featured products");
    }
    return response.json();
};

// Hero carousel items
const heroSlides = [
    {
        title: "Fresh Fruits Delivered to Your Door",
        subtitle:
            "We source the freshest fruits directly from local farmers. Enjoy nature's goodness with just a few clicks.",
        image: "https://images.unsplash.com/photo-1490885578174-acda8905c2c6?ixlib=rb-4.0.3&auto=format&fit=crop&w=1350&q=80",
        cta: "Shop Now",
        ctaLink: "/products",
    },
    {
        title: "Organic & Sustainable",
        subtitle:
            "Discover our range of certified organic fruits, grown with care for you and the planet.",
        image: "https://images.unsplash.com/photo-1464454709131-ffd692591ee5?ixlib=rb-4.0.3&auto=format&fit=crop&w=1350&q=80",
        cta: "Explore Organic",
        ctaLink: "/products?category=organic",
    },
    {
        title: "Seasonal Delights",
        subtitle:
            "Taste the season with our hand-picked selection of seasonal fruits.",
        image: "https://images.unsplash.com/photo-1618897996318-5a901fa6ca71?ixlib=rb-4.0.3&auto=format&fit=crop&w=1350&q=80",
        cta: "Shop Seasonal",
        ctaLink: "/products?sort=seasonal",
    },
];

const benefits = [
    {
        title: "Farm Fresh",
        description:
            "Sourced directly from local farmers for maximum freshness.",
        image: "https://images.unsplash.com/photo-1665516930780-2b09cc3a89aa?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NDd8fGZhcm0lMjBmcmVzaCUyMGZydWl0c3xlbnwwfHwwfHx8MA%3D%3D",
    },
    {
        title: "Fast Delivery",
        description: "Delivered to your door within 24 hours of ordering.",
        image: "https://images.pexels.com/photos/6868618/pexels-photo-6868618.jpeg?auto=compress&cs=tinysrgb&w=600",
    },
    {
        title: "Organic Options",
        description: "Certified organic fruits grown with care.",
        image: "https://images.pexels.com/photos/3669640/pexels-photo-3669640.jpeg?auto=compress&cs=tinysrgb&w=600https://images.unsplash.com/photo-1592832125589-149143e85199?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80",
    },
    {
        title: "Satisfaction Guaranteed",
        description: "100% satisfaction or your money back.",
        image: "https://images.pexels.com/photos/7564196/pexels-photo-7564196.jpeg?auto=compress&cs=tinysrgb&w=600",
    },
];

export default function Home() {
    const router = useRouter();
    // const theme = useTheme();
    // const isMobile = useMediaQuery(theme.breakpoints.down("md"));
    const [currentSlide, setCurrentSlide] = useState(0);

    // Auto-cycle hero slides
    useState(() => {
        const interval = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
        }, 5000);
        return () => clearInterval(interval);
    });

    const {
        data: featuredProducts,
        isLoading,
        error,
    } = useQuery({
        queryKey: ["featuredProducts"],
        queryFn: fetchFeaturedProducts,
    });

    return (
        <Grid
            sx={{
                display: "flex",
                flexDirection: "column",
                gap: "4rem",
            }}
        >
            {/* Hero Section */}
            <Grid
                sx={{
                    position: "relative",
                    minHeight: { xs: "70vh", md: "80vh" },
                    overflow: "hidden",
                    display: "flex",
                    alignItems: "center",
                    "&:after": {
                        content: '""',
                        position: "absolute",
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: {
                            xs: "linear-gradient(180deg, rgba(0,0,0,0.6), rgba(0,0,0,0.4))",
                            md: "linear-gradient(180deg, rgba(0,0,0,0.5), rgba(0,0,0,0.3))",
                        },
                        zIndex: 1,
                    },
                    // mx:2,
                }}
            >
                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentSlide}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.6 }}
                        style={{
                            position: "absolute",
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            backgroundImage: `url(${heroSlides[currentSlide].image})`,
                            backgroundSize: "cover",
                            backgroundPosition: "center",
                        }}
                    />
                </AnimatePresence>

                <Container
                    // maxWidth="xl"
                    sx={{
                        position: "relative",
                        zIndex: 2,
                        px: { xs: 3, sm: 6 },
                        py: { xs: 6, md: 10 },
                    }}
                >
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.7 }}
                    >
                        <Typography
                            variant="h2"
                            component="h1"
                            color="white"
                            gutterBottom
                            sx={{
                                fontWeight: 700,
                                fontSize: {
                                    xs: "clamp(2rem, 6vw, 3rem)",
                                    md: "clamp(3rem, 6vw, 4rem)",
                                },
                                textShadow: "0 4px 8px rgba(0,0,0,0.5)",
                            }}
                        >
                            {heroSlides[currentSlide].title}
                        </Typography>
                        <Typography
                            variant="h6"
                            color="white"
                            sx={{
                                mb: 4,
                                maxWidth: 600,
                                opacity: 0.95,
                                fontSize: { xs: "1rem", md: "1.25rem" },
                            }}
                        >
                            {heroSlides[currentSlide].subtitle}
                        </Typography>
                        <Button
                            variant="contained"
                            color="secondary"
                            size="large"
                            onClick={() =>
                                router.push(heroSlides[currentSlide].ctaLink)
                            }
                            sx={{
                                px: 4,
                                py: 1.5,
                                fontSize: "1rem",
                                borderRadius: 2,
                                textTransform: "none",
                            }}
                            component={motion.div}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            {heroSlides[currentSlide].cta}
                        </Button>
                    </motion.div>
                </Container>
            </Grid>

            {/* Featured Section */}
            <Grid>
                <Box
                    sx={{
                        display: "flex",
                        flexDirection: {
                            xs: "column",
                            sm: "row",
                        },
                        justifyContent: "space-between",
                        alignItems: "center",
                        mb: 4,
                    }}
                >
                    <Typography
                        variant="h4"
                        // component="h2"
                        sx={{ fontWeight: 600 }}
                        component={motion.div}
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5 }}
                    >
                        Featured Products
                    </Typography>
                    <Button
                        endIcon={<FiArrowRight />}
                        onClick={() => router.push("/products")}
                        component={motion.div}
                        whileHover={{ x: 5 }}
                    >
                        View All
                    </Button>
                </Box>
                {isLoading ? (
                    <Box
                        sx={{
                            display: "flex",
                            justifyContent: "center",
                            py: 4,
                        }}
                    >
                        <CircularProgress />
                    </Box>
                ) : error ? (
                    <Typography color="error" textAlign="center">
                        Failed to load featured products.
                    </Typography>
                ) : (
                    <Grid
                        container
                        spacing={3}
                        justifyContent="center"
                        alignItems="center"
                    >
                        {featuredProducts?.map(
                            (product: ItemType, index: number) =>
                                product.quantity > 0 ? (
                                    <Grid
                                        item
                                        key={product.id}
                                        component={motion.div}
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        whileInView={{ opacity: 1, scale: 1 }}
                                        viewport={{ once: true }}
                                        transition={{
                                            duration: 0.5,
                                            delay: index * 0.1,
                                        }}
                                        width={{
                                            xs: "100%",
                                            sm: "50%",
                                            md: "25%",
                                        }}
                                    >
                                        <ProductCard product={product} />
                                    </Grid>
                                ) : null
                        )}
                    </Grid>
                )}
            </Grid>

            {/* benefits section */}
            <Grid>
                <Box
                    sx={{
                        display: "flex",
                        flexDirection: {
                            xs: "column",
                            sm: "row",
                        },
                        justifyContent: "space-between",
                        alignItems: "center",
                        mb: 4,
                    }}
                >
                    <Typography
                        variant="h4"
                        // component="h2"
                        sx={{ fontWeight: 600 }}
                        component={motion.div}
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5 }}
                    >
                        Why Choose Us?
                    </Typography>
                </Box>
                <Grid container spacing={4} justifyContent="center">
                    {benefits.map((benefit, index) => (
                        <Grid
                            item
                            key={index}
                            xs={12}
                            sm={6}
                            md={3}
                            component={motion.div}
                            initial={{ opacity: 0, scale: 0.9 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                        >
                            <Card
                                sx={{
                                    height: "100%",
                                    boxShadow: "0 4px 20px rgba(0,0,0,0.05)",
                                    borderRadius: 2,
                                    transition: "transform 0.3s",
                                    "&:hover": {
                                        transform: "translateY(-8px)",
                                    },
                                }}
                            >
                                <CardMedia
                                    component="img"
                                    image={benefit.image}
                                    alt={benefit.title}
                                    sx={{
                                        height: 150,
                                        objectFit: "cover",
                                        borderTopLeftRadius: 8,
                                        borderTopRightRadius: 8,
                                    }}
                                />
                                <CardContent
                                    sx={{
                                        textAlign: "center",
                                        p: 3,
                                    }}
                                >
                                    <Typography
                                        variant="h6"
                                        component="h3"
                                        gutterBottom
                                        sx={{ fontWeight: 600 }}
                                    >
                                        {benefit.title}
                                    </Typography>
                                    <Typography
                                        variant="body2"
                                        color="text.secondary"
                                    >
                                        {benefit.description}
                                    </Typography>
                                </CardContent>
                            </Card>
                        </Grid>
                    ))}
                </Grid>
            </Grid>

            {/* buy */}
            <Grid>
                <Box
                    sx={{
                        bgcolor: "secondary.main",
                        borderRadius: 2,
                        p: { xs: 4, md: 6 },
                        // my: 8,
                        textAlign: "center",
                        color: "white",
                    }}
                    component={motion.div}
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5 }}
                >
                    <Typography
                        variant="h4"
                        component="h2"
                        gutterBottom
                        sx={{ fontWeight: 600 }}
                    >
                        Ready to Order Fresh Fruits?
                    </Typography>
                    <Typography
                        variant="body1"
                        paragraph
                        sx={{ maxWidth: 600, mx: "auto", mb: 4, opacity: 0.9 }}
                    >
                        Join thousands of satisfied customers who enjoy our
                        farm-fresh fruits delivered right to their doorstep.
                    </Typography>
                    <Button
                        variant="contained"
                        color="primary"
                        size="large"
                        onClick={() => router.push("/products")}
                        sx={{ px: 4, py: 1.5 }}
                        component={motion.div}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        Shop Now
                    </Button>
                </Box>
            </Grid>

            {/* Newsletter Section */}
            <Newsletter />
        </Grid>
    );
}
