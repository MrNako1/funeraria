# Funerarias Asociadas - Documentación

## Descripción

Este sistema permite mostrar información de las funerarias asociadas en la página de usuario, incluyendo un carrusel interactivo y información de contacto detallada.

## Componentes Creados

### 1. FuneralHomesCarousel.tsx
Componente principal que muestra:
- Carrusel automático con imágenes de las funerarias
- Navegación manual con botones de anterior/siguiente
- Indicadores de posición
- Controles de reproducción/pausa
- Lista resumida de todas las funerarias
- Información de contacto detallada

### 2. FuneralHomeImage.tsx
Componente de imagen placeholder que:
- Genera imágenes de fondo con colores basados en el nombre
- Muestra las iniciales de la funeraria
- Se adapta automáticamente al tamaño del contenedor

### 3. FuneralHomeContact.tsx
Componente de información de contacto que:
- Muestra información básica (nombre, dirección, teléfono)
- Permite expandir para ver detalles adicionales
- Incluye enlaces directos para llamar y visitar sitio web
- Lista servicios disponibles
- Horarios de atención

## Características del Carrusel

### Funcionalidades
- **Reproducción automática**: Cambia de imagen cada 5 segundos
- **Navegación manual**: Botones de anterior/siguiente
- **Indicadores**: Puntos que muestran la posición actual
- **Controles**: Botón para pausar/reproducir
- **Responsive**: Se adapta a diferentes tamaños de pantalla

### Interactividad
- Click en indicadores para ir a una imagen específica
- Click en lista de funerarias para ir a esa imagen
- Hover effects en botones y elementos
- Transiciones suaves entre imágenes

## Datos de las Funerarias

### Información Incluida
- Nombre de la funeraria
- Descripción de servicios
- Dirección física
- Número de teléfono
- Sitio web (opcional)
- Email de contacto
- Servicios específicos
- Horarios de atención

### Funerarias Configuradas
1. **Funeraria San José** - 30+ años de experiencia
2. **Funeraria La Paz** - Servicios personalizados
3. **Funeraria Santa María** - Atención 24 horas
4. **Funeraria El Descanso** - Servicios tradicionales
5. **Funeraria Los Ángeles** - Instalaciones modernas

## Personalización

### Agregar Nueva Funeraria
1. Editar el array `funeralHomes` en `FuneralHomesCarousel.tsx`
2. Agregar datos adicionales en `funeralHomeDetails`
3. Opcional: Agregar imagen real en `/public/images/`

### Modificar Información
- Editar los datos en los arrays correspondientes
- Los cambios se reflejan automáticamente en el carrusel
- No requiere reinicio del servidor

### Cambiar Colores
- Modificar el array `colors` en `FuneralHomeImage.tsx`
- Los colores se asignan automáticamente basados en el nombre

## Integración

### En la Página de Usuario
El carrusel se integra automáticamente en `/user/page.tsx` y se muestra al final de la página.

### En Otras Páginas
Para usar en otras páginas, importar y usar:
```tsx
import FuneralHomesCarousel from '@/components/FuneralHomesCarousel';

// En el JSX
<FuneralHomesCarousel />
```

## Responsive Design

### Breakpoints
- **Mobile**: 1 columna para lista de funerarias
- **Tablet**: 2 columnas para información de contacto
- **Desktop**: 3 columnas para lista, 2 para contacto detallado

### Adaptaciones
- Imágenes se ajustan automáticamente
- Botones de navegación se mantienen accesibles
- Texto se adapta al tamaño de pantalla

## Accesibilidad

### Características
- Navegación por teclado
- Textos alternativos en imágenes
- Contraste adecuado en colores
- Tamaños de fuente legibles
- Enlaces descriptivos

## Mantenimiento

### Actualizaciones
- Agregar nuevas funerarias editando los arrays
- Modificar información existente directamente en el código
- Cambiar estilos editando las clases de Tailwind

### Imágenes Reales
Para usar imágenes reales:
1. Colocar imágenes en `/public/images/`
2. Actualizar las rutas en el array `funeralHomes`
3. Comentar o eliminar el componente `FuneralHomeImage`

## Notas Técnicas

### Dependencias
- React hooks (useState, useEffect)
- Heroicons para iconos
- Tailwind CSS para estilos

### Performance
- Lazy loading de imágenes (cuando se usen reales)
- Optimización de re-renders
- Memoización de componentes si es necesario

### SEO
- Títulos descriptivos
- Meta información en imágenes
- Enlaces semánticos 