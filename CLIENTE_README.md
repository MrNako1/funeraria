# Vista de Clientes - Funeraria

## Descripción

Se ha implementado una vista específica para usuarios con rol "cliente" que incluye un dashboard personalizado con las siguientes funcionalidades:

- **Crear Plantilla**: Diseñar plantillas personalizadas para memoriales
- **Seres Queridos**: Gestionar el registro de seres queridos
- **Buscar Memoriales**: Encontrar memoriales existentes

## Características Implementadas

### 1. Navbar Personalizado para Clientes
- Los usuarios con rol "cliente" ven un navbar específico
- El enlace "Inicio" los lleva a `/cliente` (dashboard de cliente)
- Se muestra "Cliente" en el perfil de usuario

### 2. Dashboard de Cliente (`/cliente`)
- Página exclusiva para usuarios con rol "cliente"
- Cards interactivos para acceder a las funcionalidades principales
- Información contextual sobre cada función
- Diseño responsive y moderno

### 3. Redirección Automática
- Los usuarios con rol "cliente" son redirigidos automáticamente a su dashboard
- Los usuarios con rol "admin" son redirigidos a `/admin`
- Los usuarios con rol "user" permanecen en la página principal

## Cómo Asignar Rol Cliente

### Opción 1: Usando el archivo batch
```bash
# Asignar rol cliente a un usuario específico
assign-cliente-role.bat "usuario@email.com"

# Listar todos los usuarios disponibles
assign-cliente-role.bat
```

### Opción 2: Usando Node.js directamente
```bash
# Asignar rol cliente a un usuario específico
node scripts/assign-cliente-role.js "usuario@email.com"

# Listar todos los usuarios disponibles
node scripts/assign-cliente-role.js
```

## Estructura de Archivos

```
src/
├── app/
│   └── cliente/
│       └── page.tsx          # Dashboard de cliente
├── components/
│   ├── Navbar.tsx           # Navbar con lógica de roles
│   └── RoleRedirect.tsx     # Componente de redirección automática
└── hooks/
    └── useRole.ts           # Hook para manejar roles

scripts/
└── assign-cliente-role.js   # Script para asignar rol cliente

assign-cliente-role.bat      # Archivo batch para facilitar el uso
```

## Flujo de Usuario

1. **Registro/Login**: El usuario se registra o inicia sesión
2. **Asignación de Rol**: Se asigna el rol "cliente" usando los scripts
3. **Redirección Automática**: Al acceder a la aplicación, es redirigido a `/cliente`
4. **Dashboard Personalizado**: Ve las opciones específicas para clientes
5. **Navegación**: Puede acceder a crear plantillas, gestionar seres queridos y buscar memoriales

## Funcionalidades Disponibles para Clientes

### Crear Plantilla (`/crear-plantilla`)
- Diseñar plantillas personalizadas
- Diferentes estilos y opciones
- Vista previa en tiempo real

### Seres Queridos (`/seres-queridos`)
- Registrar información de seres queridos
- Gestionar memoriales asociados
- Organizar por categorías

### Buscar Memoriales (`/buscar`)
- Búsqueda por diferentes criterios
- Filtros avanzados
- Vista de resultados organizada

## Notas Técnicas

- El sistema utiliza el hook `useRole` para detectar el rol del usuario
- La redirección se maneja automáticamente con el componente `RoleRedirect`
- El navbar se adapta dinámicamente según el rol del usuario
- Todas las páginas están protegidas y requieren autenticación

## Próximos Pasos

- [ ] Implementar funcionalidad completa de crear plantillas
- [ ] Desarrollar gestión completa de seres queridos
- [ ] Mejorar la búsqueda de memoriales
- [ ] Agregar más opciones de personalización
- [ ] Implementar sistema de notificaciones para clientes 