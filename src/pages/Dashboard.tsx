import React from 'react';
import IcoDetails from '../components/IcoDetails.tsx';
import TokenBalance from '../components/TokenBalance.tsx';

const Dashboard: React.FC = () => {
  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold text-gray-800">ICO Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <IcoDetails />
        <TokenBalance />
      </div>
    </div>
  );
};

export default Dashboard;

