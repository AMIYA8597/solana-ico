import React from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Buy from './pages/Buy';
import Admin from './pages/Admin';
import { WalletProvider } from './contexts/WalletContext';
import { IcoProvider } from './contexts/IcoContext';

function App() {
  return (
    <Router>
      <WalletProvider>
        <IcoProvider>
          <div className="App">
            <Navbar />
            <Switch>
              <Route exact path="/" component={Home} />
              <Route path="/buy" component={Buy} />
              <Route path="/admin" component={Admin} />
            </Switch>
          </div>
        </IcoProvider>
      </WalletProvider>
    </Router>
  );
}

export default App;

