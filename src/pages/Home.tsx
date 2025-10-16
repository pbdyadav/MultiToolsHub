import React from 'react';
import { Link } from 'react-router-dom';
import { SearchBar } from '../components/SearchBar';
import { categories } from '../data/tools';
import * as Icons from 'lucide-react';
import type { LucideProps } from 'lucide-react';

export function Home() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Hero Section */}
      <div className="text-center mb-16">
        <h1 className="text-5xl font-bold text-gray-900 mb-6">
          Your All-in-One
          <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent block">
            Tools Collection
          </span>
        </h1>
        <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
          Access powerful conversion tools, utilities, and games all in one place. 
          Fast, reliable, and completely free to use.
        </p>
        <SearchBar />
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {categories.map((category) => (
          <div
            key={category.id}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center space-x-3 mb-4">
              <div className={`${category.color} p-3 rounded-lg`}>
                {/* Dynamic icon based on category */}
                {category.id === 'unit-converters' && <Icons.Ruler className="h-6 w-6 text-white" />}
                {category.id === 'currency' && <Icons.DollarSign className="h-6 w-6 text-white" />}
                {category.id === 'file' && <Icons.File className="h-6 w-6 text-white" />}
                {category.id === 'colors' && <Icons.Palette className="h-6 w-6 text-white" />}
                {category.id === 'fun' && <Icons.Gamepad2 className="h-6 w-6 text-white" />}
              </div>
              <h2 className="text-xl font-semibold text-gray-900">{category.name}</h2>
            </div>
            <p className="text-gray-600 mb-4">{category.description}</p>
            
            <div className="space-y-2">
              {category.tools.map((tool) => {
                const IconComponent = Icons[tool.icon as keyof typeof Icons] as React.ComponentType<LucideProps>;
                return (
                  <Link
                    key={tool.id}
                    to={tool.path}
                    className="flex items-center space-x-2 p-3 rounded-lg hover:bg-gray-50 transition-colors group"
                  >
                    <IconComponent className="h-4 w-4 text-gray-500 group-hover:text-blue-600" />
                    <span className="text-gray-700 group-hover:text-blue-600">{tool.name}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Features Section */}
      <div className="mt-20 text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-8">Why Choose MultiTools Hub?</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="p-6">
            <div className="bg-blue-100 p-3 rounded-lg w-fit mx-auto mb-4">
              <Icons.Zap className="h-8 w-8 text-blue-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Lightning Fast</h3>
            <p className="text-gray-600">All tools work instantly with real-time results and no waiting time.</p>
          </div>
          <div className="p-6">
            <div className="bg-green-100 p-3 rounded-lg w-fit mx-auto mb-4">
              <Icons.Shield className="h-8 w-8 text-green-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Privacy First</h3>
            <p className="text-gray-600">All conversions happen in your browser. No data is sent to our servers.</p>
          </div>
          <div className="p-6">
            <div className="bg-purple-100 p-3 rounded-lg w-fit mx-auto mb-4">
              <Icons.Smartphone className="h-8 w-8 text-purple-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Mobile Friendly</h3>
            <p className="text-gray-600">Works perfectly on all devices - desktop, tablet, and mobile.</p>
          </div>
        </div>
      </div>
    </div>
  );
}