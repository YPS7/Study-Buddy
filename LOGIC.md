# Study Buddy - Application Logic & Architecture

## Overview
Study Buddy is an AI-powered learning companion designed for school students to revise their coursebooks effectively. The app uses OpenRouter API (DeepSeek v3.1) for AI features and YouTube API for video recommendations.

---

## Core Technologies
- **Frontend**: React 18 + TypeScript + Vite
- **UI Framework**: Shadcn UI + Tailwind CSS
- **PDF Processing**: pdfjs-dist, react-pdf
- **AI**: OpenRouter API (DeepSeek v3.1 free model)
- **Media**: YouTube Data API v3
- **PDF Generation**: jsPDF
- **Gamification**: canvas-confetti

---

## API Keys & Configuration

### OpenRouter API
- **Key**: `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`
- **Model**: `deepseek/deepseek-chat-v3.1:free`
- **Usage**: Quiz generation, chat interface, mind map, exam questions, YouTube topic extraction

### YouTube API
- **Key**: `AIzaSyDUvVQl08TqxaLJ3EiUTFmI0RgpOZoYGg8`
- **Usage**: Educational video recommendations

---

## Application Flow

### 1. Welcome & Session Initialization
**Files**: 
- `src/components/WelcomeScreen.tsx`
- `src/pages/Index.tsx` (session management)

**Logic**:
1. User sees welcome screen with tagline
2. On "Get Started", dialog prompts for previous session report upload (optional)
3. If uploaded, comparison will be included in end-of-session report
4. App initializes with:
   - Session start time
   - Empty quiz results array
   - Study streak tracking (from localStorage)

---

### 2. PDF Management
**Files**:
- `src/components/PDFUploader.tsx`
- `src/components/PDFViewer.tsx`
- `src/pages/Index.tsx` (state management)

**Logic**:
- **Multiple PDF Upload**: Users can upload multiple PDFs via drag-and-drop or file browser
- **Active PDF Selection**: Dropdown selector to choose which PDF is currently active
- **Text Extraction**: 
  - Uses `pdfjs.getDocument()` to parse PDF
  - Extracts text from first 10 pages for AI processing
  - Stores extracted text in `pdfContent` state
- **Display**: Side-by-side viewer with page navigation and zoom controls
- **File Management**: Users can remove uploaded PDFs individually

---

### 3. Quiz System

#### A. Quiz Configuration
**File**: `src/components/QuizConfig.tsx`

**Configuration Options**:
1. **Question Count**: 5, 10, 20, 30
2. **Question Type**: MCQ only, Subjective only (SAQ+LAQ), Mixed
3. **Scope**: 
   - Whole book
   - Specific topic (user enters topic name)
   - Specific pages (user enters page range)

#### B. Quiz Generation
**File**: `src/pages/Index.tsx` (generateQuiz function)

**Logic**:
1. Build dynamic prompt based on configuration:
   - Question count distribution (e.g., 40% MCQ, 40% SAQ, 20% LAQ for mixed)
   - Scope filtering (topic or page range)
   - Previous questions exclusion (tracked in `askedQuestions` state)
2. Call OpenRouter API with:
   - System prompt defining JSON structure
   - First 4000 chars of PDF content
3. Parse JSON response and extract questions
4. Add new questions to `askedQuestions` to prevent repeats
5. Store questions in state for rendering

#### C. Quiz Component
**File**: `src/components/QuizComponent.tsx`

**Logic**:
- **Question Navigation**: Step-by-step progression through questions
- **Answer Collection**:
  - MCQ: Radio buttons for options
  - SAQ/LAQ: Textarea for written answers
- **Validation**: Ensures answer is provided before proceeding
- **Scoring**: 
  - Compares user answer with correct answer (case-insensitive)
  - Tracks correct/incorrect for each question
- **Results Display**:
  - Score summary with percentage
  - Question-by-question review with explanations
  - Visual indicators (✓ for correct, ✗ for incorrect)
- **Actions**:
  - Retry: Reset current quiz
  - New Quiz: Switch to quiz tab (no page reload)

#### D. Question Tracking
**Logic**:
- `askedQuestions[]` prevents duplicate questions across sessions
- `sessionQuizResults[]` stores detailed results for session report
- QuizResult structure: `{ question, userAnswer, correctAnswer, isCorrect, type }`

---

### 4. AI Chat Interface
**File**: `src/components/ChatInterface.tsx`

**Features**:
- **Chat UI**: ChatGPT-inspired left drawer + main chat window
- **System Prompt**: Chain-of-thought reasoning with structured responses
- **RAG (Retrieval-Augmented Generation)**:
  - Sends 2000-char PDF snippet with each query
  - AI cites page numbers and quotes snippets
  - Provides detailed explanations with examples
- **Conversation Management**:
  - Multiple chat sessions
  - New chat button
  - Chat switching (simulated via localStorage)
- **Streaming**: Real-time token-by-token response rendering

---

### 5. YouTube Video Recommendations
**File**: `src/components/YouTubeRecommendations.tsx`

**Logic**:
1. **Topic Extraction**:
   - Optional: User provides specific topic
   - If not provided: AI extracts key topics from PDF content
2. **Video Search**:
   - Uses YouTube API with extracted topics
   - Filters: "education", "tutorial", "explanation"
   - Sorts by relevance
3. **Display**:
   - Grid of video thumbnails
   - Video title, channel name, view count
   - Click to open in new tab

---

### 6. Mind Map Generator
**File**: `src/components/MindMapGenerator.tsx`

**Logic**:
1. **Structure Extraction**:
   - AI analyzes PDF headings and key sentences
   - Creates hierarchical JSON tree (root → subtopics → key points)
2. **Interactive Display**:
   - Expandable/collapsible nodes
   - Visual hierarchy with color coding:
     - Level 0 (root): Gradient primary background
     - Level 1 (main topics): Secondary border
     - Level 2+ (details): Muted background
3. **Export**: 
   - Canvas rendering → PNG download
   - Preserves visual hierarchy

---

### 7. Study Streaks & Gamification
**File**: `src/components/StudyStreaks.tsx`

**Features**:
1. **Streak Tracking**:
   - Increments daily on quiz completion
   - Resets if >1 day gap
   - Stored in localStorage
2. **Quiz Counter**: Total quizzes completed
3. **Badges**:
   - First Steps (1 quiz)
   - Quiz Master (10 quizzes)
   - Hot Streak (7-day streak)
   - Perfectionist (100% score)
4. **Visual Effects**:
   - Confetti on badge unlock
   - Confetti every 7-day streak milestone
5. **Integration**: 
   - Exposed via `window.incrementQuizCount()`
   - Called after quiz completion

---

### 8. Exam Question Generator
**File**: `src/components/ExamQuestionGenerator.tsx`

**Features**:
1. **Exam Type Selection**:
   - 10th Board
   - 12th Board
   - JEE (Engineering)
   - CAT (MBA)
   - NEET (Medical)
2. **Difficulty Levels**:
   - Easy: Fundamental concepts
   - Medium: Application-based
   - Hard: Complex scenarios, critical thinking
3. **Question Generation**:
   - Exam-specific patterns and difficulty
   - Mix of MCQs (1 mark), SAQs (2-3 marks), LAQs (5 marks)
   - 10-15 questions per paper
4. **Printable Format**:
   - PDF generation with jsPDF
   - Proper formatting with marks allocation
   - Blank space for answers (MCQs show options, others have writing space)

---

### 9. Progress Tracking & Dashboard
**File**: `src/pages/Dashboard.tsx`

**Metrics**:
- Total quizzes completed
- Average score across all quizzes
- Recent quiz history (score, topic, timestamp)
- Visual charts (if implemented)

---

### 10. Session Reports
**File**: `src/lib/sessionReport.ts`

**Features**:
1. **Session Data Collection**:
   - Start/end time
   - All quiz results with detailed breakdown
   - Weak areas identification (incorrect answers)
2. **PDF Report Generation**:
   - Summary statistics
   - Question-by-question analysis
   - Areas to focus on
3. **Comparison Report** (if previous session uploaded):
   - Score improvement tracking
   - Progress visualization
   - Weak area evolution

**Export**: Auto-downloads PDF on "End Session"

---

### 11. Theme System
**Files**:
- `src/components/ThemeToggle.tsx`
- `src/index.css`
- `tailwind.config.ts`

**Features**:
- Light/Dark mode toggle
- Persists in localStorage
- CSS variables for all colors (HSL format)
- Semantic tokens for gradients, shadows, borders

**Dark Mode Variables**:
- Adjusted HSL values for backgrounds, text, cards
- Darker gradients and adjusted shadows
- Maintains contrast ratios

---

## State Management

### Global State (Index.tsx)
```typescript
// PDF Management
uploadedFiles: File[]           // All uploaded PDFs
selectedFile: File | null       // Currently active PDF
pdfContent: string              // Extracted text from active PDF

// Quiz State
questions: Question[]           // Current quiz questions
askedQuestions: Question[]      // All questions asked (prevents repeats)
isGenerating: boolean           // Loading state
quizHistory: QuizHistory[]      // All completed quizzes

// Session Tracking
sessionStartTime: Date          // Session start timestamp
sessionQuizResults: QuizResult[] // Detailed quiz results
previousSession: PreviousSessionData | null // Uploaded previous report

// UI State
showWelcome: boolean            // Welcome screen visibility
activeTab: string               // Current active tab
```

### LocalStorage
```typescript
// Gamification
"study-streak": number          // Current streak count
"last-study-date": string       // Last activity date
"total-quizzes": number         // Total quizzes completed
"badges": Badge[]               // Unlocked badges

// Theme
"theme": "light" | "dark"       // User's theme preference

// Chat (future implementation)
"chat-sessions": ChatSession[]  // Saved chat conversations
```

---

## Data Flow

### Quiz Generation Flow
```
User selects config → generateQuiz() → 
OpenRouter API call → Parse JSON response → 
Update questions state → Render QuizComponent
```

### Quiz Completion Flow
```
User submits answers → Calculate score → 
Update sessionQuizResults → Update quizHistory → 
Increment streak counter → Check badge unlocks → 
Show results with explanations
```

### PDF Upload Flow
```
User uploads PDF → Extract text (10 pages) → 
Store in uploadedFiles[] → Set as selectedFile → 
Update pdfContent for AI processing → 
Enable quiz/chat/video features
```

### Session End Flow
```
End Session button → Validate quiz completion → 
Generate session report → 
(Optional) Compare with previous session → 
Download PDF report
```

---

## Component Hierarchy

```
Index.tsx (Main App)
├── WelcomeScreen.tsx
├── Dialog (Previous Session Upload)
├── ThemeToggle.tsx
├── PDFUploader.tsx
│   └── File management UI
├── PDFViewer.tsx
│   └── react-pdf rendering
└── Tabs
    ├── Quiz Tab
    │   ├── QuizConfig.tsx
    │   └── QuizComponent.tsx
    ├── Chat Tab
    │   └── ChatInterface.tsx
    ├── Videos Tab
    │   └── YouTubeRecommendations.tsx
    ├── Mind Map Tab
    │   └── MindMapGenerator.tsx
    ├── Streaks Tab
    │   └── StudyStreaks.tsx
    ├── Exam Tab
    │   └── ExamQuestionGenerator.tsx
    └── Progress Tab
        └── Dashboard.tsx
```

---

## Key Features Summary

### Must-Have (Implemented)
✅ PDF upload & viewer  
✅ Quiz generator (MCQ, SAQ, LAQ)  
✅ Quiz configuration (count, type, scope)  
✅ Progress tracking  
✅ Session reports  
✅ Multiple PDF management  

### Nice-to-Have (Implemented)
✅ AI chat with RAG & citations  
✅ YouTube recommendations  
✅ Mind map generator  
✅ Study streaks & gamification  
✅ Exam question generator  
✅ Dark mode  
✅ No page reload on new quiz  
✅ Question de-duplication  

---

## Error Handling

### API Errors
- OpenRouter failures: Toast error, retry option
- YouTube API failures: Graceful fallback message
- PDF parsing errors: User notification with upload retry

### Validation
- Quiz generation: Requires PDF upload
- Quiz submission: Requires answered question
- Session report: Requires at least 1 completed quiz
- File upload: Only accepts .pdf files

---

## Performance Optimizations

1. **Lazy Loading**: PDF text extraction limited to 10 pages
2. **Content Truncation**: AI requests use first 4000 chars
3. **State Management**: Minimal re-renders with proper state structure
4. **LocalStorage**: Persistent data without backend calls
5. **Debouncing**: (Future) For chat input and search

---

## Future Enhancements (Not Yet Implemented)

1. **Backend Integration**:
   - User authentication
   - Cloud storage for PDFs and sessions
   - Database for quiz history
2. **Advanced Analytics**:
   - Topic-wise performance graphs
   - Time-based learning patterns
   - Spaced repetition suggestions
3. **Collaboration**:
   - Share quizzes with friends
   - Leaderboards
   - Study groups
4. **AI Improvements**:
   - Voice interaction
   - Image-based questions
   - Adaptive difficulty

---

## File Organization

```
src/
├── components/
│   ├── WelcomeScreen.tsx          # Initial landing page
│   ├── PDFUploader.tsx            # Multi-PDF upload & management
│   ├── PDFViewer.tsx              # PDF display with navigation
│   ├── QuizConfig.tsx             # Quiz configuration form
│   ├── QuizComponent.tsx          # Quiz interaction & results
│   ├── ChatInterface.tsx          # AI tutor chat
│   ├── YouTubeRecommendations.tsx # Video suggestions
│   ├── MindMapGenerator.tsx       # Visual outline creator
│   ├── StudyStreaks.tsx           # Gamification & badges
│   ├── ExamQuestionGenerator.tsx  # Exam paper creator
│   ├── ThemeToggle.tsx            # Light/dark mode switcher
│   └── ui/                        # Shadcn UI components
├── pages/
│   ├── Index.tsx                  # Main app logic & routing
│   ├── Dashboard.tsx              # Progress dashboard
│   └── NotFound.tsx               # 404 page
├── lib/
│   ├── sessionReport.ts           # PDF report generation
│   └── utils.ts                   # Utility functions
├── index.css                      # Global styles & design tokens
└── main.tsx                       # App entry point
```

---

## Design System

### Color Tokens (HSL)
- **Primary**: Blue-purple gradient (brand identity)
- **Secondary**: Teal-green (success, correct answers)
- **Accent**: Orange (highlights, CTAs)
- **Destructive**: Red (errors, incorrect answers)
- **Muted**: Neutral grays (secondary text, borders)

### Shadows
- **Soft**: Subtle elevation (cards, buttons)
- **Medium**: Pronounced depth (modals, important cards)
- **Strong**: Maximum emphasis (rarely used)

### Animations
- Fade-in on component mount
- Confetti on achievements
- Smooth transitions on theme toggle
- Loading spinners during API calls

---

## Testing Considerations

### Manual Testing Checklist
- [ ] Upload multiple PDFs and switch between them
- [ ] Generate quizzes with different configurations
- [ ] Complete quizzes and verify scoring accuracy
- [ ] Test chat with various questions
- [ ] Verify YouTube recommendations load correctly
- [ ] Check mind map generation and export
- [ ] Unlock badges and verify confetti
- [ ] Generate exam questions for all types
- [ ] End session and download report
- [ ] Upload previous session and verify comparison
- [ ] Toggle dark mode and verify all components
- [ ] Test on mobile/tablet responsiveness

---

## Known Limitations

1. **No Backend**: All data is client-side (lost on browser clear)
2. **API Rate Limits**: Free tier OpenRouter may rate limit
3. **PDF Size**: Large PDFs (>50 pages) may slow extraction
4. **Browser Compatibility**: Requires modern browsers (ES6+)
5. **Offline Mode**: Not available (requires APIs)

---

## Deployment Notes

- Static site deployment (Vercel, Netlify, etc.)
- Environment variables not needed (API keys hardcoded for MVP)
- No build-time configuration required
- Ensure HTTPS for API calls

---

## Conclusion

Study Buddy is a comprehensive, AI-powered study tool built entirely on the frontend. It combines PDF processing, AI-driven quiz generation, conversational chat, gamification, and progress tracking into a cohesive learning experience. The app prioritizes user experience with smooth interactions, visual feedback, and intelligent features while maintaining simplicity and performance.
