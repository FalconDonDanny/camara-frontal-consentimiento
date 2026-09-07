# Norte Studio

Proyecto Django listo para desarrollo local.

## Arranque

```powershell
python manage.py migrate
python manage.py runserver
```

Abre http://127.0.0.1:8000/ para ver la portada y `/camara/` para la prueba con consentimiento.

## Publicar gratis en Render

1. Sube esta carpeta a un repositorio privado de GitHub.
2. En Render, crea un Web Service desde ese repositorio.
3. Render detectará `render.yaml` y generará una URL HTTPS.
4. Comparte la URL terminada en `/camara/` únicamente con la persona que haya aceptado participar.

La página no graba ni envía el vídeo. La cámara solo se muestra localmente en el dispositivo que concede el permiso.
