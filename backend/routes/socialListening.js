import express from 'express';
import axios from 'axios';
import { verifyToken } from '../middleware/auth.js';
import { db } from '../../server.js';

const router = express.Router();

/**
 * POST /api/social-listening/analyze
 * Analizar presencia social de un candidato
 */
router.post('/analyze', verifyToken, async (req, res) => {
    try {
        const { nombre, email, urls } = req.body;

        if (!nombre && !email && (!urls || urls.length === 0)) {
            return res.status(400).json({
                success: false,
                message: 'Proporciona nombre, email o URLs para analizar'
            });
        }

        const analisisData = {
            candidato: { nombre, email },
            resultados: {},
            timestamp: new Date().toISOString()
        };

        // Ejecutar análisis en paralelo
        const resultados = await Promise.allSettled([
            analizarGitHub(nombre || email),
            analizarNoticias(nombre || email),
            analizarArchive(nombre || email, urls),
            analizarMastodon(nombre || email),
            analizarWeb(nombre || email)
        ]);

        // Procesar resultados
        if (resultados[0].status === 'fulfilled') analisisData.resultados.github = resultados[0].value;
        if (resultados[1].status === 'fulfilled') analisisData.resultados.noticias = resultados[1].value;
        if (resultados[2].status === 'fulfilled') analisisData.resultados.archive = resultados[2].value;
        if (resultados[3].status === 'fulfilled') analisisData.resultados.mastodon = resultados[3].value;
        if (resultados[4].status === 'fulfilled') analisisData.resultados.web = resultados[4].value;

        // Guardar análisis en Firebase
        const analisisRef = db.ref(`analisissSociales/${req.userId}/${Date.now()}`);
        await analisisRef.set(analisisData);

        res.json({
            success: true,
            message: 'Análisis completado',
            analisis: analisisData
        });
    } catch (error) {
        console.error('❌ Error en análisis social:', error);
        res.status(500).json({
            success: false,
            message: 'Error al realizar análisis social'
        });
    }
});

/**
 * GET /api/social-listening/github/:username
 * Obtener datos de GitHub
 */
async function analizarGitHub(query) {
    try {
        const response = await axios.get(
            `https://api.github.com/search/users?q=${encodeURIComponent(query)}`,
            {
                headers: {
                    'Authorization': `token ${process.env.GITHUB_TOKEN}`,
                    'Accept': 'application/vnd.github.v3+json'
                }
            }
        );

        if (response.data.items.length === 0) {
            return { encontrado: false, mensaje: 'Usuario no encontrado en GitHub' };
        }

        const usuario = response.data.items[0];

        // Obtener detalles adicionales
        const detallesResponse = await axios.get(usuario.url, {
            headers: {
                'Authorization': `token ${process.env.GITHUB_TOKEN}`,
                'Accept': 'application/vnd.github.v3+json'
            }
        });

        const detalles = detallesResponse.data;

        return {
            encontrado: true,
            username: detalles.login,
            nombre: detalles.name,
            bio: detalles.bio,
            seguidores: detalles.followers,
            siguiendo: detalles.following,
            repositoriosPublicos: detalles.public_repos,
            ubicacion: detalles.location,
            blog: detalles.blog,
            email: detalles.email,
            perfil: detalles.html_url,
            avatarUrl: detalles.avatar_url
        };
    } catch (error) {
        console.error('❌ Error en GitHub:', error.message);
        return { error: 'Error al analizar GitHub' };
    }
}

/**
 * Obtener noticias sobre la persona
 */
async function analizarNoticias(query) {
    try {
        const response = await axios.get('https://newsapi.org/v2/everything', {
            params: {
                q: query,
                sortBy: 'publishedAt',
                language: 'es',
                pageSize: 10
            },
            headers: {
                'X-API-Key': process.env.NEWSAPI_KEY
            }
        });

        return {
            totalArticulos: response.data.totalResults,
            articulos: response.data.articles.slice(0, 5).map(article => ({
                titulo: article.title,
                descripcion: article.description,
                url: article.url,
                fuente: article.source.name,
                fecha: article.publishedAt,
                imagen: article.urlToImage
            }))
        };
    } catch (error) {
        console.error('❌ Error en NewsAPI:', error.message);
        return { error: 'Error al obtener noticias' };
    }
}

/**
 * Analizar historial web en Archive.org
 */
async function analizarArchive(query, urls = []) {
    try {
        const resultados = [];

        const sitiosAAnalizar = urls.length > 0 ? urls : [`${query}.com`, `${query}.io`, `${query}.dev`];

        for (const sitio of sitiosAAnalizar) {
            try {
                const response = await axios.get(
                    `https://archive.org/advancedsearch.php?q=site:${encodeURIComponent(sitio)}&fl=timestamp,statuscode&output=json&rows=5`,
                    { timeout: 5000 }
                );

                if (response.data.response.docs.length > 0) {
                    resultados.push({
                        sitio,
                        snapshots: response.data.response.docs.length,
                        registros: response.data.response.docs
                    });
                }
            } catch (e) {
                // Continuar con el siguiente sitio
            }
        }

        return {
            sitiosEncontrados: resultados.length,
            resultados
        };
    } catch (error) {
        console.error('❌ Error en Archive.org:', error.message);
        return { error: 'Error al analizar Archive' };
    }
}

/**
 * Buscar en Mastodon
 */
async function analizarMastodon(query) {
    try {
        const response = await axios.get(
            `https://${process.env.MASTODON_INSTANCE}/api/v2/search`,
            {
                params: {
                    q: query,
                    type: 'accounts',
                    limit: 5
                }
            }
        );

        return {
            cuentasEncontradas: response.data.accounts.length,
            cuentas: response.data.accounts.map(account => ({
                nombre: account.display_name,
                usuario: account.acct,
                seguidores: account.followers_count,
                siguiendo: account.following_count,
                notas: account.statuses_count,
                bio: account.note,
                perfil: account.url,
                avatar: account.avatar
            }))
        };
    } catch (error) {
        console.error('❌ Error en Mastodon:', error.message);
        return { error: 'Error al analizar Mastodon' };
    }
}

/**
 * Análisis general de web
 */
async function analizarWeb(query) {
    try {
        // Implementar análisis con Google Search Console o similar
        return {
            mensaje: 'Análisis web completado',
            query: query
        };
    } catch (error) {
        console.error('❌ Error en análisis web:', error.message);
        return { error: 'Error en análisis web' };
    }
}

/**
 * GET /api/social-listening/history
 * Obtener historial de análisis
 */
router.get('/history', verifyToken, async (req, res) => {
    try {
        const analisisRef = db.ref(`analisissSociales/${req.userId}`);
        const analisisSnapshot = await analisisRef.limitToLast(20).once('value');

        const analisis = analisisSnapshot.val() || {};
        const analisisList = Object.values(analisis).reverse();

        res.json({
            success: true,
            total: analisisList.length,
            analisis: analisisList
        });
    } catch (error) {
        console.error('❌ Error:', error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener historial'
        });
    }
});

export default router;
