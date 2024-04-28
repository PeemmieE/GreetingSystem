import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useUserAuth } from '../context/UserAuthContext';

function ProtectedRoute({ children }) {
    const { getCurrentUser } = useUserAuth();
    const [isAuthenticated, setIsAuthenticated] = useState(null)

    useEffect(() => {
        const fetchData = async () => {
            try {
                const result = await getCurrentUser();
                const currentUser = result;
                if (!currentUser) {
                    setIsAuthenticated(false);
                } else {
                    setIsAuthenticated(true);
                }
            } catch (error) {
                console.error('Error fetching user data', error);
                setIsAuthenticated(false);
            }
        };

        fetchData();
    }, []);

    if (isAuthenticated === null) {
        return null;
    }
    return isAuthenticated ? children : <Navigate to="/login" />;
}
export default ProtectedRoute;