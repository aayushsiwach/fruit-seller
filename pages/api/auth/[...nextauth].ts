// pages/api/auth/[...nextauth].ts
import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { supabase } from "@/lib/supabase";
import { comparePassword } from "@/lib/auth";
// import { Session, User } from "@/types/types";

import type { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: DefaultSession["user"] & {
      id?: string;
      role?: string;
      cart_id?: string;
    };
  }
}

export default NextAuth({
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
        }),
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" },
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) {
                    return null;
                }

                try {
                    const { data: user, error } = await supabase
                        .from("fruitsellerusers")
                        .select("*")
                        .eq("email", credentials.email)
                        .single();

                    if (error || !user) {
                        return null;
                    }

                    const isValid = await comparePassword(
                        credentials.password,
                        user.password
                    );

                    if (!isValid) {
                        return null;
                    }

                    // Return user without password
                    const safeUser = { ...user };
                    delete safeUser.password;
                    return safeUser;
                } catch (error) {
                    console.error("Login error:", error);
                    return null;
                }
            },
        }),
    ],
    callbacks: {
        async signIn({ user, account }) {
            try {
                // For Google authentication
                if (account?.provider === "google") {
                    // First check if user already exists in our DB
                    const { data: existingUser, error } = await supabase
                        .from("fruitsellerusers")
                        .select("*")
                        .eq("email", user.email!)
                        .single();

                    // Error could be "No rows found" which is fine for new users
                    const userExists = !error && existingUser;

                    // If user doesn't exist in our DB, create them
                    if (!userExists) {
                        // Create a new empty cart
                        const { data: cart, error: cartError } = await supabase
                            .from("carts")
                            .insert({})
                            .select()
                            .single();

                        if (cartError) {
                            console.error("Failed to create cart:", cartError);
                            return false;
                        }

                        // Create new user in Supabase
                        const { error: userError } = await supabase
                            .from("fruitsellerusers")
                            .insert({
                                email: user.email,
                                first_name: user.name?.split(" ")[0] || "",
                                last_name:
                                    user.name?.split(" ").slice(1).join(" ") ||
                                    "",
                                role: "buyer",
                                cart_id: cart.id,
                                oauth_provider: "google",
                                oauth_id: user.id,
                            });

                        if (userError) {
                            console.error("Failed to create user:", userError);
                            return false;
                        }

                        console.log(
                            "Created new user in Supabase from Google auth"
                        );
                    }
                }
                return true;
            } catch (error) {
                console.error("Sign in error:", error);
                return false;
            }
        },

        async jwt({ token, user, account }) {
            // Initial sign in
            if (user && account) {
                // After successful authentication, fetch user data from Supabase
                // to ensure we have the latest user data including the Supabase ID
                const { data: supabaseUser } = await supabase
                    .from("fruitsellerusers")
                    .select("*")
                    .eq("email", user.email!)
                    .single();

                if (supabaseUser) {
                    token.id = supabaseUser.id;
                    token.role = supabaseUser.role;
                    token.cart_id = supabaseUser.cart_id;
                    token.email = supabaseUser.email;
                    token.name =
                        `${supabaseUser.first_name} ${supabaseUser.last_name}`.trim();
                }
            }
            return token;
        },

        async session({ session, token }) {
            if (token && session.user) {
                // Add custom fields from JWT token to session
                session.user.id = token.id as string;
                session.user.role = token.role as string;
                session.user.cart_id = token.cart_id as string;
            }
            return session;
        },
    },
    pages: {
        signIn: "/login",
    },
    session: {
        strategy: "jwt",
        maxAge: 7 * 24 * 60 * 60, // 7 days
    },
    secret: process.env.NEXTAUTH_SECRET,
});
