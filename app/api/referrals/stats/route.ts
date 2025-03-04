import { NextResponse } from 'next/server';

export async function GET(req: Request) {
  try {
    // Mock data structure that would normally come from database
    const mockReferralData = {
      myReferralCode: localStorage.getItem('referralCode') || '',
      totalReferrals: parseInt(localStorage.getItem('totalReferrals') || '0'),
      activeReferrals: parseInt(localStorage.getItem('activeReferrals') || '0'),
      totalEarnings: parseFloat(localStorage.getItem('totalEarnings') || '0'),
      referredUsers: JSON.parse(localStorage.getItem('referredUsers') || '[]')
    };

    return NextResponse.json(mockReferralData);
  } catch (error) {
    console.error('Error fetching referral stats:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 