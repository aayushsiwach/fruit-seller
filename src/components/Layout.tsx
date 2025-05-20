"use client";
import { Container } from "@mui/material";
import Box from "@mui/material/Box";
import Navbar from "./Navbar";
import Footer from "./Footer";
import { useAuth } from "@/src/contexts/AuthContext";
import { LayoutProps } from "@/types/types";

const Layout = ({ children }: LayoutProps) => {
    const auth = useAuth();
    const loading = auth?.loading;

    if (loading) {
        return (
            <Box
                sx={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    height: "100vh",
                }}
            >
                Loading...
            </Box>
        );
    }

    return (
        <Box
            sx={{
                display: "flex",
                flexDirection: "column",
                minHeight: "100vh",
            }}
        >
            <Navbar />
            <Container component="main" sx={{ flexGrow: 1, py: 2 }} maxWidth="xl">
                {children}
            </Container>
            <Footer />
        </Box>
    );
};

export default Layout;
