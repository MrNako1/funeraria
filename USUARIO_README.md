# Vista de Usuarios Normales - Funeraria

## Descripción

Se ha implementado una vista específica para usuarios con rol "user" (usuarios normales) que incluye un dashboard personalizado con las siguientes funcionalidades:

- **Inicio**: Página principal del sitio
- **Seres Queridos**: Gestionar el registro de seres queridos
- **Buscar Memoriales**: Encontrar memoriales existentes

## Características Implementadas

### 1. Navbar Personalizado para Usuarios Normales
- Los usuarios con rol "user" ven un navbar específico
- El enlace "Inicio" los lleva a `/user` (dashboard de usuario)
- Se muestra "Usuario" en el perfil de usuario
- Solo incluye las opciones: Inicio, Seres Queridos y Buscar Memoriales

### 2. Dashboard de Usuario (`/user`)
- Página exclusiva para usuarios con rol "user"
- Cards interactivos para acceder a las funcionalidades principales
- Información contextual sobre cada función
- Diseño responsive y moderno
- Acceso rápido a las funciones más importantes

### 3. Redirección Automática
- Los usuarios con rol "user" son redirigidos automáticamente a su dashboard
- Los usuarios con rol "cliente" son redirigidos a `/cliente`
- Los usuarios con rol "admin" son redirigidos a `/admin`

## Funcionalidades Disponibles para Usuarios Normales

### Inicio (`/`)
- Página principal del sitio
- Información general sobre la aplicación
- Navegación básica

### Seres Queridos (`/seres-queridos`)
- Registrar información de seres queridos
- Gestionar memoriales asociados
- Organizar por categorías

### Buscar Memoriales (`/buscar`)
- Búsqueda por diferentes criterios
- Filtros avanzados
- Vista de resultados organizada

## Diferencias con Otros Roles

### Usuario Normal (user)
- **Navbar**: Inicio, Seres Queridos, Buscar Memoriales
- **Dashboard**: `/user`
- **Funcionalidades**: Explorar y gestionar seres queridos

### Cliente (cliente)
- **Navbar**: Inicio, Crear Plantilla, Seres Queridos, Buscar Memoriales
- **Dashboard**: `/cliente`
- **Funcionalidades**: Crear plantillas + explorar y gestionar

### Administrador (admin)
- **Navbar**: Todas las opciones + Administración
- **Dashboard**: `/admin`
- **Funcionalidades**: Gestión completa del sistema

## Estructura de Archivos

```
src/
├── app/
│   ├── user/
│   │   └── page.tsx          # Dashboard de usuario normal
│   └── cliente/
│       └── page.tsx          # Dashboard de cliente
├── components/
│   ├── Navbar.tsx           # Navbar con lógica de roles
│   └── RoleRedirect.tsx     # Componente de redirección automática
└── hooks/
    └── useRole.ts           # Hook para manejar roles
```

## Flujo del Usuario Normal

1. **Registro/Login**: El usuario se registra o inicia sesión
2. **Asignación de Rol**: Se le asigna automáticamente el rol "user" (por defecto)
3. **Redirección Automática**: Al acceder a la aplicación, es redirigido a `/user`
4. **Dashboard Personalizado**: Ve las opciones específicas para usuarios normales
5. **Navegación**: Puede acceder a seres queridos y buscar memoriales

## Características del Dashboard

### Cards Principales
- **Inicio**: Acceso a la página principal
- **Seres Queridos**: Gestión de seres queridos
- **Buscar Memoriales**: Búsqueda de memoriales

### Información Contextual
- Explicación de cada funcionalidad
- Guías de uso
- Acceso rápido a funciones principales

### Acceso Rápido
- Botones directos a las funciones más importantes
- Enlaces destacados para navegación eficiente

## Notas Técnicas

- El sistema utiliza el hook `useRole` para detectar el rol del usuario
- La redirección se maneja automáticamente con el componente `RoleRedirect`
- El navbar se adapta dinámicamente según el rol del usuario
- Todas las páginas están protegidas y requieren autenticación

## Próximos Pasos

- [ ] Implementar funcionalidad completa de seres queridos
- [ ] Mejorar la búsqueda de memoriales
- [ ] Agregar más opciones de personalización
- [ ] Implementar sistema de notificaciones para usuarios
- [ ] Agregar funcionalidad de favoritos 