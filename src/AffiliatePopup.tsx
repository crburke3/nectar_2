import React from 'react';
import './AffiliatePopup.css'; // Optional: Create a CSS file for styles

interface AffiliatePopupProps {
  message: string;
  onClose: () => void; // Function to call when closing the popup
}

const AffiliatePopup: React.FC<AffiliatePopupProps> = ({ message, onClose }) => {
  return (
    <div className="affiliate-popup">
      <div className="popup-content">
        <h2>Affiliate Active</h2>
        <p>{message}</p>
        <button onClick={onClose}>Close</button>
      </div>
    </div>
  );
};

export default AffiliatePopup; 