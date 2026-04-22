import dbConnect from '@/lib/db';
import User from '@/models/User';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
    try {
        await dbConnect();
        const { name, email, password, phone } = await req.json();

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return NextResponse.json(
                { error: 'User already exists' },
                { status: 400 }
            );
        }

        // In a real application, you should hash the password here
        const user = await User.create({
            name,
            email,
            password,
            phone,
        });

        return NextResponse.json({ success: true, data: user }, { status: 201 });
    } catch (error: unknown) {
        return NextResponse.json({ error: error instanceof Error ? error.message : 'Unknown error occurred' }, { status: 400 });
    }
}
