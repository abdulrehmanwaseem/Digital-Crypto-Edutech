import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { referralCode, planName } = await req.json();

    // Get existing referral data
    const totalReferrals = parseInt(localStorage.getItem('totalReferrals') || '0');
    const activeReferrals = parseInt(localStorage.getItem('activeReferrals') || '0');
    const referredUsers = JSON.parse(localStorage.getItem('referredUsers') || '[]');

    // Update referral stats
    localStorage.setItem('totalReferrals', (totalReferrals + 1).toString());
    localStorage.setItem('activeReferrals', (activeReferrals + 1).toString());

    // Add new referred user
    referredUsers.push({
      name: 'New User', // You can pass actual user data here
      joinedDate: new Date().toISOString(),
      status: 'active'
    });
    localStorage.setItem('referredUsers', JSON.stringify(referredUsers));

    return NextResponse.json({
      success: true
    });
  } catch (error) {
    console.error('Error tracking referral:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 