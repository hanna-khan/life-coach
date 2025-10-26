# Life Coach Website

A modern MERN stack life coaching website with Tailwind CSS and smooth animations.

## Features

- **Home Page**: Hero section with animations, testimonials, and features
- **About Page**: Coach information and story
- **Blog System**: Dynamic blog posts with admin management
- **Booking System**: Calendar integration for call scheduling
- **Admin Panel**: Manage blogs, pricing, and content
- **Authentication**: Secure login/signup with JWT
- **Payment Gateway**: Stripe integration for services
- **Contact Form**: Email functionality
- **Responsive Design**: Mobile-first with Tailwind CSS

## Tech Stack

- **Frontend**: React, Tailwind CSS, Framer Motion
- **Backend**: Express.js, Node.js
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT
- **Payments**: Stripe
- **Email**: Nodemailer

## Getting Started

1. Install dependencies:
```bash
npm run install-all
```

2. Set up environment variables:
- Create `.env` file in backend folder
- Add MongoDB URI, JWT secret, Stripe keys, etc.

3. Run the development server:
```bash
npm run dev
```

## Project Structure

```
life-coach-website/
├── frontend/          # React frontend
├── backend/           # Express backend
├── package.json       # Root package.json
└── README.md         # This file
```
