'use client';

import { useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';
import contractService from '../utils/contract';
import { CONTRACT_CONFIG, getNetworkById, isNetworkSupported } from '../constants/contractConfig';

export const useContract = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [account, setAccount] = useState(null);
  const [networkId, setNetworkId] = useState(null);
  const [network, setNetwork] = useState(null);
  const [balance, setBalance] = useState('0');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [contract, setContract] = useState(null);

  // Initialize contract service
  const initContract = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      await contractService.init();
      const contractInstance = await contractService.getContract();
      setContract(contractInstance);
    } catch (err) {
      console.error('Contract initialization failed:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Connect to wallet
  const connectWallet = useCallback(async () => {
    try {
      if (!window.ethereum) {
        throw new Error(CONTRACT_CONFIG.ERROR_MESSAGES.NO_WALLET);
      }

      setIsLoading(true);
      setError(null);

      // Request account access
      await window.ethereum.request({ method: 'eth_requestAccounts' });
      
      // Get provider and signer using ethers
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const userAccount = await signer.getAddress();
      
      const currentNetworkId = await contractService.getNetworkId();
      const currentNetwork = getNetworkById(currentNetworkId);
      
      if (!isNetworkSupported(currentNetworkId)) {
        throw new Error(`${CONTRACT_CONFIG.ERROR_MESSAGES.WRONG_NETWORK} Supported networks: ${Object.values(CONTRACT_CONFIG.NETWORKS).map(n => n.name).join(', ')}`);
      }

      const userBalance = await contractService.getBalance(userAccount);
      
      setAccount(userAccount);
      setNetworkId(currentNetworkId);
      setNetwork(currentNetwork);
      setBalance(userBalance);
      setIsConnected(true);
      
      // Initialize contract after successful connection
      await initContract();
    } catch (err) {
      console.error('Wallet connection failed:', err);
      setError(err.message);
      setIsConnected(false);
    } finally {
      setIsLoading(false);
    }
  }, [initContract]);

  // Disconnect wallet
  const disconnectWallet = useCallback(() => {
    setIsConnected(false);
    setAccount(null);
    setNetworkId(null);
    setNetwork(null);
    setBalance('0');
    setContract(null);
    setError(null);
  }, []);

  // Switch network
  const switchNetwork = useCallback(async (targetNetworkId) => {
    try {
      if (!window.ethereum) {
        throw new Error(CONTRACT_CONFIG.ERROR_MESSAGES.NO_WALLET);
      }

      const targetNetwork = getNetworkById(targetNetworkId);
      if (!targetNetwork) {
        throw new Error('Unsupported network');
      }

      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: `0x${targetNetworkId.toString(16)}` }],
      });
    } catch (err) {
      if (err.code === 4902) {
        // Network not added to wallet, add it
        const targetNetwork = getNetworkById(targetNetworkId);
        await window.ethereum.request({
          method: 'wallet_addEthereumChain',
          params: [{
            chainId: `0x${targetNetworkId.toString(16)}`,
            chainName: targetNetwork.name,
            rpcUrls: [targetNetwork.rpcUrl],
            blockExplorerUrls: targetNetwork.explorerUrl ? [targetNetwork.explorerUrl] : null
          }]
        });
      } else {
        throw err;
      }
    }
  }, []);

  // Contract interaction methods
  const createEvent = async (eventData) => {
    if (!contract || !account) {
      throw new Error('Contract not initialized or wallet not connected');
    }

    try {
      const receipt = await contractService.createEvent(eventData);
      return receipt;
    } catch (err) {
      console.error('Create event failed:', err);
      throw err;
    }
  };

  const rsvpToEvent = async (eventId, depositAmount) => {
    if (!contract || !account) {
      throw new Error('Contract not initialized or wallet not connected');
    }

    try {
      const receipt = await contractService.rsvpToEvent(eventId, depositAmount);
      return receipt;
    } catch (err) {
      console.error('RSVP failed:', err);
      throw err;
    }
  };

  const cancelRSVP = async (eventId) => {
    if (!contract || !account) {
      throw new Error('Contract not initialized or wallet not connected');
    }

    try {
      const receipt = await contractService.cancelRSVP(eventId);
      return receipt;
    } catch (err) {
      console.error('Cancel RSVP failed:', err);
      throw err;
    }
  };

  const getEvent = async (eventId) => {
    if (!contract) {
      throw new Error('Contract not initialized');
    }

    try {
      return await contractService.getEvent(eventId);
    } catch (err) {
      console.error('Get event failed:', err);
      throw err;
    }
  };

  const getUserRSVPs = async (userAddress = account) => {
    if (!contract) {
      throw new Error('Contract not initialized');
    }

    try {
      return await contractService.getUserRSVPs(userAddress);
    } catch (err) {
      console.error('Get user RSVPs failed:', err);
      throw err;
    }
  };

  const hasUserRSVPed = async (eventId, userAddress = account) => {
    if (!contract) {
      throw new Error('Contract not initialized');
    }

    try {
      return await contractService.hasUserRSVPed(eventId, userAddress);
    } catch (err) {
      console.error('Check RSVP status failed:', err);
      throw err;
    }
  };

  // Event listeners for account and network changes
  useEffect(() => {
    if (window.ethereum) {
      const handleAccountsChanged = (accounts) => {
        if (accounts.length === 0) {
          disconnectWallet();
        } else if (accounts[0] !== account) {
          setAccount(accounts[0]);
          // Update balance for new account
          contractService.getBalance(accounts[0]).then(setBalance);
        }
      };

      const handleChainChanged = (chainId) => {
        const newNetworkId = parseInt(chainId, 16);
        const newNetwork = getNetworkById(newNetworkId);
        
        setNetworkId(newNetworkId);
        setNetwork(newNetwork);
        
        if (!isNetworkSupported(newNetworkId)) {
          setError(CONTRACT_CONFIG.ERROR_MESSAGES.WRONG_NETWORK);
        } else {
          setError(null);
          // Reinitialize contract for new network
          initContract();
        }
      };

      window.ethereum.on('accountsChanged', handleAccountsChanged);
      window.ethereum.on('chainChanged', handleChainChanged);

      return () => {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
        window.ethereum.removeListener('chainChanged', handleChainChanged);
      };
    }
  }, [account, disconnectWallet, initContract]);

  // Auto-connect if previously connected
  useEffect(() => {
    const autoConnect = async () => {
      try {
        if (window.ethereum) {
          const accounts = await window.ethereum.request({ method: 'eth_accounts' });
          if (accounts.length > 0) {
            await connectWallet();
          } else {
            setIsLoading(false);
          }
        } else {
          setIsLoading(false);
        }
      } catch (err) {
        console.error('Auto-connect failed:', err);
        setIsLoading(false);
      }
    };

    autoConnect();
  }, [connectWallet]);

  return {
    // Connection state
    isConnected,
    account,
    networkId,
    network,
    balance,
    isLoading,
    error,
    contract,

    // Connection methods
    connectWallet,
    disconnectWallet,
    switchNetwork,

    // Contract methods
    createEvent,
    rsvpToEvent,
    cancelRSVP,
    getEvent,
    getUserRSVPs,
    hasUserRSVPed,

    // Utility methods
    isNetworkSupported: networkId ? isNetworkSupported(networkId) : false,
    formatEther: ethers.formatEther,
    formatWei: ethers.parseEther,
    isValidAddress: ethers.isAddress,
    
    // Foundry-specific utilities
    getFoundryRpcUrl: () => {
      const currentNetwork = getNetworkById(networkId);
      return currentNetwork?.foundryUrl || currentNetwork?.rpcUrl;
    },
    
    // Helper to load contract artifacts (for development)
    loadContractArtifacts: async (contractName = 'EventRSVP') => {
      return await contractService.loadDeploymentArtifacts(contractName);
    }
  };
};

export default useContract;