import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import admin from 'firebase-admin';

// Importar rutas
import authRoutes from './backend/routes/auth.js';
import candidatosRoutes from './backend/routes/candidatos.js';
import socialListeningRoutes from './backend/routes/socialListening.js';
import usersRoutes from './backend/routes/users.js';

// Configurar variables de entorno
dotenv.config();

// Inicializar Express
const app = express();
const PORT = process.env.PORT || 5000;

// ==================== MIDDLEWARE DE SEGURIDAD ====================
app.use(helmet());
app.use(compression());

// CORS Configuration
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 100 // límite de 100 requests por windowMs
});

app.use(limiter);

// Body Parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// ==================== INICIALIZAR FIREBASE ====================
if (!admin.apps.length) {
    try {
        admin.initializeApp({
            projectId: process.env.GOOGLE_PROJECT_ID,
            privateKey: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
            clientEmail: process.env.GOOGLE_CLIENT_EMAIL,
            databaseURL: process.env.FIREBASE_DATABASE_URL
        });
        console.log('✅ Firebase inicializado correctamente');
    } catch (error) {
        console.error('❌ Error al inicializar Firebase:', error);
    }
}

const db = admin.database();
export { db, admin };

// ==================== RUTAS ====================

// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: '✅ Servidor activo', timestamp: new Date() });
});

// Rutas de autenticación
app.use('/api/auth', authRoutes);

// Rutas de usuarios
app.use('/api/users', usersRoutes);

// Rutas de candidatos
app.use('/api/candidatos', candidatosRoutes);

// Rutas de escucha social
app.use('/api/social-listening', socialListeningRoutes);

// ==================== MANEJO DE ERRORES ====================

// 404 Handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: 'Ruta no encontrada',
        path: req.path
    });
});

// Error Handler
app.use((error, req, res, next) => {
    console.error('❌ Error:', error);
    res.status(error.status || 500).json({
        success: false,
        message: error.message || 'Error interno del servidor',
        ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
    });
});

// ==================== INICIAR SERVIDOR ====================
app.listen(PORT, () => {
    console.log(`
🚀 Servidor iniciado en puerto ${PORT}`);
    console.log(`📍 URL: http://localhost:${PORT}`);
    console.log(`🔗 API Health: http://localhost:${PORT}/api/health`);
    console.log(`\n📚 Endpoints disponibles:`);
    console.log(`  POST   /api/auth/google - Autenticación con Google`);
    console.log(`  POST   /api/auth/logout - Logout`);
    console.log(`  GET    /api/users/profile - Obtener perfil`);
    console.log(`  POST   /api/candidatos - Crear candidato`);
    console.log(`  GET    /api/candidatos - Listar candidatos`);
    console.log(`  POST   /api/social-listening/analyze - Análisis social`);
    console.log(`\n`);
});

export default app;
