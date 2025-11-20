import { useState } from 'react';
import { productsAPI } from '../services/api';
import '../styles/BarcodeScanner.css';

export default function BarcodeScanner({ onProductFound }) {
  const [barcode, setBarcode] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [recentBarcodes, setRecentBarcodes] = useState([]);

  const handleScan = async (e) => {
    e.preventDefault();
    setError('');

    if (!barcode.trim()) {
      setError('Please enter a barcode');
      return;
    }

    setIsLoading(true);

    try {
      const response = await productsAPI.getByBarcode(barcode);
      if (response.data.success) {
        onProductFound(response.data.data);

        // Add to recent barcodes
        if (!recentBarcodes.find(b => b.id === response.data.data.id)) {
          setRecentBarcodes([response.data.data, ...recentBarcodes].slice(0, 5));
        }

        setBarcode('');
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
        'Product not found. Please check the barcode and try again.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleRecentClick = (product) => {
    onProductFound(product);
  };

  return (
    <div className="barcode-scanner">
      <h2>Scan Barcode</h2>

      <form onSubmit={handleScan} className="scanner-form">
        <div className="form-group">
          <label htmlFor="barcode">Barcode</label>
          <input
            id="barcode"
            type="text"
            value={barcode}
            onChange={(e) => setBarcode(e.target.value)}
            placeholder="Scan or enter barcode here"
            autoFocus
            disabled={isLoading}
            className="barcode-input"
          />
        </div>

        {error && <div className="error-message">{error}</div>}

        <button type="submit" disabled={isLoading} className="scan-btn">
          {isLoading ? 'Searching...' : 'Search'}
        </button>
      </form>

      {recentBarcodes.length > 0 && (
        <div className="recent-scans">
          <h3>Recently Scanned</h3>
          <ul>
            {recentBarcodes.map((product) => (
              <li key={product.id}>
                <button
                  type="button"
                  onClick={() => handleRecentClick(product)}
                  className="recent-item"
                >
                  <span className="product-name">{product.name}</span>
                  <span className="product-barcode">{product.barcode}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
