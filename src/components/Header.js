import React from 'react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';

const Header = () => {
  return (
    <header className="app-header">
      <h1>Solana ICO Dashboard</h1>
      <WalletMultiButton />
    </header>
  );
};

export default Header;

