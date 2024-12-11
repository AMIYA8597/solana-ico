import React, { createContext, useContext, useState, useEffect } from 'react';
import { Connection, PublicKey } from '@solana/web3.js';
import { Program, Provider, web3 } from '@project-serum/anchor';
import idl from '../idl/ico.json';
import { useWallet } from './WalletContext';

const IcoContext = createContext();

export function IcoProvider({ children }) {
  const [icoDetails, setIcoDetails] = useState(null);
  const { wallet } = useWallet();
  const connection = new Connection('https://api.devnet.solana.com');
  const programId = new PublicKey('DabJsu1DrTeAauVMt1duWBG7BnkHi3ELd4ScrcjVohpz');

  useEffect(() => {
    if (wallet) {
      fetchIcoDetails();
    }
  }, [wallet]);

  const getProvider = () => {
    if (!wallet) return null;
    const provider = new Provider(connection, wallet, { preflightCommitment: 'processed' });
    return provider;
  };

  const fetchIcoDetails = async () => {
    const provider = getProvider();
    if (!provider) return;

    const program = new Program(idl, programId, provider);
    const [icoAccount] = await PublicKey.findProgramAddress([Buffer.from('ico')], programId);
    const account = await program.account.icoAccount.fetch(icoAccount);

    setIcoDetails({
      totalSupply: account.totalSupply.toString(),
      tokenPrice: account.tokenPrice.toString(),
      tokensSold: account.tokensSold.toString(),
      isActive: account.isActive,
      roundType: account.roundType,
    });
  };

  const buyTokens = async (amount) => {
    const provider = getProvider();
    if (!provider) throw new Error('Wallet not connected');

    const program = new Program(idl, programId, provider);
    const [icoAccount] = await PublicKey.findProgramAddress([Buffer.from('ico')], programId);
    const [purchaseAccount] = await PublicKey.findProgramAddress(
      [Buffer.from('purchase'), provider.wallet.publicKey.toBuffer()],
      programId
    );

    await program.rpc.buyTokens(new web3.BN(amount), {
      accounts: {
        buyer: provider.wallet.publicKey,
        icoAccount,
        purchaseAccount,
        treasuryWallet: new PublicKey('YOUR_TREASURY_WALLET_ADDRESS'),
        tokenProgram: web3.TokenProgram.programId,
        systemProgram: web3.SystemProgram.programId,
      },
    });

    await fetchIcoDetails();
  };

  const endIco = async () => {
    const provider = getProvider();
    if (!provider) throw new Error('Wallet not connected');

    const program = new Program(idl, programId, provider);
    const [icoAccount] = await PublicKey.findProgramAddress([Buffer.from('ico')], programId);

    await program.rpc.endIco({
      accounts: {
        icoAccount,
      },
    });

    await fetchIcoDetails();
  };

  const batchDistributeTokens = async () => {
    const provider = getProvider();
    if (!provider) throw new Error('Wallet not connected');

    const program = new Program(idl, programId, provider);
    const [icoAccount] = await PublicKey.findProgramAddress([Buffer.from('ico')], programId);

    await program.rpc.batchDistributeTokens({
      accounts: {
        authority: provider.wallet.publicKey,
        icoAccount,
        tokenAccount: new PublicKey('YOUR_TOKEN_ACCOUNT_ADDRESS'),
        tokenMint: new PublicKey('YOUR_TOKEN_MINT_ADDRESS'),
        tokenProgram: web3.TokenProgram.programId,
        associatedTokenProgram: web3.ASSOCIATED_TOKEN_PROGRAM_ID,
        systemProgram: web3.SystemProgram.programId,
      },
    });
  };

  return (
    <IcoContext.Provider value={{ icoDetails, buyTokens, endIco, batchDistributeTokens }}>
      {children}
    </IcoContext.Provider>
  );
}

export function useIco() {
  return useContext(IcoContext);
}

