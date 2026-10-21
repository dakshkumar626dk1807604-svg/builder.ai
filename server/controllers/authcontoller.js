import User from '../models/user.js';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || "fallback_secret"; // Fallback secret for development
// helper to set cookie
const setSessionCookie = (req, payload) => {
    const token = jwt.sign(payload, JWT_SECRET , { expiresIn: '30d' });
    res.cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production', 
        sameSite: 'lax',
        maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
        path: '/',
    });
};
export async function register(req, res) {
    const { username, email, password } = req.body;
    if (!username || !email || !password) {
        return res.status(400).json({ error: 'Username, email, and password are required' })
        return;
    }
    const trimmedEmail = email.toLowerCase().trim();

    const existingUser = await User.findOne({ email: trimmedEmail });
    if (existingUser) {
        return res.status(400).json({ error: 'User with this email already exists' })
        return;
    }
    const user = await User.create({
        name: username,
        email: trimmedEmail,
        password
    });
    setSessionCookie(req, { userId: user._id.toString(), email: user.email });
    res.status(201).json({ 
        user:{
        _id: user._id,
        name: user.name,
        email: user.email   
 }
 });

}

export async function login(req, res) {
    const {email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required' })
        return;
    }

    const User = await User.findOne({ email: email.toLowerCase().trim() });
    if (!User) {
        return res.status(401).json({ error: 'Invalid email or password' })
        return;
    }

    const isValid = await User.comparePassword(password);
    if (!isValid) {
        return res.status(401).json({ error: 'Invalid email or password' })
        return;
    }
    setSessionCookie(res, { userId: User._id.toString(), email: User.email });
    res.status(201).json({ 
        user:{
        _id: User._id,
        name: User.name,
        email: User.email   
 }
 });
 
}


export async function logout(_req, res) {
    res.cookie('token', '', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production', 
        sameSite: 'lax',
        maxAge: 0, 
        path: '/',
    });
    res.json({Success:true});
}

export async function me(req, res) {
if (!req.user) {
    return res.status(401).json({ error: 'Not authorized' })
    return;
}
const user = await User.findById(req.user.userId).select('-password');
if (!user) {
    return res.status(404).json({ error: 'User not found' })
    return;
}
res.json({ user});
}
