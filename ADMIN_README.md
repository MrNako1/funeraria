# Panel de Administración - Funeraria

## Descripción

El panel de administración permite a los usuarios con rol de administrador gestionar todos los usuarios registrados en la plataforma. Esta funcionalidad incluye visualización de estadísticas, gestión de roles y eliminación de usuarios.

## Características

### 🔐 Seguridad
- **Middleware de protección**: Las rutas `/admin/*` están protegidas por middleware que verifica autenticación y permisos de administrador
- **Verificación de roles**: Solo usuarios con rol `admin` pueden acceder al panel
- **Función RPC segura**: Utiliza la función `get_users()` de Supabase que verifica permisos en el servidor

### 📊 Dashboard de Estadísticas
- **Total de usuarios**: Número total de usuarios registrados
- **Administradores**: Usuarios con rol de administrador
- **Usuarios regulares**: Usuarios con rol de usuario
- **Emails verificados**: Usuarios con email confirmado
- **Emails pendientes**: Usuarios sin email verificado
- **Nuevos usuarios**: Usuarios registrados en los últimos 7 días

### 👥 Gestión de Usuarios
- **Lista completa**: Muestra todos los usuarios con información detallada
- **Cambio de roles**: Permite cambiar entre roles `user` y `admin`
- **Eliminación de usuarios**: Elimina usuarios de forma permanente
- **Información detallada**: Muestra nombre, email, fecha de registro, estado de verificación

### 🎨 Interfaz de Usuario
- **Diseño responsivo**: Funciona en dispositivos móviles y de escritorio
- **Notificaciones elegantes**: Sistema de notificaciones con animaciones
- **Navegación integrada**: Enlaces en el navbar para administradores
- **Indicadores visuales**: Badges de colores para diferentes roles y estados

## Estructura de Archivos

```
src/
├── app/
│   └── admin/
│       └── page.tsx                 # Página principal de administración
├── components/
│   ├── admin/
│   │   ├── AdminDashboard.tsx       # Componente de estadísticas
│   │   └── Notification.tsx         # Componente de notificaciones
│   └── Navbar.tsx                   # Navegación con enlaces de admin
├── lib/
│   └── auth-context.tsx             # Contexto de autenticación
└── middleware.ts                    # Protección de rutas
```

## Configuración de Base de Datos

### Función RPC `get_users()`
```sql
-- Verifica permisos de administrador y devuelve usuarios
create or replace function public.get_users()
returns table (
  id uuid,
  email text,
  user_metadata jsonb,
  created_at timestamptz
) 
language plpgsql
security definer
```

### Tabla `user_roles`
```sql
-- Almacena roles de usuarios
create table public.user_roles (
  id uuid references auth.users(id) primary key,
  user_id uuid references auth.users(id),
  role text check (role in ('user', 'admin')) default 'user'
);
```

## Uso

### Acceso al Panel
1. Iniciar sesión con una cuenta de administrador
2. Hacer clic en "Administración" en la barra de navegación
3. O navegar directamente a `/admin`

### Gestión de Usuarios
1. **Ver usuarios**: La lista se carga automáticamente
2. **Cambiar rol**: Seleccionar nuevo rol en el dropdown
3. **Eliminar usuario**: Hacer clic en "Eliminar" y confirmar

### Estadísticas
- Las estadísticas se actualizan automáticamente
- Muestra información en tiempo real
- Incluye métricas de crecimiento y verificación

## Permisos Requeridos

### En Supabase
- **RLS (Row Level Security)**: Habilitado en `user_roles`
- **Políticas**: Solo administradores pueden leer/editar roles
- **Función RPC**: Verifica permisos antes de devolver datos

### En la Aplicación
- **Middleware**: Protege rutas `/admin/*`
- **Contexto de Auth**: Verifica rol de usuario
- **Componentes**: Renderizado condicional basado en permisos

## Notas de Seguridad

1. **Verificación doble**: Permisos verificados tanto en cliente como servidor
2. **Middleware activo**: Protección automática de rutas
3. **Función RPC segura**: Verificación de permisos en base de datos
4. **Contexto de autenticación**: Estado de usuario sincronizado

## Personalización

### Agregar Nuevas Estadísticas
1. Modificar `AdminDashboard.tsx`
2. Agregar nueva métrica en `DashboardStats`
3. Calcular valor en `fetchStats()`
4. Agregar tarjeta en `statCards`

### Agregar Nuevas Acciones
1. Crear función en la página de administración
2. Agregar botón en la tabla de usuarios
3. Implementar lógica de negocio
4. Agregar notificaciones apropiadas

## Troubleshooting

### Error de Permisos
- Verificar que el usuario tenga rol `admin` en `user_roles`
- Comprobar que la función `get_users()` esté creada
- Revisar políticas RLS en Supabase

### Usuarios No Cargados
- Verificar conexión a Supabase
- Revisar logs de consola para errores
- Comprobar que la función RPC devuelva datos

### Problemas de UI
- Verificar que Tailwind CSS esté configurado
- Comprobar que los iconos de Heroicons estén importados
- Revisar que las dependencias estén instaladas 