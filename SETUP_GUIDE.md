# Life Coach Website - Setup Guide

## 🚀 Project Overview

This is a complete MERN stack life coaching website with modern animations, inspired by the Oliver Cowlishaw design aesthetic. The project includes:

- **Frontend**: React with TypeScript, Tailwind CSS, Framer Motion animations
- **Backend**: Express.js with MongoDB, JWT authentication, Stripe payments
- **Features**: Blog system, booking system, admin panel, contact forms, payment processing

## 📁 Project Structure

```
life-coach-website/
├── backend/                 # Express.js API server
│   ├── models/             # MongoDB models
│   ├── routes/             # API routes
│   ├── middleware/         # Custom middleware
│   ├── server.js          # Main server file
│   └── package.json       # Backend dependencies
├── frontend/               # React frontend
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   ├── pages/          # Page components
│   │   ├── contexts/       # React contexts
│   │   ├── App.tsx        # Main app component
│   │   └── index.tsx      # Entry point
│   ├── tailwind.config.js # Tailwind configuration
│   └── package.json       # Frontend dependencies
├── package.json           # Root package.json
└── README.md             # This file
```

## 🛠️ Installation & Setup

### Prerequisites

- Node.js (v16 or higher)
- MongoDB (local or MongoDB Atlas)
- Git

### 1. Clone and Install Dependencies

```bash
# Install root dependencies
npm install

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### 2. Environment Configuration

#### Backend Environment (.env)
Create `backend/.env` file:

```env
# Database
MONGODB_URI=mongodb://localhost:27017/life-coach

# JWT
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRE=7d

# Frontend URL
FRONTEND_URL=http://localhost:3000

# Email Configuration
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password

# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret

# Server
PORT=5000
NODE_ENV=development
```

#### Frontend Environment (.env)
Create `frontend/.env` file:

```env
# API Configuration
REACT_APP_API_URL=http://localhost:5000

# Stripe Configuration
REACT_APP_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key_here

# App Configuration
REACT_APP_NAME=Life Coach
REACT_APP_VERSION=1.0.0
```

### 3. Database Setup

#### Option A: Local MongoDB
```bash
# Install MongoDB locally
# Start MongoDB service
mongod
```

#### Option B: MongoDB Atlas (Recommended)
1. Create account at [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create a new cluster
3. Get connection string and update `MONGODB_URI` in backend/.env

### 4. Stripe Setup

1. Create account at [Stripe](https://stripe.com)
2. Get API keys from dashboard
3. Update Stripe keys in both backend/.env and frontend/.env
4. Set up webhook endpoint for payment processing

### 5. Email Setup (Optional)

For contact form functionality:
1. Enable 2-factor authentication on Gmail
2. Generate app password
3. Update email credentials in backend/.env

## 🚀 Running the Application

### Development Mode

```bash
# From root directory - runs both frontend and backend
npm run dev

# Or run separately:
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm start
```

### Production Build

```bash
# Build frontend
cd frontend
npm run build

# Start production server
cd ../backend
npm start
```

## 📱 Features Overview

### 🏠 Home Page
- Animated hero section with gradient background
- Feature cards with hover animations
- Testimonials carousel
- Statistics counter animations
- Call-to-action sections

### 👤 About Page
- Personal story and journey timeline
- Core values with animated icons
- Certifications and achievements
- Professional timeline with animations

### 📝 Blog System ("Lucas Letter")
- Featured blog posts
- Category filtering
- Individual blog post pages
- Newsletter signup
- Admin blog management

### 📅 Booking System
- Calendar integration (placeholder)
- Service type selection
- Time slot availability
- Payment processing with Stripe
- Email confirmations

### 🔐 Authentication
- User registration and login
- JWT token management
- Protected routes
- Admin role management

### 👨‍💼 Admin Panel
- Dashboard with statistics
- Blog management (CRUD)
- Booking management
- Contact form submissions
- User management
- Analytics and reporting

### 💳 Payment Integration
- Stripe checkout sessions
- Webhook handling
- Payment success/failure pages
- Revenue tracking

### 📧 Contact System
- Multi-field contact form
- Email notifications
- Admin contact management
- FAQ section

## 🎨 Design Features

### Animations (Framer Motion)
- Page transitions
- Scroll-triggered animations
- Hover effects
- Loading states
- Micro-interactions

### Responsive Design
- Mobile-first approach
- Tablet and desktop optimizations
- Flexible grid layouts
- Touch-friendly interactions

### Color Scheme
- Primary: Blue gradient (#0ea5e9 to #0284c7)
- Secondary: Purple gradient (#d946ef to #c026d3)
- Neutral: Gray scale for text and backgrounds
- Accent: Yellow for highlights

## 🔧 Customization

### Adding New Pages
1. Create component in `frontend/src/pages/`
2. Add route in `frontend/src/App.tsx`
3. Update navigation in `frontend/src/components/Layout/Navbar.tsx`

### Modifying Styles
- Update `frontend/tailwind.config.js` for theme changes
- Modify `frontend/src/index.css` for global styles
- Use Tailwind classes for component styling

### Adding API Endpoints
1. Create route file in `backend/routes/`
2. Add model in `backend/models/` if needed
3. Register route in `backend/server.js`

## 🚀 Deployment

### Frontend (Netlify/Vercel)
```bash
cd frontend
npm run build
# Deploy dist/ folder
```

### Backend (Heroku/Railway)
```bash
cd backend
# Add Procfile
# Deploy with environment variables
```

### Database
- Use MongoDB Atlas for production
- Set up proper indexes
- Configure backup strategies

## 📊 Performance Optimization

- Image optimization with Unsplash
- Code splitting with React.lazy
- Caching strategies
- CDN integration
- Database query optimization

## 🔒 Security Features

- JWT authentication
- Password hashing with bcrypt
- Input validation and sanitization
- Rate limiting
- CORS configuration
- Helmet.js security headers

## 🧪 Testing

```bash
# Frontend tests
cd frontend
npm test

# Backend tests
cd backend
npm test
```

## 📈 Analytics & Monitoring

- Stripe dashboard for payments
- MongoDB Atlas monitoring
- Error tracking (Sentry integration ready)
- Performance monitoring

## 🤝 Contributing

1. Fork the repository
2. Create feature branch
3. Commit changes
4. Push to branch
5. Create Pull Request

## 📄 License

MIT License - see LICENSE file for details

## 🆘 Support

For issues and questions:
- Check the documentation
- Review the code comments
- Open an issue on GitHub
- Contact the development team

---

**Built with ❤️ using MERN stack, Tailwind CSS, and Framer Motion**
