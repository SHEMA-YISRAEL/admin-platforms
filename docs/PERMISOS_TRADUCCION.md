# Sistema de Permisos de Traducción

Este documento explica cómo funciona el sistema de permisos por idioma para traductores en la plataforma.

## Descripción General

El sistema de permisos controla qué idiomas puede ver y editar cada usuario traductor. Esto asegura que:
- Cada traductor solo vea los idiomas para los que tiene permiso
- Los traductores puedan ver el español (versión original) para referencia
- Se mantenga la seguridad y organización del trabajo de traducción

## Permisos Disponibles

### Permisos de Traducción por Idioma

| Permiso | Descripción | Idioma |
|---------|-------------|--------|
| `translateEnglish` | Permite traducir al inglés | 🇬🇧 English |
| `translatePortuguese` | Permite traducir al portugués | 🇵🇹 Português |
| `translateGerman` | Permite traducir al alemán | 🇩🇪 Deutsch |
| `translateKorean` | Permite traducir al coreano | 🇰🇷 한국어 |

### Permisos de Español (Versión Original)

| Permiso | Descripción |
|---------|-------------|
| `canEditSpanishVersion` | Permite editar la versión en español (original) |
| `canViewSpanishVersion` | Permite ver español en modo solo lectura (para referencia) |

## Estructura de Permisos en Firebase

```javascript
{
  userName: "English-Translator",
  userMail: "translator@example.com",
  rol: "translator",
  permissions: {
    translateEnglish: true,        // Puede traducir al inglés
    canViewSpanishVersion: true    // Puede ver español para comparar
  }
}
```

## Configuración de Usuarios

### Script de Creación de Usuarios

Usa el script `scripts/createAdminUsers.js` para crear usuarios con permisos específicos:

```javascript
const translators = [
  {
    data: {
      userName: "English-Translator",
      userMail: "englishtranslator@topoquizz.com",
      rol: 'translator',
      permissions: {
        translateEnglish: true,
        canViewSpanishVersion: true
      }
    },
    uid: "uid-del-usuario"
  }
];
```

### Ejemplo: Traductor Multilingüe

Si un usuario debe traducir a varios idiomas:

```javascript
{
  permissions: {
    translateEnglish: true,
    translatePortuguese: true,
    canViewSpanishVersion: true
  }
}
```

## Comportamiento en la UI

### En el Componente de Traducción

1. **Filtrado de Idiomas**: Solo se muestran los botones de idiomas para los cuales el usuario tiene permiso
2. **Vista de Español**: Si tiene `canViewSpanishVersion`, puede ver la pregunta original en español en la columna izquierda
3. **Sin Permisos**: Si el usuario no tiene permisos de traducción, verá un mensaje de error

### Experiencia del Usuario

```
┌────────────────────────────────────────────────────┐
│ PREGUNTA ORIGINAL (Español) │ FORMULARIO          │
│ [Solo lectura]               │ [Botones de idioma] │
│                              │ [Solo idiomas con   │
│                              │  permiso]           │
└────────────────────────────────────────────────────┘
```

## Archivos Relacionados

### Interfaces
- `interfaces/topoquizz.ts` - Define `UserPermissions`

### Utilidades
- `utils/permissions.ts` - Funciones helper:
  - `getAllowedLanguages()` - Obtiene idiomas permitidos
  - `canEditLanguage()` - Verifica si puede editar un idioma
  - `canViewLanguage()` - Verifica si puede ver un idioma

### Componentes
- `components/topoquizz/translations/translationCard.tsx` - Componente principal de traducción

### Contextos
- `contexts/AuthContext.tsx` - Proporciona datos del usuario autenticado

## Tipos de TypeScript

```typescript
export interface UserPermissions {
  // Permisos generales
  canViewTopoquizz?: boolean;
  canEditTopoquizz?: boolean;
  canDeleteTopoquizz?: boolean;

  // Permisos de traducción
  translateEnglish?: boolean;
  translatePortuguese?: boolean;
  translateGerman?: boolean;
  translateKorean?: boolean;

  // Permisos de español
  canEditSpanishVersion?: boolean;
  canViewSpanishVersion?: boolean;
}
```

## Flujo de Trabajo

1. **Usuario se autentica** → Firebase Auth
2. **Se cargan permisos** → Firestore (`adminUsers` collection)
3. **Se filtran idiomas** → `getAllowedLanguages(permissions)`
4. **Se muestra UI** → Solo idiomas permitidos
5. **Usuario traduce** → Solo a idiomas con permiso de edición

## Seguridad

✅ **Control en Frontend**: UI solo muestra idiomas permitidos
✅ **Validación en Firestore**: Las reglas de seguridad deben validar permisos
⚠️ **Importante**: Implementar reglas de seguridad en Firestore para validar permisos en el backend

### Reglas de Firestore Recomendadas

```javascript
match /questions/{questionId} {
  allow read: if request.auth != null;
  allow write: if request.auth != null &&
    hasTranslationPermission(request.auth.uid);
}

function hasTranslationPermission(userId) {
  let userData = get(/databases/$(database)/documents/adminUsers/$(userId)).data;
  return userData.permissions.translateEnglish == true ||
         userData.permissions.translatePortuguese == true ||
         userData.permissions.translateGerman == true ||
         userData.permissions.translateKorean == true;
}
```

## Casos de Uso

### 1. Traductor Básico
- Permiso: `translateEnglish` + `canViewSpanishVersion`
- Ve: Español (referencia) + Inglés (editable)
- Puede: Solo traducir al inglés

### 2. Editor de Español
- Permiso: `canEditSpanishVersion`
- Ve: Solo español
- Puede: Editar versión original

### 3. Traductor Senior
- Permisos: `translateEnglish` + `translatePortuguese` + `canEditSpanishVersion`
- Ve: Español, Inglés, Portugués
- Puede: Editar todos estos idiomas

### 4. Revisor
- Permiso: `canViewSpanishVersion` (sin permisos de edición)
- Ve: Solo español en modo lectura
- Puede: Solo ver, no editar

## Mantenimiento

### Agregar Nuevo Idioma

1. Actualizar `types/languages.ts`:
```typescript
export type LanguageCode = 'es' | 'en' | 'pt' | 'de' | 'ko' | 'fr';
```

2. Actualizar `interfaces/topoquizz.ts`:
```typescript
export interface UserPermissions {
  // ... otros permisos
  translateFrench?: boolean;
}
```

3. Actualizar `utils/permissions.ts`:
```typescript
const PERMISSION_TO_LANGUAGE_MAP = {
  // ... otros mapeos
  translateFrench: 'fr'
};
```

4. Actualizar componentes para incluir el nuevo idioma

## Troubleshooting

### Problema: Usuario no ve ningún idioma
**Solución**: Verificar que el usuario tenga al menos un permiso de traducción en Firestore

### Problema: Usuario ve idiomas que no debería
**Solución**: Verificar la función `getAllowedLanguages()` y los permisos en Firebase

### Problema: Cambios de permisos no se reflejan
**Solución**: El usuario debe cerrar sesión y volver a iniciar sesión para que se recarguen los permisos
