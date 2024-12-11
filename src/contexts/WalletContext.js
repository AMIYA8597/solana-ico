import React, { createContext, useContext, useState } from 'react';
import { Connection, PublicKey } from '@solana/web3.js';
import { PhantomWalletAdapter } from '@solana/wallet-adapter-phantom';

const WalletContext = createContext();

export function WalletProvider({ children }) {
  const [wallet, setWallet] = useState(null);

  const connectWallet = async () => {
    const phantom = new PhantomWalletAdapter();
    await phantom.connect();
    setWallet(phantom);
  };

  const disconnectWallet = () => {
    if (wallet) {
      wallet.disconnect();
      setWallet(null);
    }
  };

  return (
    <WalletContext.Provider value={{ wallet, connectWallet, disconnectWallet }}>
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet() {
  return useContext(WalletContext);
}

