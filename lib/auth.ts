// import { encode } from 'next-auth/jwt';


// export const generateJWT = (email: string, role: string) =>
//   encode({ email, role }, process.env.JWT_SECRET!, { expiresIn: '7d' })
//   // jwt.sign({ email, role }, process.env.JWT_SECRET!, { expiresIn: '7d' });

// export const verifyJWT = (token: string) => jwt.verify(token, process.env.JWT_SECRET!);

import bcrypt from "bcryptjs";
import { encode, decode } from "next-auth/jwt";

const JWT_SECRET = String(process.env.JWT_SECRET);

export const hashPassword = (password: string) => bcrypt.hash(password, 10);
export const comparePassword = (password: string, hash: string) =>
    bcrypt.compare(password, hash);

export const generateJWT = async (email: string, role: string) => {
    const token = await encode({
        token: { email, role },
        secret: JWT_SECRET,
        maxAge: 60 * 60 * 24 * 7, // 7 days
    });
    return token!;
};

export const verifyJWT = async (token: string) => {
    const decoded = await decode({
        token,
        secret: JWT_SECRET,
    });
    // decoded is like { email, role, iat, exp } inside `decoded.token`
    return decoded?.token ?? null;
};
