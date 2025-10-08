import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { CheckCircle2, XCircle, RotateCw, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { QuizResult } from "@/lib/sessionReport";

interface Question {
  type: "mcq" | "saq" | "laq";
  question: string;
  options?: string[];
  answer: string;
  explanation: string;
}

interface QuizComponentProps {
  questions: Question[];
  onComplete: (score: number, total: number, results: QuizResult[]) => void;
  onGenerateNew: () => void;
  isGenerating: boolean;
}

const QuizComponent = ({ questions, onComplete, onGenerateNew, isGenerating }: QuizComponentProps) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<string[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [results, setResults] = useState<boolean[]>([]);

  // Initialize userAnswers when questions change
  useEffect(() => {
    setUserAnswers(Array(questions.length).fill(""));
    setCurrentQuestionIndex(0);
    setShowResults(false);
    setResults([]);
  }, [questions]);

  const currentQuestion = questions[currentQuestionIndex];

  const handleAnswer = (answer: string) => {
    const newAnswers = [...userAnswers];
    newAnswers[currentQuestionIndex] = answer;
    setUserAnswers(newAnswers);
  };

  const handleNext = () => {
    if (!userAnswers[currentQuestionIndex]) {
      toast.error("Please provide an answer");
      return;
    }

    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      handleSubmit();
    }
  };

  const handleSubmit = () => {
    const newResults = questions.map((q, index) => {
      const userAnswer = userAnswers[index].toLowerCase().trim();
      const correctAnswer = q.answer.toLowerCase().trim();
      return userAnswer === correctAnswer;
    });
    setResults(newResults);
    setShowResults(true);
    const score = newResults.filter(Boolean).length;
    
    // Create detailed quiz results for PDF report
    const quizResults: QuizResult[] = questions.map((q, index) => ({
      question: q.question,
      userAnswer: userAnswers[index],
      correctAnswer: q.answer,
      isCorrect: newResults[index],
      type: q.type,
    }));
    
    onComplete(score, questions.length, quizResults);
    toast.success(`Quiz completed! Score: ${score}/${questions.length}`);
  };

  const resetQuiz = () => {
    setCurrentQuestionIndex(0);
    setUserAnswers(Array(questions.length).fill(""));
    setShowResults(false);
    setResults([]);
  };

  if (questions.length === 0) {
    return (
      <Card className="p-8 shadow-soft border-border/50 text-center">
        <p className="text-muted-foreground mb-4">No questions generated yet</p>
        <Button onClick={onGenerateNew} disabled={isGenerating} className="shadow-soft">
          {isGenerating ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Generating...
            </>
          ) : (
            "Generate Quiz"
          )}
        </Button>
      </Card>
    );
  }

  if (showResults) {
    return (
      <div className="space-y-4">
        <Card className="p-6 shadow-medium border-border/50 gradient-primary">
          <div className="text-center text-primary-foreground">
            <h2 className="text-2xl font-bold mb-2">Quiz Results</h2>
            <p className="text-3xl font-bold">
              {results.filter(Boolean).length} / {questions.length}
            </p>
            <p className="text-sm opacity-90 mt-1">
              {Math.round((results.filter(Boolean).length / questions.length) * 100)}% Score
            </p>
          </div>
        </Card>

        {questions.map((question, index) => (
          <Card key={index} className="p-6 shadow-soft border-border/50">
            <div className="flex items-start gap-3 mb-4">
              {results[index] ? (
                <CheckCircle2 className="h-6 w-6 text-secondary shrink-0 mt-1" />
              ) : (
                <XCircle className="h-6 w-6 text-destructive shrink-0 mt-1" />
              )}
              <div className="flex-1">
                <h3 className="font-semibold mb-2">{question.question}</h3>
                <div className="space-y-2 text-sm">
                  <p>
                    <span className="font-medium">Your answer:</span>{" "}
                    <span className={results[index] ? "text-secondary" : "text-destructive"}>
                      {userAnswers[index]}
                    </span>
                  </p>
                  {!results[index] && (
                    <p>
                      <span className="font-medium">Correct answer:</span>{" "}
                      <span className="text-secondary">{question.answer}</span>
                    </p>
                  )}
                  <p className="text-muted-foreground italic">{question.explanation}</p>
                </div>
              </div>
            </div>
          </Card>
        ))}

        <div className="flex gap-3">
          <Button onClick={resetQuiz} variant="outline" className="flex-1">
            Retry Quiz
          </Button>
          <Button onClick={onGenerateNew} disabled={isGenerating} className="flex-1 shadow-soft">
            {isGenerating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <RotateCw className="mr-2 h-4 w-4" />
                New Quiz
              </>
            )}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <Card className="p-6 shadow-soft border-border/50">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm font-medium text-muted-foreground">
            Question {currentQuestionIndex + 1} of {questions.length}
          </span>
          <span className="px-3 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary">
            {currentQuestion.type.toUpperCase()}
          </span>
        </div>
        <h3 className="text-lg font-semibold mb-4">{currentQuestion.question}</h3>

        {currentQuestion.type === "mcq" && currentQuestion.options ? (
          <RadioGroup
            value={userAnswers[currentQuestionIndex] || ""}
            onValueChange={handleAnswer}
            className="space-y-3"
          >
            {currentQuestion.options.map((option, index) => (
              <div
                key={index}
                className="flex items-center space-x-3 p-3 rounded-lg border border-border hover:bg-muted/30 transition-colors"
              >
                <RadioGroupItem value={option} id={`option-${index}`} />
                <Label htmlFor={`option-${index}`} className="flex-1 cursor-pointer">
                  {option}
                </Label>
              </div>
            ))}
          </RadioGroup>
        ) : (
          <Textarea
            value={userAnswers[currentQuestionIndex] || ""}
            onChange={(e) => handleAnswer(e.target.value)}
            placeholder="Type your answer here..."
            className="min-h-32"
          />
        )}
      </div>

      <div className="flex gap-3">
        {currentQuestionIndex > 0 && (
          <Button
            variant="outline"
            onClick={() => setCurrentQuestionIndex(currentQuestionIndex - 1)}
          >
            Previous
          </Button>
        )}
        <Button onClick={handleNext} className="ml-auto shadow-soft">
          {currentQuestionIndex === questions.length - 1 ? "Submit" : "Next"}
        </Button>
      </div>
    </Card>
  );
};

export default QuizComponent;
