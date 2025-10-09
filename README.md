# Dealistaan - Classified Ads Marketplace

A professional, production-ready classified ads marketplace built with React and Node.js.

## 🚀 Features

### Frontend (React)
- **Modern UI/UX** - Built with Tailwind CSS and Framer Motion
- **Responsive Design** - Mobile-first approach with seamless desktop experience
- **Authentication** - Complete user registration, login, and profile management
- **Product Management** - Create, edit, delete, and search products
- **Category System** - Hierarchical category management
- **Messaging System** - Real-time messaging between buyers and sellers
- **Search & Filters** - Advanced search with multiple filter options
- **State Management** - React Context with custom hooks
- **API Integration** - Axios-based API client with error handling
- **Form Handling** - React Hook Form with validation
- **Notifications** - Toast notifications system
- **Loading States** - Skeleton loading and spinners
- **Error Handling** - Comprehensive error boundaries and fallbacks

### Backend (Node.js/Express)
- **RESTful API** - Well-structured API endpoints
- **Authentication** - JWT-based authentication with bcrypt password hashing
- **Database** - MongoDB with Mongoose ODM
- **MVC Architecture** - Clean separation of concerns
- **Middleware** - Custom middleware for authentication and validation
- **Error Handling** - Centralized error handling
- **Pagination** - Built-in pagination support
- **File Upload** - Image upload functionality
- **Validation** - Input validation and sanitization

## 📁 Project Structure

```
dealistaan/
├── public/                 # Static assets
├── src/
│   ├── components/        # Reusable UI components
│   │   ├── common/        # Common components
│   │   ├── forms/         # Form components
│   │   ├── layout/        # Layout components
│   │   ├── ui/           # Basic UI components
│   │   ├── product/      # Product-specific components
│   │   ├── user/         # User-specific components
│   │   ├── category/     # Category-specific components
│   │   └── message/      # Message-specific components
│   ├── pages/            # Page components
│   │   ├── auth/         # Authentication pages
│   │   ├── dashboard/    # Dashboard pages
│   │   ├── product/      # Product pages
│   │   ├── user/         # User pages
│   │   ├── category/     # Category pages
│   │   └── message/      # Message pages
│   ├── hooks/            # Custom React hooks
│   ├── services/         # API services
│   ├── context/          # React Context providers
│   ├── utils/            # Utility functions
│   ├── constants/        # Application constants
│   ├── assets/           # Static assets
│   ├── types/            # TypeScript types (if using TS)
│   └── tests/            # Test files
├── server/               # Backend API
│   ├── src/
│   │   ├── init/         # Initialization files
│   │   ├── mvc/          # MVC structure
│   │   │   ├── models/   # Database models
│   │   │   ├── controllers/ # Route controllers
│   │   │   ├── services/ # Business logic
│   │   │   ├── database/ # Database operations
│   │   │   ├── routes/   # API routes
│   │   │   └── middlewares/ # Custom middleware
│   │   └── global/       # Global utilities
│   └── test-endpoints.js # API testing script
├── package.json          # Dependencies and scripts
├── tailwind.config.js    # Tailwind CSS configuration
├── postcss.config.js     # PostCSS configuration
├── .eslintrc.js         # ESLint configuration
├── .prettierrc          # Prettier configuration
└── env.example          # Environment variables example
```

## 🛠️ Technology Stack

### Frontend
- **React 19** - Latest React with hooks
- **React Router** - Client-side routing
- **Tailwind CSS** - Utility-first CSS framework
- **Framer Motion** - Animation library
- **React Hook Form** - Form handling
- **Axios** - HTTP client
- **React Query** - Data fetching and caching
- **Lucide React** - Icon library
- **React Hot Toast** - Notification system
- **React Helmet** - SEO management

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM for MongoDB
- **JWT** - Authentication
- **bcryptjs** - Password hashing
- **CORS** - Cross-origin resource sharing
- **dotenv** - Environment variables

### Development Tools
- **ESLint** - Code linting
- **Prettier** - Code formatting
- **Nodemon** - Development server
- **PostCSS** - CSS processing
- **Autoprefixer** - CSS vendor prefixes

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- MongoDB (v5 or higher)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd dealistaan
   ```

2. **Install frontend dependencies**
   ```bash
   npm install
   ```

3. **Install server dependencies**
   ```bash
   cd server
   npm install
   cd ..
   ```

4. **Set up environment variables**
   ```bash
   # Copy environment example
   cp env.example .env
   
   # Edit .env file with your configuration
   ```

5. **Start MongoDB**
   ```bash
   # Make sure MongoDB is running on your system
   mongod
   ```

6. **Start the development servers**
   ```bash
   # Terminal 1: Start backend server
   cd server
   npm run dev
   
   # Terminal 2: Start frontend development server
   npm start
   ```

7. **Open your browser**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000

### Testing the API

Run the comprehensive test suite:
```bash
cd server
npm test
```

## 📝 Available Scripts

### Frontend Scripts
- `npm start` - Start development server
- `npm run build` - Build for production
- `npm test` - Run tests
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint errors
- `npm run format` - Format code with Prettier
- `npm run format:check` - Check code formatting

### Backend Scripts
- `npm start` - Start production server
- `npm run dev` - Start development server with nodemon
- `npm test` - Run API endpoint tests

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the root directory:

```env
# API Configuration
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_API_TIMEOUT=10000

# App Configuration
REACT_APP_NAME=Dealistaan
REACT_APP_VERSION=1.0.0
REACT_APP_DESCRIPTION=A professional classified ads marketplace

# Environment
REACT_APP_ENV=development

# Optional: External Services
REACT_APP_CLOUDINARY_CLOUD_NAME=your_cloudinary_name
REACT_APP_GOOGLE_MAPS_API_KEY=your_google_maps_key
```

### Tailwind Configuration

The project uses Tailwind CSS with custom configuration:
- Custom color palette
- Custom fonts (Inter, Poppins)
- Custom animations
- Responsive breakpoints
- Component utilities

## 🎨 Design System

### Colors
- **Primary**: Blue shades for main actions
- **Secondary**: Gray shades for secondary elements
- **Success**: Green shades for success states
- **Warning**: Yellow shades for warnings
- **Danger**: Red shades for errors

### Typography
- **Headings**: Poppins font family
- **Body**: Inter font family
- **Responsive**: Fluid typography scaling

### Components
- **Buttons**: Multiple variants and sizes
- **Forms**: Consistent input styling
- **Cards**: Elevated surfaces with shadows
- **Navigation**: Responsive header and footer

## 🔐 Authentication

The application uses JWT-based authentication:
- Secure token storage in HTTP-only cookies
- Automatic token refresh
- Protected routes
- Role-based access control

## 📱 Responsive Design

- **Mobile-first**: Designed for mobile devices first
- **Breakpoints**: sm, md, lg, xl, 2xl
- **Flexible layouts**: Grid and flexbox layouts
- **Touch-friendly**: Optimized for touch interactions

## 🧪 Testing

### Frontend Testing
- Unit tests with React Testing Library
- Component testing
- Integration testing
- E2E testing (planned)

### Backend Testing
- API endpoint testing
- Database testing
- Authentication testing
- Error handling testing

## 🚀 Deployment

### Frontend Deployment
1. Build the application: `npm run build`
2. Deploy the `build` folder to your hosting service
3. Configure environment variables
4. Set up HTTPS and domain

### Backend Deployment
1. Set up a server (AWS, DigitalOcean, etc.)
2. Install Node.js and MongoDB
3. Clone the repository
4. Install dependencies: `npm install`
5. Configure environment variables
6. Start the application: `npm start`

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/new-feature`
3. Commit changes: `git commit -am 'Add new feature'`
4. Push to branch: `git push origin feature/new-feature`
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support, email support@dealistaan.com or create an issue in the repository.

## 🔮 Future Enhancements

- [ ] Real-time notifications
- [ ] Advanced search filters
- [ ] Image optimization
- [ ] Progressive Web App (PWA)
- [ ] Mobile app (React Native)
- [ ] Payment integration
- [ ] Advanced analytics
- [ ] Admin dashboard
- [ ] Multi-language support
- [ ] Dark mode theme

---

**Dealistaan** - Connecting buyers and sellers worldwide! 🌍