'use client';

import { useState, useEffect } from 'react';
import { useWallet } from '../hooks/useWallet';
import { useNotifications } from './NotificationSystem';

export default function WalletConnect({ variant = 'button', showFullAddress = false }) {
  const {
    account,
    isConnecting,
    error,
    isMetaMaskInstalled,
    isAdmin,
    connectWallet,
    disconnectWallet,
    formatAddress,
    getNetworkName,
    switchToSepolia
  } = useWallet();

  const notifications = useNotifications();
  const [networkName, setNetworkName] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [previousAccount, setPreviousAccount] = useState(null);

  useEffect(() => {
    const fetchNetwork = async () => {
      if (account) {
        const network = await getNetworkName();
        setNetworkName(network);
      }
    };
    fetchNetwork();
  }, [account, getNetworkName]);

  // Show notifications for wallet state changes
  useEffect(() => {
    if (account && account !== previousAccount) {
      if (previousAccount) {
        notifications.success('Account Switched', `Switched to ${formatAddress(account)}`);
      } else {
        notifications.walletConnected(account);
      }
      setPreviousAccount(account);
    } else if (!account && previousAccount) {
      notifications.walletDisconnected();
      setPreviousAccount(null);
    }
  }, [account, previousAccount, notifications, formatAddress]);

  // Show error notifications
  useEffect(() => {
    if (error) {
      notifications.error('Wallet Error', error);
    }
  }, [error, notifications]);

  // Button variant for navigation
  if (variant === 'button') {
    if (!account) {
      if (!isMetaMaskInstalled) {
        return (
          <a 
            href="https://metamask.io/download/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
          >
            Install MetaMask
          </a>
        );
      }

      return (
        <button
          onClick={connectWallet}
          disabled={isConnecting}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isConnecting ? (
            <div className="flex items-center">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Connecting...
            </div>
          ) : (
            'Connect Wallet'
          )}
        </button>
      );
    }

    return (
      <div className="relative">
        <button
          onClick={() => setShowDropdown(!showDropdown)}
          className="flex items-center space-x-2 bg-green-100 hover:bg-green-200 text-green-800 px-4 py-2 rounded-md text-sm font-medium transition-colors"
        >
          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
          <span>{showFullAddress ? account : formatAddress(account)}</span>
          {isAdmin && (
            <span className="bg-purple-100 text-purple-800 text-xs px-2 py-0.5 rounded-full">
              Admin
            </span>
          )}
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {showDropdown && (
          <div className="absolute right-0 mt-2 w-72 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
            <div className="px-4 py-3 border-b border-gray-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Connected Wallet</span>
                {isAdmin && (
                  <span className="bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded-full font-medium">
                    Admin Access
                  </span>
                )}
              </div>
              <div className="font-mono text-sm text-gray-900 break-all">
                {account}
              </div>
              {networkName && (
                <div className="mt-2 text-xs text-gray-500">
                  Network: {networkName}
                </div>
              )}
            </div>
            
            <div className="py-1">
              <button
                onClick={() => {
                  navigator.clipboard.writeText(account);
                  setShowDropdown(false);
                }}
                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
              >
                <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                Copy Address
              </button>
              
              <button
                onClick={() => {
                  connectWallet(true); // Force account selection
                  setShowDropdown(false);
                }}
                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
              >
                <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l4-4-4-4m0 18l4-4-4-4" />
                </svg>
                Switch Account
              </button>
              
              <button
                onClick={() => {
                  switchToSepolia();
                  setShowDropdown(false);
                }}
                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
              >
                <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                </svg>
                Switch to Sepolia
              </button>
              
              <button
                onClick={() => {
                  disconnectWallet();
                  setShowDropdown(false);
                }}
                className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center"
              >
                <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Disconnect
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Card variant for forms and full UI
  if (variant === 'card') {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Wallet Connection</h3>
          {isAdmin && (
            <span className="bg-purple-100 text-purple-800 text-sm px-3 py-1 rounded-full font-medium">
              Admin Access
            </span>
          )}
        </div>

        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-red-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-red-800 text-sm">{error}</p>
            </div>
          </div>
        )}

        {!isMetaMaskInstalled && (
          <div className="mb-4 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-yellow-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L3.314 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              <div>
                <p className="text-yellow-800 text-sm font-medium">MetaMask Required</p>
                <p className="text-yellow-700 text-sm mt-1">
                  Please install MetaMask browser extension to connect your wallet.
                </p>
                <a
                  href="https://metamask.io/download/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-yellow-800 text-sm underline hover:no-underline mt-2 inline-block"
                >
                  Download MetaMask
                </a>
              </div>
            </div>
          </div>
        )}

        {!account ? (
          <div className="text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
              </svg>
            </div>
            <h4 className="text-lg font-medium text-gray-900 mb-2">Connect Your Wallet</h4>
            <p className="text-gray-600 mb-6">
              Connect your MetaMask wallet to access admin features and manage events.
            </p>
            <button
              onClick={connectWallet}
              disabled={isConnecting || !isMetaMaskInstalled}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isConnecting ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                  Connecting...
                </div>
              ) : (
                'Connect MetaMask'
              )}
            </button>
          </div>
        ) : (
          <div>
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
                <span className="text-green-800 font-medium">Wallet Connected</span>
              </div>
            </div>
            
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Wallet Address
                </label>
                <div className="font-mono text-sm bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 break-all">
                  {account}
                </div>
              </div>
              
              {networkName && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Network
                  </label>
                  <div className="text-sm bg-gray-50 border border-gray-200 rounded-lg px-3 py-2">
                    {networkName}
                  </div>
                </div>
              )}
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => connectWallet(true)}
                className="flex-1 bg-blue-100 hover:bg-blue-200 text-blue-800 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                Switch Account
              </button>
              <button
                onClick={switchToSepolia}
                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-800 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                Switch to Sepolia
              </button>
              <button
                onClick={disconnectWallet}
                className="flex-1 bg-red-100 hover:bg-red-200 text-red-800 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                Disconnect
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  return null;
}