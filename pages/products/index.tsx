"use client";

import {
    Box,
    Typography,
    Slider,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    CircularProgress,
    Paper,
    useMediaQuery,
    Button,
    Checkbox,
    FormControlLabel,
    Chip,
    Grid,
    Divider,
    Dialog,
    // IconButton,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ItemType } from "@/types/types";
import ProductCard from "@/src/components/ProductCard";
import { FiFilter, FiX } from "react-icons/fi";

const fetchProducts = async (): Promise<ItemType[]> => {
    const response = await fetch("/api/products");
    if (!response.ok) throw new Error("Failed to fetch products");
    return response.json();
};

export default function ProductsPage() {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down("md"));

    const [products, setProducts] = useState<ItemType[]>([]);
    const [filteredProducts, setFilteredProducts] = useState<ItemType[]>([]);
    const [priceRange, setPriceRange] = useState<[number, number]>([0, 100]);
    const [minPrice, setMinPrice] = useState(0);
    const [maxPrice, setMaxPrice] = useState(100);
    const [sortOption, setSortOption] = useState("none");
    const [category, setCategory] = useState("all");
    const [inStockOnly, setInStockOnly] = useState(false);
    const [openFilterDialog, setOpenFilterDialog] = useState(false);

    const { data, isLoading, error } = useQuery({
        queryKey: ["products"],
        queryFn: fetchProducts,
    });

    useEffect(() => {
        if (data?.length) {
            setProducts(data);
            setFilteredProducts(data);

            const prices = data.map((p) => p.price);
            const min = Math.floor(Math.min(...prices));
            const max = Math.ceil(Math.max(...prices));
            setMinPrice(min);
            setMaxPrice(max);
            setPriceRange([min, max]);
        }
    }, [data]);

    useEffect(() => {
        let filtered = [...products];

        filtered = filtered.filter(
            (p) => p.price >= priceRange[0] && p.price <= priceRange[1]
        );

        if (category !== "all") {
            filtered = filtered.filter((p) => p.category === category);
        }

        if (inStockOnly) {
            filtered = filtered.filter((p) => p.quantity > 0);
        }

        switch (sortOption) {
            case "discounted":
                filtered = filtered
                    .filter((p) => p.discount > 0)
                    .sort((a, b) => b.discount - a.discount);
                break;
            case "new":
                const recent = new Date();
                recent.setDate(recent.getDate() - 14);
                filtered = filtered
                    .filter((p) => new Date(p.created_at) >= recent)
                    .sort(
                        (a, b) =>
                            new Date(b.created_at).getTime() -
                            new Date(a.created_at).getTime()
                    );
                break;
            case "seasonal":
                filtered = filtered
                    .filter((p) => p.is_seasonal)
                    .sort((a, b) => a.name.localeCompare(b.name));
                break;
        }

        setFilteredProducts(filtered);
    }, [priceRange, category, sortOption, inStockOnly, products]);

    const handleResetFilters = () => {
        setPriceRange([minPrice, maxPrice]);
        setCategory("all");
        setSortOption("none");
        setInStockOnly(false);
    };

    const categories = ["all", "Berries", "Citrus", "Tropical", "Stone Fruits"];
    const sortOptions = [
        { value: "none", label: "Default" },
        { value: "discounted", label: "Discounted" },
        { value: "new", label: "New Arrivals" },
        { value: "seasonal", label: "Seasonal" },
    ];

    const getFilterSummary = () => {
        const filters = [];
        if (priceRange[0] !== minPrice || priceRange[1] !== maxPrice)
            filters.push(`Price: Rs.${priceRange[0]} - Rs.${priceRange[1]}`);
        if (category !== "all") filters.push(`Category: ${category}`);
        if (sortOption !== "none")
            filters.push(
                `Sort: ${
                    sortOptions.find((o) => o.value === sortOption)?.label
                }`
            );
        if (inStockOnly) filters.push("In Stock Only");
        return filters;
    };

    const searchParams = new URLSearchParams(window.location.search);
    const searchQuery = searchParams.get("search");
    useEffect(() => {
        if (searchQuery) {
            const search = searchQuery.toLowerCase();
            const searchedProducts = products.filter((product) =>
                product.name.toLowerCase().includes(search)
            );
            setFilteredProducts(searchedProducts);
        } else {
            setFilteredProducts(products);
        }
    }, [searchQuery, products]);

    const filterOptions = (
        <Paper
            elevation={2}
            sx={{
                p: 3,
                borderRadius: 2,
                bgcolor: theme.palette.background.paper,
            }}
        >
            <Typography variant="h6" fontWeight={600} mb={2}>
                Filter Products
            </Typography>
            <Divider sx={{ mb: 3 }} />

            <Box mb={3}>
                <Typography variant="subtitle2" fontWeight={500} mb={1}>
                    Price Range
                </Typography>
                <Slider
                    value={priceRange}
                    onChange={(_, v) =>
                        Array.isArray(v) && setPriceRange(v as [number, number])
                    }
                    valueLabelDisplay="auto"
                    min={minPrice}
                    max={maxPrice}
                />
                <Typography variant="caption" color="text.secondary">
                    Rs.{priceRange[0]} - Rs.{priceRange[1]}
                </Typography>
            </Box>

            <FormControl fullWidth sx={{ mb: 3 }}>
                <InputLabel>Category</InputLabel>
                <Select
                    value={category}
                    label="Category"
                    onChange={(e) => setCategory(e.target.value)}
                >
                    {categories.map((cat) => (
                        <MenuItem key={cat} value={cat}>
                            {cat === "all" ? "All Categories" : cat}
                        </MenuItem>
                    ))}
                </Select>
            </FormControl>

            <FormControl fullWidth sx={{ mb: 3 }}>
                <InputLabel>Sort By</InputLabel>
                <Select
                    value={sortOption}
                    label="Sort By"
                    onChange={(e) => setSortOption(e.target.value)}
                >
                    {sortOptions.map(({ value, label }) => (
                        <MenuItem key={value} value={value}>
                            {label}
                        </MenuItem>
                    ))}
                </Select>
            </FormControl>

            <FormControlLabel
                control={
                    <Checkbox
                        checked={inStockOnly}
                        onChange={(e) => setInStockOnly(e.target.checked)}
                    />
                }
                label="In Stock Only"
                sx={{ mb: 3 }}
            />

            <Button
                variant={getFilterSummary().length ? "contained" : "outlined"}
                color="secondary"
                fullWidth
                onClick={handleResetFilters}
            >
                Reset Filters
            </Button>
        </Paper>
    );

    return (
        <Grid container spacing={4}>
            {/* Sidebar Filters */}
            <Grid item xs={12} md={3}>
                {isMobile ? (
                    <Dialog
                        // anchor="left"
                        open={openFilterDialog}
                        onClose={() => setOpenFilterDialog(false)}
                    >
                        <Box sx={{ width: 280 }}>{filterOptions}</Box>
                    </Dialog>
                ) : (
                    filterOptions
                )}
                {isMobile && (
                    <Button
                        variant="outlined"
                        startIcon={<FiFilter />}
                        onClick={() => setOpenFilterDialog(true)}
                        sx={{ mt: 2 }}
                    >
                        Filters
                    </Button>
                )}
            </Grid>

            {/* Product Display Section */}
            <Grid item xs={12} md={9}>
                {getFilterSummary().length > 0 && (
                    <>
                        <Typography variant="subtitle2" sx={{ mb: 1 }}>
                            Active Filters:
                        </Typography>
                        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mb: 2 }}>
                            {getFilterSummary().map((filter, index) => (
                                <Chip
                                    key={index}
                                    label={filter}
                                    size="small"
                                    sx={{
                                        bgcolor: "primary.dark",
                                        color: "white",
                                    }}
                                    deleteIcon={<FiX />}
                                    onDelete={() => {
                                        if (filter.startsWith("Price"))
                                            setPriceRange([minPrice, maxPrice]);
                                        else if (filter.startsWith("Category"))
                                            setCategory("all");
                                        else if (filter.startsWith("Sort"))
                                            setSortOption("none");
                                        else setInStockOnly(false);
                                    }}
                                />
                            ))}
                        </Box>
                    </>
                )}

                {isLoading ? (
                    <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
                        <CircularProgress />
                    </Box>
                ) : error ? (
                    <Typography color="error" textAlign="center" sx={{ py: 6 }}>
                        Failed to load products. Please try again later.
                    </Typography>
                ) : (
                    <Grid container spacing={3}>
                        {filteredProducts.length ? (
                            filteredProducts.map((product) => (
                                <Grid item key={product.id} xs={12} sm={6} md={4} lg={3}>
                                    <ProductCard product={product} />
                                </Grid>
                            ))
                        ) : (
                            <Box sx={{ width: "100%", textAlign: "center", py: 6 }}>
                                <Typography variant="h6" color="text.secondary" gutterBottom>
                                    No products match your filters.
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    Try changing your filters or search terms.
                                </Typography>
                                <Button
                                    variant="text"
                                    onClick={handleResetFilters}
                                    sx={{ mt: 2 }}
                                >
                                    Reset Filters
                                </Button>
                            </Box>
                        )}
                    </Grid>
                )}
            </Grid>
        </Grid>
    );
}
