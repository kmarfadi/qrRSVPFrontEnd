import React, { useState, useContext } from "react";
import QrReader from "react-qr-scanner";
import StatusMessage from "./StatusMessage";
import { StatusContext } from "../App";
import api from "../services/api";

const QRScanner = () => {
  const [isScanning, setIsScanning] = useState(false);
  const [lastScannedCode, setLastScannedCode] = useState(null);
  const [password, setPassword] = useState("");
  const [isPasswordValid, setIsPasswordValid] = useState(false);
  const [localStatus, setLocalStatus] = useState(null);
  const { setStatus: setGlobalStatus } = useContext(StatusContext);

  const verifyPassword = () => {
    if (password === "0000") {
      setIsPasswordValid(true);
      setLocalStatus({ type: "success", message: "Password verified!" });
      setGlobalStatus({ type: "success", message: "Password verified!" });
    } else {
      setLocalStatus({ type: "error", message: "Invalid password" });
      setGlobalStatus({ type: "error", message: "Invalid password" });
    }
  };

  const handleScan = async (data) => {
    if (!data || data.text === lastScannedCode) return; // Avoid multiple scans

    const cleanCode = data.text.trim();
    setLastScannedCode(cleanCode); // Prevent re-scanning the same code instantly

    try {
      const response = await api.verifyQRCode(cleanCode);
      setLocalStatus({ type: "success", message: response.message });
      setGlobalStatus({ type: "success", message: response.message });
    } catch (error) {
      const statusType =
        error.response?.data?.error === "QR code already used" ? "error" : "warning";
      setLocalStatus({
        type: statusType,
        message: error.response?.data?.details || "Error verifying QR code",
      });
      setGlobalStatus({
        type: statusType,
        message: error.response?.data?.details || "Error verifying QR code",
      });
    }
  };

  const handleError = (err) => {
    console.error("QR Scanner Error:", err);
  };

  return (
    <div className="min-vh-100 pa3 pa4-ns">
      <div className="mw7 center">
        <div className="card">
          <h1 className="f2 fw6 tc mb4 white">QR Code Scanner</h1>

          {/* Password Input */}
          <div className="mb4">
            <input
              type="password"
              placeholder="Enter password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
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

          {/* Scanner */}
          {isPasswordValid && (
            <div className="scanner-container">
              <QrReader
                delay={1000} // 1 second delay between scans
                style={{ width: "100%" }}
                onError={handleError}
                onScan={handleScan}
                facingMode="environment" // Use back camera
              />
            </div>
          )}

          {/* Status Message */}
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
