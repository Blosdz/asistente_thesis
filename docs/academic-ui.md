# Interfaz académica

La navegación de estudiante y profesor comparte `AcademicFrame` y los estilos
de `AcademicShell.css`, basados en `thesis-demo-workspace-glass.html`.

- El encabezado ocupa 64 px y la barra contextual 48 px en escritorio.
- `AcademicFrame` define el nombre y los accesos de cada sección.
- Las vistas con acciones propias usan `<ViewTools>`. Su contenido se coloca
  en la barra contextual mediante un portal de React, conservando el estado y
  los manejadores dentro de la página. Al salir de la vista se retira el portal.
- `academic-content-workspace` reserva el alto disponible para los paneles.
- En móvil la navegación se desplaza horizontalmente y los paneles se apilan.
- Las reglas globales antiguas de glass quedan fuera de `.academic-shell`.
- `buildDocumentPreview` presenta el HTML de la API dentro de un iframe aislado,
  con fondo blanco y márgenes de lectura. No reproduce la paginación exacta de
  Word ni modifica el archivo descargable.

## Verificación manual

1. Abrir `/student/my-thesis`: documento y sugerencias visibles por defecto.
2. Alternar Documento, Vista dividida y Chat con IA; abrir/cerrar sugerencias.
3. Revisar edición manual, carátula, referencias, accesos y descarga DOCX.
4. Abrir `/advisor/thesis`: alternar revisión dividida, documento y sugerencias.
5. Navegar a Documentos o Estudiantes y comprobar que cambia la barra contextual.
6. Repetir en móvil: navegación accesible, paneles desplazables y sin desborde horizontal.

No se agregaron endpoints ni se alteraron los contratos de datos. Las pruebas
visuales con respuestas simuladas no sustituyen la validación de operaciones
de escritura contra el backend real.
