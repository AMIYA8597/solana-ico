import React from 'react';

import { Buffer } from 'buffer';

// @ts-ignore
window.Buffer = Buffer;

const Footer = () => {
  return (
    <footer className="footer">
      <p>&copy; 2024 Solana ICO. All rights reserved.</p>
    </footer>
  );
};

export default Footer;

