import { LAMPORTS_PER_SOL } from '@solana/web3.js';

import { Buffer } from 'buffer';
// @ts-ignore
window.Buffer = Buffer;


export const formatUnixTimestamp = (timestamp) => {
  return new Date(timestamp * 1000).toLocaleString();
};

export const formatLamports = (lamports) => {
  return (lamports / LAMPORTS_PER_SOL).toFixed(9);
};

