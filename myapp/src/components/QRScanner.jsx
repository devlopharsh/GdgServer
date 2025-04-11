import React, { useState } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";
import axios from "axios";

const QRScanner = () => {
    const [scanResult, setScanResult] = useState(null);
    const [message, setMessage] = useState("");

    React.useEffect(() => {
        const scanner = new Html5QrcodeScanner(
            "reader",
            { fps: 10, qrbox: 250 },
            false
        );

        scanner.render(
            (decodedText) => {
                scanner.clear();
                setScanResult(decodedText);
                markAttendance(decodedText);
            },
            (errorMessage) => {
                console.warn("QR Code Scan Error:", errorMessage);
            }
        );

        return () => scanner.clear();
    }, []);

    const markAttendance = async (uuid) => {
        try {
            const response = await axios.post("http://localhost:5000/mark-attendance", { uuid });
            setMessage(response.data.message);
        } catch (error) {
            setMessage("Error marking attendance. Please try again.");
        }
    };

    return (
        <div className="flex flex-col items-center p-4">
            <h1 className="text-2xl font-bold mb-4">Scan QR Code for Attendance</h1>
            {!scanResult ? (
                <div id="reader" className="border-2 border-gray-500 p-2"></div>
            ) : (
                <p className="text-green-500 font-semibold">Scanned UUID: {scanResult}</p>
            )}
            {message && <p className="mt-2 text-lg">{message}</p>}
        </div>
    );
};

export default QRScanner;