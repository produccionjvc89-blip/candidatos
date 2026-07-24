import jwt from 'jsonwebtoken';
import admin from 'firebase-admin';

/**
 * Middleware para verificar JWT
 */
export const verifyToken = async (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        
        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'Token no proporcionado'
            });
        }

        // Verificar token JWT
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.userId = decoded.userId;
        req.userEmail = decoded.email;
        
        next();
    } catch (error) {
        console.error('❌ Error al verificar token:', error);
        res.status(401).json({
            success: false,
            message: 'Token inválido o expirado'
        });
    }
};

/**
 * Middleware para verificar autenticación con Firebase
 */
export const verifyFirebaseToken = async (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        
        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'Token no proporcionado'
            });
        }

        // Verificar con Firebase
        const decodedToken = await admin.auth().verifyIdToken(token);
        req.userId = decodedToken.uid;
        req.userEmail = decodedToken.email;
        
        next();
    } catch (error) {
        console.error('❌ Error al verificar Firebase token:', error);
        res.status(401).json({
            success: false,
            message: 'Autenticación fallida'
        });
    }
};

/**
 * Middleware para validar datos
 */
export const validateEmail = (req, res, next) => {
    const email = req.body.email;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    if (!emailRegex.test(email)) {
        return res.status(400).json({
            success: false,
            message: 'Email inválido'
        });
    }
    
    next();
};
