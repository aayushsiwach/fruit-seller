"use client";

import { useState, useEffect } from "react";
import {
    AppBar,
    Toolbar,
    Typography,
    Button,
    IconButton,
    Badge,
    Box,
    Menu,
    MenuItem,
    Drawer,
    List,
    ListItem,
    ListItemButton,
    ListItemText,
    ListItemIcon,
    Divider,
    useMediaQuery,
    TextField,
    InputAdornment,
    Avatar,
    Tooltip,
    Container,
    Fade,
    Paper,
    alpha,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { useRouter } from "next/router";
import { useCart } from "../contexts/CartContext";
import {
    FiShoppingCart,
    FiUser,
    FiMenu,
    FiHome,
    FiPackage,
    FiLogOut,
    FiShield,
    FiSearch,
    FiHeart,
    // FiInfo,
    // FiMessageSquare,
    // FiGift,
} from "react-icons/fi";
import { useSession, signIn, signOut } from "next-auth/react";

const Navbar = () => {
    const { data: session } = useSession();
    const user = session?.user;
    const router = useRouter();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down("md"));
    const isSmall = useMediaQuery(theme.breakpoints.down("sm"));

    const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [isScrolled, setIsScrolled] = useState(false);

    const { getCartItemCount } = useCart() || { getCartItemCount: () => 0 };

    // Handle scroll effect for transparent to solid navbar
    useEffect(() => {
        const handleScroll = () => {
            const scrollPosition = window.scrollY;
            setIsScrolled(scrollPosition > 50);
        };

        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const handleProfileMenuOpen = (event: React.MouseEvent<HTMLButtonElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
    };

    const handleDrawerToggle = () => {
        setDrawerOpen(!drawerOpen);
    };

    const handleLogout = () => {
        signOut();
        handleMenuClose();
        setDrawerOpen(false);
    };

    const handleSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter") {
            router.push(`/products?search=${searchQuery}`);
            setDrawerOpen(false);
        }
    };

    const handleNavigation = (path: string) => {
        router.push(path);
        setDrawerOpen(false);
    };

    const isAdmin = user?.email?.endsWith("@yourdomain.com");

    const menuId = "primary-account-menu";
    const renderMenu = (
        <Menu
            anchorEl={anchorEl}
            id={menuId}
            keepMounted
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
            TransitionComponent={Fade}
            PaperProps={{
                elevation: 3,
                sx: {
                    borderRadius: 2,
                    minWidth: 180,
                    mt: 1,
                    overflow: "visible",
                    filter: "drop-shadow(0px 2px 8px rgba(0,0,0,0.15))",
                    "&:before": {
                        content: '""',
                        display: "block",
                        position: "absolute",
                        top: 0,
                        right: 14,
                        width: 10,
                        height: 10,
                        bgcolor: "background.paper",
                        transform: "translateY(-50%) rotate(45deg)",
                        zIndex: 0,
                    },
                },
            }}
        >
            {user && (
                <Box
                    sx={{
                        px: 2,
                        py: 1.5,
                        display: "flex",
                        alignItems: "center",
                        borderBottom: `1px solid ${theme.palette.divider}`,
                    }}
                >
                    <Avatar
                        src={user.image || ""}
                        alt={user.name || "User"}
                        sx={{ width: 32, height: 32, mr: 1.5 }}
                    />
                    <Box>
                        <Typography
                            variant="subtitle2"
                            sx={{ fontWeight: "bold" }}
                        >
                            {user.name || "User"}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                            {user.email}
                        </Typography>
                    </Box>
                </Box>
            )}
            <MenuItem
                onClick={() => {
                    handleMenuClose();
                    router.push("/profile");
                }}
                sx={{ py: 1.5 }}
            >
                <ListItemIcon>
                    <FiUser size={18} />
                </ListItemIcon>
                Profile
            </MenuItem>
            <MenuItem
                onClick={() => {
                    handleMenuClose();
                    router.push("/favorites");
                }}
                sx={{ py: 1.5 }}
            >
                <ListItemIcon>
                    <FiHeart size={18} />
                </ListItemIcon>
                Favorites
            </MenuItem>
            <MenuItem
                onClick={() => {
                    handleMenuClose();
                    router.push("/orders");
                }}
                sx={{ py: 1.5 }}
            >
                <ListItemIcon>
                    <FiPackage size={18} />
                </ListItemIcon>
                My Orders
            </MenuItem>
            {isAdmin && (
                <MenuItem
                    onClick={() => {
                        handleMenuClose();
                        router.push("/admin");
                    }}
                    sx={{ py: 1.5 }}
                >
                    <ListItemIcon>
                        <FiShield size={18} />
                    </ListItemIcon>
                    Admin Dashboard
                </MenuItem>
            )}
            <Divider />
            <MenuItem onClick={handleLogout} sx={{ py: 1.5 }}>
                <ListItemIcon>
                    <FiLogOut size={18} />
                </ListItemIcon>
                Logout
            </MenuItem>
        </Menu>
    );

    const drawer = (
        <Box sx={{ width: 280 }} role="presentation">
            <Box
                sx={{
                    p: 2,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    borderBottom: `1px solid ${theme.palette.divider}`,
                }}
            >
                <Typography
                    variant="h6"
                    color="primary"
                    sx={{ fontWeight: 700 }}
                >
                    Fruit Seller
                </Typography>
                <IconButton onClick={handleDrawerToggle} edge="end">
                    <FiMenu />
                </IconButton>
            </Box>

            {user && (
                <Box
                    sx={{
                        p: 2,
                        display: "flex",
                        alignItems: "center",
                        borderBottom: `1px solid ${theme.palette.divider}`,
                    }}
                >
                    <Avatar
                        src={user.image || ""}
                        alt={user.name || "User"}
                        sx={{ width: 40, height: 40, mr: 2 }}
                    />
                    <Box>
                        <Typography
                            variant="subtitle1"
                            sx={{ fontWeight: "bold" }}
                        >
                            {user.name || "User"}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                            {user.email}
                        </Typography>
                    </Box>
                </Box>
            )}

            <Box sx={{ p: 2 }}>
                <TextField
                    fullWidth
                    size="small"
                    placeholder="Search products..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={handleSearch}
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <FiSearch size={18} />
                            </InputAdornment>
                        ),
                        sx: { borderRadius: 2 },
                    }}
                />
            </Box>

            <List sx={{ pt: 0 }}>
                <ListItem disablePadding>
                    <ListItemButton
                        onClick={() => handleNavigation("/")}
                        sx={{ py: 1.5 }}
                    >
                        <ListItemIcon>
                            <FiHome size={20} />
                        </ListItemIcon>
                        <ListItemText primary="Home" />
                    </ListItemButton>
                </ListItem>

                <ListItem disablePadding>
                    <ListItemButton
                        onClick={() => handleNavigation("/products")}
                        sx={{ py: 1.5 }}
                    >
                        <ListItemIcon>
                            <FiPackage size={20} />
                        </ListItemIcon>
                        <ListItemText primary="Products" />
                    </ListItemButton>
                </ListItem>

                <ListItem disablePadding>
                    <ListItemButton
                        onClick={() => handleNavigation("/cart")}
                        sx={{ py: 1.5 }}
                    >
                        <ListItemIcon>
                            <Badge
                                badgeContent={getCartItemCount()}
                                color="primary"
                            >
                                <FiShoppingCart size={20} />
                            </Badge>
                        </ListItemIcon>
                        <ListItemText primary="Cart" />
                    </ListItemButton>
                </ListItem>

                {/* <ListItem disablePadding>
                    <ListItemButton onClick={() => handleNavigation("/favorites")} sx={{ py: 1.5 }}>
                        <ListItemIcon>
                            <FiHeart size={20} />
                        </ListItemIcon>
                        <ListItemText primary="Favorites" />
                    </ListItemButton>
                </ListItem>
                 */}
                {/* <ListItem disablePadding>
                    <ListItemButton onClick={() => handleNavigation("/special-offers")} sx={{ py: 1.5 }}>
                        <ListItemIcon>
                            <FiGift size={20} />
                        </ListItemIcon>
                        <ListItemText primary="Special Offers" />
                    </ListItemButton>
                </ListItem> */}

                {/* <Divider sx={{ my: 1 }} />

                <ListItem disablePadding>
                    <ListItemButton onClick={() => handleNavigation("/about-us")} sx={{ py: 1.5 }}>
                        <ListItemIcon>
                            <FiInfo size={20} />
                        </ListItemIcon>
                        <ListItemText primary="About Us" />
                    </ListItemButton>
                </ListItem> */}

                {/* <ListItem disablePadding>
                    <ListItemButton onClick={() => handleNavigation("/contact")} sx={{ py: 1.5 }}>
                        <ListItemIcon>
                            <FiMessageSquare size={20} />
                        </ListItemIcon>
                        <ListItemText primary="Contact Us" />
                    </ListItemButton>
                </ListItem> */}

                <Divider sx={{ my: 1 }} />

                {!user ? (
                    <>
                        <ListItem disablePadding>
                            <ListItemButton
                                onClick={() => signIn("email")}
                                sx={{
                                    py: 1.5,
                                    color: theme.palette.primary.main,
                                }}
                            >
                                <ListItemText primary="Login with Email" />
                            </ListItemButton>
                        </ListItem>
                        <ListItem disablePadding>
                            <ListItemButton
                                onClick={() => signIn("google")}
                                sx={{
                                    py: 1.5,
                                    color: theme.palette.primary.main,
                                }}
                            >
                                <ListItemText primary="Login with Google" />
                            </ListItemButton>
                        </ListItem>
                    </>
                ) : (
                    <>
                        {isAdmin && (
                            <ListItem disablePadding>
                                <ListItemButton
                                    onClick={() => handleNavigation("/admin")}
                                    sx={{ py: 1.5 }}
                                >
                                    <ListItemIcon>
                                        <FiShield size={20} />
                                    </ListItemIcon>
                                    <ListItemText primary="Admin Dashboard" />
                                </ListItemButton>
                            </ListItem>
                        )}
                        <ListItem disablePadding>
                            <ListItemButton
                                onClick={handleLogout}
                                sx={{ py: 1.5 }}
                            >
                                <ListItemIcon>
                                    <FiLogOut size={20} />
                                </ListItemIcon>
                                <ListItemText primary="Logout" />
                            </ListItemButton>
                        </ListItem>
                    </>
                )}
            </List>
        </Box>
    );

    return (
        <>
            <AppBar
                position="sticky"
                color="default"
                elevation={isScrolled ? 2 : 0}
                sx={{
                    bgcolor: isScrolled ? "background.paper" : "transparent",
                    transition: "all 0.3s ease",
                    backdropFilter: isScrolled ? "blur(10px)" : "none",
                    borderBottom: isScrolled
                        ? "none"
                        : `1px solid ${alpha(theme.palette.divider, 0.08)}`,
                }}
            >
                <Container maxWidth="xl">
                    <Toolbar disableGutters sx={{ py: isSmall ? 1 : 0.5 }}>
                        {isMobile && (
                            <IconButton
                                edge="start"
                                color="inherit"
                                aria-label="menu"
                                onClick={handleDrawerToggle}
                                sx={{ mr: 1 }}
                            >
                                <FiMenu />
                            </IconButton>
                        )}

                        <Typography
                            variant="h6"
                            component="div"
                            sx={{
                                display: "flex",
                                alignItems: "center",
                                color: "primary.main",
                                fontWeight: 700,
                                cursor: "pointer",
                                fontSize: { xs: "1.1rem", sm: "1.25rem" },
                            }}
                            onClick={() => router.push("/")}
                        >
                            Fruit Seller
                        </Typography>

                        {!isMobile && (
                            <Box sx={{ display: "flex", ml: 4 }}>
                                <Button
                                    color="inherit"
                                    onClick={() => router.push("/")}
                                    sx={{
                                        mx: 0.5,
                                        borderRadius: 2,
                                        "&:hover": {
                                            backgroundColor: alpha(
                                                theme.palette.primary.main,
                                                0.08
                                            ),
                                        },
                                        ...(router.pathname === "/" && {
                                            color: "primary.main",
                                            fontWeight: 600,
                                        }),
                                    }}
                                >
                                    Home
                                </Button>
                                <Button
                                    color="inherit"
                                    onClick={() => router.push("/products")}
                                    sx={{
                                        mx: 0.5,
                                        borderRadius: 2,
                                        "&:hover": {
                                            backgroundColor: alpha(
                                                theme.palette.primary.main,
                                                0.08
                                            ),
                                        },
                                        ...(router.pathname === "/products" && {
                                            color: "primary.main",
                                            fontWeight: 600,
                                        }),
                                    }}
                                >
                                    Products
                                </Button>
                                {/* <Button
                                    color="inherit"
                                    onClick={() =>
                                        router.push("/special-offers")
                                    }
                                    sx={{
                                        mx: 0.5,
                                        borderRadius: 2,
                                        "&:hover": {
                                            backgroundColor: alpha(
                                                theme.palette.primary.main,
                                                0.08
                                            ),
                                        },
                                        ...(router.pathname ===
                                            "/special-offers" && {
                                            color: "primary.main",
                                            fontWeight: 600,
                                        }),
                                    }}
                                >
                                    Special Offers
                                </Button>
                                <Button
                                    color="inherit"
                                    onClick={() => router.push("/about-us")}
                                    sx={{
                                        mx: 0.5,
                                        borderRadius: 2,
                                        "&:hover": {
                                            backgroundColor: alpha(
                                                theme.palette.primary.main,
                                                0.08
                                            ),
                                        },
                                        ...(router.pathname === "/about-us" && {
                                            color: "primary.main",
                                            fontWeight: 600,
                                        }),
                                    }}
                                >
                                    About
                                </Button> */}
                            </Box>
                        )}

                        <Box
                            sx={{
                                flexGrow: 1,
                                display: "flex",
                                justifyContent: "center",
                                mx: { xs: 1, md: 4 },
                            }}
                        >
                            {!isSmall && (
                                <Paper
                                    elevation={0}
                                    sx={{
                                        display: "flex",
                                        width: {
                                            xs: "100%",
                                            sm: "320px",
                                            md: "400px",
                                        },
                                        borderRadius: 2,
                                        p: "2px 4px",
                                        alignItems: "center",
                                        border: `1px solid ${theme.palette.divider}`,
                                        "&:hover": {
                                            boxShadow:
                                                "0 1px 6px rgba(32, 33, 36, 0.12)",
                                        },
                                    }}
                                >
                                    <InputAdornment
                                        position="start"
                                        sx={{ pl: 1 }}
                                    >
                                        <FiSearch
                                            size={18}
                                            color={theme.palette.text.secondary}
                                        />
                                    </InputAdornment>
                                    <TextField
                                        fullWidth
                                        size="small"
                                        placeholder="Search products..."
                                        value={searchQuery}
                                        onChange={(e) =>
                                            setSearchQuery(e.target.value)
                                        }
                                        onKeyDown={handleSearch}
                                        variant="standard"
                                        InputProps={{
                                            disableUnderline: true,
                                        }}
                                        sx={{ ml: 1 }}
                                    />
                                </Paper>
                            )}
                        </Box>

                        <Box sx={{ display: "flex", alignItems: "center" }}>
                            {/* {!isSmall && (
                                <Tooltip title="Favorites">
                                    <IconButton
                                        color="inherit"
                                        aria-label="favorites"
                                        onClick={() =>
                                            router.push("/favorites")
                                        }
                                        sx={{
                                            mx: 0.5,
                                            "&:hover": {
                                                backgroundColor: alpha(
                                                    theme.palette.primary.main,
                                                    0.08
                                                ),
                                            },
                                        }}
                                    >
                                        <FiHeart />
                                    </IconButton>
                                </Tooltip>
                            )} */}

                            <Tooltip title="Shopping Cart">
                                <IconButton
                                    color="inherit"
                                    aria-label="cart"
                                    onClick={() => router.push("/cart")}
                                    sx={{
                                        mx: 0.5,
                                        "&:hover": {
                                            backgroundColor: alpha(
                                                theme.palette.primary.main,
                                                0.08
                                            ),
                                        },
                                    }}
                                >
                                    <Badge
                                        badgeContent={getCartItemCount()}
                                        color="primary"
                                        sx={{
                                            "& .MuiBadge-badge": {
                                                fontSize: "0.65rem",
                                                height: "18px",
                                                minWidth: "18px",
                                            },
                                        }}
                                    >
                                        <FiShoppingCart />
                                    </Badge>
                                </IconButton>
                            </Tooltip>

                            {!isMobile ? (
                                user ? (
                                    <Tooltip title="Account">
                                        <IconButton
                                            edge="end"
                                            aria-label="account of current user"
                                            aria-controls={menuId}
                                            aria-haspopup="true"
                                            onClick={handleProfileMenuOpen}
                                            color="inherit"
                                            sx={{
                                                ml: 0.5,
                                                "&:hover": {
                                                    backgroundColor: alpha(
                                                        theme.palette.primary
                                                            .main,
                                                        0.08
                                                    ),
                                                },
                                            }}
                                        >
                                            {user.image ? (
                                                <Avatar
                                                    src={user.image}
                                                    alt={user.name || "User"}
                                                    sx={{
                                                        width: 32,
                                                        height: 32,
                                                    }}
                                                />
                                            ) : (
                                                <FiUser />
                                            )}
                                        </IconButton>
                                    </Tooltip>
                                ) : (
                                    <Box sx={{ display: "flex", ml: 1 }}>
                                        <Button
                                            color="inherit"
                                            onClick={() =>
                                                router.push("/login")
                                            }
                                            sx={{
                                                mr: 1,
                                                borderRadius: 2,
                                                "&:hover": {
                                                    backgroundColor: alpha(
                                                        theme.palette.primary
                                                            .main,
                                                        0.08
                                                    ),
                                                },
                                            }}
                                        >
                                            Login
                                        </Button>
                                        <Button
                                            variant="contained"
                                            color="primary"
                                            onClick={() =>
                                                router.push("/register")
                                            }
                                            sx={{
                                                borderRadius: 2,
                                                boxShadow: "none",
                                                "&:hover": {
                                                    boxShadow:
                                                        "0 2px 6px rgba(0,0,0,0.12)",
                                                },
                                            }}
                                        >
                                            Register
                                        </Button>
                                    </Box>
                                )
                            ) : (
                                !user && (
                                    <Button
                                        variant="contained"
                                        color="primary"
                                        size="small"
                                        onClick={() => router.push("/login")}
                                        sx={{
                                            ml: 1,
                                            borderRadius: 2,
                                            minWidth: "unset",
                                            boxShadow: "none",
                                            "&:hover": {
                                                boxShadow:
                                                    "0 2px 6px rgba(0,0,0,0.12)",
                                            },
                                        }}
                                    >
                                        Login
                                    </Button>
                                )
                            )}
                        </Box>
                    </Toolbar>
                </Container>
            </AppBar>

            {renderMenu}

            <Drawer
                anchor="left"
                open={drawerOpen}
                onClose={handleDrawerToggle}
                PaperProps={{
                    sx: {
                        borderRadius: "0 16px 16px 0",
                        boxShadow: "0px 8px 24px rgba(0, 0, 0, 0.15)",
                    },
                }}
            >
                {drawer}
            </Drawer>
        </>
    );
};

export default Navbar;
