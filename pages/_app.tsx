import PropTypes from "prop-types";
import Head from "next/head";
import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
// import { CacheProvider } from "@emotion/react"
import theme from "../src/theme";
// import createEmotionCache from "../src/createEmotionCache"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "../src/contexts/AuthContext";
import { CartProvider } from "../src/contexts/CartContext";
import Layout from "@/src/components/Layout";
import "../styles/globals.css";
import { SessionProvider } from "next-auth/react";

const queryClient = new QueryClient();

import type { AppProps } from "next/app";

export default function App(props: AppProps) {
    const { Component, pageProps } = props;

    return (
        <>
            <Head>
                <meta
                    name="viewport"
                    content="initial-scale=1, width=device-width"
                />
                <title>Fruit Seller - Fresh Fruits Delivered</title>
            </Head>
            <SessionProvider session={pageProps.session}>
                <QueryClientProvider client={queryClient}>
                    <AuthProvider>
                        <CartProvider>
                            <ThemeProvider theme={theme}>
                                <CssBaseline />
                                <Layout>
                                    <Component {...pageProps} />
                                </Layout>
                            </ThemeProvider>
                        </CartProvider>
                    </AuthProvider>
                </QueryClientProvider>
            </SessionProvider>
        </>
    );
}

App.propTypes = {
    Component: PropTypes.elementType.isRequired,
    pageProps: PropTypes.object.isRequired,
};
