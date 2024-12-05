
// import React, { useState } from 'react';
// import { useConnection, useWallet } from '@solana/wallet-adapter-react';
// import { Token, ASSOCIATED_TOKEN_PROGRAM_ID, TOKEN_PROGRAM_ID } from "@solana/spl-token";
// import { PublicKey } from '@solana/web3.js';
// import { getProgram, findProgramAddress } from '../utils/anchor-connection';
// import * as anchor from '@project-serum/anchor';
// import { Buffer } from "buffer";
// window.Buffer = window.Buffer || Buffer;

// const BuyTokens = ({ icoDetails, onPurchase }) => {
//   const { connection } = useConnection();
//   const wallet = useWallet();
//   const [amount, setAmount] = useState('');
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState('');
//   const [success, setSuccess] = useState('');

//   const handleBuyTokens = async (e) => {
//     e.preventDefault();
//     if (!wallet.publicKey || !wallet.signTransaction) return;

//     setLoading(true);
//     setError('');
//     setSuccess('');

//     try {
//       const program = getProgram(connection, wallet);
//       const { publicKey: icoAccount } = await findProgramAddress(
//         [anchor.utils.bytes.utf8.encode('ico')],
//         program.programId
//       );

//       const tx = await program.methods
//         .buyTokens(new anchor.BN(amount))
//         .accounts({
//           buyer: wallet.publicKey,
//           icoAccount,
//           tokenAccount: new PublicKey('AhmbnmLBQWNy3zQMwi6g7s5tGFmbKZEfUczNkevZWFtX'),
//           buyerTokenAccount: new PublicKey('AhmbnmLBQWNy3zQMwi6g7s5tGFmbKZEfUczNkevZWFtX'),
//           tokenProgram: anchor.utils.token.TOKEN_PROGRAM_ID,
//         })
//         .rpc();

//       setSuccess(`Transaction successful! TxID: ${tx}`);
//       onPurchase();
//     } catch (err) {
//       console.error('Error buying tokens:', err);
//       setError(`Error: ${err.message}`);
//     } finally {
//       setLoading(false);
//     }
//   };

//   if (!icoDetails || !icoDetails.isActive) {
//     return <div className="buy-tokens">ICO is not active</div>;
//   }

//   return (
//     <div className="buy-tokens">
//       <h2>Buy Tokens</h2>
//       <form onSubmit={handleBuyTokens}>
//         <div className="form-group">
//           <label htmlFor="amount">Amount of tokens:</label>
//           <input
//             type="text"
//             id="amount"
//             value={amount}
//             onChange={(e) => setAmount(e.target.value)}
//             placeholder="Enter number of tokens to buy (e.g., 100)"
//             required
//           />
//           <small>Enter the number of tokens you want to purchase (integer value)</small>
//         </div>
//         <button type="submit" disabled={loading}>
//           {loading ? 'Processing...' : 'Buy Tokens'}
//         </button>
//       </form>
//       {error && <div className="error-message">{error}</div>}
//       {success && <div className="success-message">{success}</div>}
//     </div>
//   );
// };

// export default BuyTokens;
























// import React, { useState } from 'react';
// import { useConnection, useWallet } from '@solana/wallet-adapter-react';
// import { PublicKey } from '@solana/web3.js';
// import { getProgram, findProgramAddress } from '../utils/anchor-connection';
// import * as anchor from '@project-serum/anchor';
// import { TOKEN_PROGRAM_ID, getAssociatedTokenAddress, createAssociatedTokenAccountInstruction } from '@solana/spl-token';
// import { Buffer } from "buffer";
// window.Buffer = window.Buffer || Buffer;

// const BuyTokens = ({ icoDetails, onPurchase }) => {
//   const { connection } = useConnection();
//   const wallet = useWallet();
//   const [amount, setAmount] = useState('');
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState('');
//   const [success, setSuccess] = useState('');

//   const handleBuyTokens = async (e) => {
//     e.preventDefault();
//     if (!wallet.publicKey || !wallet.signTransaction) return;

//     setLoading(true);
//     setError('');
//     setSuccess('');

//     try {
//       const program = getProgram(connection, wallet);
//       const { publicKey: icoAccount } = await findProgramAddress(
//         [anchor.utils.bytes.utf8.encode('ico')],
//         program.programId
//       );

//       const tokenMintAddress = new PublicKey('AhmbnmLBQWNy3zQMwi6g7s5tGFmbKZEfUczNkevZWFtX'); // Replace with your mint address
//       const buyerTokenAccount = await getAssociatedTokenAddress(
//         tokenMintAddress,
//         wallet.publicKey
//       );

//       // Ensure buyer's token account exists, or create it
//       const buyerTokenAccountInfo = await connection.getAccountInfo(buyerTokenAccount);
//       if (!buyerTokenAccountInfo) {
//         const createTokenAccountInstruction = createAssociatedTokenAccountInstruction(
//           wallet.publicKey, // Payer
//           buyerTokenAccount, // New account
//           wallet.publicKey, // Owner of the account
//           tokenMintAddress // Token mint
//         );

//         const transaction = new anchor.web3.Transaction().add(createTokenAccountInstruction);
//         const tx = await wallet.sendTransaction(transaction, connection);
//         await connection.confirmTransaction(tx, 'confirmed');
//         console.log('Created buyer token account:', buyerTokenAccount.toBase58());
//       }

//       // Execute the BuyTokens instruction
//       const tx = await program.methods
//         .buyTokens(new anchor.BN(amount))
//         .accounts({
//           buyer: wallet.publicKey,
//           icoAccount,
//           tokenAccount: new PublicKey('AhmbnmLBQWNy3zQMwi6g7s5tGFmbKZEfUczNkevZWFtX'), // Replace this
//           buyerTokenAccount,
//           tokenProgram: TOKEN_PROGRAM_ID,
//         })
//         .rpc();

//       setSuccess(`Transaction successful! TxID: ${tx}`);
//       onPurchase();
//     } catch (err) {
//       console.error('Error buying tokens:', err);
//       setError(`Error: ${err.message}`);
//     } finally {
//       setLoading(false);
//     }
//   };

//   if (!icoDetails || !icoDetails.isActive) {
//     return <div className="buy-tokens">ICO is not active</div>;
//   }

//   return (
//     <div className="buy-tokens">
//       <h2>Buy Tokens</h2>
//       <form onSubmit={handleBuyTokens}>
//         <div className="form-group">
//           <label htmlFor="amount">Amount of tokens:</label>
//           <input
//             type="text"
//             id="amount"
//             value={amount}
//             onChange={(e) => setAmount(e.target.value)}
//             placeholder="Enter number of tokens to buy (e.g., 100)"
//             required
//           />
//           <small>Enter the number of tokens you want to purchase (integer value)</small>
//         </div>
//         <button type="submit" disabled={loading}>
//           {loading ? 'Processing...' : 'Buy Tokens'}
//         </button>
//       </form>
//       {error && <div className="error-message">{error}</div>}
//       {success && <div className="success-message">{success}</div>}
//     </div>
//   );
// };

// export default BuyTokens;






















// import React, { useState } from 'react';
// import { useConnection, useWallet } from '@solana/wallet-adapter-react';
// import { PublicKey } from '@solana/web3.js';
// import { getProgram } from '../utils/anchor-connection';
// import * as anchor from '@project-serum/anchor';
// import { TOKEN_PROGRAM_ID, getAssociatedTokenAddress, createAssociatedTokenAccountInstruction } from '@solana/spl-token';
// import { Buffer } from "buffer";
// window.Buffer = window.Buffer || Buffer;

// const BuyTokens = ({ icoDetails, onPurchase }) => {
//   const { connection } = useConnection();
//   const wallet = useWallet();
//   const [amount, setAmount] = useState('');
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState('');
//   const [success, setSuccess] = useState('');

//   const handleBuyTokens = async (e) => {
//     e.preventDefault();
//     if (!wallet.publicKey || !wallet.signTransaction) return;

//     setLoading(true);
//     setError('');
//     setSuccess('');

//     try {
//       const program = getProgram(connection, wallet);
      
//       // Get ICO PDA
//       const [icoAccount] = await anchor.web3.PublicKey.findProgramAddress(
//         [Buffer.from("ico")],
//         program.programId
//       );

//       // Get token mint and treasury addresses
//       const tokenMintAddress = new PublicKey('AhmbnmLBQWNy3zQMwi6g7s5tGFmbKZEfUczNkevZWFtX');
//       const treasuryWallet = new PublicKey('DYkCAokwibanNxMvixmoZFQDwayGDJWfJ9moZjDRpUvW'); // Your treasury wallet
      
//       // Get ICO account data
//       const icoAccountInfo = await program.account.icoAccount.fetch(icoAccount);
//       const authority = icoAccountInfo.authority;

//       // Get token accounts
//       const tokenAccount = await getAssociatedTokenAddress(
//         tokenMintAddress,
//         authority
//       );

//       const buyerTokenAccount = await getAssociatedTokenAddress(
//         tokenMintAddress,
//         wallet.publicKey
//       );

//       // Create buyer's token account if it doesn't exist
//       try {
//         const buyerTokenAccountInfo = await connection.getAccountInfo(buyerTokenAccount);
//         if (!buyerTokenAccountInfo) {
//           const createAtaIx = createAssociatedTokenAccountInstruction(
//             wallet.publicKey,
//             buyerTokenAccount,
//             wallet.publicKey,
//             tokenMintAddress
//           );
          
//           const transaction = new anchor.web3.Transaction().add(createAtaIx);
//           const tx = await wallet.sendTransaction(transaction, connection);
//           await connection.confirmTransaction(tx, 'confirmed');
//           console.log('Created buyer token account:', buyerTokenAccount.toBase58());
//         }
//       } catch (err) {
//         console.error('Error checking/creating token account:', err);
//         throw new Error('Failed to setup token account');
//       }

//       console.log('Accounts being used:', {
//         buyer: wallet.publicKey.toBase58(),
//         icoAccount: icoAccount.toBase58(),
//         authority: authority.toBase58(),
//         treasuryWallet: treasuryWallet.toBase58(),
//         tokenAccount: tokenAccount.toBase58(),
//         buyerTokenAccount: buyerTokenAccount.toBase58(),
//       });

//       // Execute the BuyTokens instruction
//       const tx = await program.methods
//         .buyTokens(new anchor.BN(amount))
//         .accounts({
//           buyer: wallet.publicKey,
//           icoAccount: icoAccount,
//           authority: authority,
//           treasuryWallet: treasuryWallet,
//           tokenAccount: tokenAccount,
//           buyerTokenAccount: buyerTokenAccount,
//           tokenProgram: TOKEN_PROGRAM_ID,
//           systemProgram: anchor.web3.SystemProgram.programId
//         })
//         .rpc();

//       console.log('Transaction successful:', tx);
//       setSuccess(`Transaction successful! TxID: ${tx}`);
//       onPurchase();
//     } catch (err) {
//       console.error('Error buying tokens:', err);
//       setError(`Error: ${err.message}`);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const calculateTotalCost = () => {
//     if (!amount || !icoDetails?.tokenPrice) return 0;
//     return (amount * icoDetails.tokenPrice) / anchor.web3.LAMPORTS_PER_SOL;
//   };

//   if (!icoDetails || !icoDetails.isActive) {
//     return <div className="buy-tokens">ICO is not active</div>;
//   }

//   return (
//     <div className="buy-tokens">
//       <h2>Buy Tokens</h2>
//       <form onSubmit={handleBuyTokens}>
//         <div className="form-group">
//           <label htmlFor="amount">Amount of tokens:</label>
//           <input
//             type="number"
//             id="amount"
//             value={amount}
//             onChange={(e) => setAmount(e.target.value)}
//             placeholder="Enter number of tokens to buy"
//             min="1"
//             required
//           />
//           <small>Price per token: {icoDetails?.tokenPrice ? 
//             `${icoDetails.tokenPrice / anchor.web3.LAMPORTS_PER_SOL} SOL` : 
//             'Loading...'}</small>
//         </div>
//         <div className="total-cost">
//           Total Cost: {calculateTotalCost()} SOL
//         </div>
//         <button 
//           type="submit" 
//           disabled={loading || !amount || amount <= 0 || !wallet.connected}>
//           {!wallet.connected ? 'Connect Wallet' : 
//            loading ? 'Processing...' : 'Buy Tokens'}
//         </button>
//       </form>
//       {error && <div className="error-message">{error}</div>}
//       {success && <div className="success-message">{success}</div>}

//       <style jsx>{`
//         .buy-tokens {
//           max-width: 500px;
//           margin: 0 auto;
//           padding: 20px;
//         }
//         .form-group {
//           margin-bottom: 20px;
//         }
//         label {
//           display: block;
//           margin-bottom: 5px;
//         }
//         input {
//           width: 100%;
//           padding: 8px;
//           margin-bottom: 5px;
//           border: 1px solid #ddd;
//           border-radius: 4px;
//         }
//         small {
//           color: #666;
//         }
//         .total-cost {
//           margin: 15px 0;
//           font-weight: bold;
//         }
//         button {
//           width: 100%;
//           padding: 10px;
//           background-color: #4CAF50;
//           color: white;
//           border: none;
//           border-radius: 4px;
//           cursor: pointer;
//         }
//         button:disabled {
//           background-color: #cccccc;
//           cursor: not-allowed;
//         }
//         .error-message {
//           color: #ff0000;
//           margin-top: 10px;
//         }
//         .success-message {
//           color: #4CAF50;
//           margin-top: 10px;
//         }
//       `}</style>
//     </div>
//   );
// };

// export default BuyTokens;
















































// import React, { useState } from 'react';
// import { useConnection, useWallet } from '@solana/wallet-adapter-react';
// import { PublicKey } from '@solana/web3.js';
// import { getProgram } from '../utils/anchor-connection';
// import * as anchor from '@project-serum/anchor';
// import { TOKEN_PROGRAM_ID, getAssociatedTokenAddress, createAssociatedTokenAccountInstruction, ASSOCIATED_TOKEN_PROGRAM_ID } from '@solana/spl-token';

// import { Buffer } from "buffer";
// window.Buffer = window.Buffer || Buffer;

// const BuyTokens = ({ icoDetails, onPurchase }) => {
//   const { connection } = useConnection();
//   const wallet = useWallet();
//   const [amount, setAmount] = useState('');
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState('');
//   const [success, setSuccess] = useState('');

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
      
//       // Get ICO PDA
//       const [icoAccount] = await anchor.web3.PublicKey.findProgramAddress(
//         [Buffer.from("ico")],
//         program.programId
//       );

//       // Set up account addresses
//       const tokenMintAddress = new PublicKey('AhmbnmLBQWNy3zQMwi6g7s5tGFmbKZEfUczNkevZWFtX');
//       const treasuryWallet = new PublicKey('DYkCAokwibanNxMvixmoZFQDwayGDJWfJ9moZjDRpUvW');
      
//       // Get ICO account data
//       const icoAccountInfo = await program.account.icoAccount.fetch(icoAccount);
//       const authority = icoAccountInfo.authority;

//       // Get token accounts
//       const tokenAccount = await getAssociatedTokenAddress(
//         tokenMintAddress,
//         authority,
//         true // allowOwnerOffCurve set to true for PDA
//       );

//       const buyerTokenAccount = await getAssociatedTokenAddress(
//         tokenMintAddress,
//         wallet.publicKey
//       );

//       // Check if buyer's token account exists
//       let buyerAccountInfo;
//       try {
//         buyerAccountInfo = await connection.getAccountInfo(buyerTokenAccount);
//       } catch (err) {
//         console.error('Error checking buyer token account:', err);
//       }

//       let transaction = new anchor.web3.Transaction();

//       // Create buyer's token account if it doesn't exist
//       if (!buyerAccountInfo) {
//         console.log('Creating buyer token account...');
//         const createAtaIx = createAssociatedTokenAccountInstruction(
//           wallet.publicKey, // payer
//           buyerTokenAccount, // ata
//           wallet.publicKey, // owner
//           tokenMintAddress, // mint
//         );
//         transaction.add(createAtaIx);
//       }

//       console.log('Setting up buy instruction with accounts:', {
//         buyer: wallet.publicKey.toBase58(),
//         icoAccount: icoAccount.toBase58(),
//         authority: authority.toBase58(),
//         treasuryWallet: treasuryWallet.toBase58(),
//         tokenAccount: tokenAccount.toBase58(),
//         buyerTokenAccount: buyerTokenAccount.toBase58(),
//       });

//       // Add buy tokens instruction
//       const buyInstruction = await program.methods
//         .buyTokens(new anchor.BN(amount))
//         .accounts({
//           buyer: wallet.publicKey,
//           icoAccount: icoAccount,
//           authority: authority,
//           treasuryWallet: treasuryWallet,
//           tokenAccount: tokenAccount,
//           buyerTokenAccount: buyerTokenAccount,
//           tokenProgram: TOKEN_PROGRAM_ID,
//           systemProgram: anchor.web3.SystemProgram.programId
//         })
//         .instruction();

//       transaction.add(buyInstruction);

//       // Send and confirm transaction
//       const signature = await wallet.sendTransaction(transaction, connection);
//       await connection.confirmTransaction(signature, 'confirmed');

//       console.log('Transaction successful:', signature);
//       setSuccess(`Transaction successful! Signature: ${signature}`);
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
//     return (amount * icoDetails.tokenPrice) / anchor.web3.LAMPORTS_PER_SOL;
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
//             disabled={loading || !amount || amount <= 0}>
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

































import React, { useState } from 'react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { PublicKey, Transaction } from '@solana/web3.js';
import { getProgram } from '../utils/anchor-connection';
import * as anchor from '@project-serum/anchor';
import { 
  TOKEN_PROGRAM_ID, 
  getAssociatedTokenAddress, 
  ASSOCIATED_TOKEN_PROGRAM_ID 
} from '@solana/spl-token';

const BuyTokens = ({ icoDetails, onPurchase }) => {
  const { connection } = useConnection();
  const wallet = useWallet();
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const tokenMintAddress = new PublicKey('AhmbnmLBQWNy3zQMwi6g7s5tGFmbKZEfUczNkevZWFtX');
  const treasuryWallet = new PublicKey('DYkCAokwibanNxMvixmoZFQDwayGDJWfJ9moZjDRpUvW');

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

      const icoAccountInfo = await program.account.icoAccount.fetch(icoAccount);
      const authority = icoAccountInfo.authority;

      const tokenAccount = await getAssociatedTokenAddress(
        tokenMintAddress,
        authority,
        true
      );

      const buyerTokenAccount = await getAssociatedTokenAddress(
        tokenMintAddress,
        wallet.publicKey
      );

      const tx = await program.methods
        .buyTokens(new anchor.BN(amount))
        .accounts({
          buyer: wallet.publicKey,
          icoAccount: icoAccount,
          authority: authority,
          treasuryWallet: treasuryWallet,
          mint: tokenMintAddress,
          tokenAccount: tokenAccount,
          buyerTokenAccount: buyerTokenAccount,
          tokenProgram: TOKEN_PROGRAM_ID,
          associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
          systemProgram: anchor.web3.SystemProgram.programId
        })
        .transaction();

      const latestBlockhash = await connection.getLatestBlockhash();
      tx.recentBlockhash = latestBlockhash.blockhash;
      tx.feePayer = wallet.publicKey;

      const signedTx = await wallet.signTransaction(tx);
      const txId = await connection.sendRawTransaction(signedTx.serialize());
      await connection.confirmTransaction(txId);

      console.log('Transaction successful:', txId);
      setSuccess(`Transaction successful! TxID: ${txId}`);
      onPurchase();
    } catch (err) {
      console.error('Detailed error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const calculateTotalCost = () => {
    if (!amount || !icoDetails?.tokenPrice) return 0;
    return (Number(amount) * icoDetails.tokenPrice) / anchor.web3.LAMPORTS_PER_SOL;
  };

  if (!icoDetails || !icoDetails.isActive) {
    return <div className="buy-tokens">ICO is not active</div>;
  }

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
            <small>Price per token: {icoDetails?.tokenPrice ? 
              `${icoDetails.tokenPrice / anchor.web3.LAMPORTS_PER_SOL} SOL` : 
              'Loading...'}</small>
          </div>
          <div className="total-cost">
            Total Cost: {calculateTotalCost()} SOL
          </div>
          <button 
            type="submit" 
            disabled={loading || !amount || Number(amount) <= 0}>
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

