import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueueProvider } from './context/QueueContext';
import { AuthProvider } from './context/AuthContext';
import Layout from './components/Layout';
import StepFlow from './components/StepFlow';
import SignIn from './pages/SignIn';
import Counter from './pages/Counter';
import NavButton from './components/NavButton';
import CounterSelection from './pages/CounterSelection';
import CounterDisplay from './pages/CounterDisplay';
import { useEffect, useState } from "react";

import { onMessage } from 'firebase/messaging';
import { messaging } from "./firebase.ts";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// QR Data Interfaces
interface BranchQRData {
    metadata: {
        branchId: string;
        branchName: string;
        location: string;
    };
    navigationUrl: string;
}

export function App() {
    const [soundAllowed, setSoundAllowed] = useState(false);

    // ✅ Parse QR data on first load
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const dataParam = params.get("data");

        if (dataParam) {
            try {
                const decoded = decodeURIComponent(dataParam);
                const parsed: BranchQRData = JSON.parse(decoded);
                const branchId = parsed?.metadata?.branchId;

                if (branchId) {
                    localStorage.setItem("branchId", branchId);
                    console.log("📦 Branch ID saved to localStorage:", branchId);
                }

                // ✅ Optional: Redirect if navigationUrl is provided
                if (parsed?.navigationUrl) {
                    window.history.replaceState({}, '', parsed.navigationUrl);
                }

            } catch (error) {
                console.error("❌ Failed to parse QR data:", error);
            }
        }
    }, []);

    // 🔔 Handle Firebase notification
    useEffect(() => {
        if (typeof window === "undefined") return;

        Notification.requestPermission().then((permission) => {
            console.log(`🔔 Notification permission: ${permission}`);
        });

        if (!soundAllowed) return;

        const unsubscribe = onMessage(messaging, (payload) => {
            console.log("📩 Foreground message received:", payload);
            const { title, body } = payload.notification ?? {};

            toast.info(<strong>{title}</strong>);

            if (Notification.permission === "granted") {
                new Notification(title || "Notification", {
                    body: body || "",
                    icon: "/logo.png",
                });

                const audio = new Audio("/message-alert-190042.mp3");
                audio.play().catch((err) => {
                    console.warn("Audio playback failed:", err);
                });
            }
        });

        return () => unsubscribe();
    }, [soundAllowed]);

    function enableSound() {
        setSoundAllowed(true);
    }

    return (
        <>
            <ToastContainer position="top-right" autoClose={5000} />

            {!soundAllowed && (
                <div style={{
                    position: 'fixed',
                    top: 20,
                    right: 20,
                    background: '#333',
                    color: '#fff',
                    padding: '10px 20px',
                    borderRadius: 8,
                    zIndex: 1000,
                    cursor: 'pointer'
                }}
                     onClick={enableSound}
                >
                    Enable Notification Sounds 🔔
                </div>
            )}

            <AuthProvider>
                <QueueProvider>
                    <Router>
                        <Routes>
                            <Route path="/signin" element={<SignIn />} />
                            <Route path="/counter" element={<Counter />} />
                            <Route path="/display" element={<CounterSelection />} />
                            <Route path="/display/all" element={<CounterDisplay />} />
                            <Route path="/display/:counterId" element={<CounterDisplay />} />
                            <Route
                                path="/"
                                element={
                                    <Layout>
                                        <StepFlow />
                                    </Layout>
                                }
                            />
                            <Route path="*" element={<Navigate to="/" replace />} />
                        </Routes>
                        <NavButton />
                    </Router>
                </QueueProvider>
            </AuthProvider>
        </>
    );
}
