import { useState, useEffect } from 'react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { productsAPI, inventoryAPI } from '../services/api';
import Header from '../components/Header';
import '../styles/ReportingPage.css';

const COLORS = ['#667eea', '#5568d3', '#764ba2', '#f093fb', '#4facfe'];

export default function ReportingPage() {
  const [products, setProducts] = useState([]);
  const [inventoryLogs, setInventoryLogs] = useState([]);
  const [priceChanges, setPriceChanges] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [productsRes, logsRes, pricesRes] = await Promise.all([
        productsAPI.getAll(),
        inventoryAPI.getLogs(),
        inventoryAPI.getPriceChanges()
      ]);

      if (productsRes.data.success) {
        setProducts(productsRes.data.data);
      }
      if (logsRes.data.success) {
        setInventoryLogs(logsRes.data.data);
      }
      if (pricesRes.data.success) {
        setPriceChanges(pricesRes.data.data);
      }
    } catch (err) {
      console.error('Error loading data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Calculate statistics
  const totalProducts = products.length;
  const lowStockProducts = products.filter(
    (p) => p.stock < p.min_stock
  ).length;
  const totalInventoryValue = products.reduce(
    (sum, p) => sum + p.price * p.stock,
    0
  );
  const totalRecentChanges = inventoryLogs.length + priceChanges.length;

  // Most edited products
  const productEditCounts = {};
  inventoryLogs.forEach((log) => {
    productEditCounts[log.product_id] =
      (productEditCounts[log.product_id] || 0) + 1;
  });
  priceChanges.forEach((change) => {
    productEditCounts[change.product_id] =
      (productEditCounts[change.product_id] || 0) + 1;
  });

  const mostEditedProducts = Object.entries(productEditCounts)
    .map(([productId, count]) => {
      const product = products.find((p) => p.id === productId);
      return {
        name: product?.name || 'Unknown',
        changes: count
      };
    })
    .sort((a, b) => b.changes - a.changes)
    .slice(0, 5);

  // Activity by user
  const userActivity = {};
  inventoryLogs.forEach((log) => {
    if (log.changed_by) {
      userActivity[log.changed_by] = (userActivity[log.changed_by] || 0) + 1;
    }
  });
  priceChanges.forEach((change) => {
    if (change.changed_by) {
      userActivity[change.changed_by] = (userActivity[change.changed_by] || 0) + 1;
    }
  });

  const activityByUser = Object.entries(userActivity)
    .map(([user, count]) => ({
      name: user,
      changes: count
    }))
    .sort((a, b) => b.changes - a.changes);

  // Stock status distribution
  const stockStatus = {
    optimal: products.filter((p) => p.stock > p.min_stock).length,
    low: products.filter((p) => p.stock <= p.min_stock && p.stock > 0).length,
    outOfStock: products.filter((p) => p.stock === 0).length
  };

  const stockStatusData = [
    { name: 'Optimal', value: stockStatus.optimal, color: '#3c3' },
    { name: 'Low Stock', value: stockStatus.low, color: '#ff9800' },
    { name: 'Out of Stock', value: stockStatus.outOfStock, color: '#c33' }
  ];

  // Price change statistics
  const recentPriceChanges = priceChanges
    .slice(0, 5)
    .map((change) => {
      const product = products.find((p) => p.id === change.product_id);
      const priceDifference = change.new_price - change.previous_price;
      const percentChange =
        ((priceDifference / change.previous_price) * 100).toFixed(2);

      return {
        product: product?.name || 'Unknown',
        oldPrice: change.previous_price,
        newPrice: change.new_price,
        difference: priceDifference.toFixed(2),
        percentChange: percentChange,
        date: new Date(change.changed_at).toLocaleDateString()
      };
    });

  // Recent stock adjustments
  const recentStockAdjustments = inventoryLogs
    .slice(0, 5)
    .map((log) => {
      const product = products.find((p) => p.id === log.product_id);
      return {
        product: product?.name || 'Unknown',
        oldStock: log.previous_stock,
        newStock: log.new_stock,
        change: log.change_amount,
        user: log.changed_by || 'unknown',
        date: new Date(log.changed_at).toLocaleDateString()
      };
    });

  if (isLoading) {
    return (
      <div className="reporting-page">
        <div className="loading">Loading reports...</div>
      </div>
    );
  }

  return (
    <>
      <Header />
      <div className="reporting-page">
        <div className="report-header">
          <h1>Reports & Analytics</h1>
          <button className="btn-refresh" onClick={loadData}>
            Refresh Data
          </button>
        </div>

      {/* Overview Cards */}
      {activeTab === 'overview' && (
        <>
          <div className="stats-grid">
            <div className="stat-card">
              <h3>Total Products</h3>
              <p className="stat-value">{totalProducts}</p>
            </div>
            <div className="stat-card warning">
              <h3>Low Stock Items</h3>
              <p className="stat-value">{lowStockProducts}</p>
            </div>
            <div className="stat-card">
              <h3>Inventory Value</h3>
              <p className="stat-value">${totalInventoryValue.toFixed(2)}</p>
            </div>
            <div className="stat-card">
              <h3>Recent Changes</h3>
              <p className="stat-value">{totalRecentChanges}</p>
            </div>
          </div>

          {/* Stock Status */}
          <div className="report-section">
            <h2>Stock Status</h2>
            <div className="chart-container">
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={stockStatusData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: ${value}`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {stockStatusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Most Edited Products */}
          {mostEditedProducts.length > 0 && (
            <div className="report-section">
              <h2>Most Edited Products</h2>
              <div className="chart-container">
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={mostEditedProducts}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="changes" fill="#667eea" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* Activity by User */}
          {activityByUser.length > 0 && (
            <div className="report-section">
              <h2>Activity by Staff Member</h2>
              <div className="chart-container">
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={activityByUser}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="changes" fill="#764ba2" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </>
      )}

      {/* Price Changes Table */}
      {activeTab === 'prices' && (
        <div className="report-section">
          <h2>Recent Price Changes</h2>
          <div className="table-container">
            <table className="report-table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Old Price</th>
                  <th>New Price</th>
                  <th>Change</th>
                  <th>% Change</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {recentPriceChanges.map((change, idx) => (
                  <tr key={idx}>
                    <td className="product-name">{change.product}</td>
                    <td>${change.oldPrice.toFixed(2)}</td>
                    <td>${change.newPrice.toFixed(2)}</td>
                    <td
                      className={
                        parseFloat(change.difference) >= 0
                          ? 'positive'
                          : 'negative'
                      }
                    >
                      {parseFloat(change.difference) >= 0 ? '+' : ''}
                      ${change.difference}
                    </td>
                    <td
                      className={
                        parseFloat(change.percentChange) >= 0
                          ? 'positive'
                          : 'negative'
                      }
                    >
                      {parseFloat(change.percentChange) >= 0 ? '+' : ''}
                      {change.percentChange}%
                    </td>
                    <td>{change.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {recentPriceChanges.length === 0 && (
              <p className="no-data">No price changes recorded</p>
            )}
          </div>
        </div>
      )}

      {/* Stock Adjustments Table */}
      {activeTab === 'stock' && (
        <div className="report-section">
          <h2>Recent Stock Adjustments</h2>
          <div className="table-container">
            <table className="report-table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Old Stock</th>
                  <th>New Stock</th>
                  <th>Change</th>
                  <th>Staff Member</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {recentStockAdjustments.map((adjustment, idx) => (
                  <tr key={idx}>
                    <td className="product-name">{adjustment.product}</td>
                    <td>{adjustment.oldStock}</td>
                    <td>{adjustment.newStock}</td>
                    <td
                      className={
                        adjustment.change >= 0 ? 'positive' : 'negative'
                      }
                    >
                      {adjustment.change >= 0 ? '+' : ''}
                      {adjustment.change}
                    </td>
                    <td>{adjustment.user}</td>
                    <td>{adjustment.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {recentStockAdjustments.length === 0 && (
              <p className="no-data">No stock adjustments recorded</p>
            )}
          </div>
        </div>
      )}

      {/* Tab Navigation */}
      <div className="report-tabs">
        <button
          className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          Overview
        </button>
        <button
          className={`tab-btn ${activeTab === 'prices' ? 'active' : ''}`}
          onClick={() => setActiveTab('prices')}
        >
          Price Changes
        </button>
        <button
          className={`tab-btn ${activeTab === 'stock' ? 'active' : ''}`}
          onClick={() => setActiveTab('stock')}
        >
          Stock Adjustments
        </button>
      </div>
    </div>
    </>
  );
}