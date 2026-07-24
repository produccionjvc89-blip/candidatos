/**
 * Calcula el score de escucha social del candidato basado en análisis social
 */
export function calcularScoreSocialDesdeAnalisis(analisisData) {
    let puntuaciones = {};

    // GitHub Score
    if (analisisData.github && !analisisData.github.error) {
        const github = analisisData.github;
        puntuaciones.github = Math.min(
            ((github.seguidores / 1000) + (github.repositoriosPublicos / 100)) / 2 * 100,
            100
        );
    }

    // News Score
    if (analisisData.noticias && !analisisData.noticias.error) {
        const noticias = analisisData.noticias;
        puntuaciones.noticias = Math.min((noticias.totalArticulos / 50) * 100, 100);
    }

    // Mastodon Score
    if (analisisData.mastodon && !analisisData.mastodon.error) {
        const mastodon = analisisData.mastodon;
        if (mastodon.cuentas && mastodon.cuentas.length > 0) {
            const cuenta = mastodon.cuentas[0];
            puntuaciones.mastodon = Math.min(
                ((cuenta.seguidores / 1000) + (cuenta.notas / 500)) / 2 * 100,
                100
            );
        }
    }

    // Archive Score
    if (analisisData.archive && !analisisData.archive.error) {
        const archive = analisisData.archive;
        puntuaciones.archive = Math.min((archive.sitiosEncontrados / 5) * 100, 100);
    }

    // Calcular promedio ponderado
    const pesos = {
        github: 0.35,
        noticias: 0.25,
        mastodon: 0.20,
        archive: 0.20
    };

    let scoreTotal = 0;
    let totalPesos = 0;

    Object.keys(pesos).forEach(key => {
        if (puntuaciones[key]) {
            scoreTotal += puntuaciones[key] * pesos[key];
            totalPesos += pesos[key];
        }
    });

    return {
        scoreTotal: totalPesos > 0 ? Math.round((scoreTotal / totalPesos) * 100) / 100 : 0,
        detalles: puntuaciones
    };
}

/**
 * Generar reporte de reputación
 */
export function generarReporte(candidato, analisisData, scoreTecnico) {
    const scoreSocial = calcularScoreSocialDesdeAnalisis(analisisData);

    const scoreGeneral = (scoreTecnico * 0.40) + (scoreSocial.scoreTotal * 0.60);

    return {
        candidato: candidato.nombre,
        scoreTecnico,
        scoreSocial: scoreSocial.scoreTotal,
        scoreGeneral: Math.round(scoreGeneral * 100) / 100,
        nivel: scoreGeneral >= 80 ? 'Alto' : scoreGeneral >= 60 ? 'Medio' : 'Bajo',
        detallesSocial: scoreSocial.detalles,
        recomendacion: generarRecomendacion(scoreGeneral),
        timestamp: new Date().toISOString()
    };
}

/**
 * Generar recomendación basada en el score
 */
function generarRecomendacion(score) {
    if (score >= 80) {
        return '✅ Candidato recomendado - Excelente reputación y presencia social';
    } else if (score >= 60) {
        return '⚠️ Candidato potencial - Buen perfil pero con oportunidades de mejora';
    } else {
        return '❌ Revisar - Reputación limitada o presencia social débil';
    }
}
