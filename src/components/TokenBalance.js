import React, { useState, useEffect } from 'react';
import { useConnection, useWallet } from'@solana/wallet-adapter-react';
import { PublicKey } from '@solana/web3.js';
import {
  TOKEN_PROGRAM_ID,
  getAssociatedTokenAddress,
  getAccount,
} from '@solana/spl-token';
import { formatLamports } from '../utils/formatters';

const TokenBalance = () => {
  const { connection } = useConnection();
  const wallet = useWallet();
  const [balance, setBalance] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchTokenBalance = async () => {
      if (!wallet.publicKey) return;
      try {
        const mint = new PublicKey(process.env.REACT_APP_TOKEN_MINT_ADDRESS);
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

  if (loading) return <div>Loading token balance...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="token-balance">
      <h2>Your Token Balance</h2>
      {balance !== null ? (
        <p>{formatLamports(balance)} tokens</p>
      ) : (
        <p>No balance available</p>
      )}
    </div>
  );
};

export default TokenBalance;

