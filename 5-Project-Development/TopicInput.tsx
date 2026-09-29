import React, { useRef, useEffect } from 'react';
import { Lightbulb, FileText, CheckSquare, Sparkles, X, ArrowRight, CornerDownLeft } from 'lucide-react';
import { ActionType } from '../types';

interface TopicInputProps {
  topic: string;
  setTopic: (topic: string) => void;
  onSubmit: (action: ActionType) => void;
  isLoading: boolean;
  activeAction: ActionType | null;
}

const SAMPLE_TOPICS = [
  { label: 'Photosynthesis', emoji: '🌱' },
  { label: 'Why is the sky blue?', emoji: '🌌' },
  { label: "Newton's Laws of Motion", emoji: '🍎' },
  { label: 'Pythagorean Theorem', emoji: '📐' },
  { label: 'How does DNA work?', emoji: '🧬' },
  { label: 'The Water Cycle', emoji: '💧' },
  { label: 'French Revolution', emoji: '🏰' },
  { label: 'Artificial Intelligence', emoji: '🤖' },
];

export const TopicInput: React.FC<TopicInputProps> = ({
  topic,
  setTopic,
  onSubmit,
  isLoading,
  activeAction,
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea height
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 180)}px`;
    }
  }, [topic]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (topic.trim() && !isLoading) {
        // Default to explain or active action
        onSubmit(activeAction || 'explain');
      }
    }
  };

  const handleSampleClick = (sample: string) => {
    setTopic(sample);
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-200/80 p-4 sm:p-6 transition-all">
      {/* Label and Helper */}
      <div className="flex items-center justify-between mb-2">
        <label
          htmlFor="topic-input"
          className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5"
        >
          <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
          What do you want to learn today?
        </label>
        {topic.trim() && (
          <button
            onClick={() => setTopic('')}
            className="text-xs text-slate-400 hover:text-slate-600 flex items-center gap-1 transition-colors px-1 py-0.5 rounded"
            title="Clear text"
          >
            <X className="w-3.5 h-3.5" />
            Clear
          </button>
        )}
      </div>

      {/* Main Text Area Input */}
      <div className="relative rounded-xl border-2 border-slate-200 hover:border-slate-300 focus-within:border-indigo-600 focus-within:ring-4 focus-within:ring-indigo-100 transition-all bg-slate-50/50 focus-within:bg-white">
        <textarea
          id="topic-input"
          ref={textareaRef}
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type any question, topic, or concept here (e.g., 'How do black holes work?', 'Mitosis vs Meiosis', 'Photosynthesis')..."
          rows={2}
          disabled={isLoading}
          className="w-full px-4 py-3 text-slate-800 text-base sm:text-lg placeholder:text-slate-400 focus:outline-hidden resize-none bg-transparent rounded-xl"
        />

        <div className="px-3 pb-2 flex items-center justify-between text-xs text-slate-400">
          <span className="hidden sm:inline-flex items-center gap-1">
            Press <kbd className="px-1.5 py-0.5 bg-slate-200/80 rounded text-[11px] text-slate-600 font-mono">Enter</kbd> to Explain
          </span>
          <span className="ml-auto text-[11px] text-slate-400">
            {topic.length > 0 ? `${topic.length} characters` : 'Ready to learn'}
          </span>
        </div>
      </div>

      {/* Quick Suggestion Chips */}
      <div className="mt-3">
        <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
          Popular Student Topics:
        </p>
        <div className="flex flex-wrap gap-1.5 sm:gap-2">
          {SAMPLE_TOPICS.map((sample) => (
            <button
              key={sample.label}
              onClick={() => handleSampleClick(sample.label)}
              type="button"
              className={`text-xs px-2.5 py-1.5 rounded-lg border font-medium transition-all flex items-center gap-1.5 ${
                topic.toLowerCase() === sample.label.toLowerCase()
                  ? 'bg-indigo-50 border-indigo-300 text-indigo-700 shadow-xs'
                  : 'bg-slate-50/80 border-slate-200/80 text-slate-600 hover:bg-slate-100 hover:text-slate-900 hover:border-slate-300'
              }`}
            >
              <span>{sample.emoji}</span>
              <span>{sample.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* The 3 Core Action Buttons: Explain, Summarize, Quiz */}
      <div className="mt-5 pt-4 border-t border-slate-100">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-3">
          {/* 1. EXPLAIN BUTTON */}
          <button
            type="button"
            onClick={() => onSubmit('explain')}
            disabled={isLoading || !topic.trim()}
            className={`group relative flex items-center justify-center gap-2.5 px-4 py-3 rounded-xl font-semibold text-sm sm:text-base transition-all duration-200 cursor-pointer disabled:cursor-not-allowed disabled:opacity-50 ${
              activeAction === 'explain' && isLoading
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200 ring-2 ring-indigo-400 ring-offset-2'
                : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-300/40 hover:shadow-indigo-300/60 active:scale-[0.98]'
            }`}
            title="Get a simple, easy explanation with analogies and key concepts"
          >
            {activeAction === 'explain' && isLoading ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Explaining...</span>
              </span>
            ) : (
              <>
                <Lightbulb className="w-4 h-4 text-amber-300 transition-transform group-hover:scale-110" />
                <span>Explain</span>
              </>
            )}
          </button>

          {/* 2. SUMMARIZE BUTTON */}
          <button
            type="button"
            onClick={() => onSubmit('summarize')}
            disabled={isLoading || !topic.trim()}
            className={`group relative flex items-center justify-center gap-2.5 px-4 py-3 rounded-xl font-semibold text-sm sm:text-base transition-all duration-200 cursor-pointer disabled:cursor-not-allowed disabled:opacity-50 ${
              activeAction === 'summarize' && isLoading
                ? 'bg-purple-600 text-white shadow-md shadow-purple-200 ring-2 ring-purple-400 ring-offset-2'
                : 'bg-white hover:bg-purple-50/70 text-purple-700 border-2 border-purple-200 hover:border-purple-300 shadow-sm active:scale-[0.98]'
            }`}
            title="Get a concise, quick 60-second summary and key points"
          >
            {activeAction === 'summarize' && isLoading ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-purple-600/30 border-t-purple-600 rounded-full animate-spin" />
                <span>Summarizing...</span>
              </span>
            ) : (
              <>
                <FileText className="w-4 h-4 text-purple-600 transition-transform group-hover:scale-110" />
                <span>Summarize</span>
              </>
            )}
          </button>

          {/* 3. QUIZ BUTTON */}
          <button
            type="button"
            onClick={() => onSubmit('quiz')}
            disabled={isLoading || !topic.trim()}
            className={`group relative flex items-center justify-center gap-2.5 px-4 py-3 rounded-xl font-semibold text-sm sm:text-base transition-all duration-200 cursor-pointer disabled:cursor-not-allowed disabled:opacity-50 ${
              activeAction === 'quiz' && isLoading
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-200 ring-2 ring-emerald-400 ring-offset-2'
                : 'bg-white hover:bg-emerald-50/70 text-emerald-700 border-2 border-emerald-200 hover:border-emerald-300 shadow-sm active:scale-[0.98]'
            }`}
            title="Create 5 multiple-choice questions to test your knowledge"
          >
            {activeAction === 'quiz' && isLoading ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-emerald-600/30 border-t-emerald-600 rounded-full animate-spin" />
                <span>Creating Quiz...</span>
              </span>
            ) : (
              <>
                <CheckSquare className="w-4 h-4 text-emerald-600 transition-transform group-hover:scale-110" />
                <span>Quiz (5 Questions)</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
