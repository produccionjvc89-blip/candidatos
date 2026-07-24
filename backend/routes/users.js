import express from 'express';
import { verifyToken } from '../middleware/auth.js';
import { db } from '../../server.js';

const router = express.Router();

/**
 * GET /api/users/profile
 * Obtener perfil del usuario
 */
router.get('/profile', verifyToken, async (req, res) => {
    try {
        const userRef = db.ref(`users/${req.userId}`);
        const userSnapshot = await userRef.once('value');

        if (!userSnapshot.exists()) {
            return res.status(404).json({
                success: false,
                message: 'Usuario no encontrado'
            });
        }

        res.json({
            success: true,
            user: userSnapshot.val()
        });
    } catch (error) {
        console.error('❌ Error:', error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener perfil'
        });
    }
});

/**
 * PUT /api/users/profile
 * Actualizar perfil del usuario
 */
router.put('/profile', verifyToken, async (req, res) => {
    try {
        const { name, picture } = req.body;
        const userRef = db.ref(`users/${req.userId}`);

        await userRef.update({
            name,
            picture,
            updatedAt: new Date().toISOString()
        });

        res.json({
            success: true,
            message: 'Perfil actualizado correctamente'
        });
    } catch (error) {
        console.error('❌ Error:', error);
        res.status(500).json({
            success: false,
            message: 'Error al actualizar perfil'
        });
    }
});

/**
 * GET /api/users/stats
 * Obtener estadísticas del usuario
 */
router.get('/stats', verifyToken, async (req, res) => {
    try {
        const candidatosRef = db.ref(`candidatos/${req.userId}`);
        const candidatosSnapshot = await candidatosRef.once('value');

        const candidatos = candidatosSnapshot.val() || {};
        const totalCandidatos = Object.keys(candidatos).length;

        res.json({
            success: true,
            stats: {
                totalCandidatos,
                ultimaActualizacion: new Date().toISOString()
            }
        });
    } catch (error) {
        console.error('❌ Error:', error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener estadísticas'
        });
    }
});

export default router;
