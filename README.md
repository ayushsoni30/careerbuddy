# CareerLaunch — All-in-One IT Career Readiness Platform

CareerLaunch is a modern, premium full-stack web application designed to help students and job seekers enter the IT sector. The platform offers smart resume analysis, interactive mock interviews (both technology-specific and resume-tailored), and a dedicated, technical AI assistant to guide user learning.

---

## 🚀 Key Features

### 1. Unified Dashboard
- Visual summary in a clean 2x2 grid representing the core modules.
- Displays recent activity metrics (last resume analysis matching percentage, last tech interview grade, and last resume mock interview score) fetched from MongoDB.
- Quick navigation shortcuts on each module card.

### 2. Smart Resume Analyzer
- Accepts resume PDF uploads and matches them against pasted Job Descriptions (JD).
- Parsed via a secure, local text extraction pipeline.
- Calls Gemini 1.5 Flash to analyze alignment and returns a relevance match score (0-100%) along with bulleted Pros (matching strengths) and Cons (identified gaps).

### 3. Tech Interview Practice
- Features a selection grid containing 11 popular programming languages and infrastructure stacks (e.g. React, Node.js, DevOps, Docker, AWS, SQL, and DSA).
- Generates a 12-question quiz tailored to the chosen technology.
- Shows questions sequentially with a progress indicator and captures text answers.
- Submits answers to the AI evaluator to return a consolidated score, detailed feedback per question (verdict + correction suggestions), and overall strengths/weaknesses.

### 4. Resume-Based Mock Interview
- Generates 12 mock interview questions customized entirely to the user's uploaded resume (tailored to projects, experience, and tools mentioned).
- Steers the user through a single-question-at-a-time interview form.
- Evaluates answers to return a detailed scorecard detailing pros, cons, and granular suggestions.

### 5. Tech Buddy AI Chatbot
- A multi-turn, conversational chat panel styled like ChatGPT.
- Specialized to only answer questions relating to computer science, roadmaps, career prep, programming concepts, and debugging.
- Non-technical queries are politely declined ("*I only help with tech topics...*").
- Renders code snippets, lists, and headings using `react-markdown` and stores chat histories.

---

## 🛠️ Tech Stack

| Layer | Technology |
| :--- | :--- |
| **Frontend** | React.js (Vite), React Router v6, Axios, Lucide React, `react-circular-progressbar`, `react-markdown` |
| **Backend** | Node.js, Express.js |
| **Database** | MongoDB (via Mongoose) |
| **AI Integration** | Google Gemini 1.5 Flash API (REST Endpoint) |
| **PDF Parsing** | Multer (File Upload), modern `pdf-parse` (named exports) |
| **Security** | Helmet.js, `express-rate-limit`, CORS, Dotenv |

---

## 🎨 Design Philosophy & Color Constraints

The interface features a minimal, premium design inspired by Vercel and Linear, using ample whitespace, rounded edges (`12px` cards, `8px` inputs/buttons), and subtle card shadows.

The color system is strictly locked to **exactly 4 colors** throughout both light and dark modes:

### Dark Mode Tokens
- `--bg-primary`: `#0F172A` (Main page background)
- `--bg-card`: `#1E293B` (Cards, sidebar, navbar backgrounds)
- `--accent`: `#3B82F6` (Buttons, active borders, highlights)
- `--text-primary`: `#F8FAFC` (All typography text)

### Light Mode Tokens (Overrides)
- `--bg-primary`: `#F8FAFC`
- `--bg-card`: `#FFFFFF`
- `--accent`: `#3B82F6`
- `--text-primary`: `#0F172A`

*Note: Error states and alerts utilize a muted opacity version (50%) of `--text-primary` to satisfy the color restrictions.*

---

## 📂 Folder Structure

```text
project/
├── client/                        # React Frontend (Vite)
│   ├── public/
│   ├── src/
│   │   ├── components/            # Shared UI layout files
│   │   │   ├── Navbar.jsx
│   │   │   ├── Sidebar.jsx
│   │   │   └── ThemeToggle.jsx
│   │   ├── context/               # Global state (Toast, etc.)
│   │   │   └── ToastContext.jsx
│   │   ├── pages/                 # Routing containers
│   │   │   ├── Dashboard.jsx
│   │   │   ├── SmartResumeAnalyzer.jsx
│   │   │   ├── TechInterviewPractice.jsx
│   │   │   ├── ResumeBasedInterview.jsx
│   │   │   └── TechBuddy.jsx
│   │   ├── utils/                 # Axios configuration
│   │   │   └── api.js
│   │   ├── App.css                # Style overrides (cleared)
│   │   ├── index.css              # Strict color system and variables
│   │   ├── App.jsx                # Layout Shell & Router mapping
│   │   └── main.jsx
│   └── package.json
│
├── server/                        # Node.js + Express Backend
│   ├── config/
│   │   └── db.js                  # Mongoose MongoDB connection config
│   ├── middleware/
│   │   └── rateLimiter.js         # Rate-limit configurations
│   ├── models/                    # Mongoose database schemas
│   │   ├── ChatHistory.js         # Chat history
│   │   └── AnalysisResult.js      # Scores, feedback, matching logs
│   ├── routes/                    # API endpoints
│   │   ├── resumeAnalyzer.js
│   │   ├── interviewPractice.js
│   │   ├── resumeInterview.js
│   │   └── techBuddy.js
│   ├── utils/
│   │   └── gemini.js              # Gemini REST connector helper
│   ├── uploads/                   # Temp uploads folder for Multer
│   ├── .env                       # Credentials and ports config
│   └── index.js                   # Application entry point
│
└── README.md                      # Documentation
```

---

## ⚙️ Installation & Running

### Prerequisites
- Node.js (v18 or higher recommended)
- MongoDB running locally or a MongoDB Atlas URI

### 1. Setup Backend Server
1. Navigate into the `server/` directory:
   ```bash
   cd server
   ```
2. Open [.env](file:///d:/buddy/server/.env) and enter your configuration:
   ```env
   PORT=5000
   MONGO_URI=mongodb://127.0.0.1:27017/careerlaunch
   GEMINI_API_KEY=YOUR_GEMINI_API_KEY_HERE
   FRONTEND_URL=http://localhost:5173
   ```
3. Run the development server (runs with automatic nodemon restarts):
   ```bash
   npm run dev
   ```
   *The server binds to port 5000 and connects to MongoDB.*

### 2. Setup React Client
1. Open a new terminal window and navigate to the `client/` directory:
   ```bash
   cd client
   ```
2. Install standard node dependencies:
   ```bash
   npm install
   ```
3. Launch the development preview server:
   ```bash
   npm run dev
   ```
   *The client dev server hosts on [http://localhost:5173/](http://localhost:5173/).*

---

## 🔒 Security Measures

- **Helmet.js**: Injected on all Express routes to set secure HTTP headers.
- **CORS Configuration**: Restricts cross-origin resource requests strictly to the configured `FRONTEND_URL` (typically `http://localhost:5173`).
- **Endpoint Rate Limiting**: AI endpoints are rate-limited via `express-rate-limit` to a maximum of 20 requests per 15 minutes per IP address.
- **Secure File Processing**: Resume PDFs are read into node file streams to extract text content, and their temporary disk files are immediately deleted (`fs.unlinkSync`) within `finally` scopes.
