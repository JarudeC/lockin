'use client';

import { useEffect } from 'react';

export default function AdminError({ error, reset }) {
  useEffect(() => {
    console.error('Admin page error:', error);
  }, [error]);

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-md border border-gray-200 p-8 text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Admin Access Error
          </h1>
          
          <p className="text-gray-600 mb-6 max-w-md mx-auto">
            There was an error accessing the admin dashboard. This could be due to:
          </p>
          
          <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left max-w-md mx-auto">
            <ul className="text-sm text-gray-700 space-y-2">
              <li className="flex items-start">
                <span className="text-red-500 mr-2">•</span>
                Unauthorized wallet address
              </li>
              <li className="flex items-start">
                <span className="text-red-500 mr-2">•</span>
                MetaMask connection issues
              </li>
              <li className="flex items-start">
                <span className="text-red-500 mr-2">•</span>
                Event not found or deleted
              </li>
              <li className="flex items-start">
                <span className="text-red-500 mr-2">•</span>
                Network connectivity problems
              </li>
            </ul>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div className="text-sm text-blue-800">
              <strong>Admin Wallet:</strong> Only the wallet address 
              <code className="bg-blue-200 text-blue-900 px-2 py-1 rounded text-xs ml-1">
                {process.env.NEXT_PUBLIC_ADMIN_WALLET || "0xb05542907644713D95004f9e5984fcB706165937"}
              </code> has admin access.
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={reset}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
            >
              Try Again
            </button>
            
            <a
              href="/"
              className="bg-gray-100 hover:bg-gray-200 text-gray-800 px-6 py-3 rounded-lg font-medium transition-colors"
            >
              Go Back Home
            </a>
            
            <button
              onClick={() => window.location.reload()}
              className="bg-blue-100 hover:bg-blue-200 text-blue-800 px-6 py-3 rounded-lg font-medium transition-colors"
            >
              Refresh Page
            </button>
          </div>

          <div className="mt-8 pt-6 border-t border-gray-200">
            <details className="text-left max-w-2xl mx-auto">
              <summary className="cursor-pointer text-sm font-medium text-gray-700 hover:text-gray-900">
                Technical Details
              </summary>
              <div className="mt-3 p-3 bg-gray-100 rounded text-xs font-mono text-gray-600 overflow-auto max-h-32">
                {error?.message || 'Unknown error occurred'}
              </div>
            </details>
          </div>
        </div>
      </div>
    </div>
  );
}