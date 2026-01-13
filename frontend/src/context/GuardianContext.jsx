import React, { createContext, useContext, useState, useEffect } from "react";
import api from "../services/api";

const GuardianContext = createContext();

export function GuardianProvider({ children }) {
    const [wards, setWards] = useState([]);
    const [selectedWard, setSelectedWard] = useState(null);
    const [loadingWards, setLoadingWards] = useState(false);
    const [error, setError] = useState(null);

    // Load wards on initial mount (called manually if needed, or we can expose a reload function)
    const refreshWards = async () => {
        try {
            setLoadingWards(true);
            setError(null);
            const response = await api.getGuardianWards();
            if (response.success && response.data && response.data.length > 0) {
                setWards(response.data);
                // Persist selection if possible, otherwise default to first
                const savedWardId = localStorage.getItem('selectedWardId');
                const foundWard = response.data.find(w => w.id === savedWardId);

                if (foundWard) {
                    setSelectedWard(foundWard);
                } else {
                    setSelectedWard(response.data[0]);
                    localStorage.setItem('selectedWardId', response.data[0].id);
                }
            } else {
                setWards([]);
                setSelectedWard(null);
            }
        } catch (e) {
            console.error("Failed to load wards context", e);
            setError(e.message || "Failed to load wards");
            setWards([]);
            setSelectedWard(null);
        } finally {
            setLoadingWards(false);
        }
    };

    const selectWard = (ward) => {
        setSelectedWard(ward);
        if (ward) {
            localStorage.setItem('selectedWardId', ward.id);
        }
    };

    useEffect(() => {
        refreshWards();
    }, []);

    return (
        <GuardianContext.Provider value={{ wards, selectedWard, selectWard, loadingWards, refreshWards, error }}>
            {children}
        </GuardianContext.Provider>
    );
}

export const useGuardian = () => useContext(GuardianContext);
