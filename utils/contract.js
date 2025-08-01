import { ethers } from 'ethers';
import { CONTRACT_CONFIG } from '../constants/contractConfig';

class ContractService {
  constructor() {
    this.provider = null;
    this.signer = null;
    this.eventRSVPContract = null;
    this.isInitialized = false;
  }

  async init() {
    if (this.isInitialized) return;

    try {
      // Initialize ethers provider
      if (window.ethereum) {
        this.provider = new ethers.BrowserProvider(window.ethereum);
      } else {
        // Fallback to RPC provider for read-only operations
        this.provider = new ethers.JsonRpcProvider(CONTRACT_CONFIG.RPC_URL);
      }

      await this.initContract();
      this.isInitialized = true;
    } catch (error) {
      console.error('Failed to initialize contract service:', error);
      throw error;
    }
  }

  async initContract() {
    try {
      if (CONTRACT_CONFIG.EVENT_RSVP_ADDRESS && CONTRACT_CONFIG.EVENT_RSVP_ABI) {
        // Create contract instance with provider (read-only)
        this.eventRSVPContract = new ethers.Contract(
          CONTRACT_CONFIG.EVENT_RSVP_ADDRESS,
          CONTRACT_CONFIG.EVENT_RSVP_ABI,
          this.provider
        );
      }
    } catch (error) {
      console.error('Failed to initialize contract:', error);
      throw error;
    }
  }

  async getProvider() {
    if (!this.isInitialized) {
      await this.init();
    }
    return this.provider;
  }

  async getSigner() {
    if (!this.signer) {
      const provider = await this.getProvider();
      this.signer = await provider.getSigner();
    }
    return this.signer;
  }

  async getContract(needsSigner = false) {
    if (!this.isInitialized) {
      await this.init();
    }
    
    if (needsSigner && this.eventRSVPContract) {
      const signer = await this.getSigner();
      return this.eventRSVPContract.connect(signer);
    }
    
    return this.eventRSVPContract;
  }

  async getAccounts() {
    const provider = await this.getProvider();
    return await provider.listAccounts();
  }

  async getNetworkId() {
    const provider = await this.getProvider();
    const network = await provider.getNetwork();
    return Number(network.chainId);
  }

  async getBalance(address) {
    const provider = await this.getProvider();
    const balance = await provider.getBalance(address);
    return ethers.formatEther(balance);
  }

  // Event Management Methods
  async createEvent(eventData) {
    const contract = await this.getContract(true); // needs signer
    
    const { name, description, date, startTime, endTime, location, maxAttendees, depositAmount } = eventData;
    const depositWei = ethers.parseEther(depositAmount.toString());
    const eventTimestamp = Math.floor(new Date(`${date}T${startTime}`).getTime() / 1000);
    
    const tx = await contract.createEvent(
      name,
      description,
      eventTimestamp,
      location,
      maxAttendees,
      depositWei
    );
    
    return await tx.wait();
  }

  async rsvpToEvent(eventId, depositAmount) {
    const contract = await this.getContract(true); // needs signer
    const depositWei = ethers.parseEther(depositAmount.toString());
    
    const tx = await contract.rsvpToEvent(eventId, {
      value: depositWei
    });
    
    return await tx.wait();
  }

  async cancelRSVP(eventId) {
    const contract = await this.getContract(true); // needs signer
    
    const tx = await contract.cancelRSVP(eventId);
    return await tx.wait();
  }

  async markAttendance(eventId, attendeeAddress) {
    const contract = await this.getContract(true); // needs signer
    
    const tx = await contract.markAttendance(eventId, attendeeAddress);
    return await tx.wait();
  }

  async finalizeEvent(eventId) {
    const contract = await this.getContract(true); // needs signer
    
    const tx = await contract.finalizeEvent(eventId);
    return await tx.wait();
  }

  // View Methods
  async getEvent(eventId) {
    const contract = await this.getContract();
    return await contract.getEvent(eventId);
  }

  async getEventCount() {
    const contract = await this.getContract();
    const count = await contract.getEventCount();
    return Number(count);
  }

  async getUserRSVPs(userAddress) {
    const contract = await this.getContract();
    return await contract.getUserRSVPs(userAddress);
  }

  async getEventAttendees(eventId) {
    const contract = await this.getContract();
    return await contract.getEventAttendees(eventId);
  }

  async hasUserRSVPed(eventId, userAddress) {
    const contract = await this.getContract();
    return await contract.hasUserRSVPed(eventId, userAddress);
  }

  // Utility Methods
  formatEther(wei) {
    return ethers.formatEther(wei);
  }

  formatWei(ether) {
    return ethers.parseEther(ether.toString());
  }

  isValidAddress(address) {
    return ethers.isAddress(address);
  }

  // Transaction Helpers
  async estimateGas(contractMethod, args = []) {
    try {
      const contract = await this.getContract(true);
      return await contract[contractMethod].estimateGas(...args);
    } catch (error) {
      console.error('Gas estimation failed:', error);
      return null;
    }
  }

  async getGasPrice() {
    const provider = await this.getProvider();
    const feeData = await provider.getFeeData();
    return feeData.gasPrice;
  }

  async waitForTransactionReceipt(txHash, confirmations = 1) {
    const provider = await this.getProvider();
    try {
      const receipt = await provider.waitForTransaction(txHash, confirmations);
      return receipt;
    } catch (error) {
      console.error('Transaction confirmation failed:', error);
      throw error;
    }
  }

  // Foundry-specific utilities
  async deployContract(contractName, constructorArgs = [], deployerAddress = null) {
    // This would be used with Foundry's forge create command
    // For now, it's a placeholder for future Foundry integration
    throw new Error('Contract deployment should be done using Foundry forge create command');
  }

  async loadDeploymentArtifacts(contractName) {
    // Load contract artifacts generated by Foundry
    try {
      const artifactPath = `./out/${contractName}.sol/${contractName}.json`;
      // In a real implementation, this would read the JSON file
      // For now, return placeholder
      return {
        abi: CONTRACT_CONFIG.EVENT_RSVP_ABI,
        bytecode: '0x...' // Would be loaded from artifacts
      };
    } catch (error) {
      console.error('Failed to load contract artifacts:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const contractService = new ContractService();
export default contractService;