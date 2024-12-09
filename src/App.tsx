import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import { PhantomWalletAdapter } from '@solana/wallet-adapter-wallets';
import { clusterApiUrl } from '@solana/web3.js';
import Layout from './components/Layout.tsx';
import Dashboard from './pages/Dashboard.tsx';
import InitializeIco from './pages/InitializeIco.tsx';
import BuyTokens from './pages/BuyTokens.tsx';
import TokenBalance from './components/TokenBalance.tsx';
import '@solana/wallet-adapter-react-ui/styles.css';
import './styles/globals.css'

const network = clusterApiUrl('devnet');
const wallets = [new PhantomWalletAdapter()];

function App() {
  return (
    <ConnectionProvider endpoint={network}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>
          <Router>
            <Layout>
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/initialize" element={<InitializeIco />} />
                <Route path="/buy" element={<BuyTokens />} />
                <Route path="/balance" element={<TokenBalance />} />
              </Routes>
            </Layout>
          </Router>
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
}

export default App;

