import { NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';

export async function POST(req: Request) {
  try {
    const { referralCode, userName, email } = await req.json();

    // Record the referral usage
    await sql`
      INSERT INTO referrals (referral_code, referred_user_name, referred_user_email, status, joined_date)
      VALUES (${referralCode}, ${userName}, ${email}, 'pending', NOW())
    `;

    return NextResponse.json({
      success: true,
      message: 'Referral recorded successfully'
    });
  } catch (error) {
    console.error('Error recording referral:', error);
    return NextResponse.json(
      { error: 'Failed to record referral' },
      { status: 500 }
    );
  }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const code = searchParams.get('code');

    if (!code) {
      return NextResponse.json(
        { error: 'Referral code is required' },
        { status: 400 }
      );
    }

    const referrals = await sql`
      SELECT * FROM referrals 
      WHERE referral_code = ${code}
      ORDER BY joined_date DESC
    `;

    return NextResponse.json({
      referrals: referrals.rows
    });
  } catch (error) {
    console.error('Error fetching referrals:', error);
    return NextResponse.json(
      { error: 'Failed to fetch referrals' },
      { status: 500 }
    );
  }
} 