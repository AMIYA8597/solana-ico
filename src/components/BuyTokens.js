import React, { useState } from 'react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { PublicKey, Transaction } from '@solana/web3.js';
import { getProgram } from '../utils/anchor-connection';
import * as anchor from '@project-serum/anchor';
import { TOKEN_PROGRAM_ID, getAssociatedTokenAddress, createAssociatedTokenAccountInstruction } from '@solana/spl-token';
import { formatLamports } from '../utils/formatters';

const TREASURY_WALLET = new PublicKey('DYkCAokwibanNxMvixmoZFQDwayGDJWfJ9moZjDRpUvW');

const BuyTokens = () => {
  const { connection } = useConnection();
  const wallet = useWallet();
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleBuyTokens = async (e) => {
    e.preventDefault();
    if (!wallet.publicKey || !wallet.signTransaction) {
      setError('Please connect your wallet');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const program = getProgram(connection, wallet);
      
      const [icoAccount] = await PublicKey.findProgramAddress(
        [Buffer.from("ico")],
        program.programId
      );

      const mint = new PublicKey(process.env.REACT_APP_TOKEN_MINT_ADDRESS);
      const buyerTokenAccount = await getAssociatedTokenAddress(mint, wallet.publicKey);

      let transaction = new Transaction();

      try {
        await connection.getAccountInfo(buyerTokenAccount);
      } catch (err) {
        transaction.add(
          createAssociatedTokenAccountInstruction(
            wallet.publicKey,
            buyerTokenAccount,
            wallet.publicKey,
            mint
          )
        );
      }

      const [purchaseAccount] = await PublicKey.findProgramAddress(
        [Buffer.from("purchase"), wallet.publicKey.toBuffer()],
        program.programId
      );

      const buyInstruction = await program.methods
        .buyTokens(new anchor.BN(amount))
        .accounts({
          buyer: wallet.publicKey,
          icoAccount: icoAccount,
          purchaseAccount: purchaseAccount,
          mint: mint,
          buyerTokenAccount: buyerTokenAccount,
          treasuryWallet: TREASURY_WALLET,
          tokenProgram: TOKEN_PROGRAM_ID,
          systemProgram: anchor.web3.SystemProgram.programId,
        })
        .instruction();

      transaction.add(buyInstruction);

      const signature = await wallet.sendTransaction(transaction, connection);
      await connection.confirmTransaction(signature, 'confirmed');

      setSuccess(`Transaction successful! Signature: ${signature}`);
    } catch (err) {
      console.error('Error buying tokens:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="buy-tokens">
      <h2>Buy Tokens</h2>
      {!wallet.connected ? (
        <div className="connect-wallet-message">
          Please connect your wallet to buy tokens
        </div>
      ) : (
        <form onSubmit={handleBuyTokens}>
          <div className="form-group">
            <label htmlFor="amount">Amount of tokens:</label>
            <input
              type="number"
              id="amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Enter number of tokens to buy"
              min="1"
              required
            />
          </div>
          <button type="submit" disabled={loading || !amount || Number(amount) <= 0}>
            {loading ? 'Processing...' : 'Buy Tokens'}
          </button>
        </form>
      )}
      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}
    </div>
  );
};

export default BuyTokens;



















































