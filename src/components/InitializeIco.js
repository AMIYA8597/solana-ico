import React, { useState } from "react";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { PublicKey } from "@solana/web3.js";
import { getProgram } from "../utils/anchor-connection";
import * as anchor from "@project-serum/anchor";

const InitializeIco = () => {
  const { connection } = useConnection();
  const wallet = useWallet();
  const [totalSupply, setTotalSupply] = useState("");
  const [tokenPrice, setTokenPrice] = useState("");
  const [startTime, setStartTime] = useState("");
  const [duration, setDuration] = useState("");
  const [roundType, setRoundType] = useState("SeedRound");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleInitialize = async (e) => {
    e.preventDefault();
    if (!wallet.publicKey || !wallet.signTransaction) return;

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const program = getProgram(connection, wallet);
      const [icoAccount] = await PublicKey.findProgramAddress(
        [Buffer.from("ico")],
        program.programId
      );

      const mint = new PublicKey(process.env.REACT_APP_TOKEN_MINT_ADDRESS);

      const tx = await program.methods
        .initialize(
          new anchor.BN(totalSupply),
          new anchor.BN(tokenPrice),
          new anchor.BN(Math.floor(new Date(startTime).getTime() / 1000)),
          new anchor.BN(parseInt(duration) * 24 * 60 * 60),
          { [roundType]: {} }
        )
        .accounts({
          authority: wallet.publicKey,
          icoAccount,
          mint,
          systemProgram: anchor.web3.SystemProgram.programId,
        })
        .rpc();

      setSuccess(`ICO initialized successfully! TxID: ${tx}`);
    } catch (err) {
      console.error("Error initializing ICO:", err);
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
            type="number"
            id="totalSupply"
            value={totalSupply}
            onChange={(e) => setTotalSupply(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="tokenPrice">Token Price (in lamports):</label>
          <input
            type="number"
            id="tokenPrice"
            value={tokenPrice}
            onChange={(e) => setTokenPrice(e.target.value)}
            required
          />
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
        </div>
        <div className="form-group">
          <label htmlFor="duration">Duration (in days):</label>
          <input
            type="number"
            id="duration"
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="roundType">Round Type:</label>
          <select
            id="roundType"
            value={roundType}
            onChange={(e) => setRoundType(e.target.value)}
            required
          >
            <option value="SeedRound">Seed Round</option>
            <option value="PreICO">Pre-ICO</option>
            <option value="PublicICO">Public ICO</option>
          </select>
        </div>
        <button type="submit" disabled={loading}>
          {loading ? "Initializing..." : "Initialize ICO"}
        </button>
      </form>
      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}
    </div>
  );
};

export default InitializeIco;

