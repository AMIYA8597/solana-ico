import React from 'react';
import { Link } from 'react-router-dom';
import { useWallet } from '../contexts/WalletContext';

function Navbar() {
  const { wallet, connectWallet, disconnectWallet } = useWallet();

  return (
    <nav className="bg-blue-600 p-4">
      <div className="container mx-auto flex justify-between items-center">
        <Link to="/" className="text-white text-xl font-bold">Solana ICO</Link>
        <div>
          <Link to="/" className="text-white mr-4">Home</Link>
          <Link to="/buy" className="text-white mr-4">Buy Tokens</Link>
          <Link to="/admin" className="text-white mr-4">Admin</Link>
          {wallet ? (
            <button onClick={disconnectWallet} className="bg-red-500 text-white px-4 py-2 rounded">
              Disconnect Wallet
            </button>
          ) : (
            <button onClick={connectWallet} className="bg-green-500 text-white px-4 py-2 rounded">
              Connect Wallet
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;

