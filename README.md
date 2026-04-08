# SAAMS - Student Achievement & Activity Management System

A modern, responsive web-based platform for tracking and managing student extracurricular achievements. Built with React, Vite, and Tailwind CSS.

## 🎯 Features

### Landing Page
- Professional navigation bar with SAAMS branding
- Hero section with call-to-action buttons
- Features overview section
- Responsive design for all devices

### Authentication
- **Login Page**: Role-based login (Admin/Student)
- **Register Page**: Create new accounts with role selection
- **Mock Authentication**: Local state management with localStorage
- Demo credentials included for testing

### Admin Dashboard
- **Dashboard**: Overview with statistics, charts, and recent achievements
- **Add Achievement**: Form to record student achievements with file upload
- **View Achievements**: Searchable and filterable achievements list
- **Students**: Student profiles with achievement breakdown
- **Reports**: Analytics and insights with date range selector
- **Analytics**: Performance metrics and trend analysis

### Student Dashboard
- **Dashboard**: Personal achievement summary and badges
- **My Achievements**: Timeline view of personal achievements
- **Certificates**: Preview and download certificates

### Shared Features
- **Profile**: User profile management and settings
- **Settings**: Notification, appearance, and privacy preferences
- **Sidebar Navigation**: Collapsible navigation with role-based menu items

## 🛠️ Tech Stack

- **Frontend Framework**: React 18
- **Build Tool**: Vite 7.3.1
- **Styling**: Tailwind CSS
- **Routing**: React Router v6
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **Charts**: Recharts
- **State Management**: React Context API
- **Form Management**: Controlled components

## 📁 Project Structure

```
src/
├── components/         # Reusable React components
│   ├── Navbar.jsx
│   ├── Sidebar.jsx
│   ├── Card.jsx
│   ├── FormInput.jsx
│   ├── ProtectedRoute.jsx
│   ├── Toast.jsx
│   └── index.js
├── pages/             # Page components
│   ├── LandingPage.jsx
│   ├── LoginPage.jsx
│   ├── RegisterPage.jsx
│   ├── AdminDashboard.jsx
│   ├── AddAchievementPage.jsx
│   ├── ViewAchievementsPage.jsx
│   ├── StudentsPage.jsx
│   ├── ReportsPage.jsx
│   ├── AnalyticsPage.jsx
│   ├── StudentDashboard.jsx
│   ├── ProfilePage.jsx
│   ├── SettingsPage.jsx
│   └── index.js
├── layouts/           # Layout components
│   └── DashboardLayout.jsx
├── utils/             # Utility functions and contexts
│   └── AuthContext.jsx
├── data/              # Mock data
│   └── mockData.js
├── assets/            # Static assets
├── styles/            # CSS files
├── App.jsx            # Main app component
├── main.jsx           # Entry point
└── index.css          # Global styles

```

## 🚀 Getting Started

### Prerequisites
- Node.js 16.x or higher
- npm or yarn package manager

### Installation

1. **Navigate to project directory**
```bash
cd FSAD
```

2. **Install dependencies**
```bash
npm install
```

3. **Start development server**
```bash
npm run dev
```

The application will be available at `http://localhost:5173/`

### Build for Production
```bash
npm run build
```

### Preview Production Build
```bash
npm run preview
```

## 📝 Demo Credentials

### Admin Account
- **Email**: admin@saams.com
- **Password**: password123
- **Role**: Admin

### Student Account
- Use any email and password (minimum 6 characters) to register as a student

## 🎨 Design Features

- **Purple Gradient Theme**: Dark-to-lavender background gradient
- **Glassmorphism**: Frosted glass effect cards with backdrop blur
- **Rounded Corners**: 2xl (16px) border radius for modern look
- **Soft Shadows**: Subtle shadow effects with purple glow on hover
- **Smooth Animations**: Framer Motion for page transitions and interactions
- **Clean Typography**: Poppins and Inter fonts for professional appearance
- **Responsive Design**: Mobile-optimized across all screen sizes

## 📊 Mock Data

The application includes comprehensive mock data for:
- 6+ Students with profiles and achievement counts
- 143+ Achievements across multiple categories
- Monthly achievement trends
- Category distribution statistics
- Recent achievements feed

## 🔐 Authentication & Authorization

- **Context-based Auth**: AuthProvider for global state
- **Protected Routes**: Role-based route protection
- **Local Storage**: Persistent user sessions
- **Mock Login**: No backend integration required

## 🎭 Component Library

### Reusable Components
- **Card**: Base card component with glassmorphism styling
- **StatCard**: Statistics display with icons and trends
- **ChartCard**: Container for chart visualizations
- **AchievementCard**: Achievement display card
- **FormInput**: Styled input with validation
- **TextField**: Textarea with validation
- **SelectInput**: Dropdown selector
- **Navbar**: Top navigation bar
- **Sidebar**: Collapsible sidebar navigation
- **Toast**: Notification system
- **ProtectedRoute**: Route protection wrapper

## 🎯 Features Ready for Backend Integration

- Authentication endpoints (login, register, logout)
- Achievement CRUD operations
- Student management
- Report generation
- Analytics queries
- File upload for certificates
- User profile updates

## 📱 Responsive Breakpoints

- **Mobile**: 320px - 640px
- **Tablet**: 641px - 1024px
- **Desktop**: 1025px+

All components are fully responsive using Tailwind CSS grid and flex utilities.

## 🔄 State Management

- **Auth State**: `useAuth()` hook with login/logout
- **Toast Notifications**: `useToast()` hook for alerts
- **Component State**: React `useState()` for form management
- **Local Storage**: Persistent user data

## 🎬 Animations

- Page transitions with Framer Motion
- Card entrance animations
- Button hover and tap effects
- Smooth color transitions
- Chart animations
- Modal animations

## 📈 Performance Optimization

- Code splitting with React Router
- Lazy loading components
- Optimized images with proper sizing
- CSS minification (Tailwind)
- JavaScript minification (Vite)

## 🌐 Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## 📄 License

This project is provided as-is for educational purposes.

## 📞 Support

For issues or feature requests, please refer to the codebase structure and comments.

---

**Built with ❤️ using React, Vite, and Tailwind CSS**
