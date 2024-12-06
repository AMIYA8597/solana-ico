import React from 'react';
import IcoDetails from './IcoDetails';
import BuyTokens from './BuyTokens';
import TokenBalance from './TokenBalance';

import { Buffer } from 'buffer';
window.Buffer = Buffer;

const Dashboard = () => {
  return (
    <div className="dashboard">
      <h1>ICO Dashboard</h1>
      <IcoDetails />
      <BuyTokens />
      <TokenBalance />
    </div>
  );
};

export default Dashboard;


































// import React, { useState, useEffect } from 'react';
// import { useConnection, useWallet } from '@solana/wallet-adapter-react';
// import { PublicKey } from '@solana/web3.js';
// import { getProgram } from '../utils/anchor-connection';
// import IcoDetails from './IcoDetails';
// import BuyTokens from './BuyTokens';
// import TokenBalance from './TokenBalance';
// import InitializeIco from './InitializeIco';
// import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';

// const Dashboard = () => {
//   const { connection } = useConnection();
//   const wallet = useWallet();
//   const [icoDetails, setIcoDetails] = useState(null);
//   const [loading, setLoading] = useState(true);

//   const fetchIcoDetails = async () => {
//     if (!wallet.publicKey) return;

//     try {
//       const program = getProgram(connection, wallet);
//       const [icoAccount] = await PublicKey.findProgramAddress(
//         [Buffer.from("ico")],
//         program.programId
//       );

//       const account = await program.account.icoAccount.fetch(icoAccount);
//       setIcoDetails(account);
//     } catch (error) {
//       console.error('Error fetching ICO details:', error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchIcoDetails();
//   }, [connection, wallet.publicKey]);


//   if (!wallet.connected) {
//     return (
//       <div className="dashboard">
//         <h2>Connect your wallet to view the ICO dashboard</h2>
//         <WalletMultiButton />
//       </div>
//     );
//   }

//   if (loading) {
//     return <div className="dashboard">Loading ICO details...</div>;
//   }

//   return (
//     <div className="dashboard">
//       {icoDetails ? (
//         <>
//           <IcoDetails icoDetails={icoDetails} />
//           <TokenBalance />
//           <BuyTokens icoDetails={icoDetails} onPurchase={fetchIcoDetails} />
//         </>
//       ) : (
//         <InitializeIco onInitialize={fetchIcoDetails} />
//       )}
//     </div>
//   );
// };

// export default Dashboard;

