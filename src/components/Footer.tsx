import React from 'react';
import { Heart } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-gray-50 border-t border-gray-200 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <p className="text-gray-600 flex items-center justify-center space-x-1">
            <span>Made with</span>
            <Heart className="h-4 w-4 text-red-500 fill-current" />
            <span>by MultiTools Hub</span>
          </p>
          <p className="mt-2 text-sm text-gray-500">
            © 2025 MultiTools Hub. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}