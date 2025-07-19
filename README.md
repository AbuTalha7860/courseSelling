# 🧠 Course Selling App

An intelligent, web-based platform designed to allow users to browse, purchase, and manage online courses, with a robust admin interface for course creation and management.

## 🌐 Deployment

### **Frontend (Vercel):**
- **Live URL:** [https://course-selling-tan.vercel.app/](https://course-selling-tan.vercel.app/)
- **Platform:** Vercel
- **Build Command:** `npm run build`
- **Output Directory:** `dist`

### **Backend (Render):**
- **API URL:** [https://coursesellingwebsite-pe0r.onrender.com](https://coursesellingwebsite-pe0r.onrender.com)
- **Platform:** Render
- **Build Command:** `npm install`
- **Start Command:** `npm start`

### **Environment Variables:**
Make sure to set the following environment variables in your deployment platforms:

**Vercel (Frontend):**
```
VITE_BACKEND_URL=https://coursesellingwebsite-pe0r.onrender.com
VITE_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
```

**Render (Backend):**
```
MONGODB_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret
CLERK_SECRET_KEY=your_clerk_secret_key
PORT=3100
```

## 🌐 Live Demo

🔗 **Website:** [Visit the Platform](https://course-selling-tan.vercel.app/)

---

## 📌 Features

- 🎯 **Course Browsing** - Explore a comprehensive catalog of courses with detailed descriptions and pricing
- 💳 **Secure Course Purchase** - Safe and secure course purchasing for authenticated users
- 👤 **User Authentication** - Secure login and signup using Clerk for both users and admins
- 📊 **Admin Dashboard** - Comprehensive dashboard to manage courses with full CRUD operations
- ✍️ **Course Management** - Admins can add, edit, and delete course details (title, description, price, image)
- 🔁 **Real-time Updates** - Dynamic course listing with instant updates after admin actions
- 📈 **Purchase History** - Users can view and manage their purchased courses
- 🎨 **Responsive Design** - Fully responsive interface for all device types

---

## 🧪 Screenshots

> Screenshots are saved in `public/screenshots/` directory.

| Home | Courses | Admin Dashboard | Our Courses | Purchase History |
|------|---------|-----------------|-------------|------------------|
| ![Home](./public/screenshots/home.png) | ![Courses](./public/screenshots/courses.png) | ![Admin Dashboard](./public/screenshots/admin-dashboard.png) | ![Our Courses](./public/screenshots/our-courses.png) | ![Purchase History](./public/screenshots/purchase-history.png) |

---

## 📁 Project Structure

```
client/
├── src/
│   ├── admin/
│   │   ├── AdminSignup.jsx
│   │   ├── AdminLogin.jsx
│   │   ├── CourseCreate.jsx
│   │   ├── UpdateCourse.jsx
│   │   ├── OurCourses.jsx
│   │   └── Dashboard.jsx
│   ├── components/
│   │   ├── Home.jsx
│   │   ├── Login.jsx
│   │   ├── Signup.jsx
│   │   ├── Buy.jsx
│   │   ├── Courses.jsx
│   │   ├── Purchases.jsx
│   │   └── ErrorBoundary.jsx
│   ├── App.jsx
│   └── index.js
├── public/
│   └── screenshots/
├── vite.config.js
└── package.json
```

---

## ⚙️ Tech Stack

### **Frontend:**
- ✅ Vite (Build Tool)
- ✅ React
- ✅ Tailwind CSS
- ✅ React Router DOM
- ✅ React Hot Toast (Notifications)
- ✅ Axios (API Requests)

### **Backend:**
- 🛠️ Node.js with Express
- 🛢️ MongoDB (Database)
- 🔐 Clerk for Authentication
- 🌐 CORS for Cross-Origin Requests
- 🧪 JWT for Token Management

---

## 🚀 Getting Started

### 1️⃣ Clone the Repository

```bash
git clone https://github.com/AbuTalha7860/courseSelling.git
cd courseSelling/client
```

### 2️⃣ Install Dependencies

```bash
npm install
```

### 3️⃣ Configure Environment Variables

Create a `.env` file in the `client/` directory:

```env
VITE_BACKEND_URL=https://coursesellingwebsite-pe0r.onrender.com
VITE_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
```

For the backend, create a `.env` file in the backend directory:

```env
MONGODB_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret
CLERK_SECRET_KEY=your_clerk_secret_key
PORT=3100
```

### 4️⃣ Set Up the Backend

**Option 1: Use the deployed backend (Recommended)**
The backend is already deployed at `https://coursesellingwebsite-pe0r.onrender.com`

**Option 2: Run backend locally**
```bash
# Navigate to backend directory
cd ../backend
npm install
npm run dev
```

**Note:** The frontend is configured to use the deployed backend by default. For local development, update `VITE_BACKEND_URL` in your `.env` file to `http://localhost:3100`

### 5️⃣ Run the Development Server

```bash
# Navigate back to client directory
cd ../client
npm run dev
```

Your app will be running at: **http://localhost:5173**

---

## 🧠 How It Works

1. **User Authentication** - Users sign up or log in via Clerk to access courses and purchase history
2. **Course Browsing** - Users explore available courses on the `/courses` page with filtering options
3. **Secure Purchase** - Users can buy courses via the `/buy/:courseId` route with secure payment
4. **Admin Management** - Admins access the dashboard (`/admin/dashboard`) to manage courses
5. **Real-time Updates** - Course changes are reflected instantly using optimized API calls
6. **Purchase Tracking** - Users view and manage their purchased courses on the `/purchases` page

---

## 🧰 Tools & Services

- 🌐 **Vite** – Fast frontend build tool and development server
- 🎨 **Tailwind CSS** – Utility-first styling framework
- 💬 **React Hot Toast** – Beautiful notification system
- 🧠 **Clerk** – Authentication and session management
- 🗄️ **MongoDB** – NoSQL database for storing courses and user data
- 🌐 **Vercel** – Frontend hosting & deployment
- 🚀 **Render** – Backend hosting & deployment
- 📡 **Axios** – HTTP client for API requests

---

## 🔧 API Endpoints

**Base URL:** `https://coursesellingwebsite-pe0r.onrender.com`

### **User Routes:**
- `GET /api/courses` - Get all courses
- `POST /api/courses/purchase/:courseId` - Purchase a course
- `GET /api/purchases` - Get user's purchased courses

### **Admin Routes:**
- `POST /api/admin/courses` - Create new course
- `PUT /api/admin/courses/:courseId` - Update course
- `DELETE /api/admin/courses/:courseId` - Delete course
- `GET /api/admin/courses` - Get all courses (admin view)

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📝 Future Enhancements

- 🎥 **Video Course Content** - Integrated video player with progress tracking
- 📚 **Advanced Categories** - Multi-level course categorization system
- 📱 **Mobile App** - React Native mobile application
- 🏆 **Certificates** - Automated course completion certificates
- 👥 **Community Forums** - Discussion forums for learners
- 💰 **Payment Gateway** - Integration with Stripe/PayPal
- 📊 **Analytics Dashboard** - Detailed analytics for admins
- 🔍 **Advanced Search** - AI-powered course recommendations

---

## 🧑‍💻 Author

**Abu Talha**
- Final Year B.Tech CSE Student | Full Stack Developer | Web Development Enthusiast
- 📫 **GitHub:** [@AbuTalha7860](https://github.com/AbuTalha7860)

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## ⭐ Show Your Support

If you found this project helpful, please give it a ⭐ on GitHub!

---

## 📞 Contact

Have questions or suggestions? Feel free to reach out or open an issue on GitHub.

- 📧 **Repository:** [courseSelling](https://github.com/AbuTalha7860/courseSelling)
- 🌐 **Live Demo:** [course-selling-tan.vercel.app](https://course-selling-tan.vercel.app/)

---

## 🙏 Acknowledgments

- Thanks to the React community for excellent documentation
- Clerk team for seamless authentication solutions
- Tailwind CSS for making styling enjoyable
- MongoDB team for the robust database solution

---

<div align="center">
  <strong>Made with ❤️ by Abu Talha</strong>
  <br>
  <sub>Built with modern web technologies</sub>
</div>
