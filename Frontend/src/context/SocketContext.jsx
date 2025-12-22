import { createContext, useContext, useEffect, useState, useRef } from "react";
import { io } from "socket.io-client";
import { useAuth } from "./AuthContext";

const SocketContext = createContext(null);

const API_BASE_URL =
    import.meta.env.VITE_API_URL ||
    (typeof window !== "undefined" && window.location.hostname === "localhost"
        ? "http://localhost:8080"
        : "http://uninest-backend:3000");

export const SocketProvider = ({ children }) => {
    const { isAuthenticated, user } = useAuth();
    const [socket, setSocket] = useState(null);
    const [isConnected, setIsConnected] = useState(false);
    const socketRef = useRef(null);

    useEffect(() => {
        if (!isAuthenticated) {
            // Disconnect socket if user logs out
            if (socketRef.current) {
                socketRef.current.disconnect();
                socketRef.current = null;
                setSocket(null);
                setIsConnected(false);
            }
            return;
        }

        // Get token from localStorage
        const token = localStorage.getItem("token");
        if (!token) return;

        // Create socket connection
        const newSocket = io(API_BASE_URL, {
            auth: { token },
            autoConnect: true,
            reconnection: true,
            reconnectionDelay: 1000,
            reconnectionDelayMax: 5000,
            reconnectionAttempts: 5,
        });

        // Connection event handlers
        newSocket.on("connect", () => {
            setIsConnected(true);
        });

        newSocket.on("disconnect", () => {
            setIsConnected(false);
        });

        newSocket.on("connect_error", () => {
            setIsConnected(false);
        });

        newSocket.on("error", () => {
            // Socket error - handled silently
        });

        socketRef.current = newSocket;
        setSocket(newSocket);

        // Cleanup on unmount
        return () => {
            if (socketRef.current) {
                socketRef.current.disconnect();
                socketRef.current = null;
            }
        };
    }, [isAuthenticated]);

    const joinConversation = (conversationId) => {
        if (socket && isConnected) {
            socket.emit("conversation:join", conversationId);
        }
    };

    const leaveConversation = (conversationId) => {
        if (socket && isConnected) {
            socket.emit("conversation:leave", conversationId);
        }
    };

    const emitTypingStart = (conversationId) => {
        if (socket && isConnected) {
            socket.emit("typing:start", { conversationId });
        }
    };

    const emitTypingStop = (conversationId) => {
        if (socket && isConnected) {
            socket.emit("typing:stop", { conversationId });
        }
    };

    const value = {
        socket,
        isConnected,
        joinConversation,
        leaveConversation,
        emitTypingStart,
        emitTypingStop,
    };

    return (
        <SocketContext.Provider value={value}>{children}</SocketContext.Provider>
    );
};

export const useSocket = () => {
    const context = useContext(SocketContext);
    if (context === undefined) {
        throw new Error("useSocket must be used within a SocketProvider");
    }
    return context;
};
