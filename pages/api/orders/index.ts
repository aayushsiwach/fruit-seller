// pages/api/orders.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";
import { supabase } from "@/lib/supabase";
import { CartItem } from "@/types/types";
import Nextauth from "../auth/[...nextauth]";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== "POST") {
        return res.status(405).json({ error: "Method not allowed" });
    }

    const session = await getServerSession(req, res, Nextauth.authOptions) as { user?: { email?: string } } | null;
    console.log(session)
    if (!session || !session.user || !session.user.email) {
        return res.status(401).json({ error: "Unauthorized" });
    }

    const { cart, total }: { cart: CartItem[]; total: number } = req.body;

    if (!cart || !Array.isArray(cart) || cart.length === 0 || !total) {
        return res.status(400).json({ error: "Invalid cart or total" });
    }

    try {
        // Fetch all products in one query
        const productIds = cart.map((item) => item.product_id);
        const { data: products, error: fetchError } = await supabase
            .from("fruitsellerproducts")
            .select("*")
            .in("id", productIds);

        if (fetchError || !products) {
            return res.status(500).json({ error: "Failed to fetch products" });
        }

        // Validate stock
        for (const item of cart) {
            const product = products.find((p) => p.id === item.product_id);
            if (!product) {
                return res.status(400).json({ error: `Product ${item.product_id} not found` });
            }
            if (product.quantity < item.quantity) {
                return res.status(400).json({ error: `Insufficient stock for ${product.name}` });
            }
        }

        // Update stock atomically
        for (const item of cart) {
            const product = products.find((p) => p.id === item.product_id)!;
            const newQuantity = product.quantity - item.quantity;
            const { error: updateError } = await supabase
                .from("fruitsellerproducts")
                .update({ quantity: newQuantity })
                .eq("id", item.product_id);

            if (updateError) {
                return res.status(500).json({ error: `Failed to update stock for ${product.name}` });
            }
        }

        // Create order
        const { data: order, error: orderError } = await supabase
            .from("orders")
            .insert({
                user_email: session.user.email,
                items: cart,
                total,
                created_at: new Date().toISOString(),
            })
            .select()
            .single();

        if (orderError || !order) {
            return res.status(500).json({ error: "Failed to create order" });
        }

        return res.status(200).json({ order });
    } catch (error) {
        console.error("Order creation error:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
}