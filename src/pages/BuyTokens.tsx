import React, { useState } from 'react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { PublicKey, Transaction } from '@solana/web3.js';
import { getProgram } from '../utils/anchor-connection.ts';
import * as anchor from '@project-serum/anchor';
import { TOKEN_PROGRAM_ID, getAssociatedTokenAddress, createAssociatedTokenAccountInstruction } from '@solana/spl-token';
import { formatLamports } from '../utils/formatters.ts';

const TREASURY_WALLET = new PublicKey('DYkCAokwibanNxMvixmoZFQDwayGDJWfJ9moZjDRpUvW');

const BuyTokens: React.FC = () => {
  const { connection } = useConnection();
  const wallet = useWallet();
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleBuyTokens = async (e: React.FormEvent) => {
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

      const mint = new PublicKey(process.env.REACT_APP_TOKEN_MINT_ADDRESS!);
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
          treasuryWallet: TREASURY_WALLET,
          tokenProgram: TOKEN_PROGRAM_ID,
          systemProgram: anchor.web3.SystemProgram.programId,
        })
        .instruction();

      transaction.add(buyInstruction);

      const signature = await wallet.sendTransaction(transaction, connection);
      await connection.confirmTransaction(signature, 'confirmed');

      setSuccess(`Transaction successful! Signature: ${signature}`);
    } catch (err: any) {
      console.error('Error buying tokens:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-semibold mb-4">Buy Tokens</h2>
      {!wallet.connected ? (
        <div className="text-center text-gray-600">
          Please connect your wallet to buy tokens
        </div>
      ) : (
        <form onSubmit={handleBuyTokens} className="space-y-4">
          <div>
            <label htmlFor="amount" className="block text-sm font-medium text-gray-700">Amount of tokens:</label>
            <input
              type="number"
              id="amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Enter number of tokens to buy"
              min="1"
              required
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <button
            type="submit"
            disabled={loading || !amount || Number(amount) <= 0}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
          >
            {loading ? 'Processing...' : 'Buy Tokens'}
          </button>
        </form>
      )}
      {error && <div className="mt-4 text-red-500">{error}</div>}
      {success && <div className="mt-4 text-green-500">{success}</div>}
    </div>
  );
};

export default BuyTokens;

