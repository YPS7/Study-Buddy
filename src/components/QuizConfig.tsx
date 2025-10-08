import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Input } from "@/components/ui/input";
import { Loader2 } from "lucide-react";

interface QuizConfigProps {
  onGenerate: (config: QuizConfig) => void;
  isGenerating: boolean;
}

export interface QuizConfig {
  questionCount: number;
  questionType: "mcq" | "subjective" | "mixed";
  scope: "whole" | "topic" | "pages";
  topicOrPages?: string;
}

const QuizConfig = ({ onGenerate, isGenerating }: QuizConfigProps) => {
  const [questionCount, setQuestionCount] = useState<number>(10);
  const [questionType, setQuestionType] = useState<"mcq" | "subjective" | "mixed">("mixed");
  const [scope, setScope] = useState<"whole" | "topic" | "pages">("whole");
  const [topicOrPages, setTopicOrPages] = useState("");

  const handleGenerate = () => {
    const config: QuizConfig = {
      questionCount,
      questionType,
      scope,
      topicOrPages: scope !== "whole" ? topicOrPages : undefined,
    };
    onGenerate(config);
  };

  return (
    <Card className="p-6 shadow-soft border-border/50 space-y-6">
      <h2 className="text-xl font-semibold">Quiz Configuration</h2>

      {/* Question Count */}
      <div className="space-y-3">
        <Label className="text-base font-medium">Number of Questions</Label>
        <RadioGroup
          value={questionCount.toString()}
          onValueChange={(val) => setQuestionCount(parseInt(val))}
        >
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[5, 10, 20, 30].map((count) => (
              <div key={count} className="flex items-center space-x-2 p-3 rounded-lg border border-border hover:bg-muted/30">
                <RadioGroupItem value={count.toString()} id={`count-${count}`} />
                <Label htmlFor={`count-${count}`} className="cursor-pointer flex-1">
                  {count} Questions
                </Label>
              </div>
            ))}
          </div>
        </RadioGroup>
      </div>

      {/* Question Type */}
      <div className="space-y-3">
        <Label className="text-base font-medium">Question Type</Label>
        <RadioGroup value={questionType} onValueChange={(val: any) => setQuestionType(val)}>
          <div className="space-y-2">
            <div className="flex items-center space-x-2 p-3 rounded-lg border border-border hover:bg-muted/30">
              <RadioGroupItem value="mcq" id="type-mcq" />
              <Label htmlFor="type-mcq" className="cursor-pointer flex-1">
                Only MCQs
              </Label>
            </div>
            <div className="flex items-center space-x-2 p-3 rounded-lg border border-border hover:bg-muted/30">
              <RadioGroupItem value="subjective" id="type-subjective" />
              <Label htmlFor="type-subjective" className="cursor-pointer flex-1">
                Only Subjective (SAQs & LAQs)
              </Label>
            </div>
            <div className="flex items-center space-x-2 p-3 rounded-lg border border-border hover:bg-muted/30">
              <RadioGroupItem value="mixed" id="type-mixed" />
              <Label htmlFor="type-mixed" className="cursor-pointer flex-1">
                Mixed (MCQs + Subjective)
              </Label>
            </div>
          </div>
        </RadioGroup>
      </div>

      {/* Quiz Scope */}
      <div className="space-y-3">
        <Label className="text-base font-medium">Quiz Scope</Label>
        <RadioGroup value={scope} onValueChange={(val: any) => setScope(val)}>
          <div className="space-y-2">
            <div className="flex items-center space-x-2 p-3 rounded-lg border border-border hover:bg-muted/30">
              <RadioGroupItem value="whole" id="scope-whole" />
              <Label htmlFor="scope-whole" className="cursor-pointer flex-1">
                Whole Book
              </Label>
            </div>
            <div className="flex items-center space-x-2 p-3 rounded-lg border border-border hover:bg-muted/30">
              <RadioGroupItem value="topic" id="scope-topic" />
              <Label htmlFor="scope-topic" className="cursor-pointer flex-1">
                Specific Topic
              </Label>
            </div>
            <div className="flex items-center space-x-2 p-3 rounded-lg border border-border hover:bg-muted/30">
              <RadioGroupItem value="pages" id="scope-pages" />
              <Label htmlFor="scope-pages" className="cursor-pointer flex-1">
                Specific Pages
              </Label>
            </div>
          </div>
        </RadioGroup>

        {scope !== "whole" && (
          <Input
            placeholder={scope === "topic" ? "Enter topic (e.g., Photosynthesis)" : "Enter page range (e.g., 10-25)"}
            value={topicOrPages}
            onChange={(e) => setTopicOrPages(e.target.value)}
          />
        )}
      </div>

      <Button
        onClick={handleGenerate}
        disabled={isGenerating || (scope !== "whole" && !topicOrPages)}
        className="w-full shadow-soft"
      >
        {isGenerating ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Generating Quiz...
          </>
        ) : (
          "Generate Quiz"
        )}
      </Button>
    </Card>
  );
};

// Add useState import at the top
import { useState } from "react";

export default QuizConfig;
