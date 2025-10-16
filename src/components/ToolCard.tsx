import React from 'react';
import { Link } from 'react-router-dom';
import { Tool } from '../types/tools';
import * as Icons from 'lucide-react';
import type { LucideProps } from 'lucide-react';

interface ToolCardProps {
  tool: Tool;
}

export function ToolCard({ tool }: ToolCardProps) {
  const IconComponent = Icons[tool.icon as keyof typeof Icons] as React.ComponentType<LucideProps>;

  return (
    <Link
      to={tool.path}
      className="group bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md hover:scale-105 transition-all duration-200"
    >
      <div className="flex items-center space-x-3 mb-3">
        <div className="bg-blue-100 p-2 rounded-lg group-hover:bg-blue-200 transition-colors">
          <IconComponent className="h-5 w-5 text-blue-600" />
        </div>
        <h3 className="font-semibold text-gray-900">{tool.name}</h3>
      </div>
      <p className="text-gray-600 text-sm">{tool.description}</p>
    </Link>
  );
}