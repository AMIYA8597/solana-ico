import React from 'react';
import { Buffer } from "buffer";
window.Buffer = window.Buffer || Buffer;

const IcoDetails = ({ icoDetails }) => {
  if (!icoDetails) return null;

  return (
    <div className="ico-details">
      <h2>ICO Details</h2>
      <div className="detail-grid">
        <div className="detail-item">
          <span className="detail-label">Total Supply:</span>
          <span className="detail-value">{icoDetails.totalSupply.toString()}</span>
        </div>
        <div className="detail-item">
          <span className="detail-label">Token Price:</span>
          <span className="detail-value">{icoDetails.tokenPrice.toString()} lamports</span>
        </div>
        <div className="detail-item">
          <span className="detail-label">Tokens Sold:</span>
          <span className="detail-value">{icoDetails.tokensSold.toString()}</span>
        </div>
        <div className="detail-item">
          <span className="detail-label">Start Time:</span>
          <span className="detail-value">{new Date(icoDetails.startTime.toNumber() * 1000).toLocaleString()}</span>
        </div>
        <div className="detail-item">
          <span className="detail-label">Duration:</span>
          <span className="detail-value">{icoDetails.duration.toString()} seconds</span>
        </div>
        <div className="detail-item">
          <span className="detail-label">Status:</span>
          <span className={`detail-value status ${icoDetails.isActive ? 'active' : 'inactive'}`}>
            {icoDetails.isActive ? 'Active' : 'Inactive'}
          </span>
        </div>
      </div>
    </div>
  );
};

export default IcoDetails;

