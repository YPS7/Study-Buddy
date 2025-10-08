import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Flame, Trophy, Target, Star } from "lucide-react";
import confetti from "canvas-confetti";

interface Badge {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  unlocked: boolean;
  requirement: number;
}

const StudyStreaks = () => {
  const [streak, setStreak] = useState(0);
  const [totalQuizzes, setTotalQuizzes] = useState(0);
  const [badges, setBadges] = useState<Badge[]>([
    {
      id: "first-quiz",
      name: "First Steps",
      description: "Complete your first quiz",
      icon: <Star className="h-5 w-5" />,
      unlocked: false,
      requirement: 1,
    },
    {
      id: "quiz-master",
      name: "Quiz Master",
      description: "Complete 10 quizzes",
      icon: <Trophy className="h-5 w-5" />,
      unlocked: false,
      requirement: 10,
    },
    {
      id: "hot-streak",
      name: "Hot Streak",
      description: "Maintain a 7-day streak",
      icon: <Flame className="h-5 w-5" />,
      unlocked: false,
      requirement: 7,
    },
    {
      id: "perfect-score",
      name: "Perfectionist",
      description: "Score 100% on a quiz",
      icon: <Target className="h-5 w-5" />,
      unlocked: false,
      requirement: 1,
    },
  ]);

  useEffect(() => {
    // Load streak data from localStorage
    const savedStreak = localStorage.getItem("study-streak");
    const savedQuizzes = localStorage.getItem("total-quizzes");
    const savedBadges = localStorage.getItem("badges");
    const lastStudyDate = localStorage.getItem("last-study-date");

    if (savedStreak) setStreak(parseInt(savedStreak));
    if (savedQuizzes) setTotalQuizzes(parseInt(savedQuizzes));
    if (savedBadges) setBadges(JSON.parse(savedBadges));

    // Check if streak should be reset
    if (lastStudyDate) {
      const lastDate = new Date(lastStudyDate);
      const today = new Date();
      const diffDays = Math.floor((today.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));
      
      if (diffDays > 1) {
        setStreak(0);
        localStorage.setItem("study-streak", "0");
      }
    }
  }, []);

  const updateStreak = () => {
    const lastStudyDate = localStorage.getItem("last-study-date");
    const today = new Date().toDateString();

    if (lastStudyDate !== today) {
      const newStreak = streak + 1;
      setStreak(newStreak);
      localStorage.setItem("study-streak", newStreak.toString());
      localStorage.setItem("last-study-date", today);

      if (newStreak % 7 === 0) {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
        });
      }
    }
  };

  const incrementQuizCount = () => {
    const newCount = totalQuizzes + 1;
    setTotalQuizzes(newCount);
    localStorage.setItem("total-quizzes", newCount.toString());
    updateStreak();
    checkBadges(newCount);
  };

  const checkBadges = (quizCount: number) => {
    const updatedBadges = badges.map((badge) => {
      if (!badge.unlocked) {
        if (
          (badge.id === "first-quiz" && quizCount >= 1) ||
          (badge.id === "quiz-master" && quizCount >= 10) ||
          (badge.id === "hot-streak" && streak >= 7)
        ) {
          confetti({
            particleCount: 50,
            angle: 60,
            spread: 55,
            origin: { x: 0 },
          });
          confetti({
            particleCount: 50,
            angle: 120,
            spread: 55,
            origin: { x: 1 },
          });
          return { ...badge, unlocked: true };
        }
      }
      return badge;
    });
    setBadges(updatedBadges);
    localStorage.setItem("badges", JSON.stringify(updatedBadges));
  };

  useEffect(() => {
    // Expose function to parent components
    (window as any).incrementQuizCount = incrementQuizCount;
  }, [totalQuizzes, streak, badges]);

  return (
    <Card className="p-6 shadow-soft border-border/50">
      <h2 className="text-xl font-semibold mb-6">Study Streaks & Achievements</h2>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="p-4 rounded-lg gradient-primary text-center">
          <Flame className="h-8 w-8 text-primary-foreground mx-auto mb-2" />
          <div className="text-3xl font-bold text-primary-foreground">{streak}</div>
          <div className="text-sm text-primary-foreground/90">Day Streak</div>
        </div>
        <div className="p-4 rounded-lg bg-secondary/10 border border-secondary text-center">
          <Trophy className="h-8 w-8 text-secondary mx-auto mb-2" />
          <div className="text-3xl font-bold text-secondary">{totalQuizzes}</div>
          <div className="text-sm text-muted-foreground">Quizzes Completed</div>
        </div>
      </div>

      <div className="space-y-3">
        <h3 className="font-semibold text-sm text-muted-foreground">Badges</h3>
        {badges.map((badge) => (
          <div
            key={badge.id}
            className={`flex items-center gap-3 p-3 rounded-lg transition-all ${
              badge.unlocked
                ? "bg-secondary/10 border border-secondary"
                : "bg-muted/30 opacity-60"
            }`}
          >
            <div className={badge.unlocked ? "text-secondary" : "text-muted-foreground"}>
              {badge.icon}
            </div>
            <div className="flex-1">
              <div className="font-medium text-sm">{badge.name}</div>
              <div className="text-xs text-muted-foreground">{badge.description}</div>
            </div>
            {badge.unlocked && (
              <Badge variant="secondary" className="text-xs">
                Unlocked
              </Badge>
            )}
          </div>
        ))}
      </div>
    </Card>
  );
};

export default StudyStreaks;
