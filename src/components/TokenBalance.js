import React, { useState, useEffect } from 'react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { PublicKey } from '@solana/web3.js';
import { TOKEN_PROGRAM_ID } from '@solana/spl-token';
import { Buffer } from "buffer";
window.Buffer = window.Buffer || Buffer;

const TokenBalance = () => {
  const { connection } = useConnection();
  const wallet = useWallet();
  const [balance, setBalance] = useState(null);

  useEffect(() => {
    const fetchTokenBalance = async () => {
      if (!wallet.publicKey) return;

      try {
        const tokenAccounts = await connection.getParsedTokenAccountsByOwner(wallet.publicKey, {
          programId: TOKEN_PROGRAM_ID,
        });

        // Assuming the ICO token is the first token account
        if (tokenAccounts.value.length > 0) {
          const tokenBalance = tokenAccounts.value[0].account.data.parsed.info.tokenAmount.uiAmount;
          setBalance(tokenBalance);
        }
      } catch (error) {
        console.error('Error fetching token balance:', error);
      }
    };

    fetchTokenBalance();
  }, [connection, wallet]);

  if (balance === null) return null;

  return (
    <div className="token-balance">
      <h2>Your Token Balance</h2>
      <p>{balance} ICO Tokens</p>
    </div>
  );
};

export default TokenBalance;

