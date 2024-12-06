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




















































// import React, { useState } from 'react';
// import { useConnection, useWallet } from '@solana/wallet-adapter-react';
// import { PublicKey, Transaction } from '@solana/web3.js';
// import { getProgram } from '../utils/anchor-connection';
// import * as anchor from '@project-serum/anchor';
// import { 
//   TOKEN_PROGRAM_ID, 
//   getAssociatedTokenAddress, 
//   ASSOCIATED_TOKEN_PROGRAM_ID 
// } from '@solana/spl-token';

// const BuyTokens = ({ icoDetails, onPurchase }) => {
//   const { connection } = useConnection();
//   const wallet = useWallet();
//   const [amount, setAmount] = useState('');
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState('');
//   const [success, setSuccess] = useState('');

//   const tokenMintAddress = new PublicKey('AhmbnmLBQWNy3zQMwi6g7s5tGFmbKZEfUczNkevZWFtX');
//   const treasuryWallet = new PublicKey('DYkCAokwibanNxMvixmoZFQDwayGDJWfJ9moZjDRpUvW');

//   const handleBuyTokens = async (e) => {
//     e.preventDefault();
//     if (!wallet.publicKey || !wallet.signTransaction) {
//       setError('Please connect your wallet');
//       return;
//     }

//     setLoading(true);
//     setError('');
//     setSuccess('');

//     try {
//       const program = getProgram(connection, wallet);
      
//       const [icoAccount] = await PublicKey.findProgramAddress(
//         [Buffer.from("ico")],
//         program.programId
//       );

//       const icoAccountInfo = await program.account.icoAccount.fetch(icoAccount);
//       const authority = icoAccountInfo.authority;

//       const tokenAccount = await getAssociatedTokenAddress(
//         tokenMintAddress,
//         authority,
//         true
//       );

//       const buyerTokenAccount = await getAssociatedTokenAddress(
//         tokenMintAddress,
//         wallet.publicKey
//       );

//       const tx = await program.methods
//         .buyTokens(new anchor.BN(amount))
//         .accounts({
//           buyer: wallet.publicKey,
//           icoAccount: icoAccount,
//           authority: authority,
//           treasuryWallet: treasuryWallet,
//           mint: tokenMintAddress,
//           tokenAccount: tokenAccount,
//           buyerTokenAccount: buyerTokenAccount,
//           tokenProgram: TOKEN_PROGRAM_ID,
//           associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
//           systemProgram: anchor.web3.SystemProgram.programId
//         })
//         .transaction();

//       const latestBlockhash = await connection.getLatestBlockhash();
//       tx.recentBlockhash = latestBlockhash.blockhash;
//       tx.feePayer = wallet.publicKey;

//       const signedTx = await wallet.signTransaction(tx);
//       const txId = await connection.sendRawTransaction(signedTx.serialize());
//       await connection.confirmTransaction(txId);

//       console.log('Transaction successful:', txId);
//       setSuccess(`Transaction successful! TxID: ${txId}`);
//       onPurchase();
//     } catch (err) {
//       console.error('Detailed error:', err);
//       setError(err.message);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const calculateTotalCost = () => {
//     if (!amount || !icoDetails?.tokenPrice) return 0;
//     return (Number(amount) * icoDetails.tokenPrice) / anchor.web3.LAMPORTS_PER_SOL;
//   };

//   if (!icoDetails || !icoDetails.isActive) {
//     return <div className="buy-tokens">ICO is not active</div>;
//   }

//   return (
//     <div className="buy-tokens">
//       <h2>Buy Tokens</h2>
//       {!wallet.connected ? (
//         <div className="connect-wallet-message">
//           Please connect your wallet to buy tokens
//         </div>
//       ) : (
//         <form onSubmit={handleBuyTokens}>
//           <div className="form-group">
//             <label htmlFor="amount">Amount of tokens:</label>
//             <input
//               type="number"
//               id="amount"
//               value={amount}
//               onChange={(e) => setAmount(e.target.value)}
//               placeholder="Enter number of tokens to buy"
//               min="1"
//               required
//             />
//             <small>Price per token: {icoDetails?.tokenPrice ? 
//               `${icoDetails.tokenPrice / anchor.web3.LAMPORTS_PER_SOL} SOL` : 
//               'Loading...'}</small>
//           </div>
//           <div className="total-cost">
//             Total Cost: {calculateTotalCost()} SOL
//           </div>
//           <button 
//             type="submit" 
//             disabled={loading || !amount || Number(amount) <= 0}>
//             {loading ? 'Processing...' : 'Buy Tokens'}
//           </button>
//         </form>
//       )}
//       {error && <div className="error-message">{error}</div>}
//       {success && <div className="success-message">{success}</div>}
//     </div>
//   );
// };

// export default BuyTokens;



