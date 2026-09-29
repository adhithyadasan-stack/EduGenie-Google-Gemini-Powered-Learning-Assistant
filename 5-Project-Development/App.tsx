/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { TopicInput } from './components/TopicInput';
import { ExplanationView } from './components/ExplanationView';
import { SummaryView } from './components/SummaryView';
import { QuizView } from './components/QuizView';
import { RecentTopics } from './components/RecentTopics';
import { ActionType, GradeLevel, QuizData, HistoryItem } from './types';
import {
  Sparkles,
  Lightbulb,
  FileText,
  CheckSquare,
  AlertCircle,
  BookOpen,
  ArrowRight,
  Brain,
  Zap,
} from 'lucide-react';

export default function App() {
  const [topic, setTopic] = useState('');
  const [gradeLevel, setGradeLevel] = useState<GradeLevel>('General Student');
  const [isLoading, setIsLoading] = useState(false);
  const [activeAction, setActiveAction] = useState<ActionType | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Result state
  const [currentResult, setCurrentResult] = useState<{
    topic: string;
    type: ActionType;
    gradeLevel: GradeLevel;
    explanation?: string;
    summary?: string;
    quiz?: QuizData;
  } | null>(null);

  // Recent session history
  const [history, setHistory] = useState<HistoryItem[]>(() => {
    try {
      const saved = sessionStorage.getItem('edugenie_history');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Save history to session storage
  useEffect(() => {
    try {
      sessionStorage.setItem('edugenie_history', JSON.stringify(history));
    } catch {
      // ignore
    }
  }, [history]);

  const handleSubmit = async (action: ActionType, overrideTopic?: string) => {
    const targetTopic = (overrideTopic || topic).trim();
    if (!targetTopic) return;

    setIsLoading(true);
    setActiveAction(action);
    setErrorMessage(null);

    try {
      let endpoint = '/api/explain';
      if (action === 'summarize') endpoint = '/api/summarize';
      if (action === 'quiz') endpoint = '/api/quiz';

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          topic: targetTopic,
          gradeLevel,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Server returned ${response.status}: Failed to generate ${action}`);
      }

      const data = await response.json();

      let newHistoryItem: HistoryItem;

      if (action === 'explain') {
        setCurrentResult({
          topic: targetTopic,
          type: 'explain',
          gradeLevel,
          explanation: data.explanation,
        });

        newHistoryItem = {
          id: Date.now().toString(),
          topic: targetTopic,
          type: 'explain',
          gradeLevel,
          timestamp: Date.now(),
          content: data.explanation,
        };
      } else if (action === 'summarize') {
        setCurrentResult({
          topic: targetTopic,
          type: 'summarize',
          gradeLevel,
          summary: data.summary,
        });

        newHistoryItem = {
          id: Date.now().toString(),
          topic: targetTopic,
          type: 'summarize',
          gradeLevel,
          timestamp: Date.now(),
          content: data.summary,
        };
      } else {
        // quiz
        const quizData: QuizData = {
          topic: targetTopic,
          questions: data.questions,
          gradeLevel,
        };

        setCurrentResult({
          topic: targetTopic,
          type: 'quiz',
          gradeLevel,
          quiz: quizData,
        });

        newHistoryItem = {
          id: Date.now().toString(),
          topic: targetTopic,
          type: 'quiz',
          gradeLevel,
          timestamp: Date.now(),
          content: quizData,
        };
      }

      // Add to history (limit to last 15)
      setHistory((prev) => [newHistoryItem, ...prev.filter((item) => item.topic.toLowerCase() !== targetTopic.toLowerCase() || item.type !== action)].slice(0, 15));
    } catch (err: any) {
      console.error('Request failed:', err);
      setErrorMessage(err.message || 'Something went wrong. Please check your connection and try again.');
    } finally {
      setIsLoading(false);
      setActiveAction(null);
    }
  };

  const handleAskFollowUp = async (question: string): Promise<string> => {
    if (!currentResult) return '';

    let context = '';
    if (currentResult.type === 'explain') context = currentResult.explanation || '';
    else if (currentResult.type === 'summarize') context = currentResult.summary || '';
    else if (currentResult.type === 'quiz') context = JSON.stringify(currentResult.quiz);

    const response = await fetch('/api/followup', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        topic: currentResult.topic,
        context,
        question,
      }),
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to get follow-up answer.');
    }

    const data = await response.json();
    return data.answer;
  };

  const handleSelectHistoryItem = (item: HistoryItem) => {
    setTopic(item.topic);
    setGradeLevel(item.gradeLevel);

    if (item.type === 'explain') {
      setCurrentResult({
        topic: item.topic,
        type: 'explain',
        gradeLevel: item.gradeLevel,
        explanation: item.content as string,
      });
    } else if (item.type === 'summarize') {
      setCurrentResult({
        topic: item.topic,
        type: 'summarize',
        gradeLevel: item.gradeLevel,
        summary: item.content as string,
      });
    } else if (item.type === 'quiz') {
      setCurrentResult({
        topic: item.topic,
        type: 'quiz',
        gradeLevel: item.gradeLevel,
        quiz: item.content as QuizData,
      });
    }
  };

  const handleClearHistory = () => {
    setHistory([]);
    sessionStorage.removeItem('edugenie_history');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col selection:bg-indigo-500 selection:text-white">
      {/* Top Navigation & Grade Selector */}
      <Header gradeLevel={gradeLevel} onGradeLevelChange={setGradeLevel} />

      {/* Main Content Container */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
        {/* Hero Banner for Student Focus */}
        <div className="text-center py-2 sm:py-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200/80 text-indigo-700 text-xs font-semibold mb-3">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>Empower your studies with Google Gemini</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Learn Anything,{' '}
            <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              Faster & Smarter
            </span>
          </h2>
          <p className="text-sm sm:text-base text-slate-600 max-w-xl mx-auto mt-2 leading-relaxed">
            Type any question or topic. Get a simple explanation, a 60-second summary, or test your skills with a 5-question quiz.
          </p>
        </div>

        {/* 1. TEXT BOX & ACTION BUTTONS (Explain, Summarize, Quiz) */}
        <section aria-label="Topic input and actions">
          <TopicInput
            topic={topic}
            setTopic={setTopic}
            onSubmit={(action) => handleSubmit(action)}
            isLoading={isLoading}
            activeAction={activeAction}
          />
        </section>

        {/* ERROR STATE */}
        {errorMessage && (
          <div className="rounded-2xl bg-rose-50 border border-rose-200 p-4 sm:p-5 flex items-start gap-3 text-rose-900 animate-in fade-in duration-200">
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <div className="flex-1 text-sm">
              <p className="font-bold text-rose-950">Oops! Couldn't generate response</p>
              <p className="text-rose-800 mt-0.5">{errorMessage}</p>
              <button
                onClick={() => activeAction && handleSubmit(activeAction)}
                className="mt-3 text-xs font-semibold px-3 py-1.5 rounded-lg bg-rose-600 text-white hover:bg-rose-700 transition-colors"
              >
                Try Again
              </button>
            </div>
          </div>
        )}

        {/* LOADING CARD STATE */}
        {isLoading && (
          <div className="bg-white rounded-2xl p-8 sm:p-10 shadow-lg border border-indigo-100 flex flex-col items-center justify-center text-center animate-pulse">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-600 to-purple-700 text-white flex items-center justify-center shadow-lg shadow-indigo-200 mb-4 animate-bounce">
              <Brain className="w-7 h-7 text-amber-300" />
            </div>

            <h3 className="text-lg font-bold text-slate-900">
              {activeAction === 'explain' && 'EduGenie is crafting a simple explanation...'}
              {activeAction === 'summarize' && 'EduGenie is boiling down the key facts...'}
              {activeAction === 'quiz' && 'EduGenie is generating your 5-question quiz...'}
            </h3>

            <p className="text-xs sm:text-sm text-slate-500 max-w-sm mt-1.5">
              Connecting with Google Gemini to break down "{topic}" for {gradeLevel}...
            </p>

            {/* Skeleton bars */}
            <div className="w-full max-w-md mt-6 space-y-2.5">
              <div className="h-4 bg-slate-100 rounded-full w-3/4 mx-auto" />
              <div className="h-3 bg-slate-100 rounded-full w-full" />
              <div className="h-3 bg-slate-100 rounded-full w-5/6 mx-auto" />
            </div>
          </div>
        )}

        {/* 2. RESULTS PRESENTATION AREA: Shown clearly below the text box */}
        {!isLoading && currentResult && (
          <section aria-label="Learning result" className="transition-all animate-in fade-in duration-300">
            {currentResult.type === 'explain' && currentResult.explanation && (
              <ExplanationView
                topic={currentResult.topic}
                explanation={currentResult.explanation}
                gradeLevel={currentResult.gradeLevel}
                onGenerateQuiz={() => handleSubmit('quiz', currentResult.topic)}
                onGenerateSummary={() => handleSubmit('summarize', currentResult.topic)}
                onAskFollowUp={handleAskFollowUp}
              />
            )}

            {currentResult.type === 'summarize' && currentResult.summary && (
              <SummaryView
                topic={currentResult.topic}
                summary={currentResult.summary}
                gradeLevel={currentResult.gradeLevel}
                onGenerateExplanation={() => handleSubmit('explain', currentResult.topic)}
                onGenerateQuiz={() => handleSubmit('quiz', currentResult.topic)}
                onAskFollowUp={handleAskFollowUp}
              />
            )}

            {currentResult.type === 'quiz' && currentResult.quiz && (
              <QuizView
                quizData={currentResult.quiz}
                gradeLevel={currentResult.gradeLevel}
                onGenerateExplanation={() => handleSubmit('explain', currentResult.topic)}
                onGenerateSummary={() => handleSubmit('summarize', currentResult.topic)}
              />
            )}
          </section>
        )}

        {/* EMPTY STATE / GETTING STARTED GUIDE (When nothing has been submitted yet) */}
        {!isLoading && !currentResult && (
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-8 text-center shadow-xs">
            <div className="max-w-lg mx-auto">
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center mx-auto mb-3">
                <Sparkles className="w-6 h-6 text-indigo-600" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">How to get started</h3>
              <p className="text-xs sm:text-sm text-slate-500 mt-1 mb-6">
                Choose any subject you are studying — science, history, math, literature, or technology.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-left">
                <div
                  onClick={() => {
                    setTopic('Photosynthesis');
                    handleSubmit('explain', 'Photosynthesis');
                  }}
                  className="p-3.5 rounded-xl border border-indigo-100 bg-indigo-50/40 hover:bg-indigo-50 transition-colors cursor-pointer group"
                >
                  <div className="flex items-center gap-2 mb-1.5">
                    <Lightbulb className="w-4 h-4 text-indigo-600" />
                    <span className="text-xs font-bold text-indigo-900">1. Explain</span>
                  </div>
                  <p className="text-xs text-slate-600">
                    Get simple analogies and step-by-step clarity on tough concepts.
                  </p>
                  <span className="text-[11px] font-semibold text-indigo-700 mt-2 inline-flex items-center gap-1 group-hover:underline">
                    Try Photosynthesis <ArrowRight className="w-3 h-3" />
                  </span>
                </div>

                <div
                  onClick={() => {
                    setTopic("Newton's Laws of Motion");
                    handleSubmit('summarize', "Newton's Laws of Motion");
                  }}
                  className="p-3.5 rounded-xl border border-purple-100 bg-purple-50/40 hover:bg-purple-50 transition-colors cursor-pointer group"
                >
                  <div className="flex items-center gap-2 mb-1.5">
                    <FileText className="w-4 h-4 text-purple-600" />
                    <span className="text-xs font-bold text-purple-900">2. Summarize</span>
                  </div>
                  <p className="text-xs text-slate-600">
                    High-yield bullet points and key vocabulary for fast exam review.
                  </p>
                  <span className="text-[11px] font-semibold text-purple-700 mt-2 inline-flex items-center gap-1 group-hover:underline">
                    Try Newton's Laws <ArrowRight className="w-3 h-3" />
                  </span>
                </div>

                <div
                  onClick={() => {
                    setTopic('The Solar System');
                    handleSubmit('quiz', 'The Solar System');
                  }}
                  className="p-3.5 rounded-xl border border-emerald-100 bg-emerald-50/40 hover:bg-emerald-50 transition-colors cursor-pointer group"
                >
                  <div className="flex items-center gap-2 mb-1.5">
                    <CheckSquare className="w-4 h-4 text-emerald-600" />
                    <span className="text-xs font-bold text-emerald-900">3. Quiz</span>
                  </div>
                  <p className="text-xs text-slate-600">
                    Take an instant 5-question multiple choice test with score & answer keys.
                  </p>
                  <span className="text-[11px] font-semibold text-emerald-700 mt-2 inline-flex items-center gap-1 group-hover:underline">
                    Try Solar System <ArrowRight className="w-3 h-3" />
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 3. RECENT TOPICS EXPLORED */}
        <RecentTopics
          history={history}
          onSelectHistoryItem={handleSelectHistoryItem}
          onClearHistory={handleClearHistory}
        />
      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-200/80 bg-white py-4 text-center text-xs text-slate-400">
        <div className="max-w-4xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-1.5">
            <span className="font-bold text-slate-700">EduGenie</span>
            <span>—</span>
            <span>Google Gemini Powered Learning Assistant</span>
          </div>
          <div>Built for students to learn faster and master concepts easily</div>
        </div>
      </footer>
    </div>
  );
}
