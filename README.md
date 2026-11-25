# MFG | Portal deportivo

Portal independiente inspirado en MF Ghost y Subaru and Subaru, en español.

## Desarrollo local

Requiere Node.js 20.9 o posterior.

```sh
npm install
npm run dev
```

Usa la URL que imprime Next.js. Para seleccionar otro puerto, ejecuta `npm run dev -- --port 3001`.

## Verificación

```sh
npm run lint
npm run build
```

Las páginas públicas se generan con App Router. Las etiquetas y descripciones se centralizan en `src/lib/portal.ts`. Las secciones deportivas muestran estados vacíos hasta que haya información para publicar.

## Imágenes

Guarda los archivos locales en `public/media/`. Asigna `image` a cada diapositiva en `src/components/hero-carousel.tsx` e `image` y `logo` a las tarjetas de división. Usa el formato `{ src: "/media/archivo.webp", alt: "Descripción de la imagen" }`.

El calendario, la sección de noticias y las tablas se nutren de las colecciones locales de `src/lib/competition.ts`. Añade contenido confirmado con las fechas y enlaces de cada entrada. La interfaz está en español y los indicadores JP y EN quedan pendientes de traducción.

## Idiomas y rutas

Las traducciones de interfaz están en `messages/es.json`, `messages/en.json` y `messages/ja.json`. Las rutas públicas usan los prefijos `/es`, `/en` y `/ja`. Las URL anteriores redirigen según la cookie o el idioma del navegador, con español como alternativa. Configura `NEXT_PUBLIC_SITE_URL` con el origen público al desplegar para generar las URL canónicas y alternas.

## Inscripciones y personal

`/registration` organiza el borrador en seis etapas y requiere temporadas y documentos publicados antes de habilitar los campos personales. `/staff-login` tiene los campos deshabilitados y `/admin` muestra el catálogo de módulos previstos. Las pantallas existen en los tres idiomas y no procesan solicitudes ni credenciales.
