import { useState, useRef } from 'react';
import JsBarcode from 'jsbarcode';
import '../styles/BarcodeGenerator.css';

export default function BarcodeGenerator() {
  const [barcodeValue, setBarcodeValue] = useState('');
  const [format, setFormat] = useState('CODE128');
  const barcodeRef = useRef();

  const generateRandomBarcode = () => {
    const random = Math.floor(Math.random() * 10000000000)
      .toString()
      .padStart(10, '0');
    setBarcodeValue(random);
    generateBarcode(random);
  };

  const handleGenerateCustom = () => {
    if (barcodeValue.trim()) {
      generateBarcode(barcodeValue);
    }
  };

  const generateBarcode = (value) => {
    try {
      JsBarcode(barcodeRef.current, value, {
        format: format,
        width: 2,
        height: 100,
        displayValue: true
      });
    } catch (err) {
      alert('Invalid barcode value for selected format');
    }
  };

  const handleDownload = () => {
    if (!barcodeValue.trim()) {
      alert('Please generate a barcode first');
      return;
    }

    const svg = barcodeRef.current;
    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);
      const link = document.createElement('a');
      link.href = canvas.toDataURL('image/png');
      link.download = `barcode-${barcodeValue}.png`;
      link.click();
    };

    img.src = 'data:image/svg+xml;base64,' + btoa(svgData);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(barcodeValue);
    alert('Barcode copied to clipboard!');
  };

  return (
    <div className="barcode-generator">
      <h3>Barcode Generator</h3>

      <div className="generator-controls">
        <div className="control-group">
          <label htmlFor="format">Barcode Format:</label>
          <select
            id="format"
            value={format}
            onChange={(e) => setFormat(e.target.value)}
          >
            <option value="CODE128">CODE128</option>
            <option value="CODE39">CODE39</option>
            <option value="EAN13">EAN13</option>
            <option value="EAN8">EAN8</option>
            <option value="UPC">UPC</option>
          </select>
        </div>

        <div className="control-group">
          <label htmlFor="barcode-input">Barcode Value:</label>
          <input
            id="barcode-input"
            type="text"
            value={barcodeValue}
            onChange={(e) => setBarcodeValue(e.target.value)}
            placeholder="Enter barcode value or generate random"
          />
        </div>

        <div className="button-group">
          <button className="btn-secondary" onClick={generateRandomBarcode}>
            Generate Random
          </button>
          <button className="btn-primary" onClick={handleGenerateCustom}>
            Generate
          </button>
        </div>
      </div>

      {barcodeValue && (
        <div className="barcode-display">
          <svg ref={barcodeRef}></svg>

          <div className="barcode-actions">
            <button className="btn-secondary" onClick={handleCopy}>
              Copy Barcode
            </button>
            <button className="btn-secondary" onClick={handleDownload}>
              Download PNG
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
