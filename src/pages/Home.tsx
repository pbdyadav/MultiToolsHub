import React from 'react';
import { Link } from 'react-router-dom';
import { SearchBar } from '../components/SearchBar';
import { categories } from '../data/tools';
import * as Icons from 'lucide-react';
import type { LucideProps } from 'lucide-react';

export function Home() {
  return (
    <div className="relative isolate max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="absolute -left-16 top-10 h-48 w-48 rounded-full bg-teal-300/20 blur-3xl pointer-events-none" />
      <div className="absolute right-0 top-32 h-64 w-64 rounded-full bg-sky-300/20 blur-3xl pointer-events-none" />

      {/* Hero Section */}
      <div className="relative mb-14 overflow-hidden rounded-[2rem] border border-slate-200/70 bg-white/70 p-8 sm:p-10 shadow-[0_20px_60px_rgba(15,23,42,0.08)] backdrop-blur">
        <div className="mx-auto max-w-3xl text-center">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.35em] text-slate-500">
            Practical tools for everyday work
          </p>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-semibold text-slate-900 mb-5">
            Your All-in-One
            <span className="block bg-gradient-to-r from-teal-700 via-sky-700 to-indigo-700 bg-clip-text text-transparent">
              Tools Collection
            </span>
          </h1>
          <p className="text-lg sm:text-xl text-slate-600 mb-8 max-w-2xl mx-auto">
            Conversion tools, system testers, typing practice, and image utilities designed to feel clear, reliable, and human-made.
          </p>
          <div className="max-w-2xl mx-auto">
            <SearchBar />
          </div>
        </div>
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {categories.map((category) => (
          <div
            key={category.id}
            className="rounded-[1.5rem] border border-slate-200/70 bg-white/75 p-6 shadow-[0_16px_40px_rgba(15,23,42,0.06)] backdrop-blur transition-transform hover:-translate-y-1 hover:shadow-[0_22px_50px_rgba(15,23,42,0.1)]"
          >
            <div className="flex items-center space-x-3 mb-4">
              <div className={`${category.color} p-3 rounded-2xl shadow-sm`}>
                {/* Dynamic icon based on category */}
                {category.id === 'unit-converters' && <Icons.Ruler className="h-6 w-6 text-white" />}
                {category.id === 'currency' && <Icons.DollarSign className="h-6 w-6 text-white" />}
                {category.id === 'file' && <Icons.File className="h-6 w-6 text-white" />}
                {category.id === 'colors' && <Icons.Palette className="h-6 w-6 text-white" />}
                {category.id === 'fun' && <Icons.Gamepad2 className="h-6 w-6 text-white" />}
              </div>
              <h2 className="text-xl font-semibold text-slate-900">{category.name}</h2>
            </div>
            <p className="text-slate-600 mb-4">{category.description}</p>
            
            <div className="space-y-2">
              {category.tools.map((tool) => {
                const IconComponent = Icons[tool.icon as keyof typeof Icons] as React.ComponentType<LucideProps>;
                return (
                  <Link
                    key={tool.id}
                    to={tool.path}
                    className="flex items-center space-x-2 rounded-xl border border-transparent p-3 transition-colors group hover:border-slate-200 hover:bg-slate-50"
                  >
                    <IconComponent className="h-4 w-4 text-slate-500 group-hover:text-teal-700" />
                    <span className="text-slate-700 group-hover:text-teal-700">{tool.name}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Features Section */}
      <div className="mt-20 text-center">
        <h2 className="text-3xl font-semibold text-slate-900 mb-8">Why Choose MultiTools Hub?</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="p-6">
            <div className="bg-blue-100 p-3 rounded-lg w-fit mx-auto mb-4">
              <Icons.Zap className="h-8 w-8 text-blue-600" />
            </div>
            <h3 className="text-xl font-semibold text-slate-900 mb-2">Lightning Fast</h3>
            <p className="text-slate-600">All tools work instantly with real-time results and no waiting time.</p>
          </div>
          <div className="p-6">
            <div className="bg-green-100 p-3 rounded-lg w-fit mx-auto mb-4">
              <Icons.Shield className="h-8 w-8 text-green-600" />
            </div>
            <h3 className="text-xl font-semibold text-slate-900 mb-2">Privacy First</h3>
            <p className="text-slate-600">All conversions happen in your browser. No data is sent to our servers.</p>
          </div>
          <div className="p-6">
            <div className="bg-purple-100 p-3 rounded-lg w-fit mx-auto mb-4">
              <Icons.Smartphone className="h-8 w-8 text-purple-600" />
            </div>
            <h3 className="text-xl font-semibold text-slate-900 mb-2">Mobile Friendly</h3>
            <p className="text-slate-600">Works perfectly on all devices - desktop, tablet, and mobile.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
