import React, { useState, useEffect, useContext } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import StatusMessage from './StatusMessage';
import { StatusContext } from '../App';
import api from '../services/api';

const QRScanner = () => {
  const [isScanning, setIsScanning] = useState(false);
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
    } else {
      setLocalStatus({ type: 'error', message: 'Invalid password' });
      setGlobalStatus({ type: 'error', message: 'Invalid password' });
      alert('Invalid password');
    }
  };

  const startScanner = () => {
    if (!isPasswordValid) {
      setLocalStatus({ type: 'error', message: 'Please verify password first' });
      setGlobalStatus({ type: 'error', message: 'Please verify password first' });
      return;
    }

    if (document.getElementById('reader')?.children.length > 0) return;

    scannerInstance = new Html5QrcodeScanner(
      "reader",
      { fps: 1, qrbox: { width: 250, height: 250 } },
      false
    );

    scannerInstance.render(handleScanSuccess, (errorMessage) => {
      console.warn(errorMessage);
      setLocalStatus({ type: 'error', message: errorMessage });
      setGlobalStatus({ type: 'error', message: errorMessage });
    });

    setIsScanning(true);
  };

  const stopScanner = () => {
    if (scannerInstance) {
      scannerInstance.clear().catch((error) => console.error("Error clearing scanner:", error));
      scannerInstance = null;
    }
    setIsScanning(false);
  };

  const handleScanSuccess = async (decodedText) => {
    const cleanCode = decodedText.trim();
    if (cleanCode === lastScannedCode) return;

    setLastScannedCode(cleanCode);
    stopScanner();

    try {
      const response = await api.verifyQRCode(cleanCode);
      setLocalStatus({ type: 'success', message: response.message });
      setGlobalStatus({ type: 'success', message: response.message });
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Error verifying QR code';
      setLocalStatus({ type: 'error', message: errorMessage });
      setGlobalStatus({ type: 'error', message: errorMessage });
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

          {isScanning && (
            <div className="scanner-container">
              <div id="reader"></div>
            </div>
          )}

          {localStatus && <StatusMessage type={localStatus.type} message={localStatus.message} />}

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
