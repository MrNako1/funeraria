export interface Memorial {
  id: string
  primer_nombre: string
  segundo_nombre: string | null
  apellido_paterno: string
  apellido_materno: string | null
  fecha_nacimiento: string
  fecha_fallecimiento: string
  biografia: string
  comentarios: string | null
  logros: string | null
  foto: string | null
} 