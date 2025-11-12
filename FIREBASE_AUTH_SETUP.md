# Configuración de Autenticación con Firebase

## 1. Configurar Firebase Authentication

### Paso 1: Habilitar Email/Password en Firebase Console
1. Ve a [Firebase Console](https://console.firebase.google.com/)
2. Selecciona tu proyecto
3. Ve a **Authentication** > **Sign-in method**
4. Habilita **Email/Password**

### Paso 2: Crear usuarios en Firebase Authentication
1. Ve a **Authentication** > **Users**
2. Haz clic en **Add user**
3. Ingresa el email y contraseña del usuario
4. Copia el **User UID** que se genera (lo necesitarás para el siguiente paso)

## 2. Estructura de la colección "users" en Firestore

Debes crear una colección llamada `users` en Firestore con la siguiente estructura:

### Documento de Usuario

Cada documento en la colección `users` debe tener el **mismo ID que el UID del usuario en Authentication**.

**Ruta:** `users/{userId}`

**Estructura del documento:**

```json
{
  "userName": "Admin User",
  "email": "admin@example.com",
  "permissions": {
    "canViewTopoquizz": true,
    "canEditTopoquizz": true,
    "canDeleteTopoquizz": true,
    "canViewNeurapp": true,
    "canEditNeurapp": true,
    "canDeleteNeurapp": false
  },
  "createdAt": "Timestamp",
  "updatedAt": "Timestamp"
}
```

### Ejemplo de cómo crear un documento de usuario:

1. Ve a **Firestore Database** en Firebase Console
2. Crea una colección llamada `users` (si no existe)
3. Agrega un documento con el **UID del usuario** como ID
4. Agrega los siguientes campos:

| Campo | Tipo | Valor de ejemplo |
|-------|------|------------------|
| userName | string | "Admin User" |
| email | string | "admin@example.com" |
| permissions | map | Ver estructura abajo |
| createdAt | timestamp | (usar timestamp actual) |
| updatedAt | timestamp | (usar timestamp actual) |

**Estructura del campo `permissions` (tipo map):**

| Campo | Tipo | Descripción |
|-------|------|-------------|
| canViewTopoquizz | boolean | Permite ver Topoquizz |
| canEditTopoquizz | boolean | Permite editar Topoquizz |
| canDeleteTopoquizz | boolean | Permite eliminar en Topoquizz |
| canViewNeurapp | boolean | Permite ver Neurapp |
| canEditNeurapp | boolean | Permite editar Neurapp |
| canDeleteNeurapp | boolean | Permite eliminar en Neurapp |

## 3. Ejemplo de uso en la aplicación

### Verificar permisos en un componente:

```tsx
'use client'

import { useAuthContext } from '@/contexts/AuthContext'
import { hasPermission } from '@/lib/firebase/auth'

export default function MyComponent() {
  const { userData, loading } = useAuthContext()

  if (loading) return <div>Cargando...</div>

  if (!userData) return <div>No autenticado</div>

  const canEdit = hasPermission(userData.permissions, 'canEditTopoquizz')

  return (
    <div>
      <h1>Bienvenido {userData.userName}</h1>
      {canEdit && <button>Editar</button>}
    </div>
  )
}
```

### Usar el hook useAuth para login/logout:

```tsx
'use client'

import { useAuth } from '@/app/hooks/useAuth'

export default function MyComponent() {
  const { login, logout, loading } = useAuth()

  const handleLogin = async () => {
    try {
      await login('user@example.com', 'password123')
      // Redirige automáticamente a /topoquizz
    } catch (error) {
      console.error('Error:', error)
    }
  }

  const handleLogout = async () => {
    try {
      await logout()
      // Redirige automáticamente a /login
    } catch (error) {
      console.error('Error:', error)
    }
  }

  return (
    <div>
      <button onClick={handleLogin} disabled={loading}>
        Login
      </button>
      <button onClick={handleLogout} disabled={loading}>
        Logout
      </button>
    </div>
  )
}
```

## 4. Proteger rutas

Para proteger rutas y verificar autenticación, puedes crear un componente de protección:

```tsx
'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthContext } from '@/contexts/AuthContext'

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuthContext()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login')
    }
  }, [user, loading, router])

  if (loading) return <div>Cargando...</div>

  if (!user) return null

  return <>{children}</>
}
```

## 5. Notas importantes

- El **UID del usuario en Authentication** debe coincidir con el **ID del documento en Firestore**
- Asegúrate de que las variables de entorno de Firebase estén configuradas correctamente en `.env.local`
- Los permisos son opcionales, si no se especifica un permiso, se considera como `false`
- Los timestamps se manejan automáticamente con los helpers de Firestore

## 6. Variables de entorno requeridas

Asegúrate de tener estas variables en tu archivo `.env.local`:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=tu-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=tu-auth-domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=tu-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=tu-storage-bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=tu-sender-id
NEXT_PUBLIC_FIREBASE_APP_ID=tu-app-id
```
