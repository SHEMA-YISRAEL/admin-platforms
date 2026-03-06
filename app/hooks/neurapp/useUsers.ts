import { useState, useEffect } from "react";
import { neuremyFetch } from "@/lib/neuremy-api";

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

function useUsers() {
    const [users, setUsers] = useState<UserListData[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                setLoading(true);
                setError(null);

                const response = await neuremyFetch('/users');

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
