import {
    Box,
    Container,
    Grid,
    Typography,
    Link,
    IconButton,
    Divider,
} from "@mui/material";
import { FiInstagram, FiFacebook, FiTwitter } from "react-icons/fi";

const Footer = () => {
    return (
        <Box
            component="footer"
            sx={{ bgcolor: "background.paper", py: 6, mt: "auto" }}
        >
            <Container maxWidth="xl">
                <Grid
                    container
                    spacing={4}
                    display={"flex"}
                    justifyContent={"space-between"}
                >
                    <Grid item xs={12} sm={4}>
                        <Typography variant="h6" color="primary" gutterBottom>
                            Fruit Seller
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            Fresh fruits delivered to your doorstep. We source
                            directly from farmers to ensure the highest quality.
                        </Typography>
                        <Box sx={{ mt: 2 }}>
                            <IconButton color="primary" aria-label="Instagram">
                                <FiInstagram />
                            </IconButton>
                            <IconButton color="primary" aria-label="Facebook">
                                <FiFacebook />
                            </IconButton>
                            <IconButton color="primary" aria-label="Twitter">
                                <FiTwitter />
                            </IconButton>
                        </Box>
                    </Grid>

                    <Grid item xs={12} sm={4}>
                        <Typography
                            variant="h6"
                            color="text.primary"
                            gutterBottom
                        >
                            Quick Links
                        </Typography>
                        <Link
                            href="/"
                            color="inherit"
                            display="block"
                            sx={{ mb: 1 }}
                        >
                            Home
                        </Link>
                        <Link
                            href="/products"
                            color="inherit"
                            display="block"
                            sx={{ mb: 1 }}
                        >
                            Products
                        </Link>
                        <Link
                            href="/cart"
                            color="inherit"
                            display="block"
                            sx={{ mb: 1 }}
                        >
                            Cart
                        </Link>
                        <Link
                            href="/about"
                            color="inherit"
                            display="block"
                            sx={{ mb: 1 }}
                        >
                            About Us
                        </Link>
                        <Link
                            href="/contact"
                            color="inherit"
                            display="block"
                            sx={{ mb: 1 }}
                        >
                            Contact
                        </Link>
                    </Grid>

                    <Grid item xs={12} sm={4}>
                        <Typography
                            variant="h6"
                            color="text.primary"
                            gutterBottom
                        >
                            Contact Us
                        </Typography>
                        <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{ mb: 1 }}
                        >
                            123 Fruit Street, Orchard City
                        </Typography>
                        <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{ mb: 1 }}
                        >
                            Email: info@fruitseller.com
                        </Typography>
                        <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{ mb: 1 }}
                        >
                            Phone: (123) 456-7890
                        </Typography>
                    </Grid>
                </Grid>

                <Divider sx={{ mt: 4, mb: 4 }} />

                <Typography
                    variant="body2"
                    color="text.secondary"
                    align="center"
                >
                    © {new Date().getFullYear()} Fruit Seller. All rights
                    reserved.
                </Typography>
            </Container>
        </Box>
    );
};

export default Footer;
