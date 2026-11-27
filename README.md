# Control Pro

App web (PWA) para control de viajes, pedidos, gastos, gasolina, taller y finanzas diarias.
Funciona sin internet y sincroniza con Firebase (Firestore) al recuperar la señal.

© 2026 Grupo Farav. Todos los derechos reservados.

## Publicación
Netlify publica automáticamente cada cambio en la rama `main` (sin build; directorio de publicación: `.`).

## Archivos
- `index.html` — la app completa.
- `sw.js` — service worker (abrir sin internet). Subir `VERSION` en cada cambio.
- `manifest.json` e íconos — instalación en el teléfono.
- `netlify.toml`, `_redirects`, `_headers` — inicio de sesión con Google por el mismo dominio y caché.
- `firestore.rules` — reglas de seguridad (copia; se publican desde la consola de Firebase).

Los datos del usuario viven en Firestore bajo `users/{uid}/...`; nunca se guardan en este repositorio.
