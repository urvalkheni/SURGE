import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { db } from '@/lib/db';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, email, password, confirmPassword } = body;

    // 1. Field validation
    if (!name || typeof name !== 'string' || !name.trim()) {
      return NextResponse.json({ error: 'Full name is required.' }, { status: 400 });
    }

    if (!email || typeof email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: 'A valid email address is required.' }, { status: 400 });
    }

    if (!password || typeof password !== 'string') {
      return NextResponse.json({ error: 'Password is required.' }, { status: 400 });
    }

    if (password !== confirmPassword) {
      return NextResponse.json({ error: 'Passwords do not match.' }, { status: 400 });
    }

    // 2. Password complexity validation: 8+ chars, 1 uppercase, 1 lowercase, 1 number
    const hasMinLength = password.length >= 8;
    const hasUpper = /[A-Z]/.test(password);
    const hasLower = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);

    if (!hasMinLength || !hasUpper || !hasLower || !hasNumber) {
      return NextResponse.json(
        {
          error:
            'Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, and one number.',
        },
        { status: 400 }
      );
    }

    const normalizedEmail = email.trim().toLowerCase();

    // 3. Check for existing user
    const existingUser = await db.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'An operator account with this email address already exists.' },
        { status: 409 }
      );
    }

    // 4. Hash password securely
    const passwordHash = await bcrypt.hash(password, 12);

    // 5. Create user record
    const user = await db.user.create({
      data: {
        name: name.trim(),
        email: normalizedEmail,
        passwordHash,
        role: 'Plant Operator',
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
      },
    });

    return NextResponse.json(
      {
        success: true,
        user,
        message: 'Operator account created successfully.',
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Account creation error:', error);
    return NextResponse.json(
      { error: 'Account registration is temporarily unavailable. Please try again later.' },
      { status: 500 }
    );
  }
}
