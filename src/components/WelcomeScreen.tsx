import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { BookOpen, Sparkles, Brain, Target } from "lucide-react";
import ThemeToggle from "./ThemeToggle";

interface WelcomeScreenProps {
  onStart: () => void;
}

const WelcomeScreen = ({ onStart }: WelcomeScreenProps) => {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="absolute top-6 right-6">
        <ThemeToggle />
      </div>
      <Card className="max-w-3xl w-full p-8 md:p-12 shadow-elegant border-border/50">
        <div className="text-center space-y-6">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-4 rounded-2xl gradient-primary shadow-medium animate-fade-in">
              <BookOpen className="h-12 w-12 text-primary-foreground" />
            </div>
          </div>
          
          <div className="space-y-3">
            <h1 className="text-5xl font-bold gradient-text">Welcome to Study Buddy</h1>
            <p className="text-xl text-muted-foreground font-medium">
              Your AI-Powered Learning Companion for Academic Excellence
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-4 py-8">
            <div className="space-y-2">
              <div className="p-3 rounded-xl bg-primary/10 w-fit mx-auto">
                <Sparkles className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold">Smart Quizzes</h3>
              <p className="text-sm text-muted-foreground">
                Generate personalized quizzes from your coursebooks
              </p>
            </div>
            
            <div className="space-y-2">
              <div className="p-3 rounded-xl bg-primary/10 w-fit mx-auto">
                <Brain className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold">AI Tutor Chat</h3>
              <p className="text-sm text-muted-foreground">
                Get detailed explanations with citations and examples
              </p>
            </div>
            
            <div className="space-y-2">
              <div className="p-3 rounded-xl bg-primary/10 w-fit mx-auto">
                <Target className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold">Track Progress</h3>
              <p className="text-sm text-muted-foreground">
                Monitor your learning journey and identify weak areas
              </p>
            </div>
          </div>

          <Button
            size="lg"
            onClick={onStart}
            className="shadow-soft px-8 text-lg h-12"
          >
            Start Learning
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default WelcomeScreen;
