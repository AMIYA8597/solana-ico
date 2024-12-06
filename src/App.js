import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import { PhantomWalletAdapter } from '@solana/wallet-adapter-phantom';
import { clusterApiUrl } from '@solana/web3.js';
import Header from './components/Header';
import Footer from './components/Footer';
import Dashboard from './components/Dashboard';
import InitializeIco from './components/InitializeIco';
import BuyTokens from './components/BuyTokens';
import TokenBalance from './components/TokenBalance';
import '@solana/wallet-adapter-react-ui/styles.css';
import './App.css';

const network = clusterApiUrl('devnet');
const wallets = [new PhantomWalletAdapter()];

function App() {
  return (
    <ConnectionProvider endpoint={network}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>
          <Router>
            <div className="app">
              <Header />
              <main className="main-content">
                <Routes>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/initialize" element={<InitializeIco />} />
                  <Route path="/buy" element={<BuyTokens />} />
                  <Route path="/balance" element={<TokenBalance />} />
                </Routes>
              </main>
              <Footer />
            </div>
          </Router>
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
}

export default App;

