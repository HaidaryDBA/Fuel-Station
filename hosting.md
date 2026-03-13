# Railway Hosting Guide (Backend + Frontend)

This repo deploys as two Railway services using separate Dockerfiles.

**Services**
1. `backend` (Django)
1. `frontend` (Vite build served by Nginx)

**Railway setup**
1. Create a new Railway project from this repo.
1. Add two services from the same repo.
1. For the backend service, set `RAILWAY_DOCKERFILE_PATH=Backend/foundation/Dockerfile`.
1. If your Railway service root directory is `Backend`, use `RAILWAY_DOCKERFILE_PATH=foundation/Dockerfile` instead.
1. For the frontend service, set `RAILWAY_DOCKERFILE_PATH=front/Dockerfile`.

**Backend (Django) variables**
Set these service variables in Railway:
1. `SECRET_KEY` = strong random string.
1. `DEBUG` = `false`.
1. `ALLOWED_HOSTS` = comma-separated hosts, for example: `your-backend.up.railway.app`.
1. `CSRF_TRUSTED_ORIGINS` = comma-separated origins, for example: `https://your-frontend.up.railway.app`.
1. `CORS_ALLOWED_ORIGINS` = comma-separated origins, for example: `https://your-frontend.up.railway.app`.
1. `CORS_ALLOW_ALL_ORIGINS` = `false` (recommended in production).
1. `AUTH_COOKIE_SAMESITE` = `None` if frontend is on a different domain.
1. `AUTH_COOKIE_SECURE` = `true` (required when `AUTH_COOKIE_SAMESITE=None`).
1. `DATABASE_URL` = Railway Postgres connection string.
1. `MEDIA_ROOT` = `/app/media`.
1. `SERVE_MEDIA` = `true` if you want Django to serve media directly.
1. Email settings (optional): `EMAIL_HOST`, `EMAIL_PORT`, `EMAIL_USE_TLS`, `EMAIL_HOST_USER`, `EMAIL_HOST_PASSWORD`, `DEFAULT_FROM_EMAIL`.

**Default superuser variables**
Set these service variables to create a default admin on deploy:
1. `DJANGO_SUPERUSER_USERNAME`
1. `DJANGO_SUPERUSER_EMAIL` (optional)
1. `DJANGO_SUPERUSER_PASSWORD`
1. `DJANGO_SUPERUSER_ROLE` (optional, default: `admin`)

**Postgres**
1. Add a Railway Postgres service.
1. Connect it to `backend` and copy the provided `DATABASE_URL` to the backend service variables.

**Volume for media**
1. Add a Railway volume to the backend service.
1. Mount it at `/app/media`.

**Backend pre-deploy command**
1. Set the Railway pre-deploy command to:
   `python manage.py migrate && python manage.py create_default_superuser`

**Frontend (Vite) variables**
1. `VITE_API_BASE_URL` = `https://<your-backend-domain>/api`.

**Healthcheck**
1. Optional: set Railway healthcheck path to `/health/` on the backend service.

**Local Docker build (optional)**
1. Backend: `docker build -f Backend/foundation/Dockerfile -t fuel-backend Backend`
1. Frontend: `docker build --build-arg VITE_API_BASE_URL=http://localhost:8000/api -t fuel-frontend front`
