import React, { useState } from 'react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { PublicKey } from '@solana/web3.js';
import { getProgram, findProgramAddress } from '../utils/anchor-connection';
import * as anchor from '@project-serum/anchor';
import { Buffer } from "buffer";
window.Buffer = window.Buffer || Buffer;

const InitializeIco = ({ onInitialize }) => {
  const { connection } = useConnection();
  const wallet = useWallet();
  const [totalSupply, setTotalSupply] = useState('');
  const [tokenPrice, setTokenPrice] = useState('');
  const [startTime, setStartTime] = useState('');
  const [duration, setDuration] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleInitialize = async (e) => {
    e.preventDefault();
    if (!wallet.publicKey || !wallet.signTransaction) return;

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const program = getProgram(connection, wallet);
      const { publicKey: icoAccount } = await findProgramAddress(
        [anchor.utils.bytes.utf8.encode('ico')],
        program.programId
      );

      const tx = await program.methods
        .initialize(
          new anchor.BN(totalSupply),
          new anchor.BN(tokenPrice),
          new anchor.BN(Math.floor(new Date(startTime).getTime() / 1000)),
          new anchor.BN(parseInt(duration) * 24 * 60 * 60) // Convert days to seconds
        )
        .accounts({
          authority: wallet.publicKey,
          icoAccount,
          systemProgram: anchor.web3.SystemProgram.programId,
        })
        .rpc();

      setSuccess(`ICO initialized successfully! TxID: ${tx}`);
      onInitialize();
    } catch (err) {
      console.error('Error initializing ICO:', err);
      setError(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="initialize-ico">
      <h2>Initialize ICO</h2>
      <form onSubmit={handleInitialize}>
        <div className="form-group">
          <label htmlFor="totalSupply">Total Supply:</label>
          <input
            type="text"
            id="totalSupply"
            value={totalSupply}
            onChange={(e) => setTotalSupply(e.target.value)}
            placeholder="Enter total number of tokens (e.g., 1000000)"
            required
          />
          <small>Enter the total number of tokens for the ICO (integer value)</small>
        </div>
        <div className="form-group">
          <label htmlFor="tokenPrice">Token Price (lamports):</label>
          <input
            type="text"
            id="tokenPrice"
            value={tokenPrice}
            onChange={(e) => setTokenPrice(e.target.value)}
            placeholder="Enter price in lamports (e.g., 1000000 for 1 SOL)"
            required
          />
          <small>Enter the price per token in lamports (1 SOL = 1,000,000,000 lamports)</small>
        </div>
        <div className="form-group">
          <label htmlFor="startTime">Start Time:</label>
          <input
            type="datetime-local"
            id="startTime"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            required
          />
          <small>Select the start date and time for the ICO</small>
        </div>
        <div className="form-group">
          <label htmlFor="duration">Duration (days):</label>
          <input
            type="number"
            id="duration"
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
            min="1"
            placeholder="Enter duration in days (e.g., 30)"
            required
          />
          <small>Enter the duration of the ICO in days (integer value)</small>
        </div>
        <button type="submit" disabled={loading}>
          {loading ? 'Initializing...' : 'Initialize ICO'}
        </button>
      </form>
      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}
    </div>
  );
};

export default InitializeIco;

