// pages/api/admin/orders.ts
import type { NextApiRequest, NextApiResponse } from "next";
// import { getServerSession } from "next-auth/next";
import { supabase } from "@/lib/supabase";
import { ItemType } from "@/types/types";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== "GET") {
        return res.status(405).json({ error: "Method not allowed" });
    }

    // const session = await getServerSession(req, res);

    interface Order {
        id: number;
        user_email: string;
        items: ItemType[]; // Replace 'any' with a more specific type if possible
        status?: string;
    }

    const { data, error } = await supabase
        .from("orders")
        .select(`
            *
        `);
    console.log("Orders data:", data);
    if (error) return res.status(500).json({ error });

    const orders = (data as Order[]).map((order: Order) => ({
        ...order,
        userName: `${order.user_email}`,
        items: order.items, // Assuming items is an array
        status: order.status || "Processing", // Add status if your table has it
    }));

    return res.status(200).json(orders);
}