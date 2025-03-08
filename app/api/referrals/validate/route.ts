import { NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';

export async function POST(req: Request) {
  try {
    const { referralCode } = await req.json();

    if (!referralCode) {
      return NextResponse.json(
        { error: 'Referral code is required' },
        { status: 400 }
      );
    }

    // Check if referral code exists
    const result = await sql`
      SELECT * FROM users 
      WHERE referral_code = ${referralCode}
    `;

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Invalid referral code' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      valid: true,
      message: 'Valid referral code'
    });
  } catch (error) {
    console.error('Error validating referral:', error);
    return NextResponse.json(
      { error: 'Failed to validate referral code' },
      { status: 500 }
    );
  }
} 