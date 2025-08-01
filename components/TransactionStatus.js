'use client';

import { useState, useEffect } from 'react';
import { getNetworkById } from '../constants/contractConfig';
import Button from './ui/Button';
import Modal from './ui/Modal';

const TransactionStatus = ({ 
  isOpen, 
  onClose, 
  transaction, 
  networkId,
  title = 'Transaction Status',
  onRetry = null
}) => {
  const [timeElapsed, setTimeElapsed] = useState(0);
  const network = getNetworkById(networkId);

  useEffect(() => {
    let interval;
    if (isOpen && transaction?.status === 'pending') {
      interval = setInterval(() => {
        setTimeElapsed(prev => prev + 1);
      }, 1000);
    } else {
      setTimeElapsed(0);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isOpen, transaction?.status]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getStatusIcon = () => {
    switch (transaction?.status) {
      case 'pending':
        return (
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        );
      case 'success':
        return (
          <div className="rounded-full h-12 w-12 bg-green-100 flex items-center justify-center">
            <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
        );
      case 'failed':
        return (
          <div className="rounded-full h-12 w-12 bg-red-100 flex items-center justify-center">
            <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
        );
      default:
        return null;
    }
  };

  const getStatusMessage = () => {
    switch (transaction?.status) {
      case 'pending':
        return {
          title: 'Transaction Pending',
          message: 'Your transaction is being processed on the blockchain. This may take a few minutes.',
          color: 'text-blue-800'
        };
      case 'success':
        return {
          title: 'Transaction Successful',
          message: 'Your transaction has been confirmed on the blockchain.',
          color: 'text-green-800'
        };
      case 'failed':
        return {
          title: 'Transaction Failed',
          message: transaction?.error || 'Your transaction failed to process. Please try again.',
          color: 'text-red-800'
        };
      default:
        return {
          title: 'Processing',
          message: 'Preparing transaction...',
          color: 'text-gray-800'
        };
    }
  };

  const statusInfo = getStatusMessage();

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      size="md"
      closeOnOverlayClick={transaction?.status !== 'pending'}
      showCloseButton={transaction?.status !== 'pending'}
      footer={
        <div className="flex justify-end space-x-3">
          {transaction?.status === 'failed' && onRetry && (
            <Button
              variant="primary"
              onClick={onRetry}
            >
              Retry
            </Button>
          )}
          {transaction?.status !== 'pending' && (
            <Button
              variant={transaction?.status === 'success' ? 'primary' : 'secondary'}
              onClick={onClose}
            >
              {transaction?.status === 'success' ? 'Done' : 'Close'}
            </Button>
          )}
        </div>
      }
    >
      <div className="text-center space-y-6">
        {/* Status Icon */}
        <div className="flex justify-center">
          {getStatusIcon()}
        </div>

        {/* Status Message */}
        <div>
          <h3 className={`text-lg font-semibold ${statusInfo.color} mb-2`}>
            {statusInfo.title}
          </h3>
          <p className="text-gray-600 text-sm">
            {statusInfo.message}
          </p>
        </div>

        {/* Transaction Details */}
        {transaction && (
          <div className="bg-gray-50 rounded-lg p-4 space-y-3">
            {transaction.hash && (
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-500">Transaction Hash:</span>
                <div className="flex items-center space-x-2">
                  <code className="text-xs bg-gray-200 px-2 py-1 rounded">
                    {`${transaction.hash.slice(0, 10)}...${transaction.hash.slice(-8)}`}
                  </code>
                  {network?.explorerUrl && (
                    <a
                      href={`${network.explorerUrl}/tx/${transaction.hash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </a>
                  )}
                </div>
              </div>
            )}

            {transaction.type && (
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-500">Type:</span>
                <span className="font-medium capitalize">{transaction.type}</span>
              </div>
            )}

            {transaction.amount && (
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-500">Amount:</span>
                <span className="font-medium">{transaction.amount} ETH</span>
              </div>
            )}

            {transaction.gasUsed && (
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-500">Gas Used:</span>
                <span className="font-medium">{transaction.gasUsed.toLocaleString()}</span>
              </div>
            )}

            {network && (
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-500">Network:</span>
                <span className="font-medium">{network.name}</span>
              </div>
            )}

            {transaction.status === 'pending' && (
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-500">Time Elapsed:</span>
                <span className="font-medium">{formatTime(timeElapsed)}</span>
              </div>
            )}

            {transaction.confirmations !== undefined && (
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-500">Confirmations:</span>
                <span className="font-medium">{transaction.confirmations}</span>
              </div>
            )}
          </div>
        )}

        {/* Progress Indicator for Pending Transactions */}
        {transaction?.status === 'pending' && (
          <div className="space-y-2">
            <div className="text-sm text-gray-500">
              Waiting for blockchain confirmation...
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-1000 animate-pulse"
                style={{ width: `${Math.min((timeElapsed / 120) * 100, 90)}%` }}
              ></div>
            </div>
            <div className="text-xs text-gray-400">
              Transactions typically confirm within 1-2 minutes
            </div>
          </div>
        )}

        {/* Warning for Slow Transactions */}
        {transaction?.status === 'pending' && timeElapsed > 300 && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
            <div className="flex items-start">
              <svg className="w-5 h-5 text-yellow-400 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <h4 className="text-sm font-medium text-yellow-800">Transaction Taking Longer Than Expected</h4>
                <p className="text-xs text-yellow-700 mt-1">
                  This can happen during network congestion. Your transaction is still being processed.
                </p>
                {networkId === 31337 && (
                  <p className="text-xs text-yellow-700 mt-1">
                    <strong>Anvil Tip:</strong> Make sure your local Anvil node is running.
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Foundry Development Info */}
        {networkId === 31337 && transaction?.status === 'success' && (
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
            <div className="flex items-start">
              <svg className="w-5 h-5 text-purple-600 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              <div>
                <h4 className="text-sm font-medium text-purple-800">Foundry Development Mode</h4>
                <p className="text-xs text-purple-700 mt-1">
                  Transaction processed on local Anvil network. Use `cast` commands for additional contract interaction.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};

// Hook for managing transaction status
export const useTransactionStatus = () => {
  const [transaction, setTransaction] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const startTransaction = (txData) => {
    setTransaction({
      ...txData,
      status: 'pending',
      timestamp: Date.now()
    });
    setIsModalOpen(true);
  };

  const updateTransaction = (updates) => {
    setTransaction(prev => prev ? { ...prev, ...updates } : null);
  };

  const completeTransaction = (success, data = {}) => {
    setTransaction(prev => prev ? {
      ...prev,
      status: success ? 'success' : 'failed',
      ...data
    } : null);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    // Clear transaction after a delay to allow smooth closing animation
    setTimeout(() => setTransaction(null), 300);
  };

  return {
    transaction,
    isModalOpen,
    startTransaction,
    updateTransaction,
    completeTransaction,
    closeModal
  };
};

export default TransactionStatus;