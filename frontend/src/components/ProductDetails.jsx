import { useState } from 'react';
import { productsAPI, inventoryAPI } from '../services/api';
import useAuthStore from '../store/authStore';
import '../styles/ProductDetails.css';

export default function ProductDetails({ product, onClose }) {
  const username = useAuthStore((state) => state.user?.username);
  const [formData, setFormData] = useState({
    name: product.name || '',
    price: product.price || 0,
    stock: product.stock || 0,
    category: product.category || '',
    description: product.description || '',
    sku: product.sku || ''
  });

  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [priceHistory, setPriceHistory] = useState([]);
  const [stockHistory, setStockHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    let newValue = value;
    if (name === 'price' || name === 'stock') {
      newValue = value === '' ? 0 : parseFloat(value);
      if (isNaN(newValue)) newValue = 0;
    }
    setFormData((prev) => ({
      ...prev,
      [name]: newValue
    }));
    setSaveSuccess(false);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaveError('');
    setIsSaving(true);

    try {
      const dataToSave = {
        ...formData,
        username: username
      };
      const response = await productsAPI.update(product.id, dataToSave);
      if (response.data.success) {
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
      }
    } catch (err) {
      setSaveError(err.response?.data?.message || 'Error saving product');
    } finally {
      setIsSaving(false);
    }
  };

  const handleShowHistory = async () => {
    setShowHistory(!showHistory);
    if (!showHistory && priceHistory.length === 0) {
      setHistoryLoading(true);
      try {
        const [priceRes, stockRes] = await Promise.all([
          inventoryAPI.getPriceChangesByProduct(product.id),
          inventoryAPI.getLogsByProduct(product.id)
        ]);

        if (priceRes.data.success) {
          setPriceHistory(priceRes.data.data);
        }
        if (stockRes.data.success) {
          setStockHistory(stockRes.data.data);
        }
      } catch (err) {
        console.error('Error loading history:', err);
      } finally {
        setHistoryLoading(false);
      }
    }
  };

  const formatPrice = (price) => price.toFixed(2);

  return (
    <div className="product-details">
      <div className="details-header">
        <h2>{product.name}</h2>
        <button className="close-btn" onClick={onClose}>
          ✕
        </button>
      </div>

      <div className="product-info">
        <div className="info-item">
          <label>Barcode</label>
          <p className="barcode-display">{product.barcode}</p>
        </div>
        <div className="info-item">
          <label>Product ID</label>
          <p className="id-display">{product.id}</p>
        </div>
      </div>

      <form onSubmit={handleSave} className="edit-form">
        <div className="form-group">
          <label htmlFor="name">Name</label>
          <input
            id="name"
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            disabled={isSaving}
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="price">Price</label>
            <input
              id="price"
              type="number"
              name="price"
              value={formData.price}
              onChange={handleChange}
              step="0.01"
              min="0"
              disabled={isSaving}
            />
          </div>
          <div className="form-group">
            <label htmlFor="stock">Stock</label>
            <input
              id="stock"
              type="number"
              name="stock"
              value={formData.stock}
              onChange={handleChange}
              min="0"
              disabled={isSaving}
            />
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="category">Category</label>
          <input
            id="category"
            type="text"
            name="category"
            value={formData.category}
            onChange={handleChange}
            disabled={isSaving}
          />
        </div>

        <div className="form-group">
          <label htmlFor="sku">SKU</label>
          <input
            id="sku"
            type="text"
            name="sku"
            value={formData.sku}
            onChange={handleChange}
            disabled={isSaving}
          />
        </div>

        <div className="form-group">
          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            disabled={isSaving}
            rows="3"
          />
        </div>

        {saveError && <div className="error-message">{saveError}</div>}
        {saveSuccess && <div className="success-message">Product saved successfully!</div>}

        <button type="submit" disabled={isSaving} className="save-btn">
          {isSaving ? 'Saving...' : 'Save Changes'}
        </button>
      </form>

      <div className="history-section">
        <button className="history-toggle" onClick={handleShowHistory}>
          {showHistory ? 'Hide History' : 'Show History'}
        </button>

        {showHistory && (
          <div className="history-content">
            {historyLoading ? (
              <p className="loading">Loading history...</p>
            ) : (
              <>
                {priceHistory.length > 0 && (
                  <div className="history-list">
                    <h4>Price Changes</h4>
                    <ul>
                      {priceHistory.map((change) => (
                        <li key={change.id}>
                          <span className="old-price">{formatPrice(change.previous_price)}</span>
                          <span className="arrow">to</span>
                          <span className="new-price">{formatPrice(change.new_price)}</span>
                          <span className="date">
                            {new Date(change.changed_at).toLocaleDateString()}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {stockHistory.length > 0 && (
                  <div className="history-list">
                    <h4>Stock Changes</h4>
                    <ul>
                      {stockHistory.map((log) => (
                        <li key={log.id}>
                          <span className="old-stock">{log.previous_stock}</span>
                          <span className="arrow">to</span>
                          <span className={log.new_stock > log.previous_stock ? 'new-stock-up' : 'new-stock-down'}>
                            {log.new_stock}
                          </span>
                          <span className="date">
                            {new Date(log.changed_at).toLocaleDateString()}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
