import { useState } from 'react';
import BarcodeScanner from '../components/BarcodeScanner';
import ProductDetails from '../components/ProductDetails';
import Header from '../components/Header';
import '../styles/DashboardPage.css';

export default function DashboardPage() {
  const [selectedProduct, setSelectedProduct] = useState(null);

  return (
    <>
      <Header />
      <div className="dashboard-container">

      <main className="dashboard-content">
        <div className="left-panel">
          <BarcodeScanner onProductFound={setSelectedProduct} />
        </div>

        <div className="right-panel">
          {selectedProduct ? (
            <ProductDetails product={selectedProduct} onClose={() => setSelectedProduct(null)} />
          ) : (
            <div className="empty-state">
              <p>Scan a barcode to get started</p>
            </div>
          )}
        </div>
      </main>
      </div>
    </>
  );
}