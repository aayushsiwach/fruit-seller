import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";
import { supabase } from "@/lib/supabase";
import Nextauth from "../auth/[...nextauth]";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const session = await getServerSession(req, res, Nextauth.authOptions) as { user?: { id?: string } } | null;
    const userId = session?.user?.id;

    if (!userId && req.method !== "GET") {
        return res.status(401).json({ message: "Unauthorized: Please log in" });
    }

    // Handle GET request (get cart)
    if (req.method === "GET") {
        if (!userId) {
            return res.status(200).json([]); // Guest users get empty cart (handled client-side)
        }

        const { data, error } = await supabase
            .from("cart_items")
            .select("*, fruitsellerproducts(*)")
            .eq("user_id", userId);

        if (error) {
            console.error("Supabase GET error:", error);
            return res.status(500).json({ error: "Failed to fetch cart" });
        }

        const cart = data.map((item) => ({
            ...item.fruitsellerproducts,
            quantity: item.quantity,
        }));

        return res.status(200).json(cart);
    }

    // Handle POST request (add item to cart)
    if (req.method === "POST") {
        const { product_id, quantity } = req.body;

        if (!product_id || !Number.isInteger(quantity) || quantity < 1) {
            return res.status(400).json({ error: "Invalid product ID or quantity" });
        }

        // Verify product exists and has sufficient stock
        const { data: product, error: productError } = await supabase
            .from("fruitsellerproducts")
            .select("quantity")
            .eq("id", product_id)
            .single();

        if (productError || !product) {
            return res.status(404).json({ error: "Product not found" });
        }
        if (product.quantity < quantity) {
            return res.status(400).json({ error: "Insufficient stock" });
        }

        // Check if item already exists in cart
        const { data: existingItem, error: fetchError } = await supabase
            .from("cart_items")
            .select("*")
            .eq("user_id", userId)
            .eq("product_id", product_id)
            .single();

        if (fetchError && fetchError.code !== "PGRST116") {
            console.error("Supabase fetch error:", fetchError);
            return res.status(500).json({ error: "Failed to check cart" });
        }

        if (existingItem) {
            const newQuantity = existingItem.quantity + quantity;
            if (newQuantity > product.quantity) {
                return res.status(400).json({ error: "Total quantity exceeds stock" });
            }

            const { data, error } = await supabase
                .from("cart_items")
                .update({ quantity: newQuantity })
                .eq("id", existingItem.id)
                .select()
                .single();

            if (error) {
                console.error("Supabase update error:", error);
                return res.status(500).json({ error: "Failed to update cart" });
            }
            return res.status(200).json(data);
        } else {
            const { data, error } = await supabase
                .from("cart_items")
                .insert({ user_id: userId, product_id, quantity })
                .select()
                .single();

            if (error) {
                console.error("Supabase insert error:", error);
                return res.status(500).json({ error: "Failed to add to cart" });
            }
            return res.status(201).json(data);
        }
    }

    // Handle PUT request (update item quantity)
    if (req.method === "PUT") {
        const { product_id, quantity } = req.body;

        if (!product_id || !Number.isInteger(quantity) || quantity < 1) {
            return res.status(400).json({ error: "Invalid product ID or quantity" });
        }

        // Verify product exists and has sufficient stock
        const { data: product, error: productError } = await supabase
            .from("fruitsellerproducts")
            .select("quantity")
            .eq("id", product_id)
            .single();

        if (productError || !product) {
            return res.status(404).json({ error: "Product not found" });
        }
        if (product.quantity < quantity) {
            return res.status(400).json({ error: "Insufficient stock" });
        }

        const { data, error } = await supabase
            .from("cart_items")
            .update({ quantity })
            .eq("user_id", userId)
            .eq("product_id", product_id)
            .select()
            .single();

        if (error || !data) {
            console.error("Supabase update error:", error);
            return res.status(500).json({ error: "Failed to update cart" });
        }
        return res.status(200).json(data);
    }

    // Handle DELETE request (remove item from cart)
    if (req.method === "DELETE") {
        const { product_id } = req.query;

        if (!	product_id) {
            return res.status(400).json({ error: "Product ID is required" });
        }

        const { error } = await supabase
            .from("cart_items")
            .delete()
            .eq("user_id", userId)
            .eq("product_id", product_id);

        if (error) {
            console.error("Supabase delete error:", error);
            return res.status(500).json({ error: "Failed to remove item" });
        }
        return res.status(200).json({ message: "Item removed from cart" });
    }

    res.setHeader("Allow", ["GET", "POST", "PUT", "DELETE"]);
    return res.status(405).json({ error: "Method Not Allowed" });
}