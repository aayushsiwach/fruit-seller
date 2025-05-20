import { supabase } from '@/lib/supabase';
import { hashPassword } from '@/lib/auth';
import { generateJWT } from '@/lib/auth';
import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(
  req: NextApiRequest, 
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const { email, password, first_name, last_name, role } = req.body;

  if (!email || !password || !first_name || !last_name) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  try {
    // Check if user already exists
    const { data: existing, error: existingError } = await supabase
      .from('fruitsellerusers')
      .select('email')
      .eq('email', email)
      .single();

    if (existing) {
      return res.status(409).json({ message: 'User already exists' });
    }

    if (existingError && existingError.code !== 'PGRST116') {
      return res.status(500).json({ message: 'Error checking user', details: existingError });
    }

    // Hash password
    const hashed = await hashPassword(password);

    // Create a new empty cart
    // const { data: cart, error: cartError } = await supabase
    //   .from('carts')
    //   .insert({})
    //   .select()
    //   .single();

    // if (cartError) {
    //   return res.status(500).json({ message: 'Failed to create cart', cartError });
    // }

    // Create user
    const { error: insertError } = await supabase
      .from('fruitsellerusers')
      .insert({
        email,
        password: hashed,
        first_name,
        last_name,
        role: role || 'buyer', // Default to 'buyer' if no role is provided
      });

    if (insertError) {
      return res.status(500).json({ message: 'Failed to create user', insertError });
    }

    const token = await generateJWT(email, role);
    
    return res.status(201).json({ success: true, token: token, user: { email, first_name, last_name, role: role || "buyer" } });

    
  } catch (error) {
    console.error('Registration error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}

