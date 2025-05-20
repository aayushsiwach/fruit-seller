import { NextApiRequest, NextApiResponse } from "next";
import { supabase } from "@/lib/supabase";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const id = req.query.id as string;

    if (!id) {
        return res.status(400).json({ error: "Product ID is required" });
    }

    if (req.method === "GET") {
        const { data, error } = await supabase
            .from("fruitsellerproducts")
            .select("*")
            .eq("id", id)
            .single();

        if (error || !data) {
            console.error("Supabase GET error:", error);
            return res.status(404).json({ error: "Product not found" });
        }
        return res.status(200).json(data);
    }

    if (req.method === "PUT") {
        const { name, price, description, image_id, category, quantity, discount, is_seasonal } = req.body;

        if (!name || !price || !category || quantity == null) {
            return res.status(400).json({ error: "Missing required fields" });
        }

        const { data, error } = await supabase
            .from("fruitsellerproducts")
            .update({
                name,
                price,
                description,
                image_id,
                category,
                quantity,
                discount: discount || 0,
                is_seasonal: is_seasonal || false,
            })
            .eq("id", id)
            .select()
            .single();

        if (error || !data) {
            console.error("Supabase PUT error:", error);
            return res.status(500).json({ error: "Failed to update product" });
        }
        return res.status(200).json(data);
    }

    if (req.method === "DELETE") {
        const { error } = await supabase
            .from("fruitsellerproducts")
            .delete()
            .eq("id", id);

        if (error) {
            console.error("Supabase DELETE error:", error);
            return res.status(500).json({ error: "Failed to delete product" });
        }
        return res.status(200).json({ message: "Product deleted" });
    }

    res.setHeader("Allow", ["GET", "PUT", "DELETE"]);
    return res.status(405).json({ error: "Method Not Allowed" });
}