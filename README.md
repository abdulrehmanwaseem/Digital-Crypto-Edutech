# CryptoEdu - Crypto Learning Management System

A modern learning management system focused on cryptocurrency education, built with Next.js 14, Prisma, and PostgreSQL.

## Features

- 🔐 Secure Authentication

  - Email/Password and Google OAuth
  - Role-based access control (Admin/User)
  - Password strength validation
  - Forgot password functionality

- 👨‍🎓 User Management

  - Custom user profiles with avatar upload
  - ID card generation
  - Income and occupation tracking
  - Phone number verification
  - USDT withdrawal address management

- 📚 Course Management

  - Multiple course offerings
  - Course features and pricing
  - Payment tracking system
  - Course enrollment system

- 💰 Referral System

  - Unique referral codes
  - Referral tracking
  - Referral bonuses
  - Withdrawal management

- 🎨 Modern UI/UX
  - Responsive design
  - Dark theme
  - Mobile-friendly admin interface
  - Beautiful course cards

## Tech Stack

- **Framework**: Next.js 14 with App Router
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Authentication**: NextAuth.js
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **Image Upload**: Cloudinary
- **Form Validation**: Zod
- **Icons**: Lucide Icons

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL
- npm or yarn

### Installation

1. Clone the repository:

```bash
git clone <repository-url>
cd crypto-lms
```

2. Install dependencies:

```bash
npm install
```

3. Set up environment variables:

```bash
cp .env.example .env
```

Fill in your environment variables:

```env
DATABASE_URL="postgresql://..."
NEXTAUTH_SECRET="your-secret"
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
CLOUDINARY_CLOUD_NAME="your-cloud-name"
CLOUDINARY_API_KEY="your-api-key"
CLOUDINARY_API_SECRET="your-api-secret"
```

4. Set up the database:

```bash
npx prisma migrate dev
```

5. Start the development server:

```bash
npm run dev
```

Visit `http://localhost:3000` to see the application.

## Project Structure

```
├── app/                  # Next.js app directory
│   ├── admin/           # Admin dashboard pages
│   ├── api/             # API routes
│   ├── auth/            # Authentication pages
│   ├── courses/         # Course pages
│   └── profile/         # User profile pages
├── components/          # React components
├── lib/                 # Utility functions
├── prisma/             # Database schema and migrations
├── public/             # Static assets
└── schemas/            # Zod validation schemas
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

For support, email contact@cryptoedu.com or join our Telegram community.
