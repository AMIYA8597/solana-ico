import { LAMPORTS_PER_SOL } from '@solana/web3.js';

export const formatUnixTimestamp = (timestamp: number): string => {
  return new Date(timestamp * 1000).toLocaleString();
};

export const formatLamports = (lamports: string | number): string => {
  return (Number(lamports) / LAMPORTS_PER_SOL).toFixed(9);
};

