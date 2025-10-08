import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Download, FileText } from "lucide-react";
import { toast } from "sonner";
import jsPDF from "jspdf";

interface ExamQuestion {
  question: string;
  type: "mcq" | "saq" | "laq";
  options?: string[];
  answer: string;
  marks: number;
}

interface ExamQuestionGeneratorProps {
  pdfContent: string;
  apiKey: string;
}

const ExamQuestionGenerator = ({ pdfContent, apiKey }: ExamQuestionGeneratorProps) => {
  const [examType, setExamType] = useState<string>("10th-boards");
  const [difficulty, setDifficulty] = useState<"easy" | "medium" | "hard">("medium");
  const [questions, setQuestions] = useState<ExamQuestion[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);

  const examTypes = [
    { value: "10th-boards", label: "10th Board Exam" },
    { value: "12th-boards", label: "12th Board Exam" },
    { value: "jee", label: "JEE (Joint Entrance Exam)" },
    { value: "cat", label: "CAT (Common Admission Test)" },
    { value: "neet", label: "NEET (Medical Entrance)" },
  ];

  const generateExamQuestions = async () => {
    if (!pdfContent) {
      toast.error("Please upload a PDF first");
      return;
    }

    setIsGenerating(true);
    try {
      const examLabel = examTypes.find(e => e.value === examType)?.label || examType;
      
      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Content-Type": "application/json",
          "HTTP-Referer": window.location.origin,
          "X-Title": "Study Buddy",
        },
        body: JSON.stringify({
          model: "deepseek/deepseek-chat",
          messages: [
            {
              role: "system",
              content: `Generate exam-style questions for ${examLabel} with ${difficulty} difficulty level.
              
Return ONLY valid JSON in this format:
{
  "questions": [
    {
      "type": "mcq",
      "question": "question text",
      "options": ["A", "B", "C", "D"],
      "answer": "B",
      "marks": 1
    },
    {
      "type": "saq",
      "question": "question text",
      "answer": "short answer",
      "marks": 2
    },
    {
      "type": "laq",
      "question": "question text",
      "answer": "detailed answer",
      "marks": 5
    }
  ]
}

Guidelines:
- For ${examType}: Use appropriate question patterns and difficulty
- ${difficulty === "easy" ? "Focus on fundamental concepts and basic understanding" : ""}
- ${difficulty === "medium" ? "Include application-based and moderate complexity questions" : ""}
- ${difficulty === "hard" ? "Include complex scenarios, critical thinking, and advanced concepts" : ""}
- Include a mix of MCQs (1 mark), SAQs (2-3 marks), and LAQs (5 marks)
- Total should be around 10-15 questions
- Make questions relevant to the exam pattern`,
            },
            {
              role: "user",
              content: `Generate exam questions from this content:\n\n${pdfContent.slice(0, 4000)}`,
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
      setQuestions(parsed.questions || []);
      toast.success("Exam questions generated!");
    } catch (error) {
      console.error("Exam question generation error:", error);
      toast.error("Failed to generate exam questions");
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadQuestions = () => {
    const pdf = new jsPDF();
    const examLabel = examTypes.find(e => e.value === examType)?.label || examType;
    
    pdf.setFontSize(18);
    pdf.text(`${examLabel} - ${difficulty.toUpperCase()} Level`, 20, 20);
    
    pdf.setFontSize(10);
    pdf.text(`Total Questions: ${questions.length}`, 20, 30);
    pdf.text(`Total Marks: ${questions.reduce((sum, q) => sum + q.marks, 0)}`, 20, 35);
    
    let yPosition = 50;
    
    questions.forEach((q, index) => {
      if (yPosition > 270) {
        pdf.addPage();
        yPosition = 20;
      }
      
      pdf.setFontSize(11);
      pdf.setFont(undefined, "bold");
      const questionText = `Q${index + 1}. ${q.question} [${q.marks} marks]`;
      const questionLines = pdf.splitTextToSize(questionText, 170);
      pdf.text(questionLines, 20, yPosition);
      yPosition += questionLines.length * 7;
      
      if (q.type === "mcq" && q.options) {
        pdf.setFont(undefined, "normal");
        q.options.forEach((option, optIndex) => {
          pdf.text(`   ${String.fromCharCode(65 + optIndex)}. ${option}`, 25, yPosition);
          yPosition += 7;
        });
      } else {
        yPosition += 15;
      }
      
      yPosition += 5;
    });
    
    pdf.save(`${examType}-${difficulty}-questions.pdf`);
    toast.success("Question paper downloaded!");
  };

  return (
    <Card className="p-6 shadow-soft border-border/50">
      <div className="flex items-center gap-3 mb-6">
        <FileText className="h-6 w-6 text-primary" />
        <h2 className="text-xl font-semibold">Exam Question Generator</h2>
      </div>

      <div className="space-y-6">
        {/* Exam Type Selection */}
        <div className="space-y-3">
          <Label className="text-base font-medium">Exam Type</Label>
          <Select value={examType} onValueChange={setExamType}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {examTypes.map((exam) => (
                <SelectItem key={exam.value} value={exam.value}>
                  {exam.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Difficulty Level */}
        <div className="space-y-3">
          <Label className="text-base font-medium">Difficulty Level</Label>
          <RadioGroup value={difficulty} onValueChange={(val: any) => setDifficulty(val)}>
            <div className="grid grid-cols-3 gap-3">
              {["easy", "medium", "hard"].map((level) => (
                <div
                  key={level}
                  className="flex items-center space-x-2 p-3 rounded-lg border border-border hover:bg-muted/30"
                >
                  <RadioGroupItem value={level} id={`diff-${level}`} />
                  <Label htmlFor={`diff-${level}`} className="cursor-pointer flex-1 capitalize">
                    {level}
                  </Label>
                </div>
              ))}
            </div>
          </RadioGroup>
        </div>

        <Button
          onClick={generateExamQuestions}
          disabled={isGenerating}
          className="w-full shadow-soft"
        >
          {isGenerating ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Generating...
            </>
          ) : (
            "Generate Exam Questions"
          )}
        </Button>

        {questions.length > 0 && (
          <div className="space-y-4">
            <div className="p-4 rounded-lg gradient-primary text-primary-foreground">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm opacity-90">Total Questions</div>
                  <div className="text-2xl font-bold">{questions.length}</div>
                </div>
                <div>
                  <div className="text-sm opacity-90">Total Marks</div>
                  <div className="text-2xl font-bold">
                    {questions.reduce((sum, q) => sum + q.marks, 0)}
                  </div>
                </div>
              </div>
            </div>

            <Button onClick={downloadQuestions} variant="outline" className="w-full">
              <Download className="mr-2 h-4 w-4" />
              Download Question Paper (PDF)
            </Button>
          </div>
        )}
      </div>
    </Card>
  );
};

export default ExamQuestionGenerator;
