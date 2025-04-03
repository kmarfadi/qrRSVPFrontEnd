import React, { useState, useEffect, useContext } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import StatusMessage from './StatusMessage';
import { StatusContext } from '../App';
import api from '../services/api';

const QRScanner = () => {
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState(null);
  const [localStatus, setLocalStatus] = useState(null);
  const [lastScannedCode, setLastScannedCode] = useState(null);
  const [password, setPassword] = useState('');
  const [isPasswordValid, setIsPasswordValid] = useState(false);
  const { setStatus: setGlobalStatus } = useContext(StatusContext);

  let scannerInstance = null;

  useEffect(() => {
    return () => stopScanner();
  }, []);

  const verifyPassword = () => {
    if (password === '0000') {
      setIsPasswordValid(true);
      setLocalStatus({ type: 'success', message: 'Password verified successfully!' });
      setGlobalStatus({ type: 'success', message: 'Password verified successfully!' });
      return true;
    } else {
      setLocalStatus({ type: 'error', message: 'Invalid password' });
      setGlobalStatus({ type: 'error', message: 'Invalid password' });
      return false;
    }
  };

  const startScanner = () => {
    if (!isPasswordValid) {
      setLocalStatus({
        type: 'error',
        message: 'Please verify password first'
      });
      setGlobalStatus({
        type: 'error',
        message: 'Please verify password first'
      });
      return;
    }
  
    if (document.getElementById('reader')?.children.length > 0) {
      return; // Prevent multiple instances
    }
  
    const scanner = new Html5QrcodeScanner(
      "reader",
      {
        //make scanner once every 2 seconds
        fps: 0.5,
        qrbox: { width: 250, height: 250 },
      },
      false
    );
  
    scanner.render(
      (decodedText) => {
        handleScanSuccess(decodedText);
      },
      (errorMessage) => {
        console.warn(errorMessage);
      }
    );
  
    setIsScanning(true);
  };
  

  const stopScanner = () => {
    if (scannerInstance) {
      scannerInstance.clear();
    }
    const reader = document.getElementById('reader');
    if (reader) {
      reader.innerHTML = '';
    }
    setIsScanning(false);
  };

  const handleScanSuccess = async (decodedText) => {
    const cleanCode = decodedText.trim();
    
    // Prevent rapid duplicate scans
    if (cleanCode === lastScannedCode) {
      return;
    }

    setLastScannedCode(cleanCode); // Store last scanned code

    try {
      const data = await api.verifyQRCode(cleanCode);
      setLocalStatus({ type: 'success', message: data.message });
      setGlobalStatus({ type: 'success', message: data.message });

      // Temporarily disable scanning to avoid rapid duplicate scans
      
    } catch (error) {
      const statusType = error.response?.data?.error === 'QR code already used' ? 'error' : 'warning';
      setLocalStatus({ type: statusType, message: error.response?.data?.details || error.response?.data?.error || 'Error verifying QR code' });
      setGlobalStatus({ type: statusType, message: error.response?.data?.details || error.response?.data?.error || 'Error verifying QR code' });
      
      // Temporarily disable scanning to prevent rapid re-scans
      
    }
  };

  return (
    <div className="min-vh-100 pa3 pa4-ns">
      <div className="mw7 center">
        <div className="card">
          <h1 className="f2 fw6 tc mb4 white">QR Code Scanner</h1>

          {/* Password Input Section */}
          <div className="mb4">
            <input
              type="password"
              placeholder="Enter password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setIsPasswordValid(false);
                setLocalStatus(null);
                setGlobalStatus(null);
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

          {/* Scanner Controls */}
          <div className="flex flex-column flex-row-ns gap2 mb4">
            {!isScanning ? (
              <button
                onClick={startScanner}
                disabled={!isPasswordValid}
                className={`w-100 pa3 bn br3 f5 pointer ${isPasswordValid ? 'bg-green white hover-bg-dark-green' : 'bg-red white hover-bg-dark-red'}`}
              >
                Start Scanner
              </button>
            ) : (
              <button
                onClick={stopScanner}
                className="w-100 pa3 bg-red white bn br3 f5 pointer hover-bg-dark-red"
              >
                Stop Scanner
              </button>
            )}
          </div>

          {/* Scanner Container */}
          <div className="scanner-container">
            <div id="reader"></div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="status-message status-error">
              <span>✗</span>
              <span>Scanning error: {error}</span>
            </div>
          )}

          {/* Local Status Message */}
          {localStatus && <StatusMessage type={localStatus.type} message={localStatus.message} />}

          {/* Last Scanned Code */}
          {lastScannedCode && (
            <div className="last-scan mt4">
              <h3 className="f5 fw6 mb2">Last Scanned Code:</h3>
              <div className="last-scan-code">{lastScannedCode}</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default QRScanner;
