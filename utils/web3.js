// Web3 utility functions for EventRSVP

export const ADMIN_WALLET = process.env.NEXT_PUBLIC_ADMIN_WALLET || "0xb05542907644713D95004f9e5984fcB706165937";
const CHAIN_ID = process.env.NEXT_PUBLIC_CHAIN_ID || "11155111";
const NETWORK_NAME = process.env.NEXT_PUBLIC_NETWORK_NAME || "sepolia";

// Convert decimal chain ID to hex
const getChainIdHex = (chainId) => {
  return '0x' + parseInt(chainId).toString(16);
};

// Check if wallet address is admin
export const isAdminWallet = (address) => {
  if (!address) return false;
  return address.toLowerCase() === ADMIN_WALLET.toLowerCase();
};

// Format wallet address for display
export const formatAddress = (address) => {
  if (!address) return '';
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
};

// Get network information
export const getNetworkInfo = (chainId) => {
  const networks = {
    '0x1': { name: 'Ethereum Mainnet', color: 'bg-green-500' },
    '0x3': { name: 'Ropsten Testnet', color: 'bg-pink-500' },
    '0x4': { name: 'Rinkeby Testnet', color: 'bg-yellow-500' },
    '0x5': { name: 'Goerli Testnet', color: 'bg-blue-500' },
    '0xaa36a7': { name: 'Sepolia Testnet', color: 'bg-purple-500' },
    '0x89': { name: 'Polygon Mainnet', color: 'bg-purple-600' },
    '0x13881': { name: 'Polygon Mumbai', color: 'bg-orange-500' },
  };
  
  return networks[chainId] || { 
    name: `Chain ID: ${chainId}`, 
    color: 'bg-gray-500' 
  };
};

// Check if MetaMask is installed
export const isMetaMaskInstalled = () => {
  return typeof window !== 'undefined' && typeof window.ethereum !== 'undefined';
};

// Request wallet connection
export const connectWallet = async () => {
  if (!isMetaMaskInstalled()) {
    throw new Error('MetaMask is not installed');
  }

  try {
    const accounts = await window.ethereum.request({
      method: 'eth_requestAccounts'
    });
    return accounts[0];
  } catch (error) {
    if (error.code === 4001) {
      throw new Error('Please connect to MetaMask');
    }
    throw new Error('Failed to connect wallet');
  }
};

// Get current accounts
export const getAccounts = async () => {
  if (!isMetaMaskInstalled()) {
    return [];
  }

  try {
    const accounts = await window.ethereum.request({
      method: 'eth_accounts'
    });
    return accounts;
  } catch (error) {
    console.error('Error getting accounts:', error);
    return [];
  }
};

// Get current network
export const getCurrentNetwork = async () => {
  if (!isMetaMaskInstalled()) {
    return null;
  }

  try {
    const chainId = await window.ethereum.request({
      method: 'eth_chainId'
    });
    return getNetworkInfo(chainId);
  } catch (error) {
    console.error('Error getting network:', error);
    return null;
  }
};

// Switch to Sepolia testnet
export const switchToSepolia = async () => {
  if (!isMetaMaskInstalled()) {
    throw new Error('MetaMask is not installed');
  }

  try {
    await window.ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: getChainIdHex(CHAIN_ID) }],
    });
  } catch (switchError) {
    // Chain not added to MetaMask
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
        throw new Error('Failed to add Sepolia network');
      }
    } else {
      throw new Error('Failed to switch to Sepolia network');
    }
  }
};

// Validate Ethereum address
export const isValidEthereumAddress = (address) => {
  return /^0x[a-fA-F0-9]{40}$/.test(address);
};

// Convert Wei to ETH
export const weiToEth = (wei) => {
  return parseFloat(wei) / Math.pow(10, 18);
};

// Convert ETH to Wei
export const ethToWei = (eth) => {
  return Math.floor(parseFloat(eth) * Math.pow(10, 18));
};

// Mock transaction simulation for demo
export const simulateTransaction = async (amount, recipient) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      // Simulate 90% success rate
      if (Math.random() > 0.1) {
        resolve({
          hash: `0x${Math.random().toString(16).substr(2, 64)}`,
          from: ADMIN_WALLET,
          to: recipient,
          value: ethToWei(amount),
          gasUsed: '21000',
          status: 'success'
        });
      } else {
        reject(new Error('Transaction failed'));
      }
    }, 2000 + Math.random() * 3000); // 2-5 seconds delay
  });
};

// Get balance (mock for demo)
export const getBalance = async (address) => {
  // Simulate different balances for demo
  const mockBalances = {
    [ADMIN_WALLET.toLowerCase()]: '5.234',
    '0x1234567890abcdef1234567890abcdef12345678': '1.567',
    '0xabcdef1234567890abcdef1234567890abcdef12': '0.123',
  };
  
  return mockBalances[address?.toLowerCase()] || '0.000';
};

// Event logging utilities
export const logWalletEvent = (event, data = {}) => {
  console.log(`[Wallet Event] ${event}:`, data);
};

// Error handling utilities
export const handleWalletError = (error) => {
  const errorMessages = {
    4001: 'Transaction rejected by user',
    4100: 'Unauthorized method requested',
    4200: 'Unsupported method requested',
    4900: 'Disconnected from chain',
    4901: 'Chain disconnected',
    '-32002': 'Request already pending',
    '-32603': 'Internal error',
  };

  const message = errorMessages[error.code] || error.message || 'Unknown wallet error';
  logWalletEvent('error', { code: error.code, message });
  return message;
};