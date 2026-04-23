import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Gamepad2, Target, Crosshair, Puzzle, Blocks, Sparkles } from 'lucide-react';

type ArcadeGameId = 'arrow-shot' | 'bow-arrow' | 'puzzle-match' | 'brick-smash' | 'balloon-pop';
type GameSound = 'hit' | 'miss' | 'pop';

const games: Array<{ id: ArcadeGameId; label: string; badge: string; description: string; icon: React.ComponentType<{ className?: string }> }> = [
  { id: 'arrow-shot', label: 'Arrow Shot', badge: 'Aim', description: 'Hit the moving target.', icon: Target },
  { id: 'bow-arrow', label: 'Bow & Arrow', badge: 'Timing', description: 'Release in the sweet spot.', icon: Crosshair },
  { id: 'puzzle-match', label: 'Puzzle Match', badge: 'Memory', description: 'Repeat the pattern.', icon: Puzzle },
  { id: 'brick-smash', label: 'Brick Smash', badge: 'Tap', description: 'Smash falling bricks.', icon: Blocks },
  { id: 'balloon-pop', label: 'Balloon Pop', badge: 'Pop', description: 'Pop drifting balloons.', icon: Sparkles }
];

function playGameSound(type: GameSound) {
  if (typeof window === 'undefined') return;
  const AudioContext = window.AudioContext || (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AudioContext) return;
  const ctx = new AudioContext();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.connect(gain);
  gain.connect(ctx.destination);
  const tones: Record<GameSound, [number, number, OscillatorType]> = {
    hit: [760, 0.08, 'sine'],
    miss: [180, 0.06, 'square'],
    pop: [940, 0.05, 'triangle']
  };
  const [frequency, volume, wave] = tones[type];
  osc.type = wave;
  osc.frequency.value = frequency;
  gain.gain.value = 0.0001;
  osc.start();
  gain.gain.exponentialRampToValueAtTime(volume, ctx.currentTime + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.18);
  osc.stop(ctx.currentTime + 0.2);
  window.setTimeout(() => ctx.close().catch(() => {}), 240);
}

function speedMultiplier(score: number) {
  if (score >= 100) return 3;
  if (score >= 50) return 2;
  return 1;
}

function Panel({
  title,
  description,
  score,
  misses,
  children
}: {
  title: string;
  description: string;
  score: number;
  misses: number;
  children: React.ReactNode;
}) {
  const speed = speedMultiplier(score);
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="text-xl font-semibold text-slate-900">{title}</h3>
          <p className="text-sm text-slate-600">{description}</p>
        </div>
        <div className="flex flex-wrap gap-2 text-sm">
          <span className="rounded-full bg-slate-100 px-3 py-1 font-medium text-slate-700">Score {score}</span>
          <span className="rounded-full bg-slate-100 px-3 py-1 font-medium text-slate-700">Misses {misses}</span>
          <span className="rounded-full bg-slate-100 px-3 py-1 font-medium text-slate-700">{speed}x speed</span>
        </div>
      </div>
      {children}
    </div>
  );
}

function ArrowShotGame() {
  const [score, setScore] = useState(0);
  const [misses, setMisses] = useState(0);
  const [targetX, setTargetX] = useState(50);
  const dir = useRef(1);
  useEffect(() => {
    const timer = window.setInterval(() => {
      setTargetX((current) => {
        const next = current + dir.current * (0.9 + speedMultiplier(score) * 0.5);
        if (next > 86) {
          dir.current = -1;
          return 86;
        }
        if (next < 14) {
          dir.current = 1;
          return 14;
        }
        return next;
      });
    }, 35);
    return () => window.clearInterval(timer);
  }, [score]);
  const shoot = () => {
    const hit = Math.abs(targetX - 50) <= 12;
    playGameSound(hit ? 'hit' : 'miss');
    if (hit) setScore((v) => v + 1);
    else setMisses((v) => v + 1);
  };
  return (
    <Panel title="Arrow Shot" description="Hit the target when it passes the center line." score={score} misses={misses}>
      <div className="relative h-72 overflow-hidden rounded-3xl border border-slate-200 bg-[linear-gradient(180deg,#eff6ff_0%,#f8fafc_70%,#dcfce7_100%)]">
        <div className="absolute inset-x-0 top-1/2 h-px bg-slate-400/50" />
        <div className="absolute left-1/2 top-1/2 h-24 w-px -translate-x-1/2 bg-slate-500/50" />
        <div className="absolute top-1/2 -translate-y-1/2" style={{ left: `${targetX}%` }}>
          <div className="-translate-x-1/2">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border-4 border-white bg-gradient-to-br from-rose-500 to-orange-500 shadow-xl animate-brick-pulse">
              <Target className="h-7 w-7 text-white" />
            </div>
            <div className="mt-2 text-center text-[10px] font-semibold uppercase tracking-[0.28em] text-slate-600">Target</div>
          </div>
        </div>
      </div>
      <div className="mt-4 flex flex-wrap items-center gap-3">
        <button type="button" onClick={shoot} className="rounded-2xl bg-slate-900 px-4 py-3 text-sm font-medium text-white">
          Shoot arrow
        </button>
        <button type="button" onClick={() => { setScore(0); setMisses(0); setTargetX(50); dir.current = 1; }} className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700">
          Restart
        </button>
      </div>
    </Panel>
  );
}

function BowArrowGame() {
  const [score, setScore] = useState(0);
  const [misses, setMisses] = useState(0);
  const [power, setPower] = useState(25);
  const [targetX, setTargetX] = useState(36);
  const reverse = useRef(1);
  useEffect(() => {
    const timer = window.setInterval(() => {
      setPower((current) => {
        const next = current + reverse.current * (3.2 + speedMultiplier(score) * 0.35);
        if (next > 100) {
          reverse.current = -1;
          return 100;
        }
        if (next < 20) {
          reverse.current = 1;
          return 20;
        }
        return next;
      });
      setTargetX((current) => Math.max(18, Math.min(82, current + (Math.sin(Date.now() / 500) > 0 ? 0.8 : -0.8))));
    }, 35);
    return () => window.clearInterval(timer);
  }, [score]);
  const fire = () => {
    const hit = power >= 46 && power <= 74 && Math.abs(targetX - 50) <= 14;
    playGameSound(hit ? 'hit' : 'miss');
    if (hit) setScore((v) => v + 1);
    else setMisses((v) => v + 1);
  };
  return (
    <Panel title="Bow & Arrow" description="Stop the power in the sweet spot and line up the target." score={score} misses={misses}>
      <div className="rounded-3xl border border-slate-200 bg-[linear-gradient(180deg,#eff6ff_0%,#f8fafc_70%,#ecfccb_100%)] p-5">
        <div className="relative h-28 overflow-hidden rounded-2xl bg-white/70">
          <div className="absolute left-1/2 top-2 h-24 w-px -translate-x-1/2 border-l border-dashed border-slate-500/50" />
          <div className="absolute top-8 -translate-y-1/2" style={{ left: `${targetX}%` }}>
            <div className="-translate-x-1/2">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border-4 border-white bg-gradient-to-br from-sky-500 to-indigo-600 shadow-xl">
                <Target className="h-5 w-5 text-white" />
              </div>
            </div>
          </div>
        </div>
        <div className="mt-4 h-4 overflow-hidden rounded-full bg-slate-200">
          <div className="h-full rounded-full bg-gradient-to-r from-emerald-500 via-amber-400 to-rose-500" style={{ width: `${power}%` }} />
        </div>
        <div className="mt-3 flex items-center justify-between text-sm text-slate-600">
          <span>Sweet spot 46 to 74</span>
          <span>Power {Math.round(power)}%</span>
        </div>
      </div>
      <div className="mt-4 flex flex-wrap items-center gap-3">
        <button type="button" onClick={fire} className="rounded-2xl bg-slate-900 px-4 py-3 text-sm font-medium text-white">
          Fire arrow
        </button>
        <button type="button" onClick={() => { setScore(0); setMisses(0); setPower(25); setTargetX(36); reverse.current = 1; }} className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700">
          Restart
        </button>
      </div>
    </Panel>
  );
}

function PuzzleMatchGame() {
  const palette = ['#ef4444', '#f59e0b', '#10b981', '#3b82f6'];
  const names = ['Red', 'Orange', 'Green', 'Blue'];
  const [score, setScore] = useState(0);
  const [misses, setMisses] = useState(0);
  const [sequence, setSequence] = useState<number[]>([]);
  const [step, setStep] = useState(0);
  const [showing, setShowing] = useState(false);
  const [flash, setFlash] = useState<number | null>(null);
  const timeouts = useRef<number[]>([]);
  const clearTimers = useCallback(() => {
    timeouts.current.forEach((t) => window.clearTimeout(t));
    timeouts.current = [];
  }, []);
  const startRound = useCallback(() => {
    clearTimers();
    const next = Array.from({ length: 3 + Math.min(3, Math.floor(score / 2)) }, () => Math.floor(Math.random() * palette.length));
    setSequence(next);
    setStep(0);
    setShowing(true);
    next.forEach((index, order) => {
      const timer = window.setTimeout(() => {
        setFlash(index);
        playGameSound('pop');
      }, 420 * order);
      timeouts.current.push(timer);
    });
    const done = window.setTimeout(() => {
      setShowing(false);
      setFlash(null);
    }, 420 * next.length + 100);
    timeouts.current.push(done);
  }, [clearTimers, palette.length, score]);
  useEffect(() => {
    startRound();
    return () => clearTimers();
  }, [startRound, clearTimers]);
  const press = (index: number) => {
    if (showing) return;
    if (sequence[step] === index) {
      playGameSound('hit');
      const nextStep = step + 1;
      if (nextStep >= sequence.length) {
        setScore((v) => v + 1);
        startRound();
      } else {
        setStep(nextStep);
      }
    } else {
      playGameSound('miss');
      setMisses((v) => v + 1);
      startRound();
    }
  };
  return (
    <Panel title="Puzzle Match" description="Watch the color pattern and repeat it." score={score} misses={misses}>
      <div className="rounded-3xl border border-slate-200 bg-[linear-gradient(180deg,#fff7ed,#f8fafc)] p-5">
        <div className="flex flex-wrap gap-2">
          {sequence.map((index, order) => (
            <span key={`${index}-${order}`} className="rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-white" style={{ backgroundColor: palette[index] }}>
              {names[index]}
            </span>
          ))}
        </div>
        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          {palette.map((color, index) => (
            <button
              key={color}
              type="button"
              onClick={() => press(index)}
              className={`rounded-3xl border-4 border-white p-5 text-left text-white shadow-lg transition-transform ${flash === index ? 'scale-[1.04]' : 'hover:scale-[1.01]'}`}
              style={{ background: `linear-gradient(180deg, ${color}, rgba(15,23,42,0.55))` }}
            >
              <div className="text-xs uppercase tracking-[0.35em] text-white/80">{names[index]}</div>
              <div className="mt-6 text-2xl font-semibold">{flash === index ? 'Watch!' : 'Tap me'}</div>
            </button>
          ))}
        </div>
      </div>
      <div className="mt-4 flex flex-wrap items-center gap-3">
        <button type="button" onClick={startRound} className="rounded-2xl bg-slate-900 px-4 py-3 text-sm font-medium text-white">
          New pattern
        </button>
      </div>
    </Panel>
  );
}

function BrickSmashGame() {
  const [score, setScore] = useState(0);
  const [misses, setMisses] = useState(0);
  const [bricks, setBricks] = useState<Array<{ id: number; lane: number; y: number; color: string }>>([]);
  useEffect(() => {
    const spawn = window.setInterval(() => {
      setBricks((current) => [...current, { id: Date.now() + Math.random(), lane: Math.floor(Math.random() * 4), y: -20, color: ['#f97316', '#ea580c', '#f59e0b', '#fb7185'][Math.floor(Math.random() * 4)] }]);
    }, 900 - Math.min(300, score * 8));
    const frame = window.setInterval(() => {
      setBricks((current) =>
        current
          .map((brick) => ({ ...brick, y: brick.y + (1.4 + speedMultiplier(score) * 0.65) }))
          .filter((brick) => {
            if (brick.y > 260) {
              setMisses((v) => v + 1);
              return false;
            }
            return true;
          })
      );
    }, 28);
    return () => {
      window.clearInterval(spawn);
      window.clearInterval(frame);
    };
  }, [score]);
  return (
    <Panel title="Brick Smash" description="Tap the falling bricks before they land." score={score} misses={misses}>
      <div className="relative h-72 overflow-hidden rounded-3xl border border-slate-200 bg-[linear-gradient(180deg,#fff7ed_0%,#f8fafc_35%,#ecfccb_100%)]">
        {bricks.map((brick) => (
          <button
            key={brick.id}
            type="button"
            onClick={() => { playGameSound('hit'); setScore((v) => v + 1); setBricks((current) => current.filter((item) => item.id !== brick.id)); }}
            className="absolute h-14 w-[calc(25%-12px)] rounded-2xl border border-white/50 text-white shadow-lg"
            style={{
              left: `calc(${brick.lane * 25}% + 16px)`,
              top: `${brick.y}px`,
              background: `linear-gradient(180deg, ${brick.color}, rgba(15,23,42,0.75))`
            }}
          >
            Brick
          </button>
        ))}
      </div>
    </Panel>
  );
}

function BalloonPopGame() {
  const [score, setScore] = useState(0);
  const [misses, setMisses] = useState(0);
  const [balloons, setBalloons] = useState<Array<{ id: number; x: number; y: number; color: string }>>([]);
  useEffect(() => {
    const spawn = window.setInterval(() => {
      setBalloons((current) => [...current, { id: Date.now() + Math.random(), x: 10 + Math.random() * 76, y: 260, color: ['#fb7185', '#f97316', '#8b5cf6', '#06b6d4'][Math.floor(Math.random() * 4)] }]);
    }, 820 - Math.min(250, score * 7));
    const frame = window.setInterval(() => {
      setBalloons((current) =>
        current
          .map((balloon) => ({ ...balloon, y: balloon.y - (1.2 + speedMultiplier(score) * 0.6) }))
          .filter((balloon) => {
            if (balloon.y < -40) {
              setMisses((v) => v + 1);
              return false;
            }
            return true;
          })
      );
    }, 28);
    return () => {
      window.clearInterval(spawn);
      window.clearInterval(frame);
    };
  }, [score]);
  return (
    <Panel title="Balloon Pop" description="Pop the balloons before they float away." score={score} misses={misses}>
      <div className="relative h-72 overflow-hidden rounded-3xl border border-slate-200 bg-[radial-gradient(circle_at_top,_#ecfeff_0%,_#dbeafe_45%,_#f8fafc_100%)]">
        {balloons.map((balloon) => (
          <button
            key={balloon.id}
            type="button"
            onClick={() => { playGameSound('pop'); setScore((v) => v + 1); setBalloons((current) => current.filter((item) => item.id !== balloon.id)); }}
            className="absolute select-none transition-transform hover:scale-110"
            style={{ left: `${balloon.x}%`, top: `${balloon.y}px` }}
          >
            <div className="relative w-16 animate-floaty">
              <div className="mx-auto h-16 w-16 rounded-full shadow-lg" style={{ background: balloon.color }} />
              <div className="mx-auto h-5 w-px bg-slate-400" />
              <div className="mx-auto h-3 w-px bg-slate-300" />
            </div>
          </button>
        ))}
      </div>
    </Panel>
  );
}

export function FunZone() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initial = (searchParams.get('game') as ArcadeGameId) || 'arrow-shot';
  const [selected, setSelected] = useState<ArcadeGameId>(games.some((item) => item.id === initial) ? initial : 'arrow-shot');

  const choose = (game: ArcadeGameId) => {
    setSelected(game);
    const next = new URLSearchParams(searchParams);
    next.set('game', game);
    setSearchParams(next, { replace: true });
    playGameSound('pop');
  };

  const activeGame = useMemo(() => {
    if (selected === 'arrow-shot') return <ArrowShotGame />;
    if (selected === 'bow-arrow') return <BowArrowGame />;
    if (selected === 'puzzle-match') return <PuzzleMatchGame />;
    if (selected === 'brick-smash') return <BrickSmashGame />;
    return <BalloonPopGame />;
  }, [selected]);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-8">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-3xl bg-orange-100 text-orange-700 shadow-sm">
          <Gamepad2 className="h-8 w-8" />
        </div>
        <p className="text-xs uppercase tracking-[0.35em] text-slate-500 mb-2">Fun arcade zone</p>
        <h1 className="text-3xl font-semibold text-slate-900 mb-3">Play one game at a time</h1>
        <p className="text-slate-600 max-w-2xl mx-auto">
          This page is only for arcade-style games. No typing tabs, just quick games with sound and motion.
        </p>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm mb-6">
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
          {games.map((game) => {
            const Icon = game.icon;
            const active = selected === game.id;
            return (
              <button
                key={game.id}
                type="button"
                onClick={() => choose(game.id)}
                className={`rounded-2xl border p-4 text-left transition-all ${
                  active ? 'border-orange-500 bg-orange-50 shadow-sm scale-[1.01]' : 'border-slate-200 bg-slate-50 hover:bg-white'
                }`}
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-500">{game.badge}</div>
                  <Icon className="h-5 w-5 text-slate-600" />
                </div>
                <div className="mt-2 text-base font-semibold text-slate-900">{game.label}</div>
                <div className="mt-1 text-sm text-slate-600">{game.description}</div>
              </button>
            );
          })}
        </div>
      </div>

      <div className="mx-auto max-w-4xl">{activeGame}</div>
    </div>
  );
}

export default FunZone;
