# Calendar Assignment - Next.js Scheduler with Google Calendar Integration

A Next.js application that enables buyers and sellers to schedule appointments with Google Calendar integration. Built with TypeScript, NextAuth.js, and MongoDB.

## 🚀 Features

### For Sellers
- **Google OAuth Integration**: Sign in with Google and grant calendar permissions
- **Calendar Dashboard**: View appointments in a visual calendar interface
- **Availability Management**: Automatic availability detection based on Google Calendar
- **Appointment Management**: View and manage all scheduled appointments

### For Buyers
- **Browse Sellers**: Search and select from available sellers
- **Real-time Availability**: View seller's available time slots
- **Easy Booking**: Book appointments with automatic calendar events creation
- **Appointment Tracking**: View all booked appointments with meeting links

### Core Functionality
- **Dual Calendar Creation**: Events automatically created on both parties' Google Calendars
- **Google Meet Integration**: Automatic meeting links generation
- **Real-time Sync**: Appointments sync with Google Calendar
- **Role-based Access**: Different interfaces for buyers and sellers
- **Responsive Design**: Works on desktop and mobile devices

## 🛠️ Tech Stack

- **Framework**: Next.js 15.5.3 with TypeScript
- **Authentication**: NextAuth.js with Google OAuth2
- **Database**: MongoDB with Mongoose
- **UI Components**: Tailwind CSS with custom components
- **Calendar API**: Google Calendar API v3
- **Deployment**: Vercel-ready

## 📋 Prerequisites

- **Node.js**: Version 18.18.0 or higher (^18.18.0 || ^19.8.0 || >= 20.0.0)
- **MongoDB**: Local instance or MongoDB Atlas
- **Google Cloud Project**: For OAuth and Calendar API

## 🔧 Setup Instructions

### 1. Clone the Repository

```bash
git clone <repository-url>
cd calendar-assignment
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Google Cloud Console Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project or select existing one
3. Enable the following APIs:
   - Google Calendar API
   - Google+ API (for OAuth)

4. Create OAuth 2.0 credentials:
   - Go to "Credentials" > "Create Credentials" > "OAuth client ID"
   - Application type: Web application
   - Authorized JavaScript origins: `http://localhost:3000`
   - Authorized redirect URIs: `http://localhost:3000/api/auth/callback/google`

5. Copy the Client ID and Client Secret

### 4. Database Setup

**Option A: Local MongoDB**
```bash
# Install MongoDB locally and start the service
mongod
```

**Option B: MongoDB Atlas**
1. Create account at [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create a new cluster
3. Get connection string

### 5. Environment Configuration

Create `.env.local` file in the root directory:

```env
# Next.js Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-super-secret-key-here

# Google OAuth Configuration
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017/calendar-assignment
# For Atlas: mongodb+srv://username:password@cluster.mongodb.net/database-name
```

### 6. Generate NextAuth Secret

```bash
npx auth secret
```

Copy the generated secret to your `.env.local` file.

### 7. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🚀 Deployment to Vercel

### 1. Prepare for Deployment

1. Push your code to GitHub
2. Update Google OAuth settings:
   - Add your Vercel domain to authorized origins
   - Add `https://your-domain.vercel.app/api/auth/callback/google` to redirect URIs

### 2. Deploy to Vercel

1. Visit [Vercel](https://vercel.com)
2. Import your GitHub repository
3. Configure environment variables in Vercel dashboard:
   ```
   NEXTAUTH_URL=https://your-domain.vercel.app
   NEXTAUTH_SECRET=your-secret-key
   GOOGLE_CLIENT_ID=your-client-id
   GOOGLE_CLIENT_SECRET=your-client-secret
   MONGODB_URI=your-mongodb-connection-string
   ```

### 3. Deploy

Click "Deploy" and your application will be live!

## 📖 Usage Guide

### For First-Time Users

1. **Visit the Application**: Go to your deployed URL or localhost:3000
2. **Choose Your Role**: Select either "Buyer" or "Seller" during sign-up
3. **Sign In with Google**: Grant calendar permissions when prompted

### For Sellers

1. **Dashboard**: View your appointment statistics and upcoming meetings
2. **Calendar View**: Access the calendar view to see your schedule
3. **Availability**: Your availability is automatically calculated based on your Google Calendar
4. **Appointments**: Manage all your scheduled appointments

### For Buyers

1. **Browse Sellers**: View all available sellers
2. **Book Appointment**: Select a seller and choose from available time slots
3. **Add Details**: Provide appointment title and optional description
4. **Confirm Booking**: Appointment will be created on both calendars
5. **Join Meetings**: Use the provided Google Meet links

## 🔧 API Endpoints

### Authentication
- `GET/POST /api/auth/[...nextauth]` - NextAuth.js authentication

### Sellers
- `GET /api/sellers` - Get all sellers

### Availability
- `GET /api/availability` - Get seller's available time slots
  - Query params: `sellerEmail`, `startDate`, `endDate`

### Appointments
- `GET /api/appointments` - Get user's appointments
- `POST /api/appointments` - Create new appointment
- `DELETE /api/appointments` - Cancel appointment

## 📁 Project Structure

```
src/
├── app/
│   ├── api/                 # API routes
│   │   ├── auth/           # NextAuth configuration
│   │   ├── sellers/        # Seller management
│   │   ├── availability/   # Availability checking
│   │   └── appointments/   # Appointment CRUD
│   ├── signin/             # Authentication pages
│   └── user/               # Protected user pages
│       ├── dashboard/      # User dashboard
│       ├── appointments/   # Appointments management
│       ├── book-appointment/  # Booking interface
│       └── calendar/       # Calendar view (sellers)
├── components/             # Reusable UI components
├── lib/                   # Utility functions
│   ├── models/           # MongoDB models
│   ├── googleCalendar.ts # Google Calendar integration
│   └── mongodb.ts        # Database connection
└── types/                # TypeScript definitions
```

## 🔐 Security Features

- **OAuth 2.0**: Secure Google authentication
- **Refresh Tokens**: Securely stored for calendar access
- **Role-based Access**: Buyers and sellers have different permissions
- **Input Validation**: All API endpoints validate input data
- **Environment Variables**: Sensitive data stored securely

## 🐛 Troubleshooting

### Common Issues

1. **Node.js Version**: Ensure you're using Node.js 18.18.0 or higher
2. **Google Calendar Permissions**: Make sure to grant calendar access during OAuth
3. **MongoDB Connection**: Verify your database connection string
4. **Environment Variables**: Double-check all required variables are set

### Error Messages

- **"Unauthorized"**: Check if you're signed in and have proper permissions
- **"Seller not found"**: Verify the seller exists and has granted calendar permissions
- **"Time slot is already booked"**: The selected time conflicts with existing appointment

## 📝 License

This project is created as part of a hiring challenge.

## 🤝 Contributing

This is a challenge project, but suggestions and improvements are welcome!

## 📞 Support

For issues or questions about this implementation, please refer to the code comments and API documentation.
