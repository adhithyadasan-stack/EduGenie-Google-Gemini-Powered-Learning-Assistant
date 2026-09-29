import React, { useState } from 'react';
import { Lightbulb, Copy, Check, Volume2, VolumeX, Sparkles, HelpCircle, ArrowRight, Share2 } from 'lucide-react';
import { MarkdownRenderer } from './MarkdownRenderer';
import { GradeLevel } from '../types';

interface ExplanationViewProps {
  topic: string;
  explanation: string;
  gradeLevel: GradeLevel;
  onGenerateQuiz: () => void;
  onGenerateSummary: () => void;
  onAskFollowUp: (question: string) => Promise<string>;
}

export const ExplanationView: React.FC<ExplanationViewProps> = ({
  topic,
  explanation,
  gradeLevel,
  onGenerateQuiz,
  onGenerateSummary,
  onAskFollowUp,
}) => {
  const [copied, setCopied] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [followUpText, setFollowUpText] = useState('');
  const [followUpAnswer, setFollowUpAnswer] = useState<string | null>(null);
  const [isAskingFollowUp, setIsAskingFollowUp] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(`EduGenie Explanation: ${topic}\n\n${explanation}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
    }
  };

  const handleToggleSpeak = () => {
    if (!('speechSynthesis' in window)) {
      alert('Text-to-speech is not supported in this browser.');
      return;
    }

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    } else {
      window.speechSynthesis.cancel();
      // Remove markdown characters for cleaner audio
      const cleanText = explanation.replace(/[#*`_>-]/g, ' ');
      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
      window.speechSynthesis.speak(utterance);
      setIsSpeaking(true);
    }
  };

  const handleFollowUpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!followUpText.trim() || isAskingFollowUp) return;

    setIsAskingFollowUp(true);
    try {
      const answer = await onAskFollowUp(followUpText.trim());
      setFollowUpAnswer(answer);
      setFollowUpText('');
    } catch (err) {
      console.error(err);
    } finally {
      setIsAskingFollowUp(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-indigo-100 overflow-hidden">
      {/* Header bar */}
      <div className="bg-gradient-to-r from-indigo-50 via-purple-50 to-white px-5 sm:px-6 py-4 border-b border-indigo-100 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-indigo-600 text-white shadow-xs">
            <Lightbulb className="w-5 h-5 text-amber-300" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-700 bg-indigo-100/70 px-2 py-0.5 rounded-full">
                Explanation
              </span>
              <span className="text-xs text-slate-500 font-medium">
                {gradeLevel}
              </span>
            </div>
            <h3 className="text-lg sm:text-xl font-bold text-slate-900 mt-0.5 capitalize">
              {topic}
            </h3>
          </div>
        </div>

        {/* Action icons: TTS & Copy */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleToggleSpeak}
            className={`p-2 rounded-xl text-xs font-medium flex items-center gap-1.5 transition-colors border ${
              isSpeaking
                ? 'bg-amber-100 border-amber-300 text-amber-800'
                : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-indigo-600'
            }`}
            title={isSpeaking ? 'Stop voice readout' : 'Listen to explanation'}
          >
            {isSpeaking ? (
              <>
                <VolumeX className="w-4 h-4 text-amber-700 animate-pulse" />
                <span className="hidden sm:inline">Stop</span>
              </>
            ) : (
              <>
                <Volume2 className="w-4 h-4" />
                <span className="hidden sm:inline">Listen</span>
              </>
            )}
          </button>

          <button
            onClick={handleCopy}
            className="p-2 rounded-xl text-xs font-medium bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-indigo-600 flex items-center gap-1.5 transition-colors"
            title="Copy explanation"
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

      {/* Main explanation content */}
      <div className="p-5 sm:p-7">
        <MarkdownRenderer content={explanation} />

        {/* Quick Next-Step Actions */}
        <div className="mt-8 pt-5 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 bg-slate-50/70 p-4 rounded-xl">
          <span className="text-xs font-semibold text-slate-600">
            Next steps for this topic:
          </span>
          <div className="flex items-center gap-2.5">
            <button
              onClick={onGenerateSummary}
              className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-purple-700 hover:bg-purple-50 transition-colors shadow-2xs"
            >
              Get Short Summary
            </button>
            <button
              onClick={onGenerateQuiz}
              className="text-xs font-semibold px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white transition-colors shadow-2xs flex items-center gap-1.5"
            >
              <span>Test Knowledge (5-Q Quiz)</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Follow-up question box */}
        <div className="mt-6 border-t border-slate-100 pt-5">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600 mb-2.5 flex items-center gap-1.5">
            <HelpCircle className="w-3.5 h-3.5 text-indigo-600" />
            Have a question about this explanation?
          </h4>

          <form onSubmit={handleFollowUpSubmit} className="flex gap-2">
            <input
              type="text"
              value={followUpText}
              onChange={(e) => setFollowUpText(e.target.value)}
              placeholder="e.g., Can you give another example?, What about if...?"
              disabled={isAskingFollowUp}
              className="flex-1 px-3.5 py-2 text-sm rounded-xl border border-slate-200 focus:outline-hidden focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 bg-slate-50/50"
            />
            <button
              type="submit"
              disabled={!followUpText.trim() || isAskingFollowUp}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-xl text-xs font-semibold transition-colors shrink-0"
            >
              {isAskingFollowUp ? 'Thinking...' : 'Ask'}
            </button>
          </form>

          {followUpAnswer && (
            <div className="mt-3.5 p-4 rounded-xl bg-indigo-50/70 border border-indigo-100 animate-in fade-in duration-200">
              <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-900 mb-1">
                <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                EduGenie Clarification:
              </div>
              <div className="text-xs sm:text-sm text-slate-800 leading-relaxed">
                <MarkdownRenderer content={followUpAnswer} />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
