# Event Ticketing Platform

A comprehensive full-stack event ticketing solution built with Next.js 14, Supabase, and Shadcn UI.

## 🚀 Features

### Core Features
- **User Portal**:
    - Browse and search events.
    - Interactive Seat Selection (Seat Mapping).
    - Real-time seat locking (10-minute hold).
    - "My Tickets" dashboard with QR codes.
    - PDF Ticket Download.
    - Waitlist system for sold-out events.
    - Event Reviews and Ratings.

- **Organizer Portal**:
    - Dashboard for managing events.
    - Visual Seat Map Creator (drag-and-drop interface).
    - Real-time Sales Analytics (Revenue, Sold, Waitlist, Ratings).
    - Order approval workflow.
    - Scanner tool for efficient ticket validation.

- **Staff Portal**:
    - Dedicated QR Code Scanner for entry management.
    - Optimized for mobile devices.

### Technical Highlights
- **Framework**: Next.js 14 (App Router, Server Actions).
- **Database**: Supabase (PostgreSQL) with Row Level Security (RLS).
- **Authentication**: Supabase Auth (Role-based: User, Organizer, Admin, Staff).
- **Styling**: TailwindCSS + Shadcn UI.
- **Email**: Resend API integration (Simulated if key missing).
- **PDF Generation**: Client-side generation with `jspdf` and `html2canvas`.

## 🛠️ Setup & Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/yourusername/event-ticketing.git
   cd event-ticketing
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Environment Variables**:
   Copy `.env.example` to `.env.local` and fill in your keys.
   ```bash
   cp .env.example .env.local
   ```
   > **Note**: You need a Supabase project. The database schema migrations are located in `supabase/migrations`.

4. **Run the development server**:
   ```bash
   npm run dev
   ```

5. **Open the app**:
   Visit [http://localhost:3000](http://localhost:3000)

## 📂 Project Structure

- `/app` - Next.js App Router pages and API routes.
- `/components` - Reusable UI components (Shadcn, Custom).
- `/lib` - Utilities, Database clients (Supabase), Service clients (Resend).
- `/supabase` - SQL Migrations and types.
- `/public` - Static assets.

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
