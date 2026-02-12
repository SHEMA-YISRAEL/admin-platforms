import { useState, useEffect } from "react";
import { auth } from "@/utils/firebase";

export interface UserListData {
    id: string;
    name: string;
    lastName: string;
    email: string;
    dateOfBirth: Date | null;
    categoryId: number | null;
    createdAt: Date;
    updatedAt: Date;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

function useUsers() {
    const [users, setUsers] = useState<UserListData[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                setLoading(true);
                setError(null);

                const currentUser = auth.currentUser;

                if (!currentUser) {
                    setError('No estás autenticado. Por favor, inicia sesión primero.');
                    setLoading(false);
                    return;
                }

                // Obtener el token de Firebase Auth
                const firebaseToken = await currentUser.getIdToken();

                const response = await fetch(`${API_BASE_URL}/users`, {
                    headers: {
                        'Authorization': `Bearer ${firebaseToken}`,
                        'Content-Type': 'application/json',
                    },
                });

                if (!response.ok) {
                    if (response.status === 401) {
                        throw new Error('Token inválido o expirado. Por favor, recarga la página e intenta nuevamente.');
                    }
                    throw new Error(`Error ${response.status}: ${response.statusText}`);
                }

                const data: UserListData[] = await response.json();
                setUsers(data);
            } catch (err) {
                console.error('Error fetching users from backend:', err);
                setError(err instanceof Error ? err.message : 'Unknown error');
            } finally {
                setLoading(false);
            }
        };

        fetchUsers();
    }, []);

    return { users, loading, error, setUsers };
}

export default useUsers;
