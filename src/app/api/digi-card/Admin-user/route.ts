import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import {  compare } from 'bcryptjs'; // Use named imports

const prisma = new PrismaClient();

interface LoginData {
  email: string;
  password: string;
}

export async function POST(req: Request): Promise<NextResponse> {
  try {
    const { email, password } = (await req.json()) as LoginData;

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
    }

    const user = await prisma.adminUser.findUnique({
      where: { email },
    });

    if (!user) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
    }

    const isPasswordValid = await compare(password, user.password);

    if (!isPasswordValid) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
    }

    return NextResponse.json({
      message: 'Login successful',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    }, { status: 200 });
  } catch (error) {
    console.error('Error during login:', error);
    return NextResponse.json({ error: 'An error occurred during login' }, { status: 500 });
  }
}
