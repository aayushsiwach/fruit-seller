import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";
import { supabase } from "@/lib/supabase";
import Nextauth from "../auth/[...nextauth]";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const session = await getServerSession(req, res, Nextauth.authOptions) as { user?: { id?: string } } | null;
    const userId = session?.user?.id;

    if (!userId) {
        return res.status(401).json({ message: "Unauthorized: Please log in" });
    }

    if (req.method === "DELETE") {
        const { error } = await supabase
            .from("cart_items")
            .delete()
            .eq("user_id", userId);

        if (error) {
            console.error("Supabase delete error:", error);
            return res.status(500).json({ error: "Failed to clear cart" });
        }
        return res.status(200).json({ message: "Cart cleared" });
    }

    res.setHeader("Allow", ["DELETE"]);
    return res.status(405).json({ error: "Method Not Allowed" });
}