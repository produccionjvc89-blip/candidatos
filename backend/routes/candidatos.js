import express from 'express';
import { verifyToken } from '../middleware/auth.js';
import { db } from '../../server.js';

const router = express.Router();

/**
 * POST /api/candidatos
 * Crear nuevo candidato
 */
router.post('/', verifyToken, async (req, res) => {
    try {
        const candidatoData = req.body;
        const candidatoId = Date.now().toString();

        const candidatoRef = db.ref(`candidatos/${req.userId}/${candidatoId}`);
        
        await candidatoRef.set({
            id: candidatoId,
            ...candidatoData,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        });

        res.json({
            success: true,
            message: 'Candidato creado correctamente',
            candidato: {
                id: candidatoId,
                ...candidatoData
            }
        });
    } catch (error) {
        console.error('❌ Error:', error);
        res.status(500).json({
            success: false,
            message: 'Error al crear candidato'
        });
    }
});

/**
 * GET /api/candidatos
 * Listar candidatos del usuario
 */
router.get('/', verifyToken, async (req, res) => {
    try {
        const candidatosRef = db.ref(`candidatos/${req.userId}`);
        const candidatosSnapshot = await candidatosRef.once('value');

        const candidatos = candidatosSnapshot.val() || {};
        const candidatosList = Object.values(candidatos);

        res.json({
            success: true,
            total: candidatosList.length,
            candidatos: candidatosList
        });
    } catch (error) {
        console.error('❌ Error:', error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener candidatos'
        });
    }
});

/**
 * GET /api/candidatos/:id
 * Obtener candidato específico
 */
router.get('/:id', verifyToken, async (req, res) => {
    try {
        const candidatoRef = db.ref(`candidatos/${req.userId}/${req.params.id}`);
        const candidatoSnapshot = await candidatoRef.once('value');

        if (!candidatoSnapshot.exists()) {
            return res.status(404).json({
                success: false,
                message: 'Candidato no encontrado'
            });
        }

        res.json({
            success: true,
            candidato: candidatoSnapshot.val()
        });
    } catch (error) {
        console.error('❌ Error:', error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener candidato'
        });
    }
});

/**
 * PUT /api/candidatos/:id
 * Actualizar candidato
 */
router.put('/:id', verifyToken, async (req, res) => {
    try {
        const candidatoRef = db.ref(`candidatos/${req.userId}/${req.params.id}`);
        
        await candidatoRef.update({
            ...req.body,
            updatedAt: new Date().toISOString()
        });

        res.json({
            success: true,
            message: 'Candidato actualizado correctamente'
        });
    } catch (error) {
        console.error('❌ Error:', error);
        res.status(500).json({
            success: false,
            message: 'Error al actualizar candidato'
        });
    }
});

/**
 * DELETE /api/candidatos/:id
 * Eliminar candidato
 */
router.delete('/:id', verifyToken, async (req, res) => {
    try {
        const candidatoRef = db.ref(`candidatos/${req.userId}/${req.params.id}`);
        
        await candidatoRef.remove();

        res.json({
            success: true,
            message: 'Candidato eliminado correctamente'
        });
    } catch (error) {
        console.error('❌ Error:', error);
        res.status(500).json({
            success: false,
            message: 'Error al eliminar candidato'
        });
    }
});

export default router;
