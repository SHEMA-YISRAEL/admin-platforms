import { signInWithEmailAndPassword, signOut, User } from "firebase/auth";
import { doc, getDoc, Timestamp } from "firebase/firestore";
import { auth, db } from "@/utils/firebase";
import { UserData, UserPermissions } from "@/interfaces/topoquizz";

/**
 * Inicia sesión con email y contraseña
 * @param email - Email del usuario
 * @param password - Contraseña del usuario
 * @returns Usuario autenticado de Firebase
 */
export const loginWithEmailAndPassword = async (
  email: string,
  password: string
): Promise<User> => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  } catch (error) {
    console.error("Error al iniciar sesión:", error);
    throw error;
  }
};

/**
 * Obtiene los datos del usuario y sus permisos desde Firestore
 * @param userId - ID del usuario autenticado
 * @returns Datos del usuario con permisos
 */
export const getUserData = async (userId: string): Promise<UserData | null> => {
  try {
    
    const userDocRef = doc(db, "adminUsers", userId);
    const userDoc = await getDoc(userDocRef);

    if (userDoc.exists()) {
      const data = userDoc.data();
      return {
        id: userDoc.id,
        userName: data.userName || "",
        email: data.email || "",
        permissions: data.permissions || {},
        createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate() : new Date(data.createdAt),
        updatedAt: data.updatedAt instanceof Timestamp ? data.updatedAt.toDate() : new Date(data.updatedAt),
      } as UserData;
    }

    return null;
  } catch (error) {
    console.error("Error al obtener datos del usuario no encontrado :", error);
    throw error;
  }
};

/**
 * Cierra la sesión del usuario actual
 */
export const logout = async (): Promise<void> => {
  try {
    await signOut(auth);
  } catch (error) {
    console.error("Error al cerrar sesión:", error);
    throw error;
  }
};

/**
 * Verifica si el usuario tiene un permiso específico
 * @param permissions - Permisos del usuario
 * @param permission - Permiso a verificar
 * @returns true si el usuario tiene el permiso
 */
export const hasPermission = (
  permissions: UserPermissions | undefined,
  permission: keyof UserPermissions
): boolean => {
  if (!permissions) return false;
  return permissions[permission] === true;
};
