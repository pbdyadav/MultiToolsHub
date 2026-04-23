import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { BookOpen, Download, Gamepad2, Keyboard, RefreshCw, Sparkles, Target, BarChart3 } from 'lucide-react';
import jsPDF from 'jspdf';

type LessonLevel = 'Beginner' | 'Intermediate' | 'Advanced';
type Tab = 'Learn' | 'Fun' | 'Dictation' | 'Progress';
type Stats = { wpm: number; accuracy: number; mistakes: number; timeSeconds: number; charsTyped: number };
type SessionRecord = { title: string; wpm: number; accuracy: number; mistakes: number; when: string };

const STORAGE_KEY = 'multitoolweb-typing-progress';

const lessonLibrary: Record<LessonLevel, string[]> = {
  Beginner: [
    'f j f j f j a s d f j k l ;',
    'asdf jkl; asdf jkl; asdf jkl;',
    'left hand begins on asdf and right hand begins on jkl;'
  ],
  Intermediate: [
    'The quick brown fox jumps over the lazy dog.',
    'Practice accuracy first and speed will follow naturally.',
    'Keep your eyes on the screen and let your fingers learn the route.'
  ],
  Advanced: [
    'Consistent typing practice builds rhythm, accuracy, and confidence over time.',
    'When your hands stay relaxed, your speed becomes smoother and more sustainable.',
    'Every accurate keystroke trains muscle memory and sharpens your control.'
  ]
};

const dictationPrompts = [
  'Students learn best when they practice every day with patience and focus.',
  'A quiet room, a relaxed posture, and steady breathing help typing flow naturally.',
  'Good writing comes from careful reading, smooth rhythm, and accurate keystrokes.',
  'Typing speed grows when the hands stay calm and the eyes stay on the text.',
  'Every lesson becomes easier when the student repeats it with confidence.'
];

type GameSound = 'hit' | 'miss' | 'pop';

function playGameSound(type: GameSound) {
  if (typeof window === 'undefined') return;
  const AudioContext = window.AudioContext || (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AudioContext) return;

  const ctx = new AudioContext();
  const oscillator = ctx.createOscillator();
  const gain = ctx.createGain();
  oscillator.connect(gain);
  gain.connect(ctx.destination);

  const tones: Record<GameSound, [number, number, string]> = {
    hit: [680, 0.07, 'sine'],
    miss: [180, 0.06, 'square'],
    pop: [920, 0.05, 'triangle']
  };
  const [frequency, volume, wave] = tones[type];
  oscillator.type = wave as OscillatorType;
  oscillator.frequency.value = frequency;
  gain.gain.value = 0.0001;
  oscillator.start();
  gain.gain.exponentialRampToValueAtTime(volume, ctx.currentTime + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.16);
  oscillator.stop(ctx.currentTime + 0.18);
  setTimeout(() => ctx.close().catch(() => {}), 220);
}

const fingerGuide = [
  { finger: 'Left pinky', keys: ['Q', 'A', 'Z', '1', 'Tab', 'Caps', 'Shift', 'Ctrl'], tone: 'bg-rose-500' },
  { finger: 'Left ring', keys: ['W', 'S', 'X', '2', '3'], tone: 'bg-orange-500' },
  { finger: 'Left middle', keys: ['E', 'D', 'C', '4', '5'], tone: 'bg-amber-500' },
  { finger: 'Left index', keys: ['R', 'T', 'F', 'G', 'V', 'B', '6', '7'], tone: 'bg-emerald-500' },
  { finger: 'Right index', keys: ['Y', 'U', 'H', 'J', 'N', 'M', '8', '9'], tone: 'bg-cyan-500' },
  { finger: 'Right middle', keys: ['I', 'K', ',', '0'], tone: 'bg-blue-500' },
  { finger: 'Right ring', keys: ['O', 'L', '.', '-'], tone: 'bg-indigo-500' },
  { finger: 'Right pinky', keys: ['P', ';', '/', '[', ']', '\\', 'Enter', 'Shift'], tone: 'bg-fuchsia-500' }
];

function buildLessonText(level: LessonLevel, index: number) {
  const lines = lessonLibrary[level];
  return lines[index % lines.length];
}

function useTypingPractice(targetText: string) {
  const [input, setInput] = useState('');
  const [startedAt, setStartedAt] = useState<number | null>(null);
  const [endedAt, setEndedAt] = useState<number | null>(null);
  const [mistakes, setMistakes] = useState(0);

  useEffect(() => {
    setInput('');
    setStartedAt(null);
    setEndedAt(null);
    setMistakes(0);
  }, [targetText]);

  const onChange = (value: string) => {
    const trimmed = value.slice(0, targetText.length);
    if (!startedAt && trimmed.length > 0) setStartedAt(Date.now());
    setInput(trimmed);

    let errorCount = 0;
    for (let i = 0; i < trimmed.length; i += 1) {
      if (trimmed[i] !== targetText[i]) errorCount += 1;
    }
    setMistakes(errorCount);

    if (trimmed.length === targetText.length && trimmed === targetText && !endedAt) {
      setEndedAt(Date.now());
    }
  };

  const stats = useMemo<Stats | null>(() => {
    if (!startedAt) return null;
    const end = endedAt ?? Date.now();
    const minutes = Math.max(1 / 60000, (end - startedAt) / 60000);
    const typedWords = input.trim().split(/\s+/).filter(Boolean).length;
    const wpm = Math.round(typedWords / minutes);
    const accuracy = input.length > 0 ? Math.max(0, Math.round(((input.length - mistakes) / input.length) * 100)) : 100;
    const timeSeconds = Math.max(0, Math.round((end - startedAt) / 1000));
    return { wpm, accuracy, mistakes, timeSeconds, charsTyped: input.length };
  }, [input, mistakes, startedAt, endedAt]);

  return {
    input,
    onChange,
    stats,
    isComplete: input.length === targetText.length && input === targetText,
    reset: () => {
      setInput('');
      setStartedAt(null);
      setEndedAt(null);
      setMistakes(0);
    }
  };
}

function readHistory(): SessionRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as SessionRecord[]) : [];
  } catch {
    return [];
  }
}

function saveHistory(record: SessionRecord) {
  const current = readHistory();
  const next = [record, ...current].slice(0, 12);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  return next;
}

function FingerGuide() {
  return (
    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
      {fingerGuide.map((item) => (
        <div key={item.finger} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <span className={`inline-flex h-3 w-3 rounded-full ${item.tone}`} />
            <h4 className="font-semibold text-slate-900">{item.finger}</h4>
          </div>
          <div className="flex flex-wrap gap-2">
            {item.keys.map((key) => (
              <span key={key} className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
                {key}
              </span>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function LessonLab({ onComplete }: { onComplete: (stats: Stats) => void }) {
  const [level, setLevel] = useState<LessonLevel>('Beginner');
  const [exerciseIndex, setExerciseIndex] = useState(0);
  const targetText = useMemo(() => buildLessonText(level, exerciseIndex), [level, exerciseIndex]);
  const { input, onChange, stats, isComplete, reset } = useTypingPractice(targetText);

  useEffect(() => {
    if (stats && isComplete) onComplete(stats);
  }, [stats, isComplete, onComplete]);

  const nextExercise = () => {
    setExerciseIndex((value) => value + 1);
    reset();
  };

  const charClass = (index: number) => {
    if (index < input.length) {
      return input[index] === targetText[index] ? 'bg-emerald-200 text-emerald-900' : 'bg-rose-200 text-rose-900';
    }
    if (index === input.length) return 'bg-sky-500 text-white';
    return 'text-slate-700';
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2">
        {(['Beginner', 'Intermediate', 'Advanced'] as LessonLevel[]).map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => {
              setLevel(item);
              setExerciseIndex(0);
            }}
            className={`rounded-xl px-4 py-2 text-sm font-medium transition-colors ${
              level === item ? 'bg-teal-600 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            {item}
          </button>
        ))}
        <button
          type="button"
          onClick={nextExercise}
          className="ml-auto inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
        >
          <RefreshCw className="h-4 w-4" />
          Next exercise
        </button>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Metric label="WPM" value={stats?.wpm ?? 0} tone="text-blue-600" />
        <Metric label="Accuracy" value={`${stats?.accuracy ?? 100}%`} tone="text-emerald-600" />
        <Metric label="Mistakes" value={stats?.mistakes ?? 0} tone="text-rose-600" />
        <Metric label="Time" value={`${stats?.timeSeconds ?? 0}s`} tone="text-violet-600" />
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-4 rounded-2xl bg-slate-50 p-4 font-mono text-lg leading-8 text-slate-800 whitespace-pre-wrap">
          {targetText.split('').map((char, index) => (
            <span key={`${char}-${index}`} className={`${charClass(index)} rounded px-1 py-0.5`}>
              {char}
            </span>
          ))}
        </div>

        <textarea
          value={input}
          onChange={(event) => onChange(event.target.value)}
          className="h-36 w-full rounded-2xl border border-slate-200 p-4 font-mono text-base outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-200"
          placeholder="Start typing the practice text here..."
          spellCheck={false}
        />

        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
          <div className="text-sm text-slate-600">
            {isComplete ? 'Great work. You finished the exercise.' : 'Keep your eyes on the text and keep your hands relaxed.'}
          </div>
          <button
            type="button"
            onClick={() => reset()}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            <RefreshCw className="h-4 w-4" />
            Reset
          </button>
        </div>
      </div>
    </div>
  );
}

function DictationRoom({ onComplete }: { onComplete: (stats: Stats) => void }) {
  const [index, setIndex] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const targetText = dictationPrompts[index % dictationPrompts.length];
  const { input, onChange, stats, isComplete, reset } = useTypingPractice(targetText);

  useEffect(() => {
    if (stats && isComplete) onComplete(stats);
  }, [stats, isComplete, onComplete]);

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="text-xl font-semibold text-slate-900">Dictation Room</h3>
            <p className="text-sm text-slate-600">Listen with the eyes, type the sentence, and build classroom accuracy.</p>
          </div>
          <button
            type="button"
            onClick={() => setShowHint((value) => !value)}
            className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-medium text-slate-700"
          >
            {showHint ? 'Hide hint' : 'Show hint'}
          </button>
        </div>
        <div className="mt-4 rounded-2xl bg-slate-50 p-4 text-slate-800">
          {showHint ? targetText : 'Type the sentence shown in this exercise.'}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Metric label="WPM" value={stats?.wpm ?? 0} tone="text-blue-600" />
        <Metric label="Accuracy" value={`${stats?.accuracy ?? 100}%`} tone="text-emerald-600" />
        <Metric label="Mistakes" value={stats?.mistakes ?? 0} tone="text-rose-600" />
        <Metric label="Time" value={`${stats?.timeSeconds ?? 0}s`} tone="text-violet-600" />
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
        <textarea
          value={input}
          onChange={(event) => onChange(event.target.value)}
          className="h-40 w-full rounded-2xl border border-slate-200 p-4 font-mono text-base outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-200"
          placeholder="Type the dictation sentence here..."
          spellCheck={false}
        />
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => {
              setIndex((value) => value + 1);
              reset();
            }}
            className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-white"
          >
            Next sentence
          </button>
          <button
            type="button"
            onClick={reset}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-slate-700"
          >
            Reset
          </button>
        </div>
      </div>
    </div>
  );
}

function arcadeSpeed(score: number) {
  if (score >= 100) return 3;
  if (score >= 50) return 2;
  return 1;
}

function useArcadeStats(score: number, misses: number, startedAt: React.MutableRefObject<number>, onComplete: (stats: Stats) => void) {
  useEffect(() => {
    onComplete({
      wpm: 0,
      accuracy: Math.max(0, Math.round((score / Math.max(1, score + misses)) * 100)),
      mistakes: misses,
      timeSeconds: Math.max(0, Math.round((Date.now() - startedAt.current) / 1000)),
      charsTyped: score
    });
  }, [score, misses, onComplete, startedAt]);
}

export function GameCardShell({
  title,
  description,
  score,
  misses,
  speedLabel,
  children,
  footer
}: {
  title: string;
  description: string;
  score: number;
  misses: number;
  speedLabel: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h4 className="text-lg font-semibold text-slate-900">{title}</h4>
          <p className="text-sm text-slate-600">{description}</p>
        </div>
        <div className="flex flex-wrap gap-2 text-sm">
          <span className="rounded-full bg-slate-100 px-3 py-1 font-medium text-slate-700">Score {score}</span>
          <span className="rounded-full bg-slate-100 px-3 py-1 font-medium text-slate-700">Misses {misses}</span>
          <span className="rounded-full bg-slate-100 px-3 py-1 font-medium text-slate-700">{speedLabel}</span>
        </div>
      </div>
      {children}
      {footer && <div className="mt-4">{footer}</div>}
    </div>
  );
}

export function ArrowShotGame({ onComplete }: { onComplete: (stats: Stats) => void }) {
  const startedAt = useRef(Date.now());
  const direction = useRef(1);
  const [score, setScore] = useState(0);
  const [misses, setMisses] = useState(0);
  const [targetX, setTargetX] = useState(50);
  const [arrowFlash, setArrowFlash] = useState(false);

  useEffect(() => {
    startedAt.current = Date.now();
    direction.current = 1;
    setScore(0);
    setMisses(0);
    setTargetX(50);
    setArrowFlash(false);
  }, []);

  useArcadeStats(score, misses, startedAt, onComplete);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setTargetX((current) => {
        const step = (0.9 + score * 0.02) * arcadeSpeed(score);
        let next = current + direction.current * step;
        if (next >= 86) {
          direction.current = -1;
          next = 86;
        }
        if (next <= 14) {
          direction.current = 1;
          next = 14;
        }
        return next;
      });
    }, 40);
    return () => window.clearInterval(timer);
  }, [score]);

  const shoot = () => {
    const hit = Math.abs(targetX - 50) <= 12;
    setArrowFlash(true);
    window.setTimeout(() => setArrowFlash(false), 180);
    if (hit) {
      playGameSound('hit');
      setScore((value) => value + 1);
    } else {
      playGameSound('miss');
      setMisses((value) => value + 1);
    }
  };

  const speedLabel = arcadeSpeed(score) === 1 ? '1x speed' : arcadeSpeed(score) === 2 ? '2x speed' : '3x speed';

  return (
    <GameCardShell
      title="Arrow Shot"
      description="Shoot when the target reaches the center line."
      score={score}
      misses={misses}
      speedLabel={speedLabel}
      footer={
        <button
          type="button"
          onClick={() => {
            startedAt.current = Date.now();
            direction.current = 1;
            setScore(0);
            setMisses(0);
            setTargetX(50);
          }}
          className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700"
        >
          Restart
        </button>
      }
    >
      <div className="relative overflow-hidden rounded-3xl border border-slate-200 bg-[radial-gradient(circle_at_top,_#eff6ff,_#dbeafe_48%,_#f8fafc_100%)] p-5">
        <div className="absolute inset-x-0 top-1/2 h-px bg-slate-400/40" />
        <div className="absolute inset-x-0 bottom-0 h-14 bg-gradient-to-t from-emerald-100/70 to-transparent" />
        <div className="absolute left-1/2 top-1/2 h-24 w-px -translate-x-1/2 bg-slate-500/40" />
        <div
          className={`absolute top-1/2 -translate-y-1/2 transition-transform duration-75 ${arrowFlash ? 'scale-110' : 'scale-100'}`}
          style={{ left: `${targetX}%` }}
        >
          <div className="relative -translate-x-1/2">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border-4 border-white bg-gradient-to-br from-rose-500 to-orange-500 shadow-xl animate-brick-pulse">
              <Target className="h-7 w-7 text-white" />
            </div>
            <div className="mt-2 text-center text-[10px] font-semibold uppercase tracking-[0.28em] text-slate-600">Target</div>
          </div>
        </div>
        <div className={`mt-20 flex items-end justify-center ${arrowFlash ? 'opacity-100' : 'opacity-80'}`}>
          <div className="h-20 w-1 rounded-full bg-slate-700" />
          <div className="-ml-1 h-10 w-10 rounded-full border-b-8 border-r-8 border-t-8 border-b-transparent border-r-transparent border-t-transparent border-slate-700" />
        </div>
      </div>
      <div className="mt-4 flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={shoot}
          className="inline-flex items-center gap-2 rounded-2xl bg-slate-900 px-4 py-3 text-sm font-medium text-white shadow-sm hover:bg-slate-800"
        >
          Shoot arrow
        </button>
        <span className="text-sm text-slate-600">Time the shot for the center circle.</span>
      </div>
    </GameCardShell>
  );
}

export function BowArrowGame({ onComplete }: { onComplete: (stats: Stats) => void }) {
  const startedAt = useRef(Date.now());
  const direction = useRef(1);
  const [score, setScore] = useState(0);
  const [misses, setMisses] = useState(0);
  const [power, setPower] = useState(30);
  const [targetX, setTargetX] = useState(36);
  const [fired, setFired] = useState(false);

  useEffect(() => {
    startedAt.current = Date.now();
  }, []);

  useArcadeStats(score, misses, startedAt, onComplete);

  useEffect(() => {
    const powerTimer = window.setInterval(() => {
      setPower((current) => {
        const rising = direction.current > 0;
        let next = current + (rising ? 3.4 : -3.4) * arcadeSpeed(score);
        if (next >= 100) {
          direction.current = -1;
          next = 100;
        }
        if (next <= 20) {
          direction.current = 1;
          next = 20;
        }
        return next;
      });
    }, 32);

    const targetTimer = window.setInterval(() => {
      setTargetX((current) => {
        const step = (0.7 + score * 0.015) * arcadeSpeed(score);
        let next = current + (Math.sin(Date.now() / 500) > 0 ? step : -step);
        if (next > 82) next = 82;
        if (next < 18) next = 18;
        return next;
      });
    }, 46);

    return () => {
      window.clearInterval(powerTimer);
      window.clearInterval(targetTimer);
    };
  }, [score]);

  const fire = () => {
    const sweetPower = power >= 45 && power <= 72;
    const sweetAim = Math.abs(targetX - 50) <= 14;
    const hit = sweetPower && sweetAim;
    setFired(true);
    window.setTimeout(() => setFired(false), 220);
    if (hit) {
      playGameSound('hit');
      setScore((value) => value + 1);
    } else {
      playGameSound('miss');
      setMisses((value) => value + 1);
    }
  };

  const speedLabel = arcadeSpeed(score) === 1 ? '1x speed' : arcadeSpeed(score) === 2 ? '2x speed' : '3x speed';

  return (
    <GameCardShell
      title="Bow & Arrow"
      description="Hold your timing, then fire when the bow and the target line up."
      score={score}
      misses={misses}
      speedLabel={speedLabel}
      footer={
        <button
          type="button"
          onClick={() => {
            startedAt.current = Date.now();
            setScore(0);
            setMisses(0);
            setPower(30);
            setTargetX(36);
          }}
          className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700"
        >
          Restart
        </button>
      }
    >
      <div className="relative overflow-hidden rounded-3xl border border-slate-200 bg-[linear-gradient(180deg,#eff6ff_0%,#f8fafc_70%,#ecfccb_100%)] p-5">
        <div className="absolute left-1/2 top-3 h-24 w-px -translate-x-1/2 border-l border-dashed border-slate-500/50" />
        <div
          className="absolute top-12 -translate-y-1/2 transition-all duration-75"
          style={{ left: `${targetX}%` }}
        >
          <div className="-translate-x-1/2">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border-4 border-white bg-gradient-to-br from-sky-500 to-indigo-600 shadow-xl">
              <Target className="h-6 w-6 text-white" />
            </div>
            <div className="mt-2 text-center text-[10px] font-semibold uppercase tracking-[0.28em] text-slate-600">Aim here</div>
          </div>
        </div>
        <div className="mt-32 rounded-3xl border border-white/70 bg-white/60 p-4 shadow-sm">
          <div className="mb-3 text-xs uppercase tracking-[0.35em] text-slate-500">Bow power</div>
          <div className="h-4 overflow-hidden rounded-full bg-slate-200">
            <div className={`h-full rounded-full bg-gradient-to-r from-emerald-500 via-amber-400 to-rose-500 transition-all duration-75 ${fired ? 'scale-y-110' : ''}`} style={{ width: `${power}%` }} />
          </div>
          <div className="mt-3 flex items-center justify-between text-sm text-slate-600">
            <span>Sweet spot: 45 to 72</span>
            <span>Power: {Math.round(power)}%</span>
          </div>
          <div className="mt-5 flex items-end justify-center gap-3">
            <div className="h-16 w-2 rounded-full bg-slate-700" />
            <div className="h-24 w-24 rounded-full border-4 border-slate-700 border-l-transparent border-t-transparent shadow-inner" />
            <div className={`h-1 w-28 origin-left rounded-full bg-slate-700 transition-transform duration-100 ${fired ? 'scale-x-125' : 'scale-x-100'}`} />
          </div>
        </div>
      </div>
      <div className="mt-4 flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={fire}
          className="inline-flex items-center gap-2 rounded-2xl bg-slate-900 px-4 py-3 text-sm font-medium text-white shadow-sm hover:bg-slate-800"
        >
          Fire arrow
        </button>
        <span className="text-sm text-slate-600">Try to stop the power in the sweet zone.</span>
      </div>
    </GameCardShell>
  );
}

export function PuzzleMatchGame({ onComplete }: { onComplete: (stats: Stats) => void }) {
  const startedAt = useRef(Date.now());
  const timeouts = useRef<number[]>([]);
  const scoreRef = useRef(0);
  const palette = ['#ef4444', '#f59e0b', '#10b981', '#3b82f6'];
  const names = ['Red', 'Orange', 'Green', 'Blue'];
  const [score, setScore] = useState(0);
  const [misses, setMisses] = useState(0);
  const [sequence, setSequence] = useState<number[]>([]);
  const [showing, setShowing] = useState(true);
  const [flashIndex, setFlashIndex] = useState<number | null>(null);
  const [step, setStep] = useState(0);
  const [message, setMessage] = useState('Watch the pattern, then repeat it.');

  useEffect(() => {
    scoreRef.current = score;
  }, [score]);

  const clearTimers = useCallback(() => {
    timeouts.current.forEach((timer) => window.clearTimeout(timer));
    timeouts.current = [];
  }, []);

  const startRound = useCallback(() => {
    clearTimers();
    const next = Array.from({ length: 3 + Math.min(3, Math.floor(scoreRef.current / 2)) }, () => Math.floor(Math.random() * palette.length));
    setSequence(next);
    setStep(0);
    setShowing(true);
    setMessage('Watch the pattern, then repeat it.');
    next.forEach((index, order) => {
      const timer = window.setTimeout(() => {
        setFlashIndex(index);
        playGameSound('pop');
      }, 420 * order);
      timeouts.current.push(timer);
    });
    const revealTimer = window.setTimeout(() => {
      setFlashIndex(null);
      setShowing(false);
      setMessage('Your turn. Tap the same colors in order.');
    }, 420 * next.length + 100);
    timeouts.current.push(revealTimer);
  }, [clearTimers, palette.length]);

  useEffect(() => {
    startedAt.current = Date.now();
    startRound();
    return () => clearTimers();
  }, [startRound, clearTimers]);

  useArcadeStats(score, misses, startedAt, onComplete);

  const pressTile = (index: number) => {
    if (showing || !sequence.length) return;
    if (sequence[step] === index) {
      playGameSound('hit');
      const nextStep = step + 1;
      if (nextStep >= sequence.length) {
        setScore((value) => value + 1);
        setMessage('Nice. New pattern coming up.');
        window.setTimeout(startRound, 450);
      } else {
        setStep(nextStep);
      }
    } else {
      playGameSound('miss');
      setMisses((value) => value + 1);
      setStep(0);
      setMessage('That was close. Try the pattern again.');
      startRound();
    }
  };

  const speedLabel = arcadeSpeed(score) === 1 ? '1x speed' : arcadeSpeed(score) === 2 ? '2x speed' : '3x speed';

  return (
    <GameCardShell title="Puzzle Match" description="Memorize the sequence and repeat it one tile at a time." score={score} misses={misses} speedLabel={speedLabel}>
      <div className="rounded-3xl border border-slate-200 bg-[linear-gradient(180deg,#fff7ed,#f8fafc)] p-5">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <div className="text-xs uppercase tracking-[0.35em] text-slate-500">Pattern</div>
            <div className="mt-1 text-sm text-slate-600">{message}</div>
          </div>
          <div className="text-sm font-medium text-slate-600">Step {Math.min(step + 1, Math.max(1, sequence.length))} / {Math.max(1, sequence.length)}</div>
        </div>
        <div className="flex flex-wrap gap-2">
          {sequence.map((index, order) => (
            <span
              key={`${index}-${order}`}
              className="rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-white shadow-sm"
              style={{ backgroundColor: palette[index] }}
            >
              {names[index]}
            </span>
          ))}
        </div>
        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          {palette.map((color, index) => {
            const isActive = flashIndex === index;
            return (
              <button
                key={color}
                type="button"
                onClick={() => pressTile(index)}
                className={`relative overflow-hidden rounded-3xl border-4 border-white p-5 text-left text-white shadow-lg transition-transform duration-150 ${isActive ? 'scale-[1.04]' : 'hover:scale-[1.01]'}`}
                style={{ background: `linear-gradient(180deg, ${color}, rgba(15,23,42,0.55))` }}
              >
                <div className="text-xs uppercase tracking-[0.35em] text-white/80">{names[index]}</div>
                <div className="mt-6 text-2xl font-semibold">{isActive ? 'Match!' : 'Tap me'}</div>
                <div className={`absolute inset-0 bg-white/20 transition-opacity duration-150 ${isActive ? 'opacity-100' : 'opacity-0'}`} />
              </button>
            );
          })}
        </div>
      </div>
      <div className="mt-4 flex flex-wrap items-center gap-3">
        <button type="button" onClick={startRound} className="rounded-2xl bg-slate-900 px-4 py-3 text-sm font-medium text-white">
          New pattern
        </button>
        <span className="text-sm text-slate-600">Watch closely. The pattern grows as you score higher.</span>
      </div>
    </GameCardShell>
  );
}

type FallingBrick = {
  id: number;
  lane: number;
  y: number;
  color: string;
};

export function BrickSmashGame({ onComplete }: { onComplete: (stats: Stats) => void }) {
  const startedAt = useRef(Date.now());
  const spawnRef = useRef(0);
  const [score, setScore] = useState(0);
  const [misses, setMisses] = useState(0);
  const [bricks, setBricks] = useState<FallingBrick[]>([]);

  useEffect(() => {
    startedAt.current = Date.now();
  }, []);

  useArcadeStats(score, misses, startedAt, onComplete);

  useEffect(() => {
    const spawnTimer = window.setInterval(() => {
      setBricks((current) => [
        ...current,
        {
          id: Date.now() + spawnRef.current,
          lane: Math.floor(Math.random() * 4),
          y: -20,
          color: ['#f97316', '#ea580c', '#f59e0b', '#fb7185'][Math.floor(Math.random() * 4)]
        }
      ]);
      spawnRef.current += 1;
    }, 920 - Math.min(320, score * 10));

    const frame = window.setInterval(() => {
      setBricks((current) => {
        const speed = (1.4 + score * 0.03) * arcadeSpeed(score);
        const next = current
          .map((brick) => ({ ...brick, y: brick.y + speed }))
          .filter((brick) => {
            if (brick.y > 260) {
              setMisses((value) => value + 1);
              return false;
            }
            return true;
          });
        return next;
      });
    }, 24);

    return () => {
      window.clearInterval(spawnTimer);
      window.clearInterval(frame);
    };
  }, [score]);

  const smashBrick = (id: number) => {
    const found = bricks.find((brick) => brick.id === id);
    if (!found) return;
    playGameSound('hit');
    setScore((value) => value + 1);
    setBricks((current) => current.filter((brick) => brick.id !== id));
  };

  const speedLabel = arcadeSpeed(score) === 1 ? '1x speed' : arcadeSpeed(score) === 2 ? '2x speed' : '3x speed';

  return (
    <GameCardShell
      title="Brick Smash"
      description="Tap the falling bricks before they hit the bottom."
      score={score}
      misses={misses}
      speedLabel={speedLabel}
      footer={
        <button
          type="button"
          onClick={() => {
            startedAt.current = Date.now();
            setScore(0);
            setMisses(0);
            setBricks([]);
          }}
          className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700"
        >
          Restart
        </button>
      }
    >
      <div className="relative h-72 overflow-hidden rounded-3xl border border-slate-200 bg-[linear-gradient(180deg,#fff7ed_0%,#f8fafc_35%,#ecfccb_100%)]">
        <div className="absolute inset-x-0 bottom-0 h-14 bg-gradient-to-t from-amber-200/80 to-transparent" />
        <div className="absolute inset-x-0 bottom-12 h-px bg-slate-500/40" />
        <div className="grid h-full grid-cols-4 gap-px p-4">
          {bricks.map((brick) => (
            <button
              key={brick.id}
              type="button"
              onClick={() => smashBrick(brick.id)}
              className="absolute flex h-14 w-[calc(25%-12px)] items-center justify-center rounded-2xl border border-white/50 text-sm font-semibold text-white shadow-lg transition-transform hover:scale-[1.03]"
              style={{
                left: `calc(${brick.lane * 25}% + 16px)`,
                top: `${brick.y}px`,
                background: `linear-gradient(180deg, ${brick.color}, rgba(15,23,42,0.75))`
              }}
            >
              <div className="absolute inset-2 rounded-xl border border-white/25" />
              <span className="relative z-10">Brick</span>
            </button>
          ))}
        </div>
      </div>
      <div className="mt-4 flex flex-wrap items-center gap-3">
        <span className="text-sm text-slate-600">The pace gets faster after 50 and 100 points.</span>
      </div>
    </GameCardShell>
  );
}

type BalloonItem = {
  id: number;
  x: number;
  y: number;
  drift: number;
  color: string;
};

export function BalloonPopGame({ onComplete }: { onComplete: (stats: Stats) => void }) {
  const startedAt = useRef(Date.now());
  const spawnRef = useRef(0);
  const [score, setScore] = useState(0);
  const [misses, setMisses] = useState(0);
  const [balloons, setBalloons] = useState<BalloonItem[]>([]);

  useEffect(() => {
    startedAt.current = Date.now();
  }, []);

  useArcadeStats(score, misses, startedAt, onComplete);

  useEffect(() => {
    const spawnTimer = window.setInterval(() => {
      setBalloons((current) => [
        ...current,
        {
          id: Date.now() + spawnRef.current,
          x: 10 + Math.random() * 76,
          y: 255,
          drift: (Math.random() - 0.5) * 0.55,
          color: ['#fb7185', '#f97316', '#8b5cf6', '#06b6d4'][Math.floor(Math.random() * 4)]
        }
      ]);
      spawnRef.current += 1;
    }, 850 - Math.min(260, score * 8));

    const frame = window.setInterval(() => {
      setBalloons((current) => {
        const speed = (1.2 + score * 0.03) * arcadeSpeed(score);
        return current
          .map((balloon) => ({ ...balloon, y: balloon.y - speed, x: balloon.x + balloon.drift }))
          .filter((balloon) => {
            if (balloon.y < -40) {
              setMisses((value) => value + 1);
              return false;
            }
            return true;
          });
      });
    }, 24);

    return () => {
      window.clearInterval(spawnTimer);
      window.clearInterval(frame);
    };
  }, [score]);

  const popBalloon = (id: number) => {
    playGameSound('pop');
    setScore((value) => value + 1);
    setBalloons((current) => current.filter((balloon) => balloon.id !== id));
  };

  const speedLabel = arcadeSpeed(score) === 1 ? '1x speed' : arcadeSpeed(score) === 2 ? '2x speed' : '3x speed';

  return (
    <GameCardShell
      title="Balloon Pop"
      description="Pop the balloons before they float away."
      score={score}
      misses={misses}
      speedLabel={speedLabel}
      footer={
        <button
          type="button"
          onClick={() => {
            startedAt.current = Date.now();
            setScore(0);
            setMisses(0);
            setBalloons([]);
          }}
          className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700"
        >
          Restart
        </button>
      }
    >
      <div className="relative h-72 overflow-hidden rounded-3xl border border-slate-200 bg-[radial-gradient(circle_at_top,_#ecfeff_0%,_#dbeafe_45%,_#f8fafc_100%)]">
        <div className="absolute inset-x-0 top-0 h-14 bg-gradient-to-b from-white/70 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-emerald-100/70 to-transparent" />
        {balloons.map((balloon) => (
          <button
            key={balloon.id}
            type="button"
            onClick={() => popBalloon(balloon.id)}
            className="absolute select-none transition-transform duration-150 hover:scale-110"
            style={{ left: `${balloon.x}%`, top: `${balloon.y}px` }}
          >
            <div className="relative w-16 animate-floaty">
              <div className="mx-auto h-16 w-16 rounded-full shadow-lg" style={{ background: balloon.color }} />
              <div className="mx-auto h-5 w-px bg-slate-400" />
              <div className="mx-auto h-3 w-px bg-slate-300" />
              <div className="absolute inset-x-0 top-5 text-center text-[10px] font-semibold uppercase tracking-[0.25em] text-white drop-shadow">
                Pop
              </div>
            </div>
          </button>
        ))}
      </div>
      <div className="mt-4 flex flex-wrap items-center gap-3">
        <span className="text-sm text-slate-600">Fast, colorful, and easy to understand for younger students.</span>
      </div>
    </GameCardShell>
  );
}

function ProgressBoard({ sessions, onClear }: { sessions: SessionRecord[]; onClear: () => void }) {
  const avgWpm = sessions.length ? Math.round(sessions.reduce((sum, item) => sum + item.wpm, 0) / sessions.length) : 0;
  const avgAccuracy = sessions.length ? Math.round(sessions.reduce((sum, item) => sum + item.accuracy, 0) / sessions.length) : 0;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <Metric label="Sessions" value={sessions.length} tone="text-blue-600" />
        <Metric label="Avg WPM" value={avgWpm} tone="text-emerald-600" />
        <Metric label="Avg Accuracy" value={`${avgAccuracy}%`} tone="text-violet-600" />
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between gap-3 mb-4">
          <div>
            <h3 className="text-xl font-semibold text-slate-900">Student progress</h3>
            <p className="text-sm text-slate-600">Recent saved typing results from learning and dictation.</p>
          </div>
          <button
            type="button"
            onClick={onClear}
            className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-medium text-slate-700"
          >
            Clear history
          </button>
        </div>

        <div className="grid gap-3">
          {sessions.map((session, index) => (
            <div key={`${session.when}-${index}`} className="rounded-2xl border border-slate-200 bg-slate-50 p-4 flex flex-wrap items-center justify-between gap-3">
              <div>
                <div className="font-semibold text-slate-900">{session.title}</div>
                <div className="text-sm text-slate-600">{session.when}</div>
              </div>
              <div className="flex flex-wrap gap-2 text-sm">
                <span className="rounded-full bg-white px-3 py-1">WPM {session.wpm}</span>
                <span className="rounded-full bg-white px-3 py-1">Accuracy {session.accuracy}%</span>
                <span className="rounded-full bg-white px-3 py-1">Mistakes {session.mistakes}</span>
              </div>
            </div>
          ))}
          {!sessions.length && <div className="text-sm text-slate-500">No saved results yet. Finish one practice session and it will appear here.</div>}
        </div>
      </div>
    </div>
  );
}

function Metric({ label, value, tone }: { label: string; value: React.ReactNode; tone: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="text-xs uppercase tracking-[0.28em] text-slate-500">{label}</div>
      <div className={`mt-1 text-2xl font-semibold ${tone}`}>{value}</div>
    </div>
  );
}

function downloadPracticeSummary(stats: Stats | null, title: string) {
  if (!stats) return;
  const doc = new jsPDF();
  doc.setDrawColor(30, 41, 59);
  doc.setLineWidth(0.6);
  doc.roundedRect(10, 10, 190, 277, 4, 4);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.text('MultiToolWeb Typing Summary', 105, 24, { align: 'center' });
  doc.setFontSize(12);
  doc.text(title, 105, 34, { align: 'center' });
  doc.setFont('helvetica', 'normal');
  doc.text(`WPM: ${stats.wpm}`, 20, 54);
  doc.text(`Accuracy: ${stats.accuracy}%`, 20, 64);
  doc.text(`Mistakes: ${stats.mistakes}`, 20, 74);
  doc.text(`Time: ${stats.timeSeconds}s`, 20, 84);
  doc.text(`Characters typed: ${stats.charsTyped}`, 20, 94);
  doc.text('MultiToolWeb', 105, 272, { align: 'center' });
  doc.save('typing-zone-summary.pdf');
}

type TypingGameMode = 'balloon' | 'brick' | 'bird';

function TypingArcadeGame({
  title,
  description,
  mode,
  accent,
  wordList
}: {
  title: string;
  description: string;
  mode: TypingGameMode;
  accent: string;
  wordList: string[];
}) {
  const arenaRef = useRef<HTMLDivElement>(null);
  const spawnTimerRef = useRef<number | null>(null);
  const [items, setItems] = useState<Array<{ id: number; word: string; x: number; y: number; drift: number }>>([]);
  const [typed, setTyped] = useState('');
  const [score, setScore] = useState(0);
  const [misses, setMisses] = useState(0);
  const startTimeRef = useRef(Date.now());

  const speed = Math.min(1.15, 0.5 + score * 0.012);

  const spawnItem = useCallback(() => {
    const width = arenaRef.current?.clientWidth ?? 720;
    const x = 10 + Math.random() * Math.max(1, width - 120);
    const word = wordList[Math.floor(Math.random() * wordList.length)];
    const y = mode === 'balloon' ? 220 : mode === 'brick' ? -30 : 110 + Math.random() * 90;
    setItems((current) => [...current, { id: Date.now() + Math.random(), word, x, y, drift: (Math.random() - 0.5) * 0.35 }]);
  }, [mode, wordList]);

  useEffect(() => {
    setItems([]);
    setTyped('');
    setScore(0);
    setMisses(0);
    startTimeRef.current = Date.now();
    spawnTimerRef.current = window.setInterval(spawnItem, mode === 'bird' ? 1200 : 1500);
    spawnItem();
    return () => {
      if (spawnTimerRef.current) window.clearInterval(spawnTimerRef.current);
    };
  }, [mode, spawnItem]);

  useEffect(() => {
    const frame = window.setInterval(() => {
      setItems((current) =>
        current
          .map((item) => {
            const next = { ...item };
            if (mode === 'balloon') {
              next.y -= 6 * speed;
              next.x += Math.sin(Date.now() / 450 + item.id) * 0.35;
            }
            if (mode === 'brick') {
              next.y += 7 * speed;
              next.x += Math.sin(Date.now() / 450 + item.id) * 0.2;
            }
            if (mode === 'bird') {
              next.x += 7 * speed;
              next.y += Math.sin(Date.now() / 500 + item.id) * 0.2;
            }
            return next;
          })
          .filter((item) => {
            const offscreen =
              mode === 'balloon'
                ? item.y < -40
                : mode === 'brick'
                  ? item.y > 248
                  : item.x > (arenaRef.current?.clientWidth ?? 720) + 80;
            if (offscreen) setMisses((value) => value + 1);
            return !offscreen;
          })
      );
    }, 40);
    return () => window.clearInterval(frame);
  }, [mode, speed]);

  const onType = (value: string) => {
    const next = value.slice(0, 24);
    setTyped(next);
    const hit = items.find((item) => item.word.toLowerCase() === next.trim().toLowerCase());
    if (!hit) return;
    playGameSound('pop');
    setScore((value) => value + 1);
    setItems((current) => current.filter((item) => item.id !== hit.id));
    setTyped('');
  };

  const elapsedSeconds = Math.max(0, Math.round((Date.now() - startTimeRef.current) / 1000));
  const accuracy = Math.max(0, Math.round((score / Math.max(1, score + misses)) * 100));
  const speedLabel = score >= 100 ? '3x speed' : score >= 50 ? '2x speed' : '1x speed';

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h4 className="text-lg font-semibold text-slate-900">{title}</h4>
          <p className="text-sm text-slate-600">{description}</p>
        </div>
        <div className="flex flex-wrap gap-2 text-sm">
          <span className="rounded-full bg-slate-100 px-3 py-1 font-medium text-slate-700">Score {score}</span>
          <span className="rounded-full bg-slate-100 px-3 py-1 font-medium text-slate-700">Misses {misses}</span>
          <span className="rounded-full bg-slate-100 px-3 py-1 font-medium text-slate-700">{speedLabel}</span>
        </div>
      </div>

      <div
        ref={arenaRef}
        className={`relative h-72 overflow-hidden rounded-3xl border border-slate-200 ${
          mode === 'balloon'
            ? 'bg-[radial-gradient(circle_at_top,_#ecfeff,_#dbeafe)]'
            : mode === 'brick'
              ? 'bg-[linear-gradient(180deg,#fff7ed,#f8fafc_35%,#ecfccb)]'
              : 'bg-[linear-gradient(180deg,#eff6ff,#f8fafc)]'
        }`}
      >
        {mode === 'balloon' && <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.8),_transparent_40%)]" />}
        {mode === 'brick' && <div className="absolute inset-x-0 bottom-0 h-14 bg-gradient-to-t from-amber-200/70 to-transparent" />}
        {mode === 'bird' && <div className="absolute inset-x-0 top-0 h-10 bg-gradient-to-b from-white/70 to-transparent" />}
        {items.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => onType(item.word)}
            className="absolute select-none"
            style={{ left: `${item.x}px`, top: `${item.y}px` }}
          >
            {mode === 'balloon' && (
              <div className="relative w-24 animate-floaty">
                <div className={`mx-auto h-16 w-16 rounded-full shadow-lg ${accent} ring-4 ring-white/25`} />
                <div className="mx-auto h-6 w-px bg-slate-400" />
                <div className="mx-auto h-3 w-px bg-slate-300" />
                <div className="absolute inset-x-0 top-5 text-center text-[10px] font-semibold uppercase tracking-[0.25em] text-white drop-shadow">
                  {item.word}
                </div>
              </div>
            )}
            {mode === 'brick' && (
              <div className={`relative flex h-14 w-36 items-center justify-center rounded-2xl border border-white/50 px-4 text-sm font-semibold text-white shadow-lg animate-brick-pulse ${accent}`}>
                <span className="relative z-10 uppercase tracking-[0.16em]">{item.word}</span>
              </div>
            )}
            {mode === 'bird' && (
              <div className="relative flex h-14 items-center gap-2 rounded-full border border-white/70 bg-white/90 px-4 shadow-lg animate-cloud-drift">
                <span className={`inline-flex h-8 w-8 items-center justify-center rounded-full text-white ${accent}`}>★</span>
                <span className="text-sm font-semibold uppercase tracking-[0.16em] text-slate-900">{item.word}</span>
              </div>
            )}
          </button>
        ))}
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <input
          value={typed}
          onChange={(event) => onType(event.target.value)}
          placeholder="Type the word to score"
          className="min-w-[240px] flex-1 rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-200"
        />
        <button
          type="button"
          onClick={() => {
            setItems([]);
            setTyped('');
            setScore(0);
            setMisses(0);
            startTimeRef.current = Date.now();
            spawnItem();
          }}
          className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50"
        >
          Restart
        </button>
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-4">
        <Metric label="WPM" value={0} tone="text-blue-600" />
        <Metric label="Accuracy" value={`${accuracy}%`} tone="text-emerald-600" />
        <Metric label="Time" value={`${elapsedSeconds}s`} tone="text-violet-600" />
        <Metric label="Words" value={items.length} tone="text-orange-600" />
      </div>
    </div>
  );
}

function TypingGamesSection() {
  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-xl font-semibold text-slate-900">Typing games</h2>
        <p className="text-sm text-slate-600">These typing games stay inside Typing Zone, so students can practice and play in the same learning area.</p>
      </div>
      <div className="grid gap-6">
        <TypingArcadeGame
          title="Balloon Blast Typing"
          description="Type the word on each balloon before it floats away."
          mode="balloon"
          accent="bg-gradient-to-r from-rose-500 to-fuchsia-500"
          wordList={['type', 'learn', 'focus', 'speed', 'practice', 'skill', 'react', 'logic']}
        />
        <TypingArcadeGame
          title="Brick Breaker Typing"
          description="Break the falling bricks by typing the matching word."
          mode="brick"
          accent="bg-gradient-to-r from-orange-500 to-amber-600"
          wordList={['brick', 'block', 'crash', 'smash', 'type', 'learn', 'build', 'break']}
        />
        <TypingArcadeGame
          title="Birds Flying Typing"
          description="Clear the flying birds by typing the word on the card."
          mode="bird"
          accent="bg-gradient-to-r from-sky-500 to-blue-600"
          wordList={['bird', 'fly', 'sky', 'cloud', 'wing', 'swift', 'type', 'zoom']}
        />
      </div>
    </div>
  );
}

export function TypingZone() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialTab = useMemo<Tab>(() => {
    const raw = String(searchParams.get('tab') || '').toLowerCase();
    if (raw === 'fun') return 'Fun';
    if (raw === 'dictation') return 'Dictation';
    if (raw === 'progress') return 'Progress';
    return 'Learn';
  }, [searchParams]);
  const [tab, setTab] = useState<Tab>(initialTab);
  const [previewStats, setPreviewStats] = useState<Stats | null>(null);
  const [history, setHistory] = useState<SessionRecord[]>([]);
  const savedLearnRef = useRef<string>('');
  const savedDictationRef = useRef<string>('');

  useEffect(() => {
    setHistory(readHistory());
  }, []);

  useEffect(() => {
    setTab(initialTab);
  }, [initialTab]);

  const setTabAndQuery = (next: Tab) => {
    setTab(next);
    const params = new URLSearchParams(searchParams);
    if (next === 'Learn') {
      params.delete('tab');
    } else {
      params.set('tab', next.toLowerCase());
    }
    setSearchParams(params, { replace: true });
  };

  const recordSession = (title: string, stats: Stats, markerRef: React.MutableRefObject<string>) => {
    const marker = `${title}-${stats.wpm}-${stats.accuracy}-${stats.mistakes}-${stats.timeSeconds}`;
    if (markerRef.current === marker) return;
    markerRef.current = marker;
    const when = new Intl.DateTimeFormat('en-IN', {
      dateStyle: 'medium',
      timeStyle: 'short'
    }).format(new Date());
    const next = saveHistory({ title, wpm: stats.wpm, accuracy: stats.accuracy, mistakes: stats.mistakes, when });
    setHistory(next);
    setPreviewStats(stats);
  };

  const clearHistory = () => {
    localStorage.removeItem(STORAGE_KEY);
    setHistory([]);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-8">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-3xl bg-teal-100 text-teal-700 shadow-sm">
          {tab === 'Fun' ? <Gamepad2 className="h-8 w-8" /> : <Keyboard className="h-8 w-8" />}
        </div>
        <p className="text-xs uppercase tracking-[0.35em] text-slate-500 mb-2">{tab === 'Fun' ? 'Fun arcade zone' : 'Typing zone'}</p>
        <h1 className="text-3xl font-semibold text-slate-900 mb-3">
          {tab === 'Fun' ? 'Choose a game, play one at a time' : 'Learn, practice, and play'}
        </h1>
        <p className="text-slate-600 max-w-2xl mx-auto">
          {tab === 'Fun'
            ? 'Pick a mini game from the top and play it in a clean, focused panel with sound and motion.'
            : 'A calmer learning path for beginners, extra student tools for classroom practice, and game modes that feel like real games.'}
        </p>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-3 mb-8">
        {[
          { id: 'Learn', icon: BookOpen, label: 'Learning' },
          { id: 'Fun', icon: Gamepad2, label: 'Fun Zone' },
          { id: 'Dictation', icon: Target, label: 'Dictation Room' },
          { id: 'Progress', icon: BarChart3, label: 'Student Progress' }
        ].map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => setTabAndQuery(item.id as Tab)}
              className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium ${
                tab === item.id ? 'bg-teal-600 text-white' : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </button>
          );
        })}
        {previewStats && (
          <button
            type="button"
            onClick={() => downloadPracticeSummary(previewStats, `${tab} session`)}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            <Download className="h-4 w-4" />
            Download summary
          </button>
        )}
      </div>

      <div className="space-y-6 rounded-3xl border border-slate-200 bg-[linear-gradient(180deg,#f8fafc_0%,#fdfdfd_100%)] p-5 sm:p-6 shadow-[0_20px_60px_rgba(15,23,42,0.08)]">
        {tab === 'Learn' && (
          <>
            <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <Sparkles className="h-5 w-5 text-teal-600" />
                <div>
                  <h2 className="text-xl font-semibold text-slate-900">Typing learning path</h2>
                  <p className="text-sm text-slate-600">Beginner to advanced, with a finger guide that helps students understand key placement.</p>
                </div>
              </div>
              <FingerGuide />
            </div>

            <LessonLab onComplete={(stats) => recordSession('Learning practice', stats, savedLearnRef)} />
          </>
        )}

        {tab === 'Fun' && (
          <TypingGamesSection />
        )}

        {tab === 'Dictation' && (
          <DictationRoom onComplete={(stats) => recordSession('Dictation room', stats, savedDictationRef)} />
        )}

        {tab === 'Progress' && <ProgressBoard sessions={history} onClear={clearHistory} />}
      </div>
    </div>
  );
}

export default TypingZone;
