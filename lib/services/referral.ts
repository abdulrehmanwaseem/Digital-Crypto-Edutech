import { prisma } from "@/lib/prisma"

export class ReferralService {
  static async generateReferralCode(userId: string): Promise<string> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { name: true }
    })

    // Generate a unique referral code based on user's name and random string
    const baseName = user?.name?.toLowerCase().replace(/[^a-z0-9]/g, "") || "user"
    const randomString = Math.random().toString(36).substring(2, 8)
    const referralCode = `${baseName}-${randomString}`

    // Update user with new referral code
    await prisma.user.update({
      where: { id: userId },
      data: { referralCode }
    })

    return referralCode
  }

  static async validateReferralCode(code: string) {
    const referrer = await prisma.user.findFirst({
      where: { referralCode: code },
      select: {
        id: true,
        referralStats: true
      }
    })

    if (!referrer) {
      return { valid: false }
    }

    return {
      valid: true,
      referrerId: referrer.id,
      stats: referrer.referralStats
    }
  }

  static async calculateCommissionRate(userId: string): Promise<number> {
    const stats = await prisma.referralStats.findUnique({
      where: { userId },
      select: { earnings: true }
    })

    const earnings = stats?.earnings || 0
    
    // Commission rates based on total earnings
    if (earnings >= 10000) return 20 // 20% for top performers
    if (earnings >= 5000) return 15  // 15% for high performers
    if (earnings >= 1000) return 12  // 12% for good performers
    return 10 // Base 10% commission
  }

  static async updateReferralStats(referrerId: string, amount: number) {
    const commissionRate = await this.calculateCommissionRate(referrerId)
    const commission = (amount * commissionRate) / 100

    return prisma.referralStats.upsert({
      where: { userId: referrerId },
      create: {
        userId: referrerId,
        totalReferrals: 1,
        activeReferrals: 1,
        earnings: commission
      },
      update: {
        totalReferrals: { increment: 1 },
        activeReferrals: { increment: 1 },
        earnings: { increment: commission }
      }
    })
  }

  static async getReferralStats(userId: string) {
    return prisma.referralStats.findUnique({
      where: { userId },
      include: {
        user: {
          select: {
            referralCode: true
          }
        }
      }
    })
  }
}
