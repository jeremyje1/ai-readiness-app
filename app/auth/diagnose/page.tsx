'use client';

import { useState, useEffect } from 'react';
import { supabase, SUPABASE_URL, SUPABASE_ANON_KEY } from '@/lib/supabase';

export default function DiagnosePage() {
  const [results, setResults] = useState<any>({});
  const [running, setRunning] = useState(false);

  const runDiagnostics = async () => {
    setRunning(true);
    const diagnostics: any = {};

    // 1. Check if Supabase client is initialized
    diagnostics.clientInitialized = {
      test: 'Supabase Client',
      result: typeof supabase !== 'undefined' ? 'PASS' : 'FAIL',
      details: {
        hasClient: typeof supabase !== 'undefined',
        clientType: typeof supabase
      }
    };

    // 2. Check environment variables
    diagnostics.environment = {
      test: 'Environment Variables',
      result: (SUPABASE_URL && SUPABASE_ANON_KEY) ? 'PASS' : 'FAIL',
      details: {
        hasUrl: !!SUPABASE_URL,
        urlLength: SUPABASE_URL?.length,
        urlPreview: SUPABASE_URL ? `${SUPABASE_URL.substring(0, 30)}...` : 'missing',
        hasAnonKey: !!SUPABASE_ANON_KEY,
        keyLength: SUPABASE_ANON_KEY?.length
      }
    };

    // 3. Test basic fetch to Supabase
    try {
      const start = Date.now();
      const response = await fetch(`${SUPABASE_URL}/auth/v1/health`, {
        headers: { 'apikey': SUPABASE_ANON_KEY }
      });
      const elapsed = Date.now() - start;
      const data = await response.json();
      
      diagnostics.healthCheck = {
        test: 'Supabase Health Check',
        result: response.ok ? 'PASS' : 'FAIL',
        details: {
          status: response.status,
          responseTime: `${elapsed}ms`,
          data
        }
      };
    } catch (error: any) {
      diagnostics.healthCheck = {
        test: 'Supabase Health Check',
        result: 'FAIL',
        details: {
          error: error.message,
          type: error.name
        }
      };
    }

    // 4. Test auth.getSession
    try {
      const start = Date.now();
      const { data, error } = await supabase.auth.getSession();
      const elapsed = Date.now() - start;
      
      diagnostics.getSession = {
        test: 'Get Session',
        result: error ? 'FAIL' : 'PASS',
        details: {
          responseTime: `${elapsed}ms`,
          hasSession: !!data?.session,
          error: error?.message
        }
      };
    } catch (error: any) {
      diagnostics.getSession = {
        test: 'Get Session',
        result: 'FAIL',
        details: {
          error: error.message,
          type: error.name
        }
      };
    }

    // 5. Check localStorage access
    try {
      localStorage.setItem('test', 'value');
      const value = localStorage.getItem('test');
      localStorage.removeItem('test');
      
      diagnostics.localStorage = {
        test: 'LocalStorage Access',
        result: value === 'value' ? 'PASS' : 'FAIL',
        details: {
          canWrite: true,
          canRead: value === 'value'
        }
      };
    } catch (error: any) {
      diagnostics.localStorage = {
        test: 'LocalStorage Access',
        result: 'FAIL',
        details: {
          error: error.message,
          blocked: true
        }
      };
    }

    // 6. Check cookies enabled
    diagnostics.cookies = {
      test: 'Cookies Enabled',
      result: navigator.cookieEnabled ? 'PASS' : 'WARN',
      details: {
        enabled: navigator.cookieEnabled
      }
    };

    // 7. Network timing test
    try {
      const timings = [];
      for (let i = 0; i < 3; i++) {
        const start = Date.now();
        await fetch(`${SUPABASE_URL}/auth/v1/health`, {
          headers: { 'apikey': SUPABASE_ANON_KEY }
        });
        timings.push(Date.now() - start);
      }
      
      diagnostics.networkTiming = {
        test: 'Network Performance',
        result: Math.max(...timings) < 1000 ? 'PASS' : 'WARN',
        details: {
          timings,
          average: Math.round(timings.reduce((a, b) => a + b) / timings.length),
          max: Math.max(...timings)
        }
      };
    } catch (error: any) {
      diagnostics.networkTiming = {
        test: 'Network Performance',
        result: 'FAIL',
        details: { error: error.message }
      };
    }

    // 8. Browser info
    diagnostics.browser = {
      test: 'Browser Info',
      result: 'INFO',
      details: {
        userAgent: navigator.userAgent,
        platform: navigator.platform,
        language: navigator.language,
        onLine: navigator.onLine,
        doNotTrack: navigator.doNotTrack
      }
    };

    setResults(diagnostics);
    setRunning(false);
  };

  useEffect(() => {
    runDiagnostics();
  }, []);

  const getResultColor = (result: string) => {
    switch (result) {
      case 'PASS': return 'text-green-600';
      case 'FAIL': return 'text-red-600';
      case 'WARN': return 'text-yellow-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Supabase Connection Diagnostics</h1>
        
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <button
            onClick={runDiagnostics}
            disabled={running}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
          >
            {running ? 'Running...' : 'Run Diagnostics'}
          </button>
        </div>

        <div className="space-y-4">
          {Object.entries(results).map(([key, diagnostic]: [string, any]) => (
            <div key={key} className="bg-white rounded-lg shadow p-6">
              <div className="flex justify-between items-start mb-3">
                <h3 className="text-lg font-semibold">{diagnostic.test}</h3>
                <span className={`font-bold ${getResultColor(diagnostic.result)}`}>
                  {diagnostic.result}
                </span>
              </div>
              
              <pre className="bg-gray-100 p-3 rounded text-sm overflow-auto">
                {JSON.stringify(diagnostic.details, null, 2)}
              </pre>
            </div>
          ))}
        </div>

        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-3">Troubleshooting Tips</h3>
          <ul className="space-y-2 text-sm">
            <li>• If LocalStorage fails: Check if third-party cookies are blocked in Chrome settings</li>
            <li>• If Health Check fails: Check network/firewall settings or try a different network</li>
            <li>• If cookies are disabled: Enable cookies in browser settings</li>
            <li>• For Chrome Incognito: Settings → Privacy → Allow third-party cookies</li>
            <li>• Try disabling browser extensions that might block requests</li>
          </ul>
        </div>
      </div>
    </div>
  );
}