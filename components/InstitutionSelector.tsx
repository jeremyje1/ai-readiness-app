'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { GraduationCap, School, ChevronRight } from 'lucide-react';

interface InstitutionSelectorProps {
  onSelect: (type: 'K12' | 'HigherEd') => void;
  title?: string;
  subtitle?: string;
}

export default function InstitutionSelector({ 
  onSelect, 
  title = "Welcome to AI Blueprint™",
  subtitle = "Let's personalize your experience based on your institution type"
}: InstitutionSelectorProps) {
  const [selected, setSelected] = useState<'K12' | 'HigherEd' | null>(null);

  const handleSelection = (type: 'K12' | 'HigherEd') => {
    setSelected(type);
    // Small delay for visual feedback
    setTimeout(() => {
      onSelect(type);
    }, 200);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-4">{title}</h1>
          <p className="text-xl text-slate-300 max-w-2xl mx-auto">{subtitle}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* K-12 Option */}
          <Card 
            className={`cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-2xl border-2 ${
              selected === 'K12' 
                ? 'border-blue-500 bg-blue-50 shadow-blue-500/20' 
                : 'border-slate-700 bg-slate-800 hover:border-blue-400'
            }`}
            onClick={() => handleSelection('K12')}
          >
            <CardHeader className="text-center pb-4">
              <div className="mx-auto mb-4 p-4 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 w-20 h-20 flex items-center justify-center">
                <School className="w-10 h-10 text-white" />
              </div>
              <CardTitle className={`text-2xl font-bold ${selected === 'K12' ? 'text-slate-900' : 'text-white'}`}>
                K-12 Education
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className={`text-lg mb-6 ${selected === 'K12' ? 'text-slate-700' : 'text-slate-300'}`}>
                Elementary, Middle, and High Schools
              </p>
              <ul className={`text-left space-y-2 mb-6 ${selected === 'K12' ? 'text-slate-600' : 'text-slate-400'}`}>
                <li>• District-wide implementation</li>
                <li>• Teacher professional development</li>
                <li>• Student safety and privacy focus</li>
                <li>• Curriculum integration guidance</li>
              </ul>
              <Button 
                className={`w-full ${
                  selected === 'K12' 
                    ? 'bg-blue-600 hover:bg-blue-700' 
                    : 'bg-slate-700 hover:bg-slate-600'
                }`}
                size="lg"
              >
                Choose K-12 <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            </CardContent>
          </Card>

          {/* Higher Ed Option */}
          <Card 
            className={`cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-2xl border-2 ${
              selected === 'HigherEd' 
                ? 'border-purple-500 bg-purple-50 shadow-purple-500/20' 
                : 'border-slate-700 bg-slate-800 hover:border-purple-400'
            }`}
            onClick={() => handleSelection('HigherEd')}
          >
            <CardHeader className="text-center pb-4">
              <div className="mx-auto mb-4 p-4 rounded-full bg-gradient-to-br from-purple-500 to-indigo-500 w-20 h-20 flex items-center justify-center">
                <GraduationCap className="w-10 h-10 text-white" />
              </div>
              <CardTitle className={`text-2xl font-bold ${selected === 'HigherEd' ? 'text-slate-900' : 'text-white'}`}>
                Higher Education
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className={`text-lg mb-6 ${selected === 'HigherEd' ? 'text-slate-700' : 'text-slate-300'}`}>
                Universities, Colleges, and Community Colleges
              </p>
              <ul className={`text-left space-y-2 mb-6 ${selected === 'HigherEd' ? 'text-slate-600' : 'text-slate-400'}`}>
                <li>• Institutional governance frameworks</li>
                <li>• Faculty development programs</li>
                <li>• Research integration guidance</li>
                <li>• Academic policy templates</li>
              </ul>
              <Button 
                className={`w-full ${
                  selected === 'HigherEd' 
                    ? 'bg-purple-600 hover:bg-purple-700' 
                    : 'bg-slate-700 hover:bg-slate-600'
                }`}
                size="lg"
              >
                Choose Higher Ed <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="text-center mt-8">
          <p className="text-slate-400 text-sm">
            Don't worry - you can change this preference later in your account settings
          </p>
        </div>
      </div>
    </div>
  );
}
