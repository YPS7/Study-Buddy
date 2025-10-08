import { jsPDF } from "jspdf";

export interface QuizResult {
  question: string;
  userAnswer: string;
  correctAnswer: string;
  isCorrect: boolean;
  type: "mcq" | "saq" | "laq";
}

export interface SessionData {
  startTime: Date;
  endTime?: Date;
  quizResults: QuizResult[];
  totalQuestions: number;
  correctAnswers: number;
  incorrectAnswers: number;
  weakAreas: string[];
}

export interface PreviousSessionData extends SessionData {
  sessionDate: Date;
}

export const generateSessionReport = (sessionData: SessionData): string => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.width;
  
  // Title
  doc.setFontSize(20);
  doc.setFont("helvetica", "bold");
  doc.text("Study Buddy - Session Report", pageWidth / 2, 20, { align: "center" });
  
  // Session Info
  doc.setFontSize(12);
  doc.setFont("helvetica", "normal");
  doc.text(`Session Date: ${sessionData.startTime.toLocaleDateString()}`, 20, 35);
  doc.text(`Duration: ${calculateDuration(sessionData.startTime, sessionData.endTime || new Date())}`, 20, 42);
  
  // Summary Box
  doc.setFillColor(240, 240, 255);
  doc.rect(20, 50, pageWidth - 40, 30, "F");
  doc.setFont("helvetica", "bold");
  doc.text("Session Summary", 25, 58);
  doc.setFont("helvetica", "normal");
  doc.text(`Total Questions: ${sessionData.totalQuestions}`, 25, 66);
  doc.text(`Correct: ${sessionData.correctAnswers}`, 25, 73);
  doc.setTextColor(220, 38, 38);
  doc.text(`Incorrect: ${sessionData.incorrectAnswers}`, 80, 73);
  doc.setTextColor(0, 0, 0);
  
  const accuracy = ((sessionData.correctAnswers / sessionData.totalQuestions) * 100).toFixed(1);
  doc.setFont("helvetica", "bold");
  doc.text(`Accuracy: ${accuracy}%`, 140, 73);
  
  // Weak Areas
  doc.setFont("helvetica", "bold");
  doc.text("Areas to Focus On:", 20, 95);
  doc.setFont("helvetica", "normal");
  
  let yPos = 103;
  sessionData.weakAreas.forEach((area, index) => {
    if (yPos > 270) {
      doc.addPage();
      yPos = 20;
    }
    doc.setFillColor(255, 240, 240);
    doc.circle(23, yPos - 2, 1.5, "F");
    doc.text(area, 28, yPos);
    yPos += 7;
  });
  
  // Detailed Results
  if (yPos > 250) {
    doc.addPage();
    yPos = 20;
  } else {
    yPos += 10;
  }
  
  doc.setFont("helvetica", "bold");
  doc.text("Question-by-Question Analysis:", 20, yPos);
  yPos += 10;
  
  sessionData.quizResults.forEach((result, index) => {
    if (yPos > 250) {
      doc.addPage();
      yPos = 20;
    }
    
    // Question number and status
    doc.setFont("helvetica", "bold");
    if (result.isCorrect) {
      doc.setTextColor(34, 197, 94);
    } else {
      doc.setTextColor(220, 38, 38);
    }
    doc.text(`${index + 1}. ${result.isCorrect ? "✓" : "✗"}`, 20, yPos);
    doc.setTextColor(0, 0, 0);
    
    // Question type badge
    doc.setFontSize(8);
    doc.text(`[${result.type.toUpperCase()}]`, 30, yPos);
    doc.setFontSize(12);
    
    yPos += 7;
    
    // Question text (wrapped)
    doc.setFont("helvetica", "normal");
    const questionLines = doc.splitTextToSize(result.question, pageWidth - 50);
    doc.text(questionLines, 25, yPos);
    yPos += questionLines.length * 5 + 3;
    
    // Answers
    if (!result.isCorrect) {
      doc.setTextColor(220, 38, 38);
      const yourAnswerLines = doc.splitTextToSize(`Your answer: ${result.userAnswer}`, pageWidth - 55);
      doc.text(yourAnswerLines, 25, yPos);
      yPos += yourAnswerLines.length * 5 + 3;
      
      doc.setTextColor(34, 197, 94);
      const correctLines = doc.splitTextToSize(`Correct answer: ${result.correctAnswer}`, pageWidth - 55);
      doc.text(correctLines, 25, yPos);
      yPos += correctLines.length * 5 + 5;
      doc.setTextColor(0, 0, 0);
    } else {
      yPos += 3;
    }
  });
  
  // Return as data URL
  return doc.output("dataurlstring");
};

export const generateComparisonReport = (
  currentSession: SessionData,
  previousSession: PreviousSessionData
): string => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.width;
  
  // Title
  doc.setFontSize(20);
  doc.setFont("helvetica", "bold");
  doc.text("Study Buddy - Progress Comparison Report", pageWidth / 2, 20, { align: "center" });
  
  // Current Session
  doc.setFontSize(14);
  doc.text("Current Session", 20, 40);
  doc.setFontSize(12);
  doc.setFont("helvetica", "normal");
  doc.text(`Date: ${currentSession.startTime.toLocaleDateString()}`, 20, 48);
  
  const currentAccuracy = ((currentSession.correctAnswers / currentSession.totalQuestions) * 100).toFixed(1);
  doc.text(`Accuracy: ${currentAccuracy}%`, 20, 55);
  doc.text(`Questions: ${currentSession.totalQuestions}`, 20, 62);
  
  // Previous Session
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.text("Previous Session", 20, 80);
  doc.setFontSize(12);
  doc.setFont("helvetica", "normal");
  doc.text(`Date: ${previousSession.sessionDate.toLocaleDateString()}`, 20, 88);
  
  const prevAccuracy = ((previousSession.correctAnswers / previousSession.totalQuestions) * 100).toFixed(1);
  doc.text(`Accuracy: ${prevAccuracy}%`, 20, 95);
  doc.text(`Questions: ${previousSession.totalQuestions}`, 20, 102);
  
  // Improvement Analysis
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.text("Progress Analysis", 20, 120);
  doc.setFontSize(12);
  
  const accuracyChange = parseFloat(currentAccuracy) - parseFloat(prevAccuracy);
  
  doc.setFont("helvetica", "normal");
  if (accuracyChange >= 0) {
    doc.setTextColor(34, 197, 94);
  } else {
    doc.setTextColor(220, 38, 38);
  }
  doc.text(
    `Accuracy Change: ${accuracyChange > 0 ? "+" : ""}${accuracyChange.toFixed(1)}%`,
    20,
    128
  );
  doc.setTextColor(0, 0, 0);
  
  // Improvement areas
  doc.setFont("helvetica", "bold");
  doc.text("Areas of Improvement:", 20, 145);
  doc.setFont("helvetica", "normal");
  
  const improvedAreas = previousSession.weakAreas.filter(
    (area) => !currentSession.weakAreas.includes(area)
  );
  
  let yPos = 153;
  if (improvedAreas.length > 0) {
    improvedAreas.forEach((area) => {
      doc.setTextColor(34, 197, 94);
      doc.text(`✓ ${area}`, 25, yPos);
      yPos += 7;
    });
  } else {
    doc.text("Continue practicing to see improvements", 25, yPos);
    yPos += 7;
  }
  
  doc.setTextColor(0, 0, 0);
  yPos += 10;
  
  // Still needs work
  doc.setFont("helvetica", "bold");
  doc.text("Still Needs Attention:", 20, yPos);
  yPos += 8;
  doc.setFont("helvetica", "normal");
  
  currentSession.weakAreas.forEach((area) => {
    doc.setTextColor(220, 38, 38);
    doc.text(`• ${area}`, 25, yPos);
    yPos += 7;
  });
  
  return doc.output("dataurlstring");
};

const calculateDuration = (start: Date, end: Date): string => {
  const diff = end.getTime() - start.getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 60) return `${minutes} minutes`;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours}h ${mins}m`;
};
