import React, { useMemo, useState } from 'react';
import { Keyboard, Play, RotateCcw, Trophy, Download } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

type LineCount = 2 | 5 | 10 | 25 | 50;
type TypingStats = { wpm: number; accuracy: number; errors: number; seconds: number; finishedAt: number | null };

const baseSentences = [
  'The quick brown fox jumps over the lazy dog.',
  'Practice makes progress when you type with focus.',
  'Every clean keystroke builds speed and accuracy.',
  'Keep your posture relaxed and your hands steady.',
  'Short practice every day creates strong muscle memory.',
  'Students improve faster when they can see clear feedback.',
  'Accuracy comes first, then speed follows naturally.',
  'A calm rhythm helps you type with confidence.',
  'Good typing is a skill that gets better with repetition.',
  'Write each word carefully and let your fingers learn.'
];

function buildPassage(lineCount: LineCount) {
  return Array.from({ length: lineCount }, (_, index) => {
    const sentence = baseSentences[index % baseSentences.length];
    return `${index + 1}. ${sentence}`;
  }).join('\n');
}

function toReadableDate(value = new Date()) {
  return new Intl.DateTimeFormat('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  }).format(value);
}

function useTypingStats(targetText: string) {
  const [input, setInput] = useState('');
  const [startTime, setStartTime] = useState<number | null>(null);
  const [endTime, setEndTime] = useState<number | null>(null);
  const [errors, setErrors] = useState(0);

  const reset = () => {
    setInput('');
    setStartTime(null);
    setEndTime(null);
    setErrors(0);
  };

  const handleInput = (value: string) => {
    const next = value.slice(0, targetText.length);
    if (!startTime && next.length > 0) setStartTime(Date.now());
    setInput(next);

    let errorCount = 0;
    for (let index = 0; index < next.length; index += 1) {
      if (next[index] !== targetText[index]) errorCount += 1;
    }
    setErrors(errorCount);

    if (next.length === targetText.length && next === targetText && !endTime) {
      setEndTime(Date.now());
    }
  };

  const stats = useMemo<TypingStats | null>(() => {
    if (!startTime) return null;
    const end = endTime ?? Date.now();
    const minutes = Math.max(1 / 60000, (end - startTime) / 60000);
    const typedWords = input.trim().split(/\s+/).filter(Boolean).length;
    const wpm = Math.round(typedWords / minutes);
    const accuracy = input.length > 0 ? Math.max(0, Math.round(((input.length - errors) / input.length) * 100)) : 100;
    const seconds = Math.max(0, Math.round((end - startTime) / 1000));
    return { wpm, accuracy, errors, seconds, finishedAt: endTime };
  }, [startTime, endTime, input, errors]);

  return {
    input,
    handleInput,
    reset,
    stats,
    isComplete: input.length === targetText.length && input === targetText
  };
}

async function loadLogoDataUrl(src: string) {
  const response = await fetch(src);
  const blob = await response.blob();
  return await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(blob);
  });
}

async function generateCertificatePdf({
  name,
  phone,
  lineCount,
  dateLabel,
  stats
}: {
  name: string;
  phone: string;
  lineCount: LineCount;
  dateLabel: string;
  stats: TypingStats;
}) {
  if (!stats) return;
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  doc.setDrawColor(32, 41, 74);
  doc.setLineWidth(0.8);
  doc.roundedRect(10, 10, pageWidth - 20, pageHeight - 20, 3, 3);

  try {
    const logo = await loadLogoDataUrl('/images/logo.png');
    doc.addImage(logo, 'PNG', 86, 16, 38, 22);
  } catch {
    // Logo is optional in case the browser blocks the fetch.
  }

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(20);
  doc.text('Typing Speed Test Certificate', pageWidth / 2, 48, { align: 'center' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(11);
  doc.text('This certificate confirms the student completed the typing assessment with the recorded result.', pageWidth / 2, 56, {
    align: 'center',
    maxWidth: pageWidth - 40
  });

  doc.setFontSize(12);
  doc.text(`Student Name: ${name}`, 18, 72);
  doc.text(`Phone Number: ${phone}`, 18, 80);
  doc.text(`Test Date: ${dateLabel}`, 18, 88);
  doc.text(`Selected Length: ${lineCount} lines`, 18, 96);

  autoTable(doc, {
    startY: 106,
    head: [['WPM', 'Accuracy', 'Mistakes', 'Time']],
    body: [[`${stats.wpm}`, `${stats.accuracy}%`, `${stats.errors}`, `${stats.seconds}s`]],
    styles: {
      halign: 'center',
      font: 'helvetica',
      fontSize: 11
    },
    headStyles: {
      fillColor: [15, 118, 110],
      textColor: [255, 255, 255]
    },
    alternateRowStyles: {
      fillColor: [241, 245, 249]
    }
  });

  const tableBottom = (doc as jsPDF & { lastAutoTable?: { finalY?: number } }).lastAutoTable?.finalY ?? 140;

  doc.setFontSize(11);
  doc.text('Performance summary', 18, tableBottom + 16);
  doc.setFontSize(10);
  doc.text(
    'The typing result above is generated from the completed exercise and should be shared with the student for practice review.',
    18,
    tableBottom + 24,
    { maxWidth: pageWidth - 36 }
  );

  doc.setFontSize(9);
  doc.text('MultiToolWeb', pageWidth / 2, pageHeight - 16, { align: 'center' });
  doc.text('https://multitoolweb.local', pageWidth / 2, pageHeight - 10, { align: 'center' });

  doc.save(`${name.replace(/\s+/g, '_') || 'Typing_Student'}_Typing_Certificate.pdf`);
}

export function TypingTest() {
  const [lineCount, setLineCount] = useState<LineCount>(2);
  const [candidateName, setCandidateName] = useState('');
  const [candidatePhone, setCandidatePhone] = useState('');
  const [exerciseIndex, setExerciseIndex] = useState(0);
  const practiceText = useMemo(() => buildPassage(lineCount), [lineCount]);
  const targetText = useMemo(() => {
    const lines = practiceText.split('\n');
    if (exerciseIndex === 0) return practiceText;
    const shifted = lines.slice(exerciseIndex % lines.length).concat(lines.slice(0, exerciseIndex % lines.length));
    return shifted.join('\n');
  }, [practiceText, exerciseIndex]);
  const { input, handleInput, reset, stats, isComplete } = useTypingStats(targetText);

  const nextText = () => {
    setExerciseIndex((value) => value + 1);
    reset();
  };

  const downloadCertificate = async () => {
    if (!stats || !candidateName.trim() || !candidatePhone.trim()) return;
    await generateCertificatePdf({
      name: candidateName.trim(),
      phone: candidatePhone.trim(),
      lineCount,
      dateLabel: toReadableDate(),
      stats
    });
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="text-center mb-8">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-3xl bg-orange-100 text-orange-700 shadow-sm">
          <Keyboard className="h-8 w-8" />
        </div>
        <p className="text-xs uppercase tracking-[0.35em] text-slate-500 mb-2">Typing test</p>
        <h1 className="text-3xl font-semibold text-slate-900 mb-3">Typing Speed Test</h1>
        <p className="text-slate-600 max-w-2xl mx-auto">
          Choose a 2-line to 50-line exercise, type the passage, and download a branded certificate with the student details and score.
        </p>
      </div>

      <div className="rounded-3xl border bg-white p-5 sm:p-6 shadow-sm mb-6">
        <div className="grid gap-4 md:grid-cols-3">
          <Field
            label="Student name"
            value={candidateName}
            onChange={setCandidateName}
            placeholder="Enter student name"
          />
          <Field
            label="Phone number"
            value={candidatePhone}
            onChange={setCandidatePhone}
            placeholder="Enter phone number"
          />
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">Line count</label>
            <select
              value={lineCount}
              onChange={(event) => {
                setLineCount(Number(event.target.value) as LineCount);
                reset();
              }}
              className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-200"
            >
              {[2, 5, 10, 25, 50].map((count) => (
                <option key={count} value={count}>
                  {count} lines
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4 mb-6">
        <Metric label="WPM" value={stats?.wpm ?? 0} tone="text-blue-600" />
        <Metric label="Accuracy" value={`${stats?.accuracy ?? 100}%`} tone="text-emerald-600" />
        <Metric label="Errors" value={stats?.errors ?? 0} tone="text-rose-600" />
        <Metric label="Progress" value={isComplete ? 'Done' : `${Math.round((input.length / targetText.length) * 100)}%`} tone="text-violet-600" />
      </div>

      <div className="rounded-3xl border bg-white p-5 sm:p-6 shadow-sm">
        <div className="mb-4 rounded-2xl bg-slate-50 p-4 text-lg leading-8 text-slate-800 whitespace-pre-wrap">
          {targetText.split('').map((char, index) => (
            <span
              key={`${char}-${index}`}
              className={`rounded px-1 py-0.5 ${
                input[index]
                  ? input[index] === char
                    ? 'bg-emerald-200 text-emerald-900'
                    : 'bg-rose-200 text-rose-900'
                  : index === input.length
                    ? 'bg-orange-500 text-white'
                    : 'text-slate-700'
              }`}
            >
              {char}
            </span>
          ))}
        </div>

        <textarea
          value={input}
          onChange={(event) => handleInput(event.target.value)}
          disabled={isComplete}
          spellCheck={false}
          className="h-44 w-full rounded-2xl border border-slate-200 p-4 font-mono text-base outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-200 disabled:bg-slate-50"
          placeholder="Start typing here..."
        />

        <div className="mt-4 flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={reset}
            className="inline-flex items-center gap-2 rounded-xl bg-slate-700 px-4 py-2 text-white hover:bg-slate-800"
          >
            <RotateCcw className="h-4 w-4" />
            Reset
          </button>
          <button
            type="button"
            onClick={nextText}
            className="inline-flex items-center gap-2 rounded-xl bg-orange-600 px-4 py-2 text-white hover:bg-orange-700"
          >
            <Play className="h-4 w-4" />
            New text
          </button>
          {isComplete && stats && (
            <button
              type="button"
              onClick={downloadCertificate}
              className="inline-flex items-center gap-2 rounded-xl border bg-white px-4 py-2 text-slate-700 hover:bg-slate-50"
            >
              <Download className="h-4 w-4" />
              Download certificate
            </button>
          )}
        </div>
      </div>

      {isComplete && stats && (
        <div className="mt-6 rounded-3xl border bg-amber-50 p-5 text-amber-900">
          <div className="flex items-center gap-3">
            <Trophy className="h-6 w-6" />
            <div>
              <h2 className="text-lg font-semibold">Congratulations {candidateName || 'student'}</h2>
              <p className="text-sm">The typing certificate is ready for download.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-slate-700">{label}</label>
      <input
        type="text"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-200"
      />
    </div>
  );
}

function Metric({ label, value, tone }: { label: string; value: React.ReactNode; tone: string }) {
  return (
    <div className="rounded-2xl border bg-white p-4 text-center shadow-sm">
      <div className="text-xs uppercase tracking-[0.28em] text-slate-500">{label}</div>
      <div className={`mt-1 text-2xl font-semibold ${tone}`}>{value}</div>
    </div>
  );
}

export default TypingTest;
