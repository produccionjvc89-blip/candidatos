import express from 'express';
import jwt from 'jsonwebtoken';
import admin from 'firebase-admin';
import { db } from '../../server.js';

const router = express.Router();

/**
 * POST /api/auth/google
 * Autenticación con Google
 */
router.post('/google', async (req, res) => {
    try {
        const { idToken } = req.body;

        if (!idToken) {
            return res.status(400).json({
                success: false,
                message: 'ID Token es requerido'
            });
        }

        // Verificar el token de Google con Firebase
        const decodedToken = await admin.auth().verifyIdToken(idToken);
        
        const { uid, email, name, picture } = decodedToken;

        // Crear o actualizar usuario en Firebase
        const userRef = db.ref(`users/${uid}`);
        const userSnapshot = await userRef.once('value');

        if (!userSnapshot.exists()) {
            // Crear nuevo usuario
            await userRef.set({
                uid,
                email,
                name,
                picture,
                rol: 'user',
                createdAt: new Date().toISOString(),
                premium: false
            });
        }

        // Generar JWT local
        const jwtToken = jwt.sign(
            { userId: uid, email },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRE || '7d' }
        );

        res.json({
            success: true,
            message: 'Autenticación exitosa',
            token: jwtToken,
            user: {
                uid,
                email,
                name,
                picture
            }
        });
    } catch (error) {
        console.error('❌ Error en autenticación Google:', error);
        res.status(401).json({
            success: false,
            message: 'Error en autenticación: ' + error.message
        });
    }
});

/**
 * POST /api/auth/logout
 * Cerrar sesión
 */
router.post('/logout', async (req, res) => {
    try {
        // En cliente, se borra el token del localStorage
        res.json({
            success: true,
            message: 'Sesión cerrada correctamente'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al cerrar sesión'
        });
    }
});

/**
 * POST /api/auth/refresh-token
 * Refrescar token
 */
router.post('/refresh-token', async (req, res) => {
    try {
        const { token } = req.body;

        if (!token) {
            return res.status(400).json({
                success: false,
                message: 'Token requerido'
            });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET, { ignoreExpiration: true });
        
        const newToken = jwt.sign(
            { userId: decoded.userId, email: decoded.email },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRE || '7d' }
        );

        res.json({
            success: true,
            token: newToken
        });
    } catch (error) {
        res.status(401).json({
            success: false,
            message: 'Error al refrescar token'
        });
    }
});

export default router;
