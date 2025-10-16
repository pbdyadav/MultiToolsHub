import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Keyboard, BookOpen, Gamepad2, Download, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import jsPDF from 'jspdf';

type LessonLevel = 'Basic' | 'Intermediate' | 'Advanced';

const lessonsByLevel: Record<LessonLevel, string[]> = {
  Basic: [
    'ffff jjjj fffj jjjf fjfj jfjf asdf jkl; asdf jkl; asdf jkl;',
    'asdf asdf jkl; jkl; asdf jkl; asdf jkl; a s d f j k l ;',
    'aa ss dd ff jj kk ll ;; as as df jk l; as df jk l;'
  ],
  Intermediate: [
    'practice makes perfect keep your eyes on the screen and type steadily',
    'accuracy is more important than speed focus on correct keystrokes and rhythm',
    'the quick brown fox jumps over the lazy dog many times today'
  ],
  Advanced: (() => {
    const base = [
      'Typing is a fundamental skill that enhances productivity and communication across many domains.',
      'Consistent practice with varied texts improves muscle memory, accuracy, and sustainable speed.',
      'Maintain ergonomic posture and calm breathing to minimize fatigue during extended sessions.',
      'Believe in your progress; every keystroke builds confidence and mastery.',
      'Focus on rhythm and accuracy; speed grows naturally over time.',
      'You are capable of remarkable growth when you practice consistently.',
      'Small improvements compound into big results—keep typing with purpose.',
      'Relax your shoulders, breathe deeply, and enjoy the learning journey.',
      'Clarity comes with repetition; let each sentence sharpen your skills.',
      'Your dedication today creates a confident typist tomorrow.'
    ];
    const generated: string[] = [];
    for (let i = 1; i <= 100; i++) {
      generated.push(`Keep going ${i}: You are improving with every word. Stay calm and type with confidence.`);
    }
    return [...base, ...generated];
  })()
};

type Stats = { wpm: number; accuracy: number; mistakes: number; timeSeconds: number };

function useTypingSession(targetText: string) {
  const [input, setInput] = useState('');
  const [startedAt, setStartedAt] = useState<number | null>(null);
  const [endedAt, setEndedAt] = useState<number | null>(null);
  const [mistakes, setMistakes] = useState(0);
  const isCompleted = input.length >= targetText.length;

  useEffect(() => {
    if (isCompleted && !endedAt) setEndedAt(Date.now());
  }, [isCompleted, endedAt]);

  const onChange = (value: string) => {
    if (!startedAt && value.length > 0) setStartedAt(Date.now());
    setInput(value.slice(0, targetText.length));
    let errs = 0;
    for (let i = 0; i < value.length && i < targetText.length; i++) {
      if (value[i] !== targetText[i]) errs++;
    }
    setMistakes(errs);
  };

  const stats: Stats | null = useMemo(() => {
    if (!startedAt) return null;
    const end = endedAt ?? Date.now();
    const minutes = (end - startedAt) / 60000;
    const words = input.trim().split(/\s+/).filter(Boolean).length;
    const wpm = minutes > 0 ? Math.round(words / minutes) : 0;
    const accuracy = input.length ? Math.max(0, Math.round(((input.length - mistakes) / input.length) * 100)) : 100;
    const timeSeconds = Math.max(0, Math.round((end - startedAt) / 1000));
    return { wpm, accuracy, mistakes, timeSeconds };
  }, [startedAt, endedAt, input, mistakes]);

  const reset = () => {
    setInput('');
    setStartedAt(null);
    setEndedAt(null);
    setMistakes(0);
  };

  return { input, onChange, stats, reset, isCompleted };
}

function Lessons() {
  const [level, setLevel] = useState<LessonLevel>('Basic');
  const [index, setIndex] = useState(0);
  const text = lessonsByLevel[level][index % lessonsByLevel[level].length];
  const { input, onChange, stats, reset, isCompleted } = useTypingSession(text);
  const audioRef = useRef<HTMLAudioElement>(null);
  const [musicOn, setMusicOn] = useState(false);

  const next = () => {
    setIndex((i) => i + 1);
    reset();
  };

  useEffect(() => { reset(); setIndex(0); }, [level]);

  useEffect(() => {
    if (musicOn) {
      audioRef.current?.play().catch(() => {});
    } else {
      audioRef.current?.pause();
    }
  }, [musicOn]);

  const charClass = (i: number) => {
    if (i < input.length) return input[i] === text[i] ? 'bg-green-200 text-green-800' : 'bg-red-200 text-red-800';
    if (i === input.length) return 'bg-blue-500 text-white';
    return 'text-gray-700';
  };

  return (
    <div>
      <div className="flex flex-wrap gap-2 mb-4">
        {(['Basic','Intermediate','Advanced'] as LessonLevel[]).map((lvl) => (
          <button key={lvl} onClick={() => setLevel(lvl)} className={`px-4 py-2 rounded-lg text-sm font-medium ${level===lvl?'bg-indigo-600 text-white':'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>{lvl}</button>
        ))}
        <button onClick={()=>setMusicOn((m)=>!m)} className={`ml-auto px-3 py-2 rounded-lg text-sm ${musicOn?'bg-emerald-600 text-white':'bg-white border text-gray-700 hover:bg-gray-50'}`}>{musicOn?'Pause Music':'Play Music'}</button>
        <audio ref={audioRef} loop src="https://cdn.pixabay.com/download/audio/2022/03/15/audio_8e3a0b4e2a.mp3?filename=ambient-piano-112199.mp3" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg border text-center"><div className="text-2xl font-bold text-blue-600">{stats?.wpm ?? 0}</div><div className="text-sm text-gray-600">WPM</div></div>
        <div className="bg-white p-4 rounded-lg border text-center"><div className="text-2xl font-bold text-green-600">{stats?.accuracy ?? 100}%</div><div className="text-sm text-gray-600">Accuracy</div></div>
        <div className="bg-white p-4 rounded-lg border text-center"><div className="text-2xl font-bold text-red-600">{stats?.mistakes ?? 0}</div><div className="text-sm text-gray-600">Mistakes</div></div>
        <div className="bg-white p-4 rounded-lg border text-center"><div className="text-2xl font-bold text-purple-600">{stats?.timeSeconds ?? 0}s</div><div className="text-sm text-gray-600">Time</div></div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border p-6 mb-4">
        <div className="font-mono text-lg leading-8 mb-4">
          {text.split('').map((ch, i) => (
            <span key={i} className={`${charClass(i)} px-1 py-0.5 rounded`}>{ch}</span>
          ))}
        </div>
        <textarea value={input} onChange={(e)=>onChange(e.target.value)} className="w-full h-28 p-4 border rounded-lg focus:ring-2 focus:ring-indigo-500 font-mono" placeholder="Start typing here..." disabled={isCompleted} />
      </div>

      <div className="flex gap-3">
        <button onClick={reset} className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 inline-flex items-center gap-2"><RefreshCw className="h-4 w-4"/>Reset</button>
        <button onClick={next} className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">Next Exercise</button>
        {isCompleted && stats && (
          <button onClick={()=>downloadReport(stats, `Lesson Result - ${level}`)} className="px-4 py-2 border rounded hover:bg-gray-50">Download Report</button>
        )}
      </div>
    </div>
  );
}

// Simple Balloon Blast game
function BalloonBlast() {
  const words = useMemo(() => ['type','fast','react','code','learn','focus','speed','skill','logic','debug'], []);
  const [active, setActive] = useState<{ id: number; word: string; x: number; born: number }[]>([]);
  const [typed, setTyped] = useState('');
  const [score, setScore] = useState(0);
  const [misses, setMisses] = useState(0);
  const [running, setRunning] = useState(true);
  const startTime = useRef<number>(Date.now());
  const spawn = useCallback(() => {
    const id = Date.now();
    const word = words[Math.floor(Math.random()*words.length)];
    const x = Math.random()*80+10; // percentage
    setActive((a)=>[...a, { id, word, x, born: Date.now() }]);
  }, [words]);

  useEffect(() => {
    if (!running) return;
    let interval = 1400;
    const tick = () => {
      const elapsed = (Date.now() - startTime.current) / 1000;
      interval = Math.max(500, 1400 - elapsed * 20);
      spawn();
      timer = window.setTimeout(tick, interval);
    };
    let timer = window.setTimeout(tick, interval);
    return () => clearTimeout(timer);
  }, [running, spawn]);

  const onType = (val: string) => {
    setTyped(val);
    const hit = active.find((b) => b.word === val.trim());
    if (hit) {
      setScore((s)=>s+1);
      setActive((a)=>a.filter((b)=>b.id!==hit.id));
      setTyped('');
      try {
        const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
        const o = ctx.createOscillator(); const g = ctx.createGain();
        o.type='triangle'; o.frequency.value=880; o.connect(g); g.connect(ctx.destination); g.gain.value=0.05; o.start(); setTimeout(()=>{o.stop(); ctx.close();}, 120);
      } catch {}
    }
  };

  return (
    <div>
      <div className="flex items-center gap-6 mb-4">
        <div className="text-sm text-gray-600">Score: <span className="font-semibold text-green-600">{score}</span></div>
        <div className="text-sm text-gray-600">Misses: <span className="font-semibold text-red-600">{misses}</span></div>
        <button onClick={()=>{setActive([]);setScore(0);setMisses(0);setRunning(true);}} className="ml-auto px-3 py-1.5 rounded bg-gray-100 hover:bg-gray-200">Restart</button>
      </div>
      <div className="relative h-72 overflow-hidden rounded-lg bg-gradient-to-b from-sky-50 to-sky-100 border">
        <AnimatePresence>
          {active.map((b) => {
            const elapsed = (Date.now() - b.born) / 1000;
            const duration = Math.max(3, 7 - elapsed * 0.1);
            return (
              <motion.div
                key={b.id}
                className="absolute px-3 py-1 rounded-full bg-pink-500 text-white font-medium shadow"
                style={{ left: `${b.x}%` }}
                initial={{ bottom: -40, opacity: 0 }}
                animate={{ bottom: 320, opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration, ease: 'linear' }}
                onAnimationComplete={() => {
                  setActive((a)=>a.filter((x)=>x.id!==b.id));
                  setMisses((m)=>m+1);
                }}
              >{b.word}</motion.div>
            );
          })}
        </AnimatePresence>
      </div>
      <input value={typed} onChange={(e)=>onType(e.target.value)} className="mt-4 w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-rose-500" placeholder="Type a word to pop a balloon..." />
    </div>
  );
}

function Games() {
  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Balloon Blast Typing</h3>
        <p className="text-sm text-gray-600 mb-3">Type the words shown on balloons to pop them before they fly away.</p>
        <BalloonBlast />
      </div>
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Brick Breaker Typing</h3>
        <p className="text-sm text-gray-600 mb-3">Bricks fall with words. Type to break them before they reach the bottom.</p>
        {BrickBreaker()}
      </div>
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Birds Flying Typing</h3>
        <p className="text-sm text-gray-600 mb-3">Birds fly across the sky carrying words. Type to clear them.</p>
        {BirdsFlying()}
      </div>
    </div>
  );
}

function downloadReport(stats: Stats, title: string) {
  const doc = new jsPDF();
  doc.setFontSize(18);
  doc.text(title, 14, 20);
  doc.setFontSize(12);
  const y = 35;
  doc.text(`WPM: ${stats.wpm}`, 14, y);
  doc.text(`Accuracy: ${stats.accuracy}%`, 14, y + 10);
  doc.text(`Mistakes: ${stats.mistakes}`, 14, y + 20);
  doc.text(`Time: ${stats.timeSeconds}s`, 14, y + 30);
  doc.save('typing-report.pdf');
}

export function TypingZone() {
  const [tab, setTab] = useState<'Lessons' | 'Games'>('Lessons');
  const [lastStats, setLastStats] = useState<Stats | null>(null);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-8">
        <div className="bg-teal-100 p-4 rounded-full w-fit mx-auto mb-4">
          <Keyboard className="h-8 w-8 text-teal-600" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Typing Zone</h1>
        <p className="text-gray-600">Learn, practice, and have fun with interactive typing lessons and games</p>
      </div>

      <div className="flex gap-2 justify-center mb-8">
        <button onClick={()=>setTab('Lessons')} className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg ${tab==='Lessons'?'bg-teal-600 text-white':'bg-white border text-gray-700 hover:bg-gray-50'}`}><BookOpen className="h-4 w-4"/>Lessons</button>
        <button onClick={()=>setTab('Games')} className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg ${tab==='Games'?'bg-teal-600 text-white':'bg-white border text-gray-700 hover:bg-gray-50'}`}><Gamepad2 className="h-4 w-4"/>Games</button>
        {lastStats && (
          <button onClick={()=>downloadReport(lastStats, `Typing ${tab} Report`)} className="ml-2 inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white border hover:bg-gray-50"><Download className="h-4 w-4"/>Download Report</button>
        )}
      </div>

      <div className="bg-white rounded-xl shadow-sm border p-6">
        {tab === 'Lessons' ? <Lessons /> : <Games />}
      </div>
    </div>
  );
}

export default TypingZone;


