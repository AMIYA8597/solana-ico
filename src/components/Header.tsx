import React from 'react';
import { Link } from 'react-router-dom';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';

const Header: React.FC = () => {
  return (
    <header className="bg-white shadow-md">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <div className="text-2xl font-bold text-blue-600">
          <Link to="/">Solana ICO</Link>
        </div>
        <nav className="space-x-4">
          <Link to="/" className="text-gray-600 hover:text-blue-600">Dashboard</Link>
          <Link to="/initialize" className="text-gray-600 hover:text-blue-600">Initialize ICO</Link>
          <Link to="/buy" className="text-gray-600 hover:text-blue-600">Buy Tokens</Link>
          <Link to="/balance" className="text-gray-600 hover:text-blue-600">Token Balance</Link>
        </nav>
        <WalletMultiButton className="!bg-blue-600 hover:!bg-blue-700" />
      </div>
    </header>
  );
};

export default Header;

