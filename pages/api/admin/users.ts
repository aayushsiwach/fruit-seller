import { getServerSession } from "next-auth/next";
import { supabase } from "@/lib/supabase";
import Nextauth from "../auth/[...nextauth]";
import type { NextApiRequest, NextApiResponse } from "next";

type SessionUser = {
    user: {
        role?: string;
    };
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const session = await getServerSession(req, res,Nextauth.authOptions) as SessionUser;


    // GET all or featured products
    if (req.method === "GET") {
        const { data, error } = req.query.featured
            ? await supabase
                  .from("fruitsellerusers")
                  .select("*")
            : await supabase.from("fruitsellerusers").select("*");

        if (error) return res.status(500).json({ error });
        // console.log(data);
        return res.status(200).json(data);
    }

    // POST new product (admin or seller only)
    if (req.method === "POST") {
        // console.log(session?.user.role);
        
        if (
            !session ||
            !["admin", "seller"].includes(
                typeof session.user.role === "string" ? session.user.role : ""
            )
        ) {
            return res.status(403).json({ error: "Unauthorized" });
        }

        const { name, price, description, image_id } = req.body;

        const { error } = await supabase
            .from("fruitsellerproducts")
            .insert({ name, price, description, image_id });

        if (error) return res.status(500).json({ error });
        return res.status(201).json({ message: "Product added" });
    }

    return res.status(405).end();
}
