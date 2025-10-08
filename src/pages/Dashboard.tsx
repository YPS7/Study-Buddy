import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Trophy, TrendingUp, BookOpen, CheckCircle } from "lucide-react";

interface DashboardProps {
  quizHistory: Array<{
    score: number;
    total: number;
    topic: string;
    timestamp: Date;
  }>;
}

const Dashboard = ({ quizHistory }: DashboardProps) => {
  const totalQuizzes = quizHistory.length;
  const averageScore = totalQuizzes > 0
    ? Math.round((quizHistory.reduce((acc, quiz) => acc + (quiz.score / quiz.total) * 100, 0) / totalQuizzes))
    : 0;
  
  const recentQuizzes = quizHistory.slice(-5).reverse();

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Your Progress</h1>
        <p className="text-muted-foreground">Track your learning journey</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="p-6 shadow-soft border-border/50 hover:shadow-medium transition-shadow">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl gradient-primary">
              <Trophy className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Quizzes</p>
              <p className="text-2xl font-bold">{totalQuizzes}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6 shadow-soft border-border/50 hover:shadow-medium transition-shadow">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl gradient-secondary">
              <TrendingUp className="h-6 w-6 text-secondary-foreground" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Average Score</p>
              <p className="text-2xl font-bold">{averageScore}%</p>
            </div>
          </div>
        </Card>

        <Card className="p-6 shadow-soft border-border/50 hover:shadow-medium transition-shadow">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl gradient-accent">
              <BookOpen className="h-6 w-6 text-accent-foreground" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Study Sessions</p>
              <p className="text-2xl font-bold">{totalQuizzes}</p>
            </div>
          </div>
        </Card>
      </div>

      <Card className="p-6 shadow-soft border-border/50">
        <h2 className="text-xl font-bold mb-4">Recent Quizzes</h2>
        <div className="space-y-4">
          {recentQuizzes.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">No quizzes taken yet. Start learning!</p>
          ) : (
            recentQuizzes.map((quiz, index) => {
              const percentage = Math.round((quiz.score / quiz.total) * 100);
              return (
                <div key={index} className="flex items-center gap-4 p-4 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                  <CheckCircle className="h-5 w-5 text-secondary shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{quiz.topic}</p>
                    <p className="text-sm text-muted-foreground">
                      {quiz.score}/{quiz.total} correct
                    </p>
                  </div>
                  <div className="w-32 shrink-0">
                    <Progress value={percentage} className="h-2" />
                  </div>
                  <span className="text-sm font-semibold w-12 text-right">{percentage}%</span>
                </div>
              );
            })
          )}
        </div>
      </Card>
    </div>
  );
};

export default Dashboard;
