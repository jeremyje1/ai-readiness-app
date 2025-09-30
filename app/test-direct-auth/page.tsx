'use client';
import { useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function DirectAuthTestPage() {
  const [email, setEmail] = useState('test@aiblueprint.com');
  const [password, setPassword] = useState('TestPassword123!');
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const testDirectAuth = async () => {
    setLoading(true);
    setResult(null);
    
    const startTime = Date.now();
    
    try {
      console.log('🔐 Starting direct Supabase auth test...');
      console.log('🔐 Email:', email);
      console.log('🔐 Password:', password.replace(/./g, '*'));
      console.log('🔐 Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);
      
      // Test direct Supabase auth without any wrappers
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password
      });
      
      const elapsed = Date.now() - startTime;
      
      if (error) {
        console.error('❌ Auth failed:', error);
        setResult({
          success: false,
          error: error.message,
          elapsed: elapsed,
          timestamp: new Date().toISOString()
        });
      } else {
        console.log('✅ Auth successful:', data);
        setResult({
          success: true,
          user: data.user?.email,
          session: !!data.session,
          elapsed: elapsed,
          timestamp: new Date().toISOString()
        });
        
        // Sign out after successful test to avoid conflicts
        setTimeout(() => {
          supabase.auth.signOut();
        }, 2000);
      }
    } catch (err: any) {
      const elapsed = Date.now() - startTime;
      console.error('❌ Exception:', err);
      setResult({
        success: false,
        error: err.message || 'Unknown error',
        elapsed: elapsed,
        timestamp: new Date().toISOString()
      });
    } finally {
      setLoading(false);
    }
  };

  const testConnection = async () => {
    setLoading(true);
    setResult(null);
    
    try {
      console.log('🔌 Testing Supabase connection...');
      const { data, error } = await supabase.auth.getSession();
      
      if (error) {
        setResult({
          success: false,
          error: `Connection error: ${error.message}`,
          timestamp: new Date().toISOString()
        });
      } else {
        setResult({
          success: true,
          message: 'Connection successful',
          hasSession: !!data.session,
          timestamp: new Date().toISOString()
        });
      }
    } catch (err: any) {
      setResult({
        success: false,
        error: `Exception: ${err.message}`,
        timestamp: new Date().toISOString()
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Direct Auth Test</h1>
        
        <div className="bg-white p-6 rounded shadow mb-4">
          <h2 className="text-xl font-semibold mb-4">Test Credentials</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 border rounded"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 border rounded"
              />
            </div>
            
            <div className="flex gap-2">
              <button
                onClick={testConnection}
                disabled={loading}
                className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 disabled:opacity-50"
              >
                Test Connection
              </button>
              
              <button
                onClick={testDirectAuth}
                disabled={loading}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
              >
                Test Direct Auth
              </button>
            </div>
          </div>
        </div>
        
        {loading && (
          <div className="bg-yellow-100 p-4 rounded mb-4">
            <p className="text-yellow-800">⏳ Testing... Check console for details</p>
          </div>
        )}
        
        {result && (
          <div className={`p-4 rounded ${result.success ? 'bg-green-100' : 'bg-red-100'}`}>
            <h3 className="font-semibold mb-2">
              {result.success ? '✅ Success' : '❌ Failed'}
            </h3>
            <pre className="text-sm overflow-x-auto">
              {JSON.stringify(result, null, 2)}
            </pre>
          </div>
        )}
        
        <div className="mt-6 text-sm text-gray-600">
          <p>Environment:</p>
          <ul className="list-disc ml-5">
            <li>URL: {process.env.NEXT_PUBLIC_SUPABASE_URL}</li>
            <li>Anon Key: {process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.substring(0, 20)}...</li>
          </ul>
        </div>
      </div>
    </div>
  );
}