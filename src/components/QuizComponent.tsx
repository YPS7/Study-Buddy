/// <reference types="vite/client" />
import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { CheckCircle2, XCircle, RotateCw, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { QuizResult } from "@/lib/sessionReport";

// small helpers to read Vite env variables (VITE_ prefix must be used in .env)
const getOpenRouterKey = (): string => {
  return (import.meta.env.VITE_OPENROUTER_API_KEY as string) || "";
};
const getYouTubeKey = (): string => {
  return (import.meta.env.VITE_YOUTUBE_API_KEY as string) || "";
};

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

const LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const letterForIndex = (i: number) => LETTERS[i] || String(i + 1);
const indexForLetter = (ch: string) => LETTERS.indexOf((ch || "").toUpperCase());
const normalize = (s = "") => (s || "").toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();

const deriveCorrectIndex = (q: Question): number | null => {
  if (!q.options || q.options.length === 0) return null;
  const ca = (q.answer || "").trim();

  // If answer begins with a letter (A, B, C...)
  const m = ca.match(/^[A-Za-z]/);
  if (m) {
    const idx = indexForLetter(m[0]);
    if (idx >= 0 && idx < q.options.length) return idx;
  }

  // Try normalized text equality
  const nca = normalize(ca);
  for (let i = 0; i < q.options.length; i++) {
    if (normalize(q.options[i]) === nca) return i;
  }

  // Loose contains match
  for (let i = 0; i < q.options.length; i++) {
    const no = normalize(q.options[i]);
    if (no && (nca.includes(no) || no.includes(nca))) return i;
  }

  return null;
};

const formatMcq = (q: Question, ansLetter: string): string => {
  if (!q.options?.length) return ansLetter;
  const letter = (ansLetter || "")[0] || "";
  const idx = indexForLetter(letter);
  if (idx >= 0 && idx < q.options.length) {
    return `${letterForIndex(idx)}. ${q.options[idx]}`;
  }
  return ansLetter;
};

const QuizComponent = ({ questions, onComplete, onGenerateNew, isGenerating }: QuizComponentProps) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<string[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [results, setResults] = useState<boolean[]>([]);
  const [isEvaluating, setIsEvaluating] = useState(false);

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

  const checkSemanticSimilarity = async (q: Question, userAnswer: string): Promise<boolean> => {
    const ua = (userAnswer || "").trim();
    const ca = (q.answer || "").trim();

    // MCQ: strict letter index matching when possible
    if (q.type === "mcq" && q.options?.length) {
      const userIdx = indexForLetter((ua || "")[0]);
      const correctIdx = deriveCorrectIndex(q);

      // If user picked a letter and correct index is known -> strict compare
      if (userIdx >= 0 && correctIdx != null) {
        return userIdx === correctIdx;
      }

      // If user stored full text or letter parsing failed, try to map by normalized text
      const nUa = normalize(ua);
      const foundIdx = q.options.findIndex((o) => normalize(o) === nUa);
      if (foundIdx >= 0) {
        // we do NOT mutate state here; return true/false based on equality
        if (correctIdx != null) return foundIdx === correctIdx;
        return normalize(q.options[foundIdx]) === normalize(ca);
      }

      // Final fallback: compare normalized selected option text (if we can get userIdx)
      if (userIdx >= 0) {
        const userText = q.options[userIdx] ?? ua;
        return normalize(userText) === normalize(ca);
      }

      // Fallback textual equality with correct answer
      return normalize(ua) === normalize(ca);
    }

    // SAQ/LAQ: semantic check via OpenRouter (browser). If fails, fallback to normalized text equality.
    try {
      const apiKey = getOpenRouterKey();
      if (!apiKey) throw new Error("OpenRouter key not configured");

      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "deepseek/deepseek-chat",
          messages: [
            {
              role: "system",
              content:
                "You are an answer evaluation assistant. Compare the user's answer with the correct answer and determine if they convey the same meaning, even if worded differently. Respond with only 'YES' if the meanings match or are very similar, or 'NO' if they are different.",
            },
            {
              role: "user",
              content: `User's Answer: "${ua}"\n\nCorrect Answer: "${ca}"\n\nDo these answers have the same meaning?`,
            },
          ],
        }),
      });

      const data = await response.json();
      const aiResponse = data.choices?.[0]?.message?.content?.trim().toUpperCase();
      return aiResponse === "YES";
    } catch (error) {
      console.error("Error checking semantic similarity:", error);
      return normalize(ua) === normalize(ca);
    }
  };

  const handleSubmit = async () => {
    setIsEvaluating(true);

    try {
      const newResults = await Promise.all(
        questions.map(async (q, index) => {
          return await checkSemanticSimilarity(q, userAnswers[index] || "");
        })
      );

      setResults(newResults);
      setShowResults(true);
      const score = newResults.filter(Boolean).length;

      // Create detailed quiz results for PDF report with formatted MCQ displays
      const quizResults: QuizResult[] = questions.map((q, index) => {
        const ua = userAnswers[index] || "";
        const displayedAnswer = q.type === "mcq" ? formatMcq(q, ua) : ua;
        const correctIdx = q.type === "mcq" ? deriveCorrectIndex(q) : null;
        const displayedCorrect = q.type === "mcq" && correctIdx != null && q.options
          ? `${letterForIndex(correctIdx)}. ${q.options[correctIdx]}`
          : q.answer;

        return {
          question: q.question,
          userAnswer: displayedAnswer,
          correctAnswer: displayedCorrect,
          isCorrect: newResults[index],
          type: q.type,
        };
      });

      onComplete(score, questions.length, quizResults);
      toast.success(`Quiz completed! Score: ${score}/${questions.length}`);
    } catch (error) {
      toast.error("Error evaluating answers. Please try again.");
      console.error("Error in handleSubmit:", error);
    } finally {
      setIsEvaluating(false);
    }
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
                      {question.type === "mcq" ? formatMcq(question, userAnswers[index] || "") : (userAnswers[index] || "")}
                    </span>
                  </p>
                  {!results[index] && (
                    <p>
                      <span className="font-medium">Correct answer:</span>{" "}
                      <span className="text-secondary">
                        {question.type === "mcq" && question.options?.length
                          ? (deriveCorrectIndex(question) != null
                              ? `${letterForIndex(deriveCorrectIndex(question)!)}. ${question.options[deriveCorrectIndex(question)!]}`
                              : question.answer)
                          : question.answer}
                      </span>
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
            {currentQuestion.options.map((option, index) => {
              const letter = String.fromCharCode(65 + index);
              const id = `option-${index}`;
              return (
                <div
                  key={index}
                  className="flex items-center space-x-3 p-3 rounded-lg border border-border hover:bg-muted/30 transition-colors"
                >
                  <RadioGroupItem value={letter} id={id} />
                  <Label htmlFor={id} className="flex-1 cursor-pointer">
                    <span className="font-medium mr-2">{letter}.</span> {option}
                  </Label>
                </div>
              );
            })}
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
        <Button onClick={handleNext} disabled={isEvaluating} className="ml-auto shadow-soft">
          {isEvaluating ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Evaluating...
            </>
          ) : currentQuestionIndex === questions.length - 1 ? "Submit" : "Next"}
        </Button>
      </div>
    </Card>
  );
};

export default QuizComponent;
