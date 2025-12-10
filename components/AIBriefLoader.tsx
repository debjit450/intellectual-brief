import React, { useState, useEffect } from 'react';
import { TBLogo } from '../constants.tsx';

const BRIEF_GENERATION_STAGES = [
  { message: "Analyzing article context...", progress: 20 },
  { message: "Identifying key implications...", progress: 40 },
  { message: "Synthesizing strategic insights...", progress: 60 },
  { message: "Crafting executive summary...", progress: 80 },
  { message: "Finalizing brief...", progress: 95 },
];

interface AIBriefLoaderProps {
  articleTitle?: string;
  estimatedTime?: number; // in seconds
}

const AIBriefLoader: React.FC<AIBriefLoaderProps> = ({ articleTitle, estimatedTime = 15 }) => {
  const [stageIndex, setStageIndex] = useState(0);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [dots, setDots] = useState('');

  useEffect(() => {
    // Rotate through stages
    const stageInterval = setInterval(() => {
      setStageIndex((prev) => {
        if (prev < BRIEF_GENERATION_STAGES.length - 1) {
          return prev + 1;
        }
        return prev; // Stay on last stage
      });
    }, Math.max(3000, (estimatedTime * 1000) / BRIEF_GENERATION_STAGES.length));

    // Update elapsed time
    const timeInterval = setInterval(() => {
      setElapsedTime((prev) => prev + 1);
    }, 1000);

    // Animated dots
    const dotsInterval = setInterval(() => {
      setDots((prev) => {
        if (prev === '...') return '';
        return prev + '.';
      });
    }, 500);

    return () => {
      clearInterval(stageInterval);
      clearInterval(timeInterval);
      clearInterval(dotsInterval);
    };
  }, [estimatedTime]);

  const currentStage = BRIEF_GENERATION_STAGES[stageIndex];
  const progress = Math.min(
    currentStage.progress + (elapsedTime / estimatedTime) * 5,
    95
  );

  return (
    <div className="w-full py-16 md:py-24">
      <div className="max-w-2xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <TBLogo className="w-12 h-12 text-primary animate-pulse" />
          </div>
          <h3 className="text-xl md:text-2xl font-serif font-medium text-neutral-900 dark:text-neutral-100">
            Generating Your Brief
          </h3>
          {articleTitle && (
            <p className="text-sm text-neutral-500 dark:text-neutral-400 font-serif italic max-w-lg mx-auto px-4">
              {articleTitle}
            </p>
          )}
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="w-full bg-neutral-200 dark:bg-neutral-800 rounded-full h-2 overflow-hidden">
            <div
              className="h-full bg-primary transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="flex justify-between items-center text-xs text-neutral-400">
            <span>{Math.round(progress)}%</span>
            <span className="font-mono">
              {elapsedTime}s / ~{estimatedTime}s
            </span>
          </div>
        </div>

        {/* Current Stage */}
        <div className="text-center space-y-3">
          <p className="text-sm font-serif text-neutral-600 dark:text-neutral-300">
            {currentStage.message}
            <span className="inline-block w-4 text-left">{dots}</span>
          </p>
          
          {/* Stage Indicators */}
          <div className="flex justify-center gap-2">
            {BRIEF_GENERATION_STAGES.map((stage, idx) => (
              <div
                key={idx}
                className={`h-1.5 w-8 rounded-full transition-all duration-300 ${
                  idx <= stageIndex
                    ? 'bg-primary'
                    : 'bg-neutral-200 dark:bg-neutral-700'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Fun Facts / Tips */}
        <div className="mt-12 pt-8 border-t border-neutral-200 dark:border-neutral-800">
          <div className="text-center space-y-2">
            <p className="text-xs uppercase tracking-[0.2em] text-neutral-400 font-mono">
              Did You Know?
            </p>
            <p className="text-sm text-neutral-600 dark:text-neutral-400 font-serif italic max-w-md mx-auto">
              Our AI analyzes multiple layers of implications, from immediate effects to long-term strategic impacts.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIBriefLoader;

