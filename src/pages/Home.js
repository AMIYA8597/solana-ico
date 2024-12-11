import React from 'react';
import { useIco } from '../contexts/IcoContext';

function Home() {
  const { icoDetails } = useIco();

  return (
    <div className="container mx-auto mt-8">
      <h1 className="text-4xl font-bold mb-4">Welcome to Our ICO</h1>
      {icoDetails && (
        <div>
          <p>Total Supply: {icoDetails.totalSupply}</p>
          <p>Token Price: {icoDetails.tokenPrice} SOL</p>
          <p>Tokens Sold: {icoDetails.tokensSold}</p>
          <p>ICO Status: {icoDetails.isActive ? 'Active' : 'Inactive'}</p>
          <p>Round Type: {icoDetails.roundType}</p>
        </div>
      )}
    </div>
  );
}

export default Home;

