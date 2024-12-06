import React from 'react';
import { Link } from 'react-router-dom';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';

import { Buffer } from 'buffer';
window.Buffer = Buffer;

const Header = () => {
  return (
    <header className="header">
      <div className="logo">
        <Link to="/">Solana ICO</Link>
      </div>
      <nav className="nav-links">
        <Link to="/">Dashboard</Link>
        <Link to="/initialize">Initialize ICO</Link>
        <Link to="/buy">Buy Tokens</Link>
        <Link to="/balance">Token Balance</Link>
      </nav>
      <WalletMultiButton />
    </header>
  );
};

export default Header;

