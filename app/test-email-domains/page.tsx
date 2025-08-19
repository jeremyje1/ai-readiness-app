'use client';

import { useState } from 'react';

export default function TestEmailDomains() {
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const testEmail = async (institutionType: 'K12' | 'HigherEd', domainContext: string) => {
    setLoading(true);
    try {
      const response = await fetch('/api/test-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-institution-type': institutionType,
          'x-domain-context': domainContext,
        },
        body: JSON.stringify({
          email: `test@${institutionType.toLowerCase()}.edu`,
          name: `${institutionType} Test User`,
          type: 'assessment'
        })
      });

      const data = await response.json();
      setResult(data);
    } catch (error) {
      setResult({ error: (error as Error).message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-8">Test Domain-Specific Emails</h1>
      
      <div className="space-y-4">
        <button
          onClick={() => testEmail('K12', 'k12')}
          disabled={loading}
          className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 disabled:opacity-50 mr-4"
        >
          Test K-12 Email (k12aiblueprint.com)
        </button>
        
        <button
          onClick={() => testEmail('HigherEd', 'higher-ed')}
          disabled={loading}
          className="bg-green-500 text-white px-6 py-3 rounded-lg hover:bg-green-600 disabled:opacity-50"
        >
          Test Higher Ed Email (aiblueprint.k12aiblueprint.com)
        </button>
      </div>

      {loading && (
        <div className="mt-8 text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          <p className="mt-2">Sending test email...</p>
        </div>
      )}

      {result && (
        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-4">Result:</h2>
          <pre className="bg-gray-100 p-4 rounded-lg overflow-auto">
            {JSON.stringify(result, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}
