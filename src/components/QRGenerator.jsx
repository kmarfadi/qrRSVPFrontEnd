import React, { useState } from 'react';
import StatusMessage from './StatusMessage';
import JSZip from 'jszip';
import api from '../services/api';

const QRGenerator = () => {
  const [password, setPassword] = useState('');
  const [isPasswordValid, setIsPasswordValid] = useState(false);
  const [generatedQRCodes, setGeneratedQRCodes] = useState([]);
  const [status, setStatus] = useState(null);

  const verifyPassword = () => {
    if (password === '0000') {
      setIsPasswordValid(true);
      setStatus({
        type: 'success',
        message: 'Password verified successfully!'
      });
      return true;
    } else {
      setStatus({
        type: 'error',
        message: 'Invalid password'
      });
      return false;
    }
  };

  const generateNewQRCode = async () => {
    if (!isPasswordValid) {
      setStatus({
        type: 'error',
        message: 'Please verify password first'
      });
      return;
    }
    try {
      // Use consistent API URL from services
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
      const response = await fetch(`${API_URL}/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to generate QR code');
      }

      const data = await response.json();
      const newQRCode = {
        id: Date.now(),
        code: data.qrCode,
        image: `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${data.qrCode}`,
        status: 'pending'
      };

      setGeneratedQRCodes(prev => [...prev, newQRCode]);
      setStatus({
        type: 'success',
        message: 'New QR code generated successfully!'
      });

     } catch (error) {
      setStatus({
        type: 'error',
        message: 'Error generating QR code'
      });
    }
  };

  const downloadQRCode = (imageData, id) => {
    const link = document.createElement('a');
    link.href = imageData;
    link.download = `qr-code-${id}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const downloadAllQRCodes = async () => {
    try {
      const zip = new JSZip();
      const date = new Date().toISOString().split('T')[0];
      const folderName = `qr-codes-${date}`;
      const folder = zip.folder(folderName);

      // Add CSV file with QR code information
      const csvContent = [
        ['ID', 'Code', 'Status', 'Generated Date', 'File Name'],
        ...generatedQRCodes.map(qr => [
          qr.id,
          qr.code,
          qr.status,
          new Date(qr.id).toLocaleString(),
          `qr-${qr.code}.png`
        ])
      ].map(row => row.join(',')).join('\n');
      folder.file('qr-codes-info.csv', csvContent);

      // Add README file with instructions
      const readmeContent = `QR Codes Package
Generated on: ${new Date().toLocaleString()}

This package contains:
1. qr-codes-info.csv - Information about all QR codes
2. Individual QR code PNG files

Each QR code file is named in the format: qr-{CODE}.png
For example: qr-ABC123.png

Total QR codes in this package: ${generatedQRCodes.length}
`;
      folder.file('README.txt', readmeContent);

      // Add QR code images
      for (const qrCode of generatedQRCodes) {
        try {
          const response = await fetch(qrCode.image);
          const blob = await response.blob();
          folder.file(`qr-${qrCode.code}.png`, blob);
        } catch (error) {
          console.error(`Error downloading QR code ${qrCode.code}:`, error);
          setStatus({
            type: 'error',
            message: `Error downloading QR code ${qrCode.code}`
          });
          return;
        }
      }

      // Generate and download zip file
      const content = await zip.generateAsync({ type: 'blob' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(content);
      link.download = `${folderName}.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setStatus({
        type: 'success',
        message: 'All QR codes downloaded successfully!'
      });
    } catch (error) {
      setStatus({
        type: 'error',
        message: 'Error creating download package'
      });
    }
  };

  return (
    <div className="min-vh-100 pa3 pa4-ns">
      <div className="mw7 center">
        <div className="card">
          <h1 className="f2 fw6 tc mb4 white">QR Code Generator</h1>
          
          {/* Password Input Section */}
          <div className="mb4">
            <input
              type="password"
              placeholder="Enter password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setIsPasswordValid(false);
                setStatus(null);
              }}
              className="w-100 pa3 ba b--light-gray br3 f5"
            />
            {!isPasswordValid && password && (
              <button
                onClick={verifyPassword}
                className="mt2 w-100 pa3 bg-blue white bn br3 f5 pointer hover-bg-dark-blue"
              >
                Verify
              </button>
            )}
          </div>

          {/* Generate Button */}
          {isPasswordValid && (
            <button
              onClick={generateNewQRCode}
              className="w-100 pa3 bg-purple white bn br3 f5 pointer hover-bg-dark-purple"
            >
              Generate New QR Code
            </button>
          )}

          {/* Status Message */}
          {status && <StatusMessage type={status.type} message={status.message} />}
        </div>

        {/* Generated QR Codes Grid */}
        {generatedQRCodes.length > 0 && (
          <div className="card mt4">
            <div className="flex justify-between items-center mb4">
              <h2 className="f3 fw6 tc">Generated QR Codes</h2>
              <button
                onClick={downloadAllQRCodes}
                className="download-all-btn"
              >
                <span>📥</span> Download All
              </button>
            </div>
            <div className="qr-grid">
              {generatedQRCodes.map(qrCode => (
                <div key={qrCode.id} className="qr-card">
                  <div className="qr-code-container">
                    <img 
                      src={qrCode.image} 
                      alt={`QR Code ${qrCode.id}`}
                      className="grow pointer"
                    />
                  </div>
                  <div className="qr-info">
                    <h3 className="black">Code: {qrCode.code}</h3>
                    <p className="black">ID: {qrCode.id}</p>
                    <span className="status-badge pending">New</span>
                  </div>
                 
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default QRGenerator; 