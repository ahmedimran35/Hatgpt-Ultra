import React, { useState } from 'react';
import ResumeBuilder from './tools/ResumeBuilder';
import EmailWriter from './tools/EmailWriter';
import BlogWriter from './tools/BlogWriter';
import LinkedInGenerator from './tools/LinkedInGenerator';
import CodeExplainer from './tools/CodeExplainer';
import GrammarFixer from './tools/GrammarFixer';
import TextSummarizer from './tools/TextSummarizer';
import IdeaGenerator from './tools/IdeaGenerator';

interface Tool {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  component: React.ComponentType;
}

const TOOLS: Tool[] = [
  {
    id: 'resume-builder',
    name: 'Resume Builder',
    description: 'Create professional resumes with AI assistance',
    icon: '📄',
    color: 'bg-blue-500',
    component: ResumeBuilder
  },
  {
    id: 'email-writer',
    name: 'AI Email Writer',
    description: 'Write professional emails with AI assistance',
    icon: '📧',
    color: 'bg-green-500',
    component: EmailWriter
  },
  {
    id: 'blog-writer',
    name: 'Blog Writer',
    description: 'Create engaging blog content with AI',
    icon: '📝',
    color: 'bg-purple-500',
    component: BlogWriter
  },
  {
    id: 'linkedin-generator',
    name: 'LinkedIn Post Generator',
    description: 'Create engaging LinkedIn posts',
    icon: '💼',
    color: 'bg-blue-600',
    component: LinkedInGenerator
  },
  {
    id: 'code-explainer',
    name: 'Code Explainer',
    description: 'Understand code snippets with AI',
    icon: '💻',
    color: 'bg-gray-600',
    component: CodeExplainer
  },
  {
    id: 'grammar-fixer',
    name: 'Grammar Fixer',
    description: 'Fix grammar and improve writing',
    icon: '✏️',
    color: 'bg-yellow-500',
    component: GrammarFixer
  },
  {
    id: 'text-summarizer',
    name: 'Text Summarizer',
    description: 'Summarize long texts quickly',
    icon: '📋',
    color: 'bg-indigo-500',
    component: TextSummarizer
  },
  {
    id: 'idea-generator',
    name: 'Idea Generator',
    description: 'Generate creative ideas and concepts',
    icon: '💡',
    color: 'bg-orange-500',
    component: IdeaGenerator
  }
];

export default function ToolsPage() {
  const [selectedTool, setSelectedTool] = useState<string | null>(null);

  if (selectedTool) {
    const tool = TOOLS.find(t => t.id === selectedTool);
    if (tool) {
      const ToolComponent = tool.component;
      return (
        <div className="h-full flex flex-col">
          <div className="flex items-center gap-4 p-6 border-b border-gray-200 bg-white/95 backdrop-blur-sm">
            <button
              onClick={() => setSelectedTool(null)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              ← Back
            </button>
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-lg ${tool.color} flex items-center justify-center text-white text-xl`}>
                {tool.icon}
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">{tool.name}</h1>
                <p className="text-sm text-gray-600">{tool.description}</p>
              </div>
            </div>
          </div>
          <div className="flex-1 overflow-hidden">
            <ToolComponent />
          </div>
        </div>
      );
    }
  }

  return (
    <div className="h-full overflow-y-auto bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 via-purple-600/10 to-pink-600/10"></div>
        <div className="relative max-w-7xl mx-auto px-6 py-8">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/80 backdrop-blur-sm border border-gray-200 mb-4">
              <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div>
              <span className="text-xs font-medium text-gray-700">AI-Powered Tools</span>
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 via-blue-900 to-purple-900 bg-clip-text text-transparent mb-3">
              AI Tools Suite
            </h1>
            <p className="text-sm text-gray-600 max-w-2xl mx-auto">
              Transform your workflow with our cutting-edge AI tools. From content creation to code analysis, 
              unlock unlimited possibilities with intelligent automation.
            </p>
          </div>
        </div>
      </div>

      {/* Tools Grid */}
      <div className="max-w-7xl mx-auto px-6 pb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {TOOLS.map((tool, index) => (
            <div
              key={tool.id}
              className="group cursor-pointer"
              onClick={() => setSelectedTool(tool.id)}
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="relative h-full bg-white/70 backdrop-blur-xl rounded-3xl border border-white/20 shadow-xl hover:shadow-2xl transition-all duration-500 hover:scale-105 hover:-translate-y-2 overflow-hidden">
                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-br from-white/50 to-transparent"></div>
                
                {/* Content */}
                <div className="relative p-8 h-full flex flex-col">
                  {/* Icon */}
                  <div className="relative mb-6">
                    <div className={`w-16 h-16 rounded-2xl ${tool.color} flex items-center justify-center text-white text-3xl shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                      {tool.icon}
                    </div>
                    <div className="absolute -top-2 -right-2 w-6 h-6 bg-white rounded-full flex items-center justify-center shadow-lg">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    </div>
                  </div>

                  {/* Title & Description */}
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors duration-300">
                      {tool.name}
                    </h3>
                    <p className="text-gray-600 leading-relaxed mb-6">
                      {tool.description}
                    </p>
                  </div>

                  {/* CTA Button */}
                  <div className="mt-auto">
                    <div className="relative">
                      <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl blur-sm opacity-75 group-hover:opacity-100 transition-opacity duration-300"></div>
                      <button className="relative w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 transform group-hover:scale-105 shadow-lg">
                        <span className="flex items-center justify-center gap-2">
                          Get Started
                          <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                          </svg>
                        </span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Hover Effect */}
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-16">
          <div className="inline-flex items-center gap-2 px-6 py-3 bg-white/80 backdrop-blur-sm rounded-full border border-gray-200 shadow-lg">
            <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></div>
            <span className="text-sm font-medium text-gray-700">Powered by Advanced AI Models</span>
          </div>
        </div>
      </div>
    </div>
  );
}
