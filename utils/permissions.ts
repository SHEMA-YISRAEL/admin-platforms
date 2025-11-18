import { UserPermissions } from "@/interfaces/topoquizz";
import { LanguageCode } from "@/types/languages";

/**
 * Mapeo entre permisos de usuario y códigos de idioma
 */
const PERMISSION_TO_LANGUAGE_MAP: Record<string, LanguageCode> = {
  translateEnglish: 'en',
  translatePortuguese: 'pt',
  translateGerman: 'de',
  translateKorean: 'ko',
  canEditSpanishVersion: 'es'
};

/**
 * Obtiene los idiomas a los que el usuario tiene permiso para traducir
 * @param permissions - Los permisos del usuario
 * @returns Array de códigos de idioma permitidos
 */
export const getAllowedLanguages = (permissions: UserPermissions | undefined): LanguageCode[] => {
  if (!permissions) {
    return [];
  }

  const allowedLanguages: LanguageCode[] = [];

  // Iterar sobre los permisos de traducción
  Object.entries(PERMISSION_TO_LANGUAGE_MAP).forEach(([permission, languageCode]) => {
    if (permissions[permission as keyof UserPermissions]) {
      allowedLanguages.push(languageCode);
    }
  });

  // Si el usuario puede ver la versión en español, agregarlo (solo lectura)
  if (permissions.canViewSpanishVersion && !allowedLanguages.includes('es')) {
    allowedLanguages.push('es');
  }

  return allowedLanguages;
};

/**
 * Verifica si el usuario puede editar un idioma específico
 * @param permissions - Los permisos del usuario
 * @param language - El código del idioma a verificar
 * @returns true si el usuario puede editar ese idioma
 */
export const canEditLanguage = (
  permissions: UserPermissions | undefined,
  language: LanguageCode
): boolean => {
  if (!permissions) {
    return false;
  }

  switch (language) {
    case 'en':
      return permissions.translateEnglish || false;
    case 'pt':
      return permissions.translatePortuguese || false;
    case 'de':
      return permissions.translateGerman || false;
    case 'ko':
      return permissions.translateKorean || false;
    case 'es':
      return permissions.canEditSpanishVersion || false;
    default:
      return false;
  }
};

/**
 * Verifica si el usuario puede ver (solo lectura) un idioma específico
 * @param permissions - Los permisos del usuario
 * @param language - El código del idioma a verificar
 * @returns true si el usuario puede ver ese idioma
 */
export const canViewLanguage = (
  permissions: UserPermissions | undefined,
  language: LanguageCode
): boolean => {
  if (!permissions) {
    return false;
  }

  // Si puede editar, también puede ver
  if (canEditLanguage(permissions, language)) {
    return true;
  }

  // Caso especial: puede ver español sin poder editarlo
  if (language === 'es' && permissions.canViewSpanishVersion) {
    return true;
  }

  return false;
};
