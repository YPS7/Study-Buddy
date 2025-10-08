# Study Buddy - AI-Powered Learning Companion

![Study Buddy](https://img.shields.io/badge/AI-Powered-blue) ![React](https://img.shields.io/badge/React-18.3.1-61DAFB?logo=react) ![TypeScript](https://img.shields.io/badge/TypeScript-5.6-3178C6?logo=typescript) ![Vite](https://img.shields.io/badge/Vite-6.0-646CFF?logo=vite)

A comprehensive, AI-powered web application designed to revolutionize how students study and revise their coursebooks. Built with React, TypeScript, and cutting-edge AI APIs, Study Buddy transforms static PDF textbooks into interactive, personalized learning experiences.

## 🌟 Features Overview

### 📚 Core Learning Tools

#### 1. **Intelligent PDF Processing**
- **Multi-PDF Upload**: Upload and manage multiple PDF coursebooks simultaneously
- **Smart Selection**: Interactive PDF selector - click to select/deselect active study materials
- **Built-in PDF Viewer**: View your coursebook side-by-side while studying
- **Content Extraction**: Automatic text extraction using pdfjs-dist for AI processing

#### 2. **Smart Quiz Generation**
Generate customized quizzes tailored to your study needs:
- **Question Types**:
  - Multiple Choice Questions (MCQs) with 4 options
  - Short Answer Questions (SAQs)
  - Long Answer Questions (LAQs)
- **Flexible Configuration**:
  - Choose question count (5-50 questions)
  - Select question types or mix them
  - Focus on specific topics or page ranges
- **AI-Powered**: Leverages DeepSeek Chat API via OpenRouter for intelligent question generation
- **Smart Tracking**: Prevents duplicate questions across sessions
- **Instant Feedback**: Real-time answer evaluation with detailed explanations

#### 3. **AI Tutor Chat**
An intelligent conversational tutor that:
- Answers questions about your coursebook with page citations
- Provides step-by-step explanations using chain-of-thought reasoning
- Includes real-world examples and applications
- Highlights common misconceptions
- Maintains conversation context for follow-up questions
- Uses structured pedagogical approach for deep learning

#### 4. **YouTube Video Recommendations**
- **AI-Powered Topic Extraction**: Automatically identifies key topics from your PDF
- **Custom Topic Search**: Manually search for specific educational content
- **Curated Results**: 6 relevant educational videos per search
- **Direct Integration**: Click to open videos in new tabs
- **Visual Previews**: Thumbnail previews with channel information

#### 5. **Exam Question Generator**
Prepare for competitive exams with targeted question banks:
- **Exam Types Supported**:
  - 10th Board Exam
  - 12th Board Exam
  - JEE (Joint Entrance Exam)
  - CAT (Common Admission Test)
  - NEET (Medical Entrance)
- **Difficulty Levels**: Easy, Medium, Hard
- **Printable Format**: Download questions as professionally formatted PDFs
- **Mark Distribution**: Realistic mark allocation per question type
- **Exam-Specific Patterns**: Questions follow actual exam patterns

### 🎯 Progress & Engagement

#### 6. **Study Streaks & Gamification**
Stay motivated with local progress tracking:
- **Daily Streaks**: Track consecutive study days
- **Quiz Statistics**: Monitor total quizzes completed
- **Achievement Badges**:
  - 🎯 First Steps - Complete your first quiz
  - 🎓 Quiz Master - Complete 10 quizzes
  - 🔥 Hot Streak - Maintain a 7-day streak
  - 💯 Perfectionist - Score 100% on a quiz
- **Visual Celebrations**: Confetti animations on milestone achievements
- **Persistent Storage**: All progress saved locally

#### 7. **Session Reports**
Comprehensive study analytics:
- **Performance Metrics**:
  - Total study time
  - Quizzes completed
  - Average scores
  - Question breakdown by type
- **Progress Visualization**: Charts showing performance trends
- **Comparison Reports**: Compare current session with previous sessions
- **Downloadable**: Generate PDF reports for record-keeping

#### 8. **Progress Dashboard**
Visual analytics with interactive charts:
- **Quiz Performance Trends**: Line charts showing score improvements
- **Question Type Analysis**: Pie charts of MCQ/SAQ/LAQ distribution
- **Study Pattern Insights**: Identify strengths and weaknesses
- **Historical Data**: Track long-term learning progress

### 🎨 User Experience

#### 9. **Theme Toggle**
- **Dark/Light Mode**: Seamless theme switching
- **Welcome Screen Access**: Toggle theme before starting
- **Persistent Preference**: Theme choice saved to localStorage
- **Beautiful Design**: Carefully crafted color palettes for both modes

#### 10. **Responsive Design**
- Mobile-friendly layouts
- Tablet-optimized views
- Desktop full-feature experience
- Adaptive component sizing

---

## 🛠️ Technology Stack

### Frontend Framework
- **React 18.3.1**: Modern component-based architecture with hooks
- **TypeScript 5.6**: Type-safe development for fewer runtime errors
- **Vite 6.0**: Lightning-fast build tool and dev server

### UI Libraries & Components
- **Tailwind CSS**: Utility-first CSS framework
- **shadcn/ui**: High-quality, accessible React components
  - Radix UI primitives for robust component logic
  - Custom-styled with Tailwind
- **Lucide React**: Beautiful, consistent icon system
- **Sonner**: Elegant toast notifications

### PDF Processing
- **pdfjs-dist 5.4.296**: PDF parsing and text extraction
- **react-pdf 10.1.0**: React wrapper for PDF.js
- **jsPDF 3.0.3**: PDF generation for downloadable reports

### AI & External APIs
- **OpenRouter API**: Gateway for accessing DeepSeek Chat AI model
  - Model: `deepseek/deepseek-chat`
  - Used for quiz generation, chat tutoring, topic extraction.

### State Management & Utilities
- **React Hooks**: useState, useEffect, useRef for local state
- **localStorage**: Client-side persistent storage for:
  - Study streaks
  - Quiz history
  - Session data
  - Theme preferences
- **date-fns**: Date manipulation and formatting
- **TanStack Query**: (Future) Server state management

### Gamification & Animations
- **canvas-confetti**: Celebration animations for achievements
- **CSS Animations**: Smooth transitions and hover effects

---

## 📁 Project Structure

```
study-buddy/
├── src/
│   ├── components/           # React components
│   │   ├── ui/              # shadcn/ui components
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   ├── tabs.tsx
│   │   │   └── ... (50+ components)
│   │   ├── ChatInterface.tsx        # AI tutor chat
│   │   ├── ExamQuestionGenerator.tsx # Exam prep tool
│   │   ├── PDFUploader.tsx          # Multi-PDF uploader
│   │   ├── PDFViewer.tsx            # Built-in PDF viewer
│   │   ├── QuizComponent.tsx        # Quiz interface
│   │   ├── QuizConfig.tsx           # Quiz settings
│   │   ├── StudyStreaks.tsx         # Gamification system
│   │   ├── ThemeToggle.tsx          # Dark/light mode
│   │   ├── WelcomeScreen.tsx        # App entry point
│   │   └── YouTubeRecommendations.tsx # Video search
│   │
│   ├── pages/               # Page components
│   │   ├── Index.tsx        # Main application page
│   │   ├── Dashboard.tsx    # Analytics dashboard
│   │   └── NotFound.tsx     # 404 page
│   │
│   ├── lib/                 # Utility functions
│   │   ├── sessionReport.ts # Report generation logic
│   │   └── utils.ts         # Helper functions
│   │
│   ├── hooks/               # Custom React hooks
│   │   ├── use-mobile.tsx   # Mobile detection
│   │   └── use-toast.ts     # Toast notifications
│   │
│   ├── App.tsx              # App router
│   ├── main.tsx             # App entry point
│   ├── index.css            # Global styles & design tokens
│   └── vite-env.d.ts        # Vite TypeScript definitions
│
├── public/                  # Static assets
│   ├── robots.txt
│   └── favicon.ico
│
├── LOGIC.md                 # Detailed architecture documentation
├── README.md                # This file
├── package.json             # Dependencies
├── tsconfig.json            # TypeScript configuration
├── tailwind.config.ts       # Tailwind CSS configuration
└── vite.config.ts           # Vite build configuration
```

---   

## 🚀 Getting Started

### Prerequisites
- **Node.js** (v18 or higher recommended)
- **npm** or **yarn** or **bun** package manager
- Modern web browser (Chrome, Firefox, Safari, Edge)

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/study-buddy.git
cd study-buddy
```

2. **Install dependencies**
```bash
npm install
# or
yarn install
# or
bun install
```

3. **Configure API Keys** (if needed)

The application comes with pre-configured API keys for the MVP:
- **OpenRouter API Key**: `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`

⚠️ **For Production**: Replace these with your own API keys in `src/pages/Index.tsx`:

```typescript
const OPENROUTER_API_KEY = "your-openrouter-api-key";
```

### Running the Application

**Development Mode**
```bash
npm run dev
# or
yarn dev
# or
bun dev
```

The app will be available at `http://localhost:8080`

**Production Build**
```bash
npm run build
npm run preview
```

---

## 📖 Usage Guide

### 1. Getting Started
1. Click "Let's Start Learning!" on the welcome screen
2. Choose to upload a previous session report or skip
3. Upload your first PDF coursebook

### 2. Managing PDFs
- **Upload**: Click "Upload PDF" and select your file
- **Select/Deselect**: Click on uploaded PDFs in the selection area to toggle
- **View**: Selected PDFs are displayed in the viewer
- **Remove**: Click the X button on a PDF to delete it

### 3. Generating Quizzes
1. Go to the "Quiz" tab
2. Configure your quiz:
   - Choose question count (5-50)
   - Select question type (MCQ/Subjective/Mixed)
   - Optionally focus on specific topics or pages
3. Click "Generate Quiz"
4. Answer questions and submit
5. Review your results and explanations

### 4. Using AI Tutor
1. Go to the "Chat" tab
2. Ask questions about your coursebook
3. Get detailed explanations with page citations
4. Ask follow-up questions for deeper understanding

### 5. Finding Video Resources
1. Go to the "Videos" tab
2. Click "Get Videos" for auto-detected topics
3. Or enter a custom topic and search
4. Click on video thumbnails to watch on YouTube

### 6. Preparing for Exams
1. Go to the "Exam" tab
2. Select your exam type (10th/12th boards, JEE, CAT, NEET)
3. Choose difficulty level
4. Click "Generate Questions"
5. Download the PDF question bank

### 7. Tracking Progress
- **Streaks Tab**: View daily streaks and achievements
- **Progress Tab**: Analyze your performance with charts
- **End Session**: Generate a comprehensive session report

--- 

## 📊 Data Flow Architecture

### Quiz Generation Flow
```
User Config → Index.tsx → OpenRouter API → JSON Response → 
QuizComponent → User Answers → Score Calculation → 
Results + Storage → Quiz History + Streaks Update
```

### Chat Flow
```
User Message → ChatInterface.tsx → OpenRouter API (with PDF context) → 
AI Response → Message Display → Conversation History
```

### Video Recommendation Flow
```
PDF Content → OpenRouter (Topic Extraction) → Topics → 
YouTube API Search → Video Results → Display + External Links
```

---
