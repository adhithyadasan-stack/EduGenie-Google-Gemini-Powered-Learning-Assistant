import React, { useState } from 'react';
import {
  CheckSquare,
  CheckCircle2,
  XCircle,
  HelpCircle,
  RotateCcw,
  Eye,
  EyeOff,
  Trophy,
  Copy,
  Check,
  Sparkles,
  ArrowRight,
  BookOpen,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { QuizData, GradeLevel } from '../types';

interface QuizViewProps {
  quizData: QuizData;
  gradeLevel: GradeLevel;
  onGenerateExplanation: () => void;
  onGenerateSummary: () => void;
}

export const QuizView: React.FC<QuizViewProps> = ({
  quizData,
  gradeLevel,
  onGenerateExplanation,
  onGenerateSummary,
}) => {
  // Store student selections: { [questionIndex]: optionIndex }
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [showAllAnswers, setShowAllAnswers] = useState(false);
  const [copied, setCopied] = useState(false);

  const questions = quizData.questions || [];
  const totalQuestions = questions.length;

  const answeredCount = Object.keys(selectedAnswers).length;

  // Calculate score
  const correctCount = questions.reduce((acc, q, index) => {
    return selectedAnswers[index] === q.correctIndex ? acc + 1 : acc;
  }, 0);

  const isCompleted = answeredCount === totalQuestions && totalQuestions > 0;

  // Handle option select
  const handleSelectOption = (questionIndex: number, optionIndex: number) => {
    // If answer is already selected for this question and showAllAnswers is not forced, we record it
    if (selectedAnswers[questionIndex] !== undefined) return; // Prevent changing after answer or allow retry

    const nextAnswers = {
      ...selectedAnswers,
      [questionIndex]: optionIndex,
    };
    setSelectedAnswers(nextAnswers);

    // If this was the last question answered
    if (Object.keys(nextAnswers).length === totalQuestions) {
      const finalScore = questions.reduce((acc, q, idx) => {
        return nextAnswers[idx] === q.correctIndex ? acc + 1 : acc;
      }, 0);

      // Trigger celebratory confetti if score is >= 3
      if (finalScore >= 3) {
        try {
          confetti({
            particleCount: 80,
            spread: 70,
            origin: { y: 0.6 },
          });
        } catch {
          // ignore
        }
      }
    }
  };

  const handleResetQuiz = () => {
    setSelectedAnswers({});
    setShowAllAnswers(false);
  };

  const handleCopyQuiz = async () => {
    try {
      const text = questions
        .map((q, idx) => {
          const opts = q.options.map((opt, oIdx) => `  ${String.fromCharCode(65 + oIdx)}. ${opt}`).join('\n');
          const correctLetter = String.fromCharCode(65 + q.correctIndex);
          return `Q${idx + 1}: ${q.question}\n${opts}\nAnswer: ${correctLetter} - ${q.options[q.correctIndex]}\nExplanation: ${q.explanation}\n`;
        })
        .join('\n');

      await navigator.clipboard.writeText(`EduGenie Quiz: ${quizData.topic}\n\n${text}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
    }
  };

  const optionLetters = ['A', 'B', 'C', 'D'];

  return (
    <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-emerald-100 overflow-hidden">
      {/* Header bar */}
      <div className="bg-gradient-to-r from-emerald-50 via-teal-50 to-white px-5 sm:px-6 py-4 border-b border-emerald-100 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-emerald-600 text-white shadow-xs">
            <CheckSquare className="w-5 h-5 text-amber-200" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 bg-emerald-100/70 px-2 py-0.5 rounded-full">
                Interactive Quiz (5 Questions)
              </span>
              <span className="text-xs text-slate-500 font-medium">
                {gradeLevel}
              </span>
            </div>
            <h3 className="text-lg sm:text-xl font-bold text-slate-900 mt-0.5 capitalize">
              {quizData.topic}
            </h3>
          </div>
        </div>

        {/* Controls: Study Key toggle, Reset, Copy */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowAllAnswers(!showAllAnswers)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors border ${
              showAllAnswers
                ? 'bg-amber-100 border-amber-300 text-amber-800'
                : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-emerald-700'
            }`}
            title="Toggle showing all answers and explanations immediately"
          >
            {showAllAnswers ? (
              <>
                <EyeOff className="w-3.5 h-3.5" />
                <span>Hide Key</span>
              </>
            ) : (
              <>
                <Eye className="w-3.5 h-3.5" />
                <span>Reveal All Answers</span>
              </>
            )}
          </button>

          <button
            onClick={handleResetQuiz}
            className="p-2 rounded-xl text-xs font-medium bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-emerald-700 flex items-center gap-1 transition-colors"
            title="Reset Quiz"
          >
            <RotateCcw className="w-4 h-4" />
            <span className="hidden sm:inline">Reset</span>
          </button>

          <button
            onClick={handleCopyQuiz}
            className="p-2 rounded-xl text-xs font-medium bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-emerald-700 flex items-center gap-1 transition-colors"
            title="Copy Quiz & Answers"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-emerald-600" />
                <span className="text-emerald-700 font-semibold hidden sm:inline">Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                <span className="hidden sm:inline">Copy</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Score Banner & Progress */}
      <div className="px-5 sm:px-7 py-3.5 bg-slate-50/80 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs sm:text-sm">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-slate-700 font-medium">
            <span>Answered:</span>
            <span className="font-bold text-slate-900">
              {answeredCount} / {totalQuestions}
            </span>
          </div>

          <div className="h-4 w-px bg-slate-200" />

          <div className="flex items-center gap-1.5">
            <Trophy className="w-4 h-4 text-amber-500" />
            <span className="text-slate-700 font-medium">Score:</span>
            <span className="font-extrabold text-emerald-700">
              {correctCount} / {totalQuestions}
            </span>
          </div>
        </div>

        {isCompleted && (
          <div className="flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 animate-in zoom-in-95">
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            {correctCount === 5
              ? '🎉 Perfect Score! Outstanding work!'
              : correctCount >= 3
              ? '👍 Great job! You passed!'
              : 'Keep practicing! Review explanations below.'}
          </div>
        )}
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-slate-100 h-1.5">
        <div
          className="bg-emerald-500 h-1.5 transition-all duration-300"
          style={{ width: `${(answeredCount / totalQuestions) * 100}%` }}
        />
      </div>

      {/* 5 Questions List */}
      <div className="p-5 sm:p-7 space-y-6">
        {questions.map((q, qIndex) => {
          const studentChoice = selectedAnswers[qIndex];
          const hasAnswered = studentChoice !== undefined;
          const isCorrect = studentChoice === q.correctIndex;
          const showAnswer = hasAnswered || showAllAnswers;

          return (
            <div
              key={q.id || qIndex}
              className={`rounded-2xl border p-4 sm:p-5 transition-all ${
                hasAnswered
                  ? isCorrect
                    ? 'border-emerald-200 bg-emerald-50/20'
                    : 'border-rose-200 bg-rose-50/20'
                  : 'border-slate-200/90 bg-white hover:border-slate-300'
              }`}
            >
              {/* Question Header */}
              <div className="flex items-start justify-between gap-3 mb-3.5">
                <div className="flex items-start gap-2.5">
                  <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-slate-100 text-slate-700 text-xs font-bold shrink-0 mt-0.5">
                    {qIndex + 1}
                  </span>
                  <h4 className="text-base sm:text-lg font-semibold text-slate-900 leading-snug">
                    {q.question}
                  </h4>
                </div>

                {/* Question Status Badge */}
                {hasAnswered && (
                  <span
                    className={`inline-flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-full shrink-0 ${
                      isCorrect
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-rose-100 text-rose-800'
                    }`}
                  >
                    {isCorrect ? (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Correct</span>
                      </>
                    ) : (
                      <>
                        <XCircle className="w-3.5 h-3.5 text-rose-600" />
                        <span>Incorrect</span>
                      </>
                    )}
                  </span>
                )}
              </div>

              {/* 4 Multiple Choice Options */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-2.5">
                {q.options.map((opt, optIndex) => {
                  const isThisSelected = studentChoice === optIndex;
                  const isThisCorrect = q.correctIndex === optIndex;

                  let optionStyle = 'border-slate-200 bg-slate-50/60 hover:bg-slate-100/80 text-slate-700';

                  if (showAnswer) {
                    if (isThisCorrect) {
                      // Correct answer is always marked clearly once answered or revealed
                      optionStyle = 'border-emerald-400 bg-emerald-50 text-emerald-900 font-semibold ring-2 ring-emerald-300/60';
                    } else if (isThisSelected && !isThisCorrect) {
                      // Student chose wrong answer
                      optionStyle = 'border-rose-300 bg-rose-50 text-rose-900 ring-2 ring-rose-200';
                    } else {
                      optionStyle = 'border-slate-100 bg-slate-50/40 text-slate-400 opacity-60';
                    }
                  } else if (isThisSelected) {
                    optionStyle = 'border-emerald-500 bg-emerald-50 text-emerald-900 font-semibold';
                  }

                  return (
                    <button
                      key={optIndex}
                      type="button"
                      onClick={() => handleSelectOption(qIndex, optIndex)}
                      disabled={hasAnswered && !showAllAnswers}
                      className={`text-left p-3 rounded-xl border text-xs sm:text-sm font-medium transition-all flex items-start gap-2.5 cursor-pointer disabled:cursor-default ${optionStyle}`}
                    >
                      <span
                        className={`w-5 h-5 rounded-md flex items-center justify-center text-xs font-bold shrink-0 ${
                          showAnswer && isThisCorrect
                            ? 'bg-emerald-600 text-white'
                            : showAnswer && isThisSelected && !isThisCorrect
                            ? 'bg-rose-600 text-white'
                            : 'bg-white border border-slate-200 text-slate-600'
                        }`}
                      >
                        {optionLetters[optIndex]}
                      </span>

                      <span className="flex-1 leading-snug pt-0.5">{opt}</span>

                      {showAnswer && isThisCorrect && (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      )}
                      {showAnswer && isThisSelected && !isThisCorrect && (
                        <XCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Explanation box: shown when student answers or reveals key */}
              {showAnswer && (
                <div className="mt-3.5 p-3 sm:p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 text-xs sm:text-sm text-slate-700 animate-in fade-in duration-200">
                  <div className="flex items-center gap-1.5 font-bold text-slate-800 mb-1">
                    <HelpCircle className="w-3.5 h-3.5 text-indigo-600" />
                    <span>
                      Answer: Option {optionLetters[q.correctIndex]} ({q.options[q.correctIndex]})
                    </span>
                  </div>
                  <p className="text-slate-600 leading-relaxed pl-5">
                    {q.explanation}
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Bottom Footer Actions */}
      <div className="p-5 sm:p-7 bg-slate-50/70 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
        <span className="text-xs font-semibold text-slate-600">
          Want to study this topic deeper?
        </span>
        <div className="flex items-center gap-2.5">
          <button
            onClick={onGenerateExplanation}
            className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-indigo-700 hover:bg-indigo-50 transition-colors shadow-2xs flex items-center gap-1.5"
          >
            <BookOpen className="w-3.5 h-3.5 text-indigo-600" />
            <span>Read Full Explanation</span>
          </button>
          <button
            onClick={onGenerateSummary}
            className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-700 text-white transition-colors shadow-2xs flex items-center gap-1.5"
          >
            <span>Read 60s Summary</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
