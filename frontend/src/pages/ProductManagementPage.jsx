import { useState, useEffect } from 'react';
import { productsAPI } from '../services/api';
import BarcodeGenerator from '../components/BarcodeGenerator';
import Header from '../components/Header';
import '../styles/ProductManagementPage.css';

export default function ProductManagementPage() {
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showBarcodeGenerator, setShowBarcodeGenerator] = useState(false);

  const [formData, setFormData] = useState({
    barcode: '',
    name: '',
    category: '',
    price: '',
    cost: '',
    stock: '0',
    min_stock: '0',
    sku: '',
    description: ''
  });

  const [isSaving, setIsSaving] = useState(false);

  // Load all products
  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      setIsLoading(true);
      const response = await productsAPI.getAll();
      if (response.data.success) {
        setProducts(response.data.data);
      }
    } catch (err) {
      setError('Failed to load products');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAddProduct = async (e) => {
    e.preventDefault();
    setError('');
    setIsSaving(true);

    try {
      const productData = {
        barcode: formData.barcode,
        name: formData.name,
        category: formData.category,
        price: parseFloat(formData.price),
        cost: formData.cost ? parseFloat(formData.cost) : null,
        stock: parseInt(formData.stock) || 0,
        min_stock: parseInt(formData.min_stock) || 0,
        sku: formData.sku,
        description: formData.description
      };

      const response = await productsAPI.create(productData);
      if (response.data.success) {
        setProducts([...products, response.data.data]);
        setFormData({
          barcode: '',
          name: '',
          category: '',
          price: '',
          cost: '',
          stock: '0',
          min_stock: '0',
          sku: '',
          description: ''
        });
        setShowAddForm(false);
        alert('Product added successfully!');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add product');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteProduct = async (productId) => {
    if (!window.confirm('Are you sure you want to delete this product?')) {
      return;
    }

    try {
      await productsAPI.delete(productId);
      setProducts(products.filter((p) => p.id !== productId));
      setSelectedProduct(null);
      alert('Product deleted successfully!');
    } catch (err) {
      setError('Failed to delete product');
    }
  };

  return (
    <>
      <Header />
      <div className="product-management">
        <div className="pm-header">
          <h1>Product Management</h1>
        <div className="pm-actions">
          <button
            className="btn-primary"
            onClick={() => setShowAddForm(!showAddForm)}
          >
            {showAddForm ? 'Cancel' : '+ Add Product'}
          </button>
          <button
            className="btn-secondary"
            onClick={() => setShowBarcodeGenerator(!showBarcodeGenerator)}
          >
            {showBarcodeGenerator ? 'Hide Generator' : 'Generate Barcode'}
          </button>
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}

      {showBarcodeGenerator && (
        <div className="barcode-generator-section">
          <BarcodeGenerator />
        </div>
      )}

      {showAddForm && (
        <div className="add-product-form-section">
          <h2>Add New Product</h2>
          <form onSubmit={handleAddProduct} className="product-form">
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="barcode">Barcode *</label>
                <input
                  id="barcode"
                  type="text"
                  name="barcode"
                  value={formData.barcode}
                  onChange={handleInputChange}
                  placeholder="e.g., 1234567890"
                  required
                  disabled={isSaving}
                />
              </div>
              <div className="form-group">
                <label htmlFor="name">Product Name *</label>
                <input
                  id="name"
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="e.g., Milk 1L"
                  required
                  disabled={isSaving}
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="category">Category</label>
                <input
                  id="category"
                  type="text"
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  placeholder="e.g., Dairy"
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
                  onChange={handleInputChange}
                  placeholder="e.g., MILK-001"
                  disabled={isSaving}
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="price">Price *</label>
                <input
                  id="price"
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleInputChange}
                  step="0.01"
                  min="0"
                  required
                  disabled={isSaving}
                />
              </div>
              <div className="form-group">
                <label htmlFor="cost">Cost</label>
                <input
                  id="cost"
                  type="number"
                  name="cost"
                  value={formData.cost}
                  onChange={handleInputChange}
                  step="0.01"
                  min="0"
                  disabled={isSaving}
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="stock">Initial Stock</label>
                <input
                  id="stock"
                  type="number"
                  name="stock"
                  value={formData.stock}
                  onChange={handleInputChange}
                  min="0"
                  disabled={isSaving}
                />
              </div>
              <div className="form-group">
                <label htmlFor="min_stock">Min Stock Level</label>
                <input
                  id="min_stock"
                  type="number"
                  name="min_stock"
                  value={formData.min_stock}
                  onChange={handleInputChange}
                  min="0"
                  disabled={isSaving}
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="description">Description</label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Product description"
                disabled={isSaving}
                rows="3"
              />
            </div>

            <button type="submit" disabled={isSaving} className="btn-primary">
              {isSaving ? 'Adding...' : 'Add Product'}
            </button>
          </form>
        </div>
      )}

      <div className="products-section">
        <h2>Products ({products.length})</h2>

        {isLoading ? (
          <p className="loading">Loading products...</p>
        ) : products.length === 0 ? (
          <p className="empty-state">No products found. Add one to get started!</p>
        ) : (
          <div className="products-table">
            <table>
              <thead>
                <tr>
                  <th>Barcode</th>
                  <th>Name</th>
                  <th>Category</th>
                  <th>Price</th>
                  <th>Stock</th>
                  <th>Min Stock</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <tr
                    key={product.id}
                    className={
                      selectedProduct?.id === product.id ? 'selected' : ''
                    }
                  >
                    <td className="barcode">{product.barcode}</td>
                    <td className="name">{product.name}</td>
                    <td>{product.category || '-'}</td>
                    <td>${product.price.toFixed(2)}</td>
                    <td
                      className={
                        product.stock < product.min_stock ? 'low-stock' : ''
                      }
                    >
                      {product.stock}
                    </td>
                    <td>{product.min_stock}</td>
                    <td className="actions">
                      <button
                        className="btn-small"
                        onClick={() => setSelectedProduct(product)}
                      >
                        View
                      </button>
                      <button
                        className="btn-small btn-danger"
                        onClick={() => handleDeleteProduct(product.id)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {selectedProduct && (
        <div className="product-details-modal">
          <div className="modal-content">
            <div className="modal-header">
              <h2>{selectedProduct.name}</h2>
              <button
                className="close-btn"
                onClick={() => setSelectedProduct(null)}
              >
                ✕
              </button>
            </div>

            <div className="modal-body">
              <div className="detail-row">
                <label>Barcode:</label>
                <span className="barcode-display">{selectedProduct.barcode}</span>
              </div>
              <div className="detail-row">
                <label>SKU:</label>
                <span>{selectedProduct.sku || '-'}</span>
              </div>
              <div className="detail-row">
                <label>Category:</label>
                <span>{selectedProduct.category || '-'}</span>
              </div>
              <div className="detail-row">
                <label>Price:</label>
                <span>${selectedProduct.price.toFixed(2)}</span>
              </div>
              <div className="detail-row">
                <label>Cost:</label>
                <span>${selectedProduct.cost ? selectedProduct.cost.toFixed(2) : '-'}</span>
              </div>
              <div className="detail-row">
                <label>Stock:</label>
                <span
                  className={
                    selectedProduct.stock < selectedProduct.min_stock
                      ? 'low-stock'
                      : ''
                  }
                >
                  {selectedProduct.stock}
                </span>
              </div>
              <div className="detail-row">
                <label>Min Stock:</label>
                <span>{selectedProduct.min_stock}</span>
              </div>
              <div className="detail-row">
                <label>Description:</label>
                <span>{selectedProduct.description || '-'}</span>
              </div>
            </div>

            <div className="modal-footer">
              <button
                className="btn-danger"
                onClick={() => {
                  handleDeleteProduct(selectedProduct.id);
                }}
              >
                Delete Product
              </button>
              <button
                className="btn-secondary"
                onClick={() => setSelectedProduct(null)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
      </div>
    </>
  );
}
