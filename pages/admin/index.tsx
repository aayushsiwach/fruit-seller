"use client";

import React, { useState } from "react";
import {
    Box,
    Container,
    Typography,
    Grid,
    Card,
    CardContent,
    Button,
    Tabs,
    Tab,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    IconButton,
    TextField,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Chip,
    useMediaQuery,
    CircularProgress,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { useRouter } from "next/router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/src/contexts/AuthContext";
import {
    FiEdit2,
    FiTrash2,
    FiPlus,
    FiPackage,
    FiUsers,
    FiShoppingBag,
    FiDollarSign,
} from "react-icons/fi";
import { ItemType, Order } from "@/types/types";

// API functions using Supabase
const fetchProducts = async () => {
    const response = await fetch("/api/products");
    if (!response.ok) {
        throw new Error("Failed to fetch products");
    }
    return response.json();
};

const fetchUsers = async () => {
    const response = await fetch("/api/admin/users");
    if (!response.ok) {
        throw new Error("Failed to fetch users");
    }
    return response.json();
};

const fetchOrders = async () => {
    const response = await fetch("/api/admin/orders");
    if (!response.ok) {
        throw new Error("Failed to fetch orders");
    }
    return response.json();
};

const saveProduct = async (
    productData: Partial<ItemType>,
    isEdit: boolean,
    id?: string
) => {
    const method = isEdit ? "PUT" : "POST";
    const url = isEdit ? `/api/products/${id}` : "/api/products";

    const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(productData),
    });

    if (!response.ok) {
        throw new Error(
            isEdit ? "Failed to update product" : "Failed to create product"
        );
    }

    return response.json();
};

const deleteProduct = async (id: string) => {
    const response = await fetch(`/api/products/${id}`, {
        method: "DELETE",
    });

    if (!response.ok) {
        throw new Error("Failed to delete product");
    }

    return response.json();
};

export default function AdminDashboard() {
    const router = useRouter();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down("md"));
    const {  isAdmin } = useAuth();
    const queryClient = useQueryClient();

    const [activeTab, setActiveTab] = useState(0);
    const [openProductDialog, setOpenProductDialog] = useState(false);
    const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState<Partial<ItemType>>(
        {}
    );
    const [searchQuery, setSearchQuery] = useState("");
    const [error, setError] = useState<string | null>(null);

    // Redirect if not admin
    React.useEffect(() => {
        if (!isAdmin()) {
            router.push("/");
        }
    }, [isAdmin, router]);

    // Fetch all data on load
    const { data: products, isLoading: isLoadingProducts, error: productsError } = useQuery({
        queryKey: ["adminProducts"],
        queryFn: fetchProducts,
        enabled: isAdmin(),
    });

    const { data: users, isLoading: isLoadingUsers, error: usersError } = useQuery({
        queryKey: ["adminUsers"],
        queryFn: fetchUsers,
        enabled: isAdmin(), // Fetch on load
    });

    const { data: orders, isLoading: isLoadingOrders, error: ordersError } = useQuery({
        queryKey: ["adminOrders"],
        queryFn: fetchOrders,
        enabled: isAdmin(), // Fetch on load
    });

    const saveProductMutation = useMutation({
        mutationFn: ({
            productData,
            isEdit,
            id,
        }: {
            productData: Partial<ItemType>;
            isEdit: boolean;
            id?: string;
        }) => saveProduct(productData, isEdit, id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["adminProducts"] });
            handleCloseProductDialog();
        },
        onError: (error: Error) => {
            setError(error.message);
        },
    });

    const deleteProductMutation = useMutation({
        mutationFn: deleteProduct,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["adminProducts"] });
            handleCloseDeleteDialog();
        },
        onError: (error: Error) => {
            setError(error.message);
        },
    });

    const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
        setActiveTab(newValue);
    };

    const handleOpenProductDialog = (
        product: Partial<ItemType> | null = null
    ) => {
        setSelectedProduct(product || {});
        setOpenProductDialog(true);
        setError(null);
    };

    const handleCloseProductDialog = () => {
        setOpenProductDialog(false);
        setSelectedProduct({});
        setError(null);
    };

    const handleOpenDeleteDialog = (product: ItemType) => {
        setSelectedProduct(product);
        setOpenDeleteDialog(true);
        setError(null);
    };

    const handleCloseDeleteDialog = () => {
        setOpenDeleteDialog(false);
        setSelectedProduct({});
        setError(null);
    };

    const handleSaveProduct = async (
        event: React.FormEvent<HTMLFormElement>
    ) => {
        event.preventDefault();
        const formData = new FormData(event.currentTarget);

        const productData: Partial<ItemType> = {
            name: formData.get("name") as string,
            price: Number(formData.get("price")),
            description: formData.get("description") as string,
            discount: Number(formData.get("discount")) || 0,
            is_seasonal: formData.get("is_seasonal") === "true",
            category: formData.get("category") as string,
            quantity: Number(formData.get("quantity")),
            image: formData.get("image") as string,
        };

        saveProductMutation.mutate({
            productData,
            isEdit: !!selectedProduct.id,
            id: selectedProduct.id,
        });
    };

    const handleDeleteProduct = () => {
        if (selectedProduct.id) {
            deleteProductMutation.mutate(selectedProduct.id);
        }
    };

    const filteredProducts = products?.filter(
        (product: ItemType) =>
            product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            product.description
                .toLowerCase()
                .includes(searchQuery.toLowerCase()) ||
            product.category.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (!isAdmin()) return null;

    return (
        <Container maxWidth="lg">
            <Box sx={{ mb: 4 }}>
                <Typography
                    variant="h4"
                    component="h1"
                    gutterBottom
                    sx={{ fontWeight: 600 }}
                >
                    Admin Dashboard
                </Typography>
                <Typography variant="body1" color="text.secondary">
                    Manage your products, users, and orders
                </Typography>
                {error && (
                    <Typography color="error" sx={{ mt: 2 }}>
                        {error}
                    </Typography>
                )}
            </Box>

            {/* Dashboard Stats */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
                {[
                    {
                        title: "Total Products",
                        value: isLoadingProducts ? "..." : (products?.length || 0),
                        icon: FiPackage,
                        color: "primary.main",
                    },
                    {
                        title: "Total Users",
                        value: isLoadingUsers ? "..." : (users?.length || 0),
                        icon: FiUsers,
                        color: "secondary.main",
                    },
                    {
                        title: "Total Orders",
                        value: isLoadingOrders ? "..." : (orders?.length || 0),
                        icon: FiShoppingBag,
                        color: "success.main",
                    },
                    {
                        title: "Revenue",
                        value: isLoadingOrders
                            ? "..."
                            : `$${orders?.reduce((sum: number, order: Order) => sum + order.total, 0).toFixed(2) || "0.00"}`,
                        icon: FiDollarSign,
                        color: "warning.main",
                    },
                ].map((stat, index) => (
                    <Grid item xs={6} md={3} key={index}>
                        <Card>
                            <CardContent sx={{ textAlign: "center" }}>
                                <Box
                                    sx={{
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        bgcolor: `${stat.color}15`,
                                        color: stat.color,
                                        width: 50,
                                        height: 50,
                                        borderRadius: "50%",
                                        mx: "auto",
                                        mb: 2,
                                    }}
                                >
                                    <stat.icon size={24} />
                                </Box>
                                <Typography
                                    variant="h5"
                                    component="div"
                                    sx={{ fontWeight: 700 }}
                                >
                                    {stat.value}
                                </Typography>
                                <Typography
                                    variant="body2"
                                    color="text.secondary"
                                >
                                    {stat.title}
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                ))}
            </Grid>

            {/* Tabs */}
            <Box sx={{ mb: 3 }}>
                <Tabs
                    value={activeTab}
                    onChange={handleTabChange}
                    variant={isMobile ? "scrollable" : "standard"}
                    scrollButtons={isMobile ? "auto" : false}
                    sx={{ borderBottom: 1, borderColor: "divider" }}
                >
                    <Tab label="Products" />
                    <Tab label="Users" />
                    <Tab label="Orders" />
                </Tabs>
            </Box>

            {/* Products Tab */}
            {activeTab === 0 && (
                <Box>
                    <Box
                        sx={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            mb: 3,
                            flexDirection: { xs: "column", sm: "row" },
                            gap: 2,
                        }}
                    >
                        <TextField
                            placeholder="Search products..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            sx={{ flexGrow: 1, maxWidth: { sm: 300 } }}
                            size="small"
                        />
                        <Button
                            variant="contained"
                            color="primary"
                            startIcon={<FiPlus />}
                            onClick={() => handleOpenProductDialog()}
                        >
                            Add Product
                        </Button>
                    </Box>

                    <TableContainer component={Paper}>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>Image</TableCell>
                                    <TableCell>Name</TableCell>
                                    <TableCell>Category</TableCell>
                                    <TableCell align="right">Price</TableCell>
                                    <TableCell align="center">Status</TableCell>
                                    <TableCell align="right">Actions</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {isLoadingProducts ? (
                                    <TableRow>
                                        <TableCell colSpan={6} align="center">
                                            <CircularProgress />
                                            <Typography>Loading products...</Typography>
                                        </TableCell>
                                    </TableRow>
                                ) : productsError ? (
                                    <TableRow>
                                        <TableCell colSpan={6} align="center">
                                            <Typography color="error">
                                                Failed to load products: {productsError.message}
                                            </Typography>
                                        </TableCell>
                                    </TableRow>
                                ) : filteredProducts?.length > 0 ? (
                                    filteredProducts.map(
                                        (product: ItemType) => (
                                            <TableRow key={product.id}>
                                                <TableCell>
                                                    <Box
                                                        component="img"
                                                        src={product.image}
                                                        alt={product.name}
                                                        sx={{
                                                            width: 50,
                                                            height: 50,
                                                            objectFit: "cover",
                                                            borderRadius: 1,
                                                        }}
                                                    />
                                                </TableCell>
                                                <TableCell>
                                                    <Typography variant="subtitle2">
                                                        {product.name}
                                                    </Typography>
                                                    <Typography
                                                        variant="body2"
                                                        color="text.secondary"
                                                        noWrap
                                                        sx={{ maxWidth: 200 }}
                                                    >
                                                        {product.description}
                                                    </Typography>
                                                </TableCell>
                                                <TableCell>
                                                    {product.category}
                                                </TableCell>
                                                <TableCell align="right">
                                                    ${product.price.toFixed(2)}
                                                </TableCell>
                                                <TableCell align="center">
                                                    <Chip
                                                        label={
                                                            product.quantity > 0
                                                                ? "In Stock"
                                                                : "Out of Stock"
                                                        }
                                                        color={
                                                            product.quantity > 0
                                                                ? "success"
                                                                : "error"
                                                        }
                                                        size="small"
                                                    />
                                                </TableCell>
                                                <TableCell align="right">
                                                    <IconButton
                                                        color="primary"
                                                        onClick={() =>
                                                            handleOpenProductDialog(
                                                                product
                                                            )
                                                        }
                                                        size="small"
                                                    >
                                                        <FiEdit2 />
                                                    </IconButton>
                                                    <IconButton
                                                        color="error"
                                                        onClick={() =>
                                                            handleOpenDeleteDialog(
                                                                product
                                                            )
                                                        }
                                                        size="small"
                                                    >
                                                        <FiTrash2 />
                                                    </IconButton>
                                                </TableCell>
                                            </TableRow>
                                        )
                                    )
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={6} align="center">
                                            No products found
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Box>
            )}

            {/* Users Tab */}
            {activeTab === 1 && (
                <TableContainer component={Paper}>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>ID</TableCell>
                                <TableCell>Name</TableCell>
                                <TableCell>Email</TableCell>
                                <TableCell>Role</TableCell>
                                <TableCell>Joined</TableCell>
                                <TableCell align="right">Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {isLoadingUsers ? (
                                <TableRow>
                                    <TableCell colSpan={6} align="center">
                                        <CircularProgress />
                                        <Typography>Loading users...</Typography>
                                    </TableCell>
                                </TableRow>
                            ) : usersError ? (
                                <TableRow>
                                    <TableCell colSpan={6} align="center">
                                        <Typography color="error">
                                            Failed to load users: {usersError.message}
                                        </Typography>
                                    </TableCell>
                                </TableRow>
                            ) : users?.length > 0 ? (
                                users.map((user: {id:string,firstName:string,lastName:string,email:string,role:string,createdAt:string}) => (
                                    <TableRow key={user.id}>
                                        <TableCell>{user.id}</TableCell>
                                        <TableCell>{`${user.firstName} ${user.lastName}`}</TableCell>
                                        <TableCell>{user.email}</TableCell>
                                        <TableCell>
                                            <Chip
                                                label={user.role}
                                                color={
                                                    user.role === "admin"
                                                        ? "primary"
                                                        : "default"
                                                }
                                                size="small"
                                            />
                                        </TableCell>
                                        <TableCell>
                                            {new Date(
                                                user.createdAt
                                            ).toLocaleDateString()}
                                        </TableCell>
                                        <TableCell align="right">
                                            <IconButton
                                                color="primary"
                                                size="small"
                                            >
                                                <FiEdit2 />
                                            </IconButton>
                                            <IconButton color="error" size="small">
                                                <FiTrash2 />
                                            </IconButton>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={6} align="center">
                                        No users found
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            )}

            {/* Orders Tab */}
            {activeTab === 2 && (
                <TableContainer component={Paper}>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>Order ID</TableCell>
                                <TableCell>Customer</TableCell>
                                <TableCell align="center">Items</TableCell>
                                <TableCell align="right">Total</TableCell>
                                <TableCell align="center">Status</TableCell>
                                <TableCell>Date</TableCell>
                                <TableCell align="right">Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {isLoadingOrders ? (
                                <TableRow>
                                    <TableCell colSpan={7} align="center">
                                        <CircularProgress />
                                        <Typography>Loading orders...</Typography>
                                    </TableCell>
                                </TableRow>
                            ) : ordersError ? (
                                <TableRow>
                                    <TableCell colSpan={7} align="center">
                                        <Typography color="error">
                                            Failed to load orders: {ordersError.message}
                                        </Typography>
                                    </TableCell>
                                </TableRow>
                            ) : orders?.length > 0 ? (
                                orders.map((order: Order) => (
                                    <TableRow key={order.id}>
                                        <TableCell>{order.id}</TableCell>
                                        <TableCell>{order.userName}</TableCell>
                                        <TableCell align="center">
                                            {order.items.length}
                                        </TableCell>
                                        <TableCell align="right">
                                            ${order.total.toFixed(2)}
                                        </TableCell>
                                        <TableCell align="center">
                                            <Chip
                                                label={order.status}
                                                color={
                                                    order.status === "Delivered"
                                                        ? "success"
                                                        : order.status === "Shipped"
                                                        ? "info"
                                                        : order.status ===
                                                          "Processing"
                                                        ? "warning"
                                                        : order.status ===
                                                          "Cancelled"
                                                        ? "error"
                                                        : "default"
                                                }
                                                size="small"
                                            />
                                        </TableCell>
                                        <TableCell>
                                            {new Date(
                                                order.createdAt
                                            ).toLocaleDateString()}
                                        </TableCell>
                                        <TableCell align="right">
                                            <IconButton
                                                color="primary"
                                                size="small"
                                            >
                                                <FiEdit2 />
                                            </IconButton>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={7} align="center">
                                        No orders found
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            )}

            {/* Product Dialog */}
            <Dialog
                open={openProductDialog}
                onClose={handleCloseProductDialog}
                maxWidth="sm"
                fullWidth
            >
                <DialogTitle>
                    {selectedProduct.id ? "Edit Product" : "Add New Product"}
                </DialogTitle>
                <form onSubmit={handleSaveProduct}>
                    <DialogContent>
                        <Grid container spacing={2}>
                            <Grid item xs={12}>
                                <TextField
                                    name="name"
                                    label="Name"
                                    defaultValue={selectedProduct.name}
                                    fullWidth
                                    margin="normal"
                                    required
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <TextField
                                    name="description"
                                    label="Description"
                                    multiline
                                    rows={3}
                                    defaultValue={
                                        selectedProduct.description || ""
                                    }
                                    fullWidth
                                    margin="normal"
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    name="price"
                                    label="Price"
                                    type="number"
                                    defaultValue={selectedProduct.price}
                                    fullWidth
                                    margin="normal"
                                    required
                                    inputProps={{ min: 0, step: "0.01" }}
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <FormControl fullWidth margin="normal">
                                    <InputLabel>Category</InputLabel>
                                    <Select
                                        name="category"
                                        defaultValue={
                                            selectedProduct.category || ""
                                        }
                                        label="Category"
                                        required
                                    >
                                        <MenuItem value="Berries">
                                            Berries
                                        </MenuItem>
                                        <MenuItem value="Citrus">
                                            Citrus
                                        </MenuItem>
                                        <MenuItem value="Tropical">
                                            Tropical
                                        </MenuItem>
                                        <MenuItem value="Stone Fruits">
                                            Stone Fruits
                                        </MenuItem>
                                    </Select>
                                </FormControl>
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    name="quantity"
                                    label="Quantity"
                                    type="number"
                                    defaultValue={selectedProduct.quantity || 0}
                                    fullWidth
                                    margin="normal"
                                    required
                                    inputProps={{ min: 0 }}
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    name="discount"
                                    label="Discount (%)"
                                    type="number"
                                    defaultValue={selectedProduct.discount || 0}
                                    fullWidth
                                    margin="normal"
                                    inputProps={{ min: 0, max: 100 }}
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <TextField
                                    name="image"
                                    label="Image URL"
                                    defaultValue={selectedProduct.image}
                                    fullWidth
                                    margin="normal"
                                    required
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <FormControl fullWidth margin="normal">
                                    <InputLabel>Seasonal</InputLabel>
                                    <Select
                                        name="is_seasonal"
                                        defaultValue={
                                            selectedProduct.is_seasonal
                                                ? "true"
                                                : "false"
                                        }
                                        label="Seasonal"
                                        required
                                    >
                                        <MenuItem value="true">Yes</MenuItem>
                                        <MenuItem value="false">No</MenuItem>
                                    </Select>
                                </FormControl>
                            </Grid>
                        </Grid>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={handleCloseProductDialog}>
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            variant="contained"
                            color="primary"
                            disabled={saveProductMutation.isPending}
                        >
                            {saveProductMutation.isPending
                                ? "Saving..."
                                : selectedProduct.id
                                ? "Update"
                                : "Create"}
                        </Button>
                    </DialogActions>
                </form>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <Dialog open={openDeleteDialog} onClose={handleCloseDeleteDialog}>
                <DialogTitle>Confirm Delete</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Are you sure you want to delete the product &quot;{selectedProduct.name}&quot;? This action cannot be undone.
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDeleteDialog}>Cancel</Button>
                    <Button
                        onClick={handleDeleteProduct}
                        color="error"
                        variant="contained"
                        disabled={deleteProductMutation.isPending}
                    >
                        {deleteProductMutation.isPending
                            ? "Deleting..."
                            : "Delete"}
                    </Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
}