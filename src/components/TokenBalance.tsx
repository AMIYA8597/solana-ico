import React, { useState, useEffect } from 'react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { PublicKey } from '@solana/web3.js';
import {
  TOKEN_PROGRAM_ID,
  getAssociatedTokenAddress,
  getAccount,
} from '@solana/spl-token';
import { formatLamports } from '../utils/formatters.ts';

const TokenBalance: React.FC = () => {
  const { connection } = useConnection();
  const wallet = useWallet();
  const [balance, setBalance] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchTokenBalance = async () => {
      if (!wallet.publicKey) return;
      try {
        const mint = new PublicKey(process.env.REACT_APP_TOKEN_MINT_ADDRESS!);
        const tokenAccount = await getAssociatedTokenAddress(mint, wallet.publicKey);
        const accountInfo = await getAccount(connection, tokenAccount);
        setBalance(accountInfo.amount.toString());
      } catch (err) {
        console.error('Error fetching token balance:', err);
        setError('Failed to fetch token balance');
      } finally {
        setLoading(false);
      }
    };

    fetchTokenBalance();
  }, [connection, wallet.publicKey]);

  if (loading) return <div className="animate-pulse bg-gray-200 h-24 rounded-lg"></div>;
  if (error) return <div className="text-red-500">{error}</div>;

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-semibold mb-4">Your Token Balance</h2>
      {balance !== null ? (
        <p className="text-3xl font-bold text-blue-600">{formatLamports(balance)} tokens</p>
      ) : (
        <p className="text-gray-600">No balance available</p>
      )}
    </div>
  );
};

export default TokenBalance;

