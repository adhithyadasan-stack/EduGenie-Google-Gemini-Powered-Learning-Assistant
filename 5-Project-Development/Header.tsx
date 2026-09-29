import React, { useState } from 'react';
import { Sparkles, GraduationCap, Info, HelpCircle, BookOpen, CheckCircle, Lightbulb } from 'lucide-react';
import { GradeLevel } from '../types';

interface HeaderProps {
  gradeLevel: GradeLevel;
  onGradeLevelChange: (level: GradeLevel) => void;
}

export const Header: React.FC<HeaderProps> = ({ gradeLevel, onGradeLevelChange }) => {
  const [showHelp, setShowHelp] = useState(false);

  return (
    <header className="border-b border-slate-200/80 bg-white/90 backdrop-blur-md sticky top-0 z-30 shadow-xs">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-3.5 flex items-center justify-between gap-4">
        {/* Logo and Brand Title */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-600 via-indigo-700 to-purple-700 text-white flex items-center justify-center shadow-md shadow-indigo-200 ring-2 ring-indigo-100">
            <Sparkles className="w-5 h-5 text-amber-300 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight bg-gradient-to-r from-indigo-700 via-purple-700 to-pink-600 bg-clip-text text-transparent">
                EduGenie
              </h1>
              <span className="text-[10px] font-bold tracking-wide uppercase px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200/60 hidden xs:inline-block">
                Gemini Powered
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium hidden sm:block">
              Your friendly AI learning assistant
            </p>
          </div>
        </div>

        {/* Right side controls: Grade Level + Info */}
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="flex items-center gap-1.5 bg-slate-100/90 hover:bg-slate-100 transition-colors rounded-xl px-2.5 py-1.5 border border-slate-200 text-xs">
            <GraduationCap className="w-4 h-4 text-indigo-600 shrink-0" />
            <select
              value={gradeLevel}
              onChange={(e) => onGradeLevelChange(e.target.value as GradeLevel)}
              className="bg-transparent font-medium text-slate-700 focus:outline-hidden cursor-pointer"
              aria-label="Select student learning level"
            >
              <option value="General Student">Standard Level</option>
              <option value="Elementary School">Elementary School</option>
              <option value="Middle School">Middle School</option>
              <option value="High School">High School</option>
              <option value="College / Advanced">College / Advanced</option>
            </select>
          </div>

          <button
            onClick={() => setShowHelp(true)}
            className="p-2 rounded-xl text-slate-500 hover:text-indigo-600 hover:bg-indigo-50/70 transition-colors border border-transparent hover:border-indigo-100"
            title="How to use EduGenie"
            aria-label="How to use EduGenie"
          >
            <HelpCircle className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Help Modal */}
      {showHelp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                  <Sparkles className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold text-slate-900">Welcome to EduGenie</h3>
              </div>
              <button
                onClick={() => setShowHelp(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-md text-lg leading-none"
              >
                ✕
              </button>
            </div>

            <p className="text-sm text-slate-600 mb-4 leading-relaxed">
              EduGenie is designed to help students master any concept quickly with three powerful tools:
            </p>

            <div className="space-y-3 mb-5">
              <div className="flex items-start gap-3 p-3 rounded-xl bg-blue-50/60 border border-blue-100">
                <Lightbulb className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-blue-900 uppercase tracking-wider">Explain</h4>
                  <p className="text-xs text-blue-800 mt-0.5">
                    Breaks down difficult concepts into simple terms, step-by-step guides, and relatable everyday analogies.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-xl bg-amber-50/60 border border-amber-100">
                <BookOpen className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-amber-900 uppercase tracking-wider">Summarize</h4>
                  <p className="text-xs text-amber-800 mt-0.5">
                    Provides a high-yield, 60-second summary with bullet points, essential vocabulary, and memory tips.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-xl bg-emerald-50/60 border border-emerald-100">
                <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-emerald-900 uppercase tracking-wider">Quiz</h4>
                  <p className="text-xs text-emerald-800 mt-0.5">
                    Generates 5 multiple-choice questions with instant feedback and explanations to test your knowledge!
                  </p>
                </div>
              </div>
            </div>

            <button
              onClick={() => setShowHelp(false)}
              className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-sm rounded-xl transition-colors shadow-sm"
            >
              Got it, let's learn!
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
