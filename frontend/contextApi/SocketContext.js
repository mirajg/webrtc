
'use client'
import { createContext, useContext, useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';

const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {
    const socketRef = useRef(null);
    const [isReady, setIsReady] = useState(false);
    const [callEnded, setCallEnded] = useState(false);

    useEffect(() => {
        socketRef.current = io('http://localhost:5000', {
            withCredentials: true,
        });
        setIsReady(true);

        return () => {
            socketRef.current.disconnect();
        };
    }, []);

    if (!isReady) return null; // Or a loading spinner

    return (
        <SocketContext.Provider value={{
            socket: socketRef.current,
            callEnded: callEnded,
            setCallEnded: setCallEnded
        }}>
            {children}
        </SocketContext.Provider>

    );
};

export const useSocket = () => useContext(SocketContext);
