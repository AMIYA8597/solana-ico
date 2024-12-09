import React, { useState, useEffect } from 'react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { PublicKey } from '@solana/web3.js';
import { getProgram } from '../utils/anchor-connection.ts';
import { formatUnixTimestamp, formatLamports } from '../utils/formatters.ts';

const IcoDetails: React.FC = () => {
  const { connection } = useConnection();
  const wallet = useWallet();
  const [icoDetails, setIcoDetails] = useState<any>(null);
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

  if (loading) return <div className="animate-pulse bg-gray-200 h-48 rounded-lg"></div>;
  if (error) return <div className="text-red-500">Error: {error}</div>;

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-semibold mb-4">ICO Details</h2>
      {icoDetails ? (
        <div className="space-y-2">
          <p><span className="font-medium">Total Supply:</span> {formatLamports(icoDetails.totalSupply)} tokens</p>
          <p><span className="font-medium">Token Price:</span> {formatLamports(icoDetails.tokenPrice)} SOL</p>
          <p><span className="font-medium">Start Time:</span> {icoDetails.startTime}</p>
          <p><span className="font-medium">End Time:</span> {icoDetails.endTime}</p>
          <p><span className="font-medium">Status:</span> {icoDetails.isActive ? 'Active' : 'Inactive'}</p>
          <p><span className="font-medium">Round Type:</span> {icoDetails.roundType}</p>
        </div>
      ) : (
        <p>No ICO details available</p>
      )}
    </div>
  );
};

export default IcoDetails;

