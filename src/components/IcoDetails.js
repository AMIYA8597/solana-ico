import React, { useState, useEffect } from 'react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { PublicKey } from '@solana/web3.js';
import { getProgram } from '../utils/anchor-connection';
import { formatUnixTimestamp, formatLamports } from '../utils/formatters';

import { Buffer } from 'buffer';

// @ts-ignore
window.Buffer = Buffer;

const IcoDetails = () => {
  const { connection } = useConnection();
  const wallet = useWallet();
  const [icoDetails, setIcoDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchIcoDetails = async () => {
      if (!wallet.publicKey) return;
      try {
        const program = getProgram(connection, wallet);
        const [icoAccount] = await PublicKey.findProgramAddress(
          [Buffer.from("ico")],
          program.programId
        );
        const icoData = await program.account.icoAccount.fetch(icoAccount);
        setIcoDetails({
          totalSupply: icoData.totalSupply.toString(),
          tokenPrice: icoData.tokenPrice.toString(),
          startTime: formatUnixTimestamp(icoData.startTime),
          endTime: formatUnixTimestamp(icoData.startTime.add(icoData.duration)),
          isActive: icoData.isActive,
          roundType: Object.keys(icoData.roundType)[0],
        });
      } catch (err) {
        console.error('Error fetching ICO details:', err);
        setError('Failed to fetch ICO details');
      } finally {
        setLoading(false);
      }
    };

    fetchIcoDetails();
  }, [connection, wallet.publicKey]);

  if (loading) return <div>Loading ICO details...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="ico-details">
      <h2>ICO Details</h2>
      {icoDetails ? (
        <>
          <p>Total Supply: {formatLamports(icoDetails.totalSupply)} tokens</p>
          <p>Token Price: {formatLamports(icoDetails.tokenPrice)} SOL</p>
          <p>Start Time: {icoDetails.startTime}</p>
          <p>End Time: {icoDetails.endTime}</p>
          <p>Status: {icoDetails.isActive ? 'Active' : 'Inactive'}</p>
          <p>Round Type: {icoDetails.roundType}</p>
        </>
      ) : (
        <p>No ICO details available</p>
      )}
    </div>
  );
};

export default IcoDetails;

