import React from 'react';
import { useIco } from '../contexts/IcoContext';
import { useWallet } from '../contexts/WalletContext';

function Admin() {
  const { endIco, batchDistributeTokens } = useIco();
  const { wallet } = useWallet();

  const handleEndIco = async () => {
    if (!wallet) {
      alert('Please connect your wallet first');
      return;
    }
    try {
      await endIco();
      alert('ICO ended successfully');
    } catch (error) {
      console.error('Error ending ICO:', error);
      alert('Failed to end ICO. Please try again.');
    }
  };

  const handleDistributeTokens = async () => {
    if (!wallet) {
      alert('Please connect your wallet first');
      return;
    }
    try {
      await batchDistributeTokens();
      alert('Tokens distributed successfully');
    } catch (error) {
      console.error('Error distributing tokens:', error);
      alert('Failed to distribute tokens. Please try again.');
    }
  };

  return (
    <div className="container mx-auto mt-8">
      <h1 className="text-4xl font-bold mb-4">Admin Panel</h1>
      <div className="space-y-4">
        <button onClick={handleEndIco} className="bg-red-500 text-white px-4 py-2 rounded">
          End ICO
        </button>
        <button onClick={handleDistributeTokens} className="bg-green-500 text-white px-4 py-2 rounded">
          Distribute Tokens
        </button>
      </div>
    </div>
  );
}

export default Admin;

