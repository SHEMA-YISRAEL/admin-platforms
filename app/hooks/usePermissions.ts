import { useAuthContext } from '@/contexts/AuthContext';
import { UserPermissions } from '@/interfaces/topoquizz';
import { hasPermission as checkPermission } from '@/lib/firebase/auth';

interface UsePermissionsReturn {
  permissions: UserPermissions | undefined;
  hasPermission: (permission: keyof UserPermissions) => boolean;

  translateEnglish:boolean;

  canViewTopoquizz: boolean;
  canEditTopoquizz: boolean;
  canDeleteTopoquizz: boolean;
  canViewNeurapp: boolean;
  canEditNeurapp: boolean;
  canDeleteNeurapp: boolean;
}

/**
 * Hook para verificar permisos del usuario actual
 * @returns Objeto con los permisos y funciones para verificarlos
 */
export const usePermissions = (): UsePermissionsReturn => {
  const { userData } = useAuthContext();
  const permissions = userData?.permissions;

  const hasPermission = (permission: keyof UserPermissions): boolean => {
    return checkPermission(permissions, permission);
  };

  return {
    permissions,
    hasPermission,

    translateEnglish:hasPermission('translateEnglish'),
    
    canViewTopoquizz: hasPermission('canViewTopoquizz'),
    canEditTopoquizz: hasPermission('canEditTopoquizz'),
    canDeleteTopoquizz: hasPermission('canDeleteTopoquizz'),
    canViewNeurapp: hasPermission('canViewNeurapp'),
    canEditNeurapp: hasPermission('canEditNeurapp'),
    canDeleteNeurapp: hasPermission('canDeleteNeurapp'),
  };
};
