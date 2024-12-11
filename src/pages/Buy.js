import React, { useState } from 'react';
import { useIco } from '../contexts/IcoContext';
import { useWallet } from '../contexts/WalletContext';

function Buy() {
  const [amount, setAmount] = useState('');
  const { buyTokens } = useIco();
  const { wallet } = useWallet();

  const handleBuy = async (e) => {
    e.preventDefault();
    if (!wallet) {
      alert('Please connect your wallet first');
      return;
    }
    try {
      await buyTokens(Number(amount));
      alert('Purchase successful!');
      setAmount('');
    } catch (error) {
      console.error('Error buying tokens:', error);
      alert('Failed to purchase tokens. Please try again.');
    }
  };

  return (
    <div className="container mx-auto mt-8">
      <h1 className="text-4xl font-bold mb-4">Buy Tokens</h1>
      <form onSubmit={handleBuy} className="max-w-md">
        <div className="mb-4">
          <label htmlFor="amount" className="block mb-2">Amount of tokens to buy:</label>
          <input
            type="number"
            id="amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full px-3 py-2 border rounded"
            required
          />
        </div>
        <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">
          Buy Tokens
        </button>
      </form>
    </div>
  );
}

export default Buy;

