import { useState, useRef } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import WelcomeScreen from "@/components/WelcomeScreen";
import PDFUploader from "@/components/PDFUploader";
import PDFViewer from "@/components/PDFViewer";
import QuizConfig, { QuizConfig as QuizConfigType } from "@/components/QuizConfig";
import QuizComponent from "@/components/QuizComponent";
import ChatInterface from "@/components/ChatInterface";
import YouTubeRecommendations from "@/components/YouTubeRecommendations";
import StudyStreaks from "@/components/StudyStreaks";
import ExamQuestionGenerator from "@/components/ExamQuestionGenerator";
import ThemeToggle from "@/components/ThemeToggle";
import Dashboard from "./Dashboard";
import { BookOpen, MessageSquare, Video, BarChart3, Sparkles, FileText, Flame, GraduationCap, Check } from "lucide-react";
import { toast } from "sonner";
import { pdfjs } from "react-pdf";
import { 
  SessionData, 
  PreviousSessionData, 
  QuizResult, 
  generateSessionReport, 
  generateComparisonReport 
} from "@/lib/sessionReport";

const OPENROUTER_API_KEY: string = import.meta.env.VITE_OPENROUTER_API_KEY ?? "";
const YOUTUBE_API_KEY: string     = import.meta.env.VITE_YOUTUBE_API_KEY ?? "";

if (typeof window !== "undefined") {
  if (!OPENROUTER_API_KEY) {
    console.warn("VITE_OPENROUTER_API_KEY is not set. Chat/AI features may not work.");
  }
  if (!YOUTUBE_API_KEY) {
    console.warn("VITE_YOUTUBE_API_KEY is not set. YouTube recommendation features may not work.");
  }
}

interface Question {
  type: "mcq" | "saq" | "laq";
  question: string;
  options?: string[];
  answer: string;
  explanation: string;
}

interface QuizHistory {
  score: number;
  total: number;
  topic: string;
  timestamp: Date;
}

const Index = () => {
  const [showWelcome, setShowWelcome] = useState(true);
  const [showPreviousSessionDialog, setShowPreviousSessionDialog] = useState(false);
  const [previousSession, setPreviousSession] = useState<PreviousSessionData | null>(null);
  
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [selectedPDFs, setSelectedPDFs] = useState<string[]>([]);
  const [pdfContent, setPdfContent] = useState<string>("");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [askedQuestions, setAskedQuestions] = useState<Question[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [quizHistory, setQuizHistory] = useState<QuizHistory[]>([]);
  const [activeTab, setActiveTab] = useState("quiz");
  
  const [sessionStartTime] = useState(new Date());
  const [sessionQuizResults, setSessionQuizResults] = useState<QuizResult[]>([]);

  const handleStart = () => {
    setShowWelcome(false);
    setShowPreviousSessionDialog(true);
  };

  const handlePreviousSessionUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      toast.success("Previous session report loaded");
      setShowPreviousSessionDialog(false);
    } catch (error) {
      toast.error("Failed to load previous session");
    }
  };

  const handleSkipPreviousSession = () => {
    setShowPreviousSessionDialog(false);
  };

  const handleUpload = async (file: File) => {
    const newFiles = [...uploadedFiles, file];
    setUploadedFiles(newFiles);
    
    if (uploadedFiles.length === 0) {
      await extractPDFContent(file);
      setSelectedPDFs([file.name]);
    }
    
    toast.success("PDF uploaded successfully!");
  };

  const extractPDFContent = async (file: File) => {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise;
      let fullText = "";
      
      for (let i = 1; i <= Math.min(pdf.numPages, 10); i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items.map((item: any) => item.str).join(" ");
        fullText += pageText + " ";
      }
      
      setPdfContent(fullText);
      toast.success("PDF processed successfully!");
    } catch (error) {
      console.error("PDF processing error:", error);
      toast.error("Failed to process PDF");
    }
  };

  const handleRemoveFile = (index: number) => {
    const removedFileName = uploadedFiles[index].name;
    const newFiles = uploadedFiles.filter((_, i) => i !== index);
    setUploadedFiles(newFiles);
    
    const newSelected = selectedPDFs.filter(name => name !== removedFileName);
    setSelectedPDFs(newSelected);
  
    if (newFiles.length === 0 || newSelected.length === 0) {
      setPdfContent("");
    }
  };

  const handleTogglePDFSelection = (fileName: string) => {
    if (selectedPDFs.includes(fileName)) {
      const newSelected = selectedPDFs.filter(name => name !== fileName);
      setSelectedPDFs(newSelected);
      if (newSelected.length === 0) {
        setPdfContent("");
      }
    } else {
      const file = uploadedFiles.find(f => f.name === fileName);
      if (file) {
        extractPDFContent(file);
        setSelectedPDFs([...selectedPDFs, fileName]);
      }
    }
  };

  const generateQuiz = async (config: QuizConfigType) => {
    if (!pdfContent) {
      toast.error("Please upload a PDF first");
      return;
    }

    setIsGenerating(true);
    try {
      let questionPrompt = "";
      const count = config.questionCount;
      
      if (config.questionType === "mcq") {
        questionPrompt = `Generate ${count} Multiple Choice Questions (MCQs) with 4 options each.`;
      } else if (config.questionType === "subjective") {
        const saqCount = Math.floor(count * 0.6);
        const laqCount = count - saqCount;
        questionPrompt = `Generate ${saqCount} Short Answer Questions (SAQs) and ${laqCount} Long Answer Questions (LAQs).`;
      } else {
        const mcqCount = Math.floor(count * 0.4);
        const saqCount = Math.floor(count * 0.4);
        const laqCount = count - mcqCount - saqCount;
        questionPrompt = `Generate ${mcqCount} MCQs with 4 options each, ${saqCount} SAQs, and ${laqCount} LAQs.`;
      }

      let scopePrompt = "";
      if (config.scope === "topic" && config.topicOrPages) {
        scopePrompt = ` Focus specifically on the topic: "${config.topicOrPages}".`;
      } else if (config.scope === "pages" && config.topicOrPages) {
        scopePrompt = ` Focus on pages ${config.topicOrPages}.`;
      }

      const previousQuestionsText = askedQuestions.length > 0
        ? `\n\nIMPORTANT: Do NOT repeat these previously asked questions:\n${askedQuestions.map(q => `- ${q.question}`).join('\n')}`
        : "";

      if (!OPENROUTER_API_KEY) {
        throw new Error("OpenRouter API key not configured. Set VITE_OPENROUTER_API_KEY in .env");
      }

      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
          "HTTP-Referer": window.location.origin,
          "X-Title": "Study Buddy",
        },
        body: JSON.stringify({
          model: "deepseek/deepseek-chat",
          messages: [
            {
              role: "system",
              content: `${questionPrompt}${scopePrompt} Return ONLY valid JSON in this exact format with no additional text:
{
  "questions": [
    {
      "type": "mcq",
      "question": "question text",
      "options": ["A", "B", "C", "D"],
      "answer": "B",
      "explanation": "explanation text"
    },
    {
      "type": "saq",
      "question": "question text",
      "answer": "short answer",
      "explanation": "explanation text"
    },
    {
      "type": "laq",
      "question": "question text",
      "answer": "detailed answer",
      "explanation": "explanation text"
    }
  ]
}${previousQuestionsText}`,
            },
            {
              role: "user",
              content: pdfContent.slice(0, 4000),
            },
          ],
        }),
      });

      const data = await response.json();
      const content = data.choices[0].message.content;
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error("Invalid response format");
      }
      
      const parsed = JSON.parse(jsonMatch[0]);
      const newQuestions = parsed.questions || [];
      setQuestions(newQuestions);
      setAskedQuestions([...askedQuestions, ...newQuestions]);
      toast.success("Quiz generated successfully!");
    } catch (error: any) {
      console.error("Quiz generation error:", error);
      toast.error(error?.message || "Failed to generate quiz. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleQuizComplete = (score: number, total: number, results: QuizResult[]) => {
    const newHistory: QuizHistory = {
      score,
      total,
      topic: selectedPDFs.join(", ") || "Quiz",
      timestamp: new Date(),
    };
    setQuizHistory([...quizHistory, newHistory]);
    setSessionQuizResults([...sessionQuizResults, ...results]);
  };

  const handleNewQuiz = () => {
    setQuestions([]);
    setActiveTab("quiz");
  };

  const handleEndSession = () => {
    if (sessionQuizResults.length === 0) {
      toast.error("Complete at least one quiz before ending session");
      return;
    }
    const incorrectResults = sessionQuizResults.filter(r => !r.isCorrect);
    const weakAreas = incorrectResults.map(r => r.question.substring(0, 80) + "...");

    const sessionData: SessionData = {
      startTime: sessionStartTime,
      endTime: new Date(),
      quizResults: sessionQuizResults,
      totalQuestions: sessionQuizResults.length,
      correctAnswers: sessionQuizResults.filter(r => r.isCorrect).length,
      incorrectAnswers: incorrectResults.length,
      weakAreas: weakAreas.slice(0, 10),
    };

    let reportDataUrl: string;
    if (previousSession) {
      reportDataUrl = generateComparisonReport(sessionData, previousSession);
      toast.success("Comparison report generated!");
    } else {
      reportDataUrl = generateSessionReport(sessionData);
      toast.success("Session report generated!");
    }
    const link = document.createElement("a");
    link.href = reportDataUrl;
    link.download = `study-buddy-session-${new Date().toISOString().split('T')[0]}.pdf`;
    link.click();
  };

  if (showWelcome) {
    return <WelcomeScreen onStart={handleStart} />;
  }

  return (
    <>
      {}
      <Dialog open={showPreviousSessionDialog} onOpenChange={setShowPreviousSessionDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Previous Session Report</DialogTitle>
            <DialogDescription>
              Do you have a previous session report? Upload it to track your progress over time.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="previous-session">Upload Previous Report (Optional)</Label>
              <Input
                id="previous-session"
                type="file"
                accept="application/pdf"
                onChange={handlePreviousSessionUpload}
              />
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleSkipPreviousSession} className="flex-1">
                Skip
              </Button>
              <Button onClick={handleSkipPreviousSession} className="flex-1">
                Continue
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      
      <div className="min-h-screen p-4 md:p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl gradient-primary shadow-medium">
                <BookOpen className="h-8 w-8 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">Study Buddy</h1>
                <p className="text-muted-foreground text-sm">Your AI-powered learning companion</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <ThemeToggle />
              <Button onClick={handleEndSession} variant="outline" className="gap-2">
                <FileText className="h-4 w-4" />
                End Session & Generate Report
              </Button>
            </div>
          </div>

          <div className="space-y-4">
            <PDFUploader
              onUpload={handleUpload}
              uploadedFiles={uploadedFiles}
              onRemove={handleRemoveFile}
            />
            
            {uploadedFiles.length > 0 && (
              <Card className="p-4 shadow-soft">
                <h4 className="font-semibold mb-3">Select Active PDFs</h4>
                <div className="flex flex-wrap gap-2">
                  {uploadedFiles.map((file) => (
                    <Button
                      key={file.name}
                      variant={selectedPDFs.includes(file.name) ? "default" : "outline"}
                      size="sm"
                      onClick={() => handleTogglePDFSelection(file.name)}
                      className="gap-2"
                    >
                      {selectedPDFs.includes(file.name) && <Check className="h-4 w-4" />}
                      {file.name}
                    </Button>
                  ))}
                </div>
              </Card>
            )}
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-6 lg:w-auto lg:inline-grid shadow-soft">
              <TabsTrigger value="quiz" className="gap-2">
                <Sparkles className="h-4 w-4" />
                Quiz
              </TabsTrigger>
              <TabsTrigger value="chat" className="gap-2">
                <MessageSquare className="h-4 w-4" />
                Chat
              </TabsTrigger>
              <TabsTrigger value="videos" className="gap-2">
                <Video className="h-4 w-4" />
                Videos
              </TabsTrigger>
              <TabsTrigger value="streaks" className="gap-2">
                <Flame className="h-4 w-4" />
                Streaks
              </TabsTrigger>
              <TabsTrigger value="exam" className="gap-2">
                <GraduationCap className="h-4 w-4" />
                Exam
              </TabsTrigger>
              <TabsTrigger value="progress" className="gap-2">
                <BarChart3 className="h-4 w-4" />
                Progress
              </TabsTrigger>
            </TabsList>

            <div className="mt-6">
              <TabsContent value="quiz" className="space-y-6">
                <div className="grid lg:grid-cols-2 gap-6">
                  <div className="space-y-6">
                    {questions.length === 0 ? (
                      <QuizConfig onGenerate={generateQuiz} isGenerating={isGenerating} />
                    ) : (
                      <>
                        <QuizComponent
                          questions={questions}
                          onComplete={handleQuizComplete}
                          onGenerateNew={handleNewQuiz}
                          isGenerating={isGenerating}
                        />
                      </>
                    )}
                  </div>
                  <div className="h-[600px]">
                    <PDFViewer file={uploadedFiles.find(f => selectedPDFs.includes(f.name)) || null} />
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="chat" className="space-y-6">
                <div className="grid lg:grid-cols-2 gap-6">
                  <div className="h-[600px]">
                    <ChatInterface pdfContent={pdfContent} apiKey={OPENROUTER_API_KEY} />
                  </div>
                  <div className="h-[600px]">
                    <PDFViewer file={uploadedFiles.find(f => selectedPDFs.includes(f.name)) || null} />
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="videos">
                <YouTubeRecommendations
                  pdfContent={pdfContent}
                  apiKey={YOUTUBE_API_KEY}
                  openRouterKey={OPENROUTER_API_KEY}
                />
              </TabsContent>

              <TabsContent value="streaks">
                <StudyStreaks />
              </TabsContent>

              <TabsContent value="exam">
                <ExamQuestionGenerator pdfContent={pdfContent} apiKey={OPENROUTER_API_KEY} />
              </TabsContent>

              <TabsContent value="progress">
                <Dashboard quizHistory={quizHistory} />
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </div>
    </>
  );
};

export default Index;
