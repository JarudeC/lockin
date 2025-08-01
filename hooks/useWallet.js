'use client';

import { useState, useEffect, useCallback } from 'react';

const ADMIN_WALLET = process.env.NEXT_PUBLIC_ADMIN_WALLET || "0xb05542907644713D95004f9e5984fcB706165937";
const CHAIN_ID = process.env.NEXT_PUBLIC_CHAIN_ID || "11155111";
const NETWORK_NAME = process.env.NEXT_PUBLIC_NETWORK_NAME || "sepolia";

// Convert decimal chain ID to hex
const getChainIdHex = (chainId) => {
  return '0x' + parseInt(chainId).toString(16);
};

export const useWallet = () => {
  const [account, setAccount] = useState(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState(null);
  const [isMetaMaskInstalled, setIsMetaMaskInstalled] = useState(false);

  // Check if MetaMask is installed
  useEffect(() => {
    const checkMetaMask = () => {
      if (typeof window !== 'undefined') {
        const hasMetaMask = typeof window.ethereum !== 'undefined' && window.ethereum.isMetaMask;
        setIsMetaMaskInstalled(hasMetaMask);
      }
    };
    
    checkMetaMask();
    
    // Also check on window load in case MetaMask loads after initial check
    window.addEventListener('load', checkMetaMask);
    
    return () => {
      window.removeEventListener('load', checkMetaMask);
    };
  }, []);

  // Check if already connected on mount
  useEffect(() => {
    const checkConnection = async () => {
      if (isMetaMaskInstalled) {
        try {
          const accounts = await window.ethereum.request({ 
            method: 'eth_accounts' 
          });
          if (accounts.length > 0) {
            setAccount(accounts[0]);
          }
        } catch (err) {
          console.error('Error checking wallet connection:', err);
        }
      }
    };

    checkConnection();
  }, [isMetaMaskInstalled]);

  // Listen for account changes
  useEffect(() => {
    if (isMetaMaskInstalled) {
      const handleAccountsChanged = (accounts) => {
        if (accounts.length === 0) {
          setAccount(null);
        } else {
          setAccount(accounts[0]);
        }
        setError(null);
      };

      const handleChainChanged = () => {
        // Reload the page when chain changes
        window.location.reload();
      };

      window.ethereum.on('accountsChanged', handleAccountsChanged);
      window.ethereum.on('chainChanged', handleChainChanged);

      return () => {
        if (window.ethereum.removeListener) {
          window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
          window.ethereum.removeListener('chainChanged', handleChainChanged);
        }
      };
    }
  }, [isMetaMaskInstalled]);

  const connectWallet = useCallback(async (forceAccountSelection = false) => {
    if (!isMetaMaskInstalled) {
      setError('MetaMask is not installed. Please install MetaMask to continue.');
      return;
    }

    setIsConnecting(true);
    setError(null);

    try {
      let accounts;
      
      if (forceAccountSelection) {
        // Force MetaMask to show account selection dialog
        try {
          // First disconnect any existing connection
          await window.ethereum.request({
            method: 'wallet_revokePermissions',
            params: [{
              eth_accounts: {}
            }]
          });
        } catch (revokeError) {
          // Ignore revoke errors as some versions don't support it
          console.log('Revoke permissions not supported:', revokeError);
        }
      }
      
      // Request account access (this will show account selection if forced or first time)
      accounts = await window.ethereum.request({
        method: 'eth_requestAccounts'
      });

      if (accounts.length > 0) {
        setAccount(accounts[0]);
      }
    } catch (err) {
      if (err.code === 4001) {
        setError('Please connect to MetaMask.');
      } else {
        setError('An error occurred while connecting to your wallet.');
      }
      console.error('Error connecting wallet:', err);
    } finally {
      setIsConnecting(false);
    }
  }, [isMetaMaskInstalled]);

  const disconnectWallet = useCallback(async () => {
    try {
      // Try to revoke permissions to clear the connection cache
      if (window.ethereum && window.ethereum.request) {
        try {
          await window.ethereum.request({
            method: 'wallet_revokePermissions',
            params: [{
              eth_accounts: {}
            }]
          });
        } catch (revokeError) {
          // Some MetaMask versions don't support revoke, that's okay
          console.log('Revoke permissions not supported:', revokeError);
        }
      }
    } catch (error) {
      console.error('Error during disconnect:', error);
    }
    
    setAccount(null);
    setError(null);
  }, []);

  const isAdmin = useCallback(() => {
    return account && account.toLowerCase() === ADMIN_WALLET.toLowerCase();
  }, [account]);

  const formatAddress = useCallback((address) => {
    if (!address) return '';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  }, []);

  const getNetworkName = useCallback(async () => {
    if (!isMetaMaskInstalled || !account) return null;

    try {
      const chainId = await window.ethereum.request({ method: 'eth_chainId' });
      const networks = {
        '0x1': 'Ethereum Mainnet',
        '0x3': 'Ropsten Testnet',
        '0x4': 'Rinkeby Testnet',
        '0x5': 'Goerli Testnet',
        '0xaa36a7': 'Sepolia Testnet',
        '0x89': 'Polygon Mainnet',
        '0x13881': 'Polygon Mumbai',
      };
      return networks[chainId] || `Chain ID: ${chainId}`;
    } catch (err) {
      console.error('Error getting network:', err);
      return null;
    }
  }, [isMetaMaskInstalled, account]);

  const switchToSepolia = useCallback(async () => {
    if (!isMetaMaskInstalled) return;

    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: getChainIdHex(CHAIN_ID) }], // Configured testnet
      });
    } catch (switchError) {
      // This error code indicates that the chain has not been added to MetaMask
      if (switchError.code === 4902) {
        try {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [
              {
                chainId: getChainIdHex(CHAIN_ID),
                chainName: `${NETWORK_NAME.charAt(0).toUpperCase() + NETWORK_NAME.slice(1)} Testnet`,
                rpcUrls: [`https://${NETWORK_NAME}.infura.io/v3/`],
                nativeCurrency: {
                  name: 'SepoliaETH',
                  symbol: 'SEP',
                  decimals: 18,
                },
                blockExplorerUrls: [`https://${NETWORK_NAME}.etherscan.io/`],
              },
            ],
          });
        } catch (addError) {
          console.error('Error adding Sepolia network:', addError);
        }
      } else {
        console.error('Error switching to Sepolia:', switchError);
      }
    }
  }, [isMetaMaskInstalled]);

  return {
    account,
    isConnecting,
    error,
    isMetaMaskInstalled,
    isAdmin: isAdmin(),
    connectWallet,
    disconnectWallet,
    formatAddress,
    getNetworkName,
    switchToSepolia,
    ADMIN_WALLET
  };
};