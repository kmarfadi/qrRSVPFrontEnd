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

  useEffect(() => {
    if (localStatus?.message) {
      setTimeout(() => {
        alert(localStatus.message);
      }, 200);
    }
  }, [localStatus]);

  const verifyPassword = () => {
    if (password === '0000') {
      setIsPasswordValid(true);
      setLocalStatus({ type: 'success', message: 'Password verified successfully!' });
      setGlobalStatus({ type: 'success', message: 'Password verified successfully!' });
      return true;
    } else {
      setLocalStatus({ type: 'error', message: 'Invalid password' });
      setGlobalStatus({ type: 'error', message: 'Invalid password' });
      alert('Invalid password');
      return false;
    }
  };

  const startScanner = () => {
    if (!isPasswordValid) {
      setLocalStatus({ type: 'error', message: 'Please verify password first' });
      setGlobalStatus({ type: 'error', message: 'Please verify password first' });
      return;
    }
    
    setTimeout(() => {
      const readerElement = document.getElementById("reader");
      if (!readerElement) {
        console.error("QR Scanner div not found!");
        return;
      }
      
      scannerInstance = new Html5QrcodeScanner(
        "reader",
        { fps: 0.5, qrbox: { width: 250, height: 250 } },
        false
      );
      
      scannerInstance.render(handleScanSuccess, (errorMessage) => {
        setLocalStatus({ type: 'error', message: errorMessage });
        setGlobalStatus({ type: 'error', message: errorMessage });
      });
      
      setIsScanning(true);
    }, 100);
  };

  const stopScanner = () => {
    if (scannerInstance) {
      scannerInstance.clear();
      scannerInstance = null;
    }
    const reader = document.getElementById('reader');
    if (reader) {
      reader.innerHTML = '';
    }
    setIsScanning(false);
  };

  const handleScanSuccess = async (decodedText) => {
    const cleanCode = decodedText.trim();

    if (cleanCode === lastScannedCode) return;
    setLastScannedCode(cleanCode);

    try {
      const response = await api.verifyQRCode(cleanCode);
      setLocalStatus({ type: 'success', message: response.message });
      setGlobalStatus({ type: 'success', message: response.message });
      stopScanner();
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Error verifying QR code';
      setLocalStatus({ type: 'error', message: errorMessage });
      setGlobalStatus({ type: 'error', message: errorMessage });

      if (errorMessage === 'QR code already used') {
        stopScanner();
      }
    }
  };

  return (
    <div className="min-vh-100 pa3 pa4-ns">
      <div className="mw7 center">
        <div className="card">
          <h1 className="f2 fw6 tc mb4 white">QR Code Scanner</h1>
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
          <div className="scanner-container">
            <div id="reader"></div>
          </div>
          {error && (
            <div className="status-message status-error">
              <span>✗</span>
              <span>Scanning error: {error}</span>
            </div>
          )}
          {localStatus && <StatusMessage type={localStatus.type} message={localStatus.message} />}
          {lastScannedCode && (
            <div className="last-scan mt4">
              <h3 className="f5 fw6 mb2">Last Scanned Code:</h3>
              <div className="last-scan-code">{lastScannedCode} {localStatus?.message}</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default QRScanner;
