import { useEffect, useState } from 'react';
import { getContract } from '../utils/contract';
import { ethers } from 'ethers';

export default function EventCount() {
  const [count, setCount] = useState(null);

  useEffect(() => {
    async function fetchCount() {
      if (window.ethereum) {
        await window.ethereum.request({ method: 'eth_requestAccounts' });
  const provider = new ethers.BrowserProvider(window.ethereum); // ethers v6
        const contract = getContract(provider);
        const eventCount = await contract.getEventCount();
        setCount(eventCount.toString());
      }
    }
    fetchCount();
  }, []);

  return <div>Event Count: {count}</div>;
}