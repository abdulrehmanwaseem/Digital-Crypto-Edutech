const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

const courses = [
  {
    id: "basic-1", // using courseId as the primary key
    title: "Basic",
    description: "Basic course description",
    imageUrl: "https://example.com/basic.jpg", // replace with an actual URL if needed
    price: 30,
    duration: "1 month",
    features: [
      "Basic to advance curriculum coverage",
      "Complete crypto feature access",
      "24/7 Customer Support",
      "Crypto Signal Access",
    ],
    stipend: null, // no stipend
    referralBonus: {
      amount: 5,
      type: "fixed",
      tiers: [
        { threshold: 3, bonus: 7 },
        { threshold: 5, bonus: 10 },
        { threshold: 10, bonus: 15 },
      ],
      milestoneRewards: [
        { referrals: 5, reward: { type: "bonus", value: 25 } },
        { referrals: 10, reward: { type: "planUpgrade", value: "Standard" } },
      ],
    },
  },
  {
    id: "standard-1",
    title: "Standard",
    description: "Standard course description",
    imageUrl: "https://example.com/standard.jpg",
    price: 50,
    duration: "2 months",
    features: [
      "Basic to advance curriculum coverage",
      "Complete crypto feature access",
      "24/7 Customer Support",
      "Crypto Signal Access",
    ],
    stipend: null,
    referralBonus: {
      amount: 10,
      type: "percentage",
      tiers: [
        { threshold: 3, bonus: 12 },
        { threshold: 5, bonus: 15 },
        { threshold: 10, bonus: 20 },
      ],
      milestoneRewards: [
        { referrals: 5, reward: { type: "bonus", value: 50 } },
        { referrals: 10, reward: { type: "planUpgrade", value: "Premium" } },
      ],
    },
  },
  {
    id: "premium-1",
    title: "Premium",
    description: "Premium course description",
    imageUrl: "https://example.com/premium.jpg",
    price: 100,
    duration: "4 months",
    features: [
      "Basic to advance curriculum coverage",
      "Complete crypto feature access",
      "24/7 Customer Support",
      "Crypto Signal Access",
    ],
    stipend: { amount: 6, months: 3 },
    referralBonus: {
      amount: 15,
      type: "percentage",
      tiers: [
        { threshold: 3, bonus: 18 },
        { threshold: 5, bonus: 20 },
        { threshold: 10, bonus: 25 },
      ],
      milestoneRewards: [
        { referrals: 5, reward: { type: "bonus", value: 100 } },
        {
          referrals: 10,
          reward: {
            type: "courseAccess",
            value: "Advanced Trading Masterclass",
          },
        },
      ],
    },
  },
  {
    id: "professional-1",
    title: "Professional",
    description: "Professional course description",
    imageUrl: "https://example.com/professional.jpg",
    price: 200,
    duration: "6 months",
    features: [
      "Basic to advance curriculum coverage",
      "Complete crypto feature access",
      "24/7 Customer Support",
      "Crypto Signal Access",
    ],
    stipend: { amount: 12, months: 5 },
    referralBonus: {
      amount: 20,
      type: "percentage",
      tiers: [
        { threshold: 3, bonus: 25 },
        { threshold: 5, bonus: 30 },
        { threshold: 10, bonus: 35 },
      ],
      milestoneRewards: [
        { referrals: 5, reward: { type: "bonus", value: 200 } },
        {
          referrals: 10,
          reward: {
            type: "courseAccess",
            value: "Professional Trading Bundle",
          },
        },
      ],
    },
  },
];

async function main() {
  console.log("Seeding courses...");

  for (const course of courses) {
    await prisma.course.create({
      data: {
        id: course.id,
        title: course.title,
        description: course.description,
        imageUrl: course.imageUrl,
        price: course.price,
        duration: course.duration,
        features: course.features,
        // Use nullish coalescing to replace null with undefined for JSON fields
        stipend: course.stipend ?? undefined,
        referralBonus: course.referralBonus,
      },
    });
    console.log(`Seeded course: ${course.title}`);
  }

  console.log("Seeding complete.");
}

main()
  .catch((error) => {
    console.error("Error seeding courses:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
