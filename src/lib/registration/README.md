# Integración de inscripciones

El catálogo de cada idioma está vacío hasta que se publiquen temporadas, requisitos y documentos. La interfaz conserva el borrador y los archivos seleccionados en memoria de React Hook Form. El flujo carece de endpoint de envío. Las rutas de inscripción y reglamentos comparten un proveedor en memoria durante la navegación interna. El recibo de aceptación está vinculado a categoría, temporada, versión y revisiones publicadas. Al integrar el backend, valida y registra allí el recibo como evidencia definitiva.

Para conectar PostgreSQL mediante Prisma:

- Resuelve las temporadas, los estados de apertura, las reglas de numeración y las revisiones de documentos en el servidor. Usa los mismos identificadores entre idiomas.
- Revalida cada etapa en el servidor con los esquemas de Zod. Registra qué revisiones de los documentos aceptó expresamente el participante.
- Encapsula la consulta de dorsales detrás de `NumberAvailabilityQuery`. Verifica y reserva el dorsal de forma transaccional según el ámbito oficial de temporada y categoría al recibir una inscripción. Valida el prefijo y el estado de apertura con los valores del servidor.
- Vincula las referencias a documentos a la inscripción tras habilitar la recepción segura, el control de acceso y la validación de archivos en el servidor.
