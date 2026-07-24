# 🚀 Backend - Sistema de Gestión de Reputación de Candidatos

## 📋 Descripción

Backend completo con:
- ✅ Autenticación con Google OAuth
- ✅ Integración de APIs de código abierto para escucha social
- ✅ Firebase Realtime Database
- ✅ Análisis de reputación avanzado

## 🛠️ Instalación

### 1. Requisitos
- Node.js 16+
- npm o yarn
- Cuenta de Firebase
- Google Cloud Project

### 2. Configurar credenciales

Copia `.env.example` a `.env` y configura:

```bash
cp .env.example .env
```

Completa los valores:
- `GOOGLE_PROJECT_ID` - Tu proyecto de Firebase
- `GOOGLE_PRIVATE_KEY` - Clave privada de Firebase
- `GOOGLE_CLIENT_EMAIL` - Email de Firebase
- `GOOGLE_CLIENT_ID` - Client ID de Google
- `NEWSAPI_KEY` - Token de NewsAPI
- `GITHUB_TOKEN` - Token de GitHub

### 3. Instalar dependencias

```bash
npm install
```

### 4. Iniciar servidor

```bash
# Desarrollo
npm run dev

# Producción
npm start
```

## 📡 APIs Integradas

### 1. **GitHub API** - Código abierto
- Búsqueda de usuarios
- Análisis de repositorios
- Métricas de contribución

### 2. **NewsAPI** - Noticias públicas
- Búsqueda de artículos sobre candidatos
- Análisis de menciones en prensa

### 3. **Archive.org API** - Historial web
- Búsqueda de snapshots históricos
- Análisis de sitios web antiguos

### 4. **Mastodon API** - Red social federada
- Búsqueda de cuentas
- Análisis de perfiles
- Extracción de datos públicos

### 5. **Google Firebase** - Base de datos
- Almacenamiento de candidatos
- Gestión de usuarios
- Análisis social almacenados

## 🔐 Autenticación

### Flujo Google OAuth 2.0

```
Cliente → Google Sign-In → Backend → Firebase Auth → JWT
```

### Headers requeridos

```
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json
```

## 📚 Endpoints Principales

### Autenticación
```
POST   /api/auth/google        - Login con Google
POST   /api/auth/logout         - Cerrar sesión
POST   /api/auth/refresh-token  - Refrescar JWT
```

### Usuarios
```
GET    /api/users/profile       - Obtener perfil
PUT    /api/users/profile       - Actualizar perfil
GET    /api/users/stats         - Estadísticas del usuario
```

### Candidatos
```
POST   /api/candidatos          - Crear candidato
GET    /api/candidatos          - Listar candidatos
GET    /api/candidatos/:id      - Obtener candidato
PUT    /api/candidatos/:id      - Actualizar candidato
DELETE /api/candidatos/:id      - Eliminar candidato
```

### Escucha Social
```
POST   /api/social-listening/analyze   - Analizar presencia social
GET    /api/social-listening/history   - Historial de análisis
```

## 📊 Estructura de Datos Firebase

```
reputacion-db/
├── users/
│   └── {uid}/
│       ├── email
│       ├── name
│       ├── picture
│       ├── rol
│       ├── createdAt
│       └── premium
├── candidatos/
│   └── {uid}/
│       └── {candidatoId}/
│           ├── nombre
│           ├── email
│           ├── especialidad
│           ├── puntuaciones
│           └── timestamps
└── analisisSociales/
    └── {uid}/
        └── {analisisId}/
            ├── candidato
            ├── resultados
            └── timestamp
```

## 🔄 Flujo de Análisis Social

1. Usuario inicia análisis desde frontend
2. Backend recibe solicitud con nombre/email
3. Ejecuta búsquedas en paralelo:
   - GitHub API
   - NewsAPI
   - Archive.org
   - Mastodon
   - Web Analysis
4. Agrega resultados
5. Calcula scores ponderados
6. Guarda en Firebase
7. Retorna análisis completo

## 🎯 Puntuación de Reputación

```
Score General = (Score Técnico × 40%) + (Score Social × 60%)

Score Social = 
  (GitHub × 35%) +
  (Noticias × 25%) +
  (Mastodon × 20%) +
  (Archive × 20%)
```

## 🚨 Manejo de Errores

Todos los endpoints retornan:

```json
{
  "success": true/false,
  "message": "Descripción",
  "data": {}
}
```

## 🔒 Seguridad

- ✅ CORS habilitado
- ✅ Rate limiting (100 req/15min)
- ✅ Helmet.js para headers seguros
- ✅ Compresión gzip
- ✅ JWT con expiración
- ✅ Validación de entrada

## 📈 Escalabilidad

Para producción:
- Usar Cloud Run de Google
- Firestore en lugar de Realtime Database
- CDN para assets estáticos
- Caché con Redis
- Monitoreo con Cloud Monitoring

## 🐛 Testing

```bash
# Verificar health
curl http://localhost:5000/api/health

# Analizar candidato (requiere auth)
curl -X POST http://localhost:5000/api/social-listening/analyze \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"nombre": "Juan García"}'
```

## 📝 Variables de Entorno

Ver `.env.example` para referencia completa.

## 🤝 Contribuciones

Este es un proyecto open source. Las contribuciones son bienvenidas.

## 📄 Licencia

MIT
