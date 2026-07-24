// Base de datos en memoria (se puede reemplazar por backend)
let candidatos = [];
let ordenRankingActual = 'general';

// ==================== INICIALIZACIÓN ====================
document.addEventListener('DOMContentLoaded', () => {
    cargarDatos();
    document.getElementById('formCandidato').addEventListener('submit', agregarCandidato);
    actualizarFiltros();
    actualizarAnalisis();
});

// ==================== GESTIÓN DE TABS ====================
function mostrarTab(tabName) {
    // Ocultar todos los tabs
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.remove('active');
    });
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });

    // Mostrar tab seleccionado
    document.getElementById(tabName).classList.add('active');
    event.target.classList.add('active');

    // Actualizar contenido
    if (tabName === 'candidatos') {
        mostrarCandidatos();
    } else if (tabName === 'ranking') {
        mostrarRanking();
    } else if (tabName === 'analisis') {
        actualizarAnalisis();
    }
}

// ==================== MÉTRICAS Y CÁLCULOS ====================

/**
 * Calcula el score de escucha social del candidato
 */
function calcularScoreSocial(candidato) {
    const pesos = {
        sentimientoRedes: 0.25,
        relevanciaWeb: 0.25,
        engagementPromedio: 0.20,
        seguidoresGithub: 0.08,
        seguidoresLinkedin: 0.08,
        puntosStackOverflow: 0.07,
        contribucionesOpenSource: 0.07
    };

    let score = 0;
    
    // Componentes normalizados (0-100)
    score += (candidato.sentimientoRedes || 0) * pesos.sentimientoRedes;
    score += (candidato.relevanciaWeb || 0) * pesos.relevanciaWeb;
    score += (candidato.engagementPromedio || 0) * pesos.engagementPromedio;
    
    // Normalizar seguidores (máximo 10000 = 100 puntos)
    score += Math.min((candidato.seguidoresGithub || 0) / 100, 100) * pesos.seguidoresGithub;
    score += Math.min((candidato.seguidoresLinkedin || 0) / 100, 100) * pesos.seguidoresLinkedin;
    
    // Normalizar Stack Overflow (máximo 100000 = 100 puntos)
    score += Math.min((candidato.puntosStackOverflow || 0) / 1000, 100) * pesos.puntosStackOverflow;
    
    // Normalizar contribuciones (máximo 500 = 100 puntos)
    score += Math.min((candidato.contribucionesOpenSource || 0) / 5, 100) * pesos.contribucionesOpenSource;

    return Math.round(score * 100) / 100;
}

/**
 * Calcula la puntuación técnica del candidato
 */
function calcularPuntuacionTecnica(candidato) {
    const pesos = {
        puntuacionTecnica: 0.40,
        experiencia: 0.20,
        proyectosCompletados: 0.15,
        certificaciones: 0.15,
        confiabilidad: 0.10
    };

    let score = 0;
    score += (candidato.puntuacionTecnica || 0) * pesos.puntuacionTecnica;
    score += Math.min((candidato.experiencia || 0) * 10, 100) * pesos.experiencia;
    score += Math.min((candidato.proyectosCompletados || 0) / 2, 100) * pesos.proyectosCompletados;
    
    const numCertificaciones = (candidato.certificaciones || '').split(',').filter(c => c.trim()).length;
    score += Math.min(numCertificaciones * 20, 100) * pesos.certificaciones;
    score += (candidato.confiabilidad || 0) * pesos.confiabilidad;

    return Math.round(score * 100) / 100;
}

/**
 * Calcula la puntuación de desempeño
 */
function calcularPuntuacionDesempenio(candidato) {
    const pesos = {
        tasaCumplimiento: 0.35,
        calificacionClientes: 0.35,
        velocidadEntrega: 0.20,
        comunicacion: 0.10
    };

    let score = 0;
    score += (candidato.tasaCumplimiento || 0) * pesos.tasaCumplimiento;
    score += (candidato.calificacionClientes || 0) * 20 * pesos.calificacionClientes;
    
    // Invertir velocidad (menos días = mejor)
    const velocidadNormalizada = Math.max(0, 100 - ((candidato.velocidadEntrega || 30) * 3));
    score += velocidadNormalizada * pesos.velocidadEntrega;
    score += (candidato.comunicacion || 0) * 10 * pesos.comunicacion;

    return Math.round(score * 100) / 100;
}

/**
 * Calcula la puntuación general del candidato
 */
function calcularPuntuacionGeneral(candidato) {
    const puntuacionTecnica = calcularPuntuacionTecnica(candidato);
    const puntuacionDesempenio = calcularPuntuacionDesempenio(candidato);
    const scoreSocial = calcularScoreSocial(candidato);

    const pesos = {
        tecnica: 0.40,
        desempenio: 0.35,
        social: 0.25
    };

    const puntuacionGeneral = (puntuacionTecnica * pesos.tecnica) +
                             (puntuacionDesempenio * pesos.desempenio) +
                             (scoreSocial * pesos.social);

    return Math.round(puntuacionGeneral * 100) / 100;
}

// ==================== GESTIÓN DE CANDIDATOS ====================

function agregarCandidato(e) {
    e.preventDefault();

    const candidato = {
        id: Date.now(),
        nombre: document.getElementById('nombre').value,
        email: document.getElementById('email').value,
        especialidad: document.getElementById('especialidad').value,
        puntuacionTecnica: parseFloat(document.getElementById('puntuacionTecnica').value),
        experiencia: parseFloat(document.getElementById('experiencia').value),
        certificaciones: document.getElementById('certificaciones').value,
        tasaCumplimiento: parseFloat(document.getElementById('tasaCumplimiento').value),
        velocidadEntrega: parseFloat(document.getElementById('velocidadEntrega').value),
        proyectosCompletados: parseFloat(document.getElementById('proyectosCompletados').value),
        calificacionClientes: parseFloat(document.getElementById('calificacionClientes').value),
        confiabilidad: parseFloat(document.getElementById('confiabilidad').value),
        comunicacion: parseFloat(document.getElementById('comunicacion').value),
        tiempoRespuesta: parseFloat(document.getElementById('tiempoRespuesta').value),
        seguidoresGithub: parseFloat(document.getElementById('seguidoresGithub').value || 0),
        repositoriosGithub: parseFloat(document.getElementById('repositoriosGithub').value || 0),
        seguidoresLinkedin: parseFloat(document.getElementById('seguidoresLinkedin').value || 0),
        endorsementsLinkedin: parseFloat(document.getElementById('endorsementsLinkedin').value || 0),
        seguidoresTwitter: parseFloat(document.getElementById('seguidoresTwitter').value || 0),
        publicacionesTecnicas: parseFloat(document.getElementById('publicacionesTecnicas').value || 0),
        mencionesWeb: parseFloat(document.getElementById('mencionesWeb').value || 0),
        puntosStackOverflow: parseFloat(document.getElementById('puntosStackOverflow').value || 0),
        contribucionesOpenSource: parseFloat(document.getElementById('contribucionesOpenSource').value || 0),
        sentimientoRedes: parseFloat(document.getElementById('sentimientoRedes').value),
        relevanciaWeb: parseFloat(document.getElementById('relevanciaWeb').value),
        engagementPromedio: parseFloat(document.getElementById('engagementPromedio').value),
        alcancePromedio: parseFloat(document.getElementById('alcancePromedio').value || 0),
        fechaRegistro: new Date().toISOString()
    };

    candidatos.push(candidato);
    guardarDatos();
    
    // Limpiar formulario
    document.getElementById('formCandidato').reset();
    
    // Notificación
    alert(`✅ Candidato "${candidato.nombre}" agregado exitosamente`);
    
    // Actualizar vistas
    actualizarFiltros();
    mostrarCandidatos();
}

function eliminarCandidato(id) {
    if (confirm('¿Estás seguro de que deseas eliminar este candidato?')) {
        candidatos = candidatos.filter(c => c.id !== id);
        guardarDatos();
        mostrarCandidatos();
        actualizarAnalisis();
    }
}

// ==================== VISUALIZACIÓN ====================

function mostrarCandidatos() {
    const filtroNombre = document.getElementById('filtroNombre').value.toLowerCase();
    const filtroEspecialidad = document.getElementById('filtroEspecialidad').value;

    let candidatosFiltrados = candidatos.filter(c => {
        return c.nombre.toLowerCase().includes(filtroNombre) &&
               (!filtroEspecialidad || c.especialidad === filtroEspecialidad);
    });

    const contenedor = document.getElementById('listaCandidatos');
    contenedor.innerHTML = '';

    if (candidatosFiltrados.length === 0) {
        contenedor.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: #999;">No hay candidatos registrados</p>';
        return;
    }

    candidatosFiltrados.forEach(candidato => {
        const puntuacionGeneral = calcularPuntuacionGeneral(candidato);
        const scoreSocial = calcularScoreSocial(candidato);
        const puntuacionTecnica = calcularPuntuacionTecnica(candidato);

        const tarjeta = document.createElement('div');
        tarjeta.className = 'tarjeta-candidato';
        tarjeta.onclick = () => mostrarDetallesCandidato(candidato);

        let badge = 'bajo';
        if (puntuacionGeneral >= 80) badge = 'alto';
        else if (puntuacionGeneral >= 60) badge = 'medio';

        tarjeta.innerHTML = `
            <h3>${candidato.nombre}</h3>
            <p><strong>Email:</strong> ${candidato.email}</p>
            <p><strong>Especialidad:</strong> ${candidato.especialidad}</p>
            <p><strong>Experiencia:</strong> ${candidato.experiencia} años</p>
            
            <div style="margin-top: 15px;">
                <p><strong>Puntuaciones:</strong></p>
                <span class="score-badge ${badge}">General: ${puntuacionGeneral}</span>
                <span class="score-badge">Social: ${scoreSocial}</span>
                <span class="score-badge">Técnica: ${puntuacionTecnica}</span>
            </div>
            
            <div class="barra-progreso">
                <div class="barra-progreso-fill" style="width: ${puntuacionGeneral}%"></div>
            </div>
            
            <button onclick="event.stopPropagation(); eliminarCandidato(${candidato.id})" 
                    style="margin-top: 15px; padding: 8px 15px; background: #f44336; color: white; border: none; border-radius: 5px; cursor: pointer; width: 100%;">
                🗑️ Eliminar
            </button>
        `;

        contenedor.appendChild(tarjeta);
    });
}

function mostrarDetallesCandidato(candidato) {
    const puntuacionGeneral = calcularPuntuacionGeneral(candidato);
    const scoreSocial = calcularScoreSocial(candidato);
    const puntuacionTecnica = calcularPuntuacionTecnica(candidato);
    const puntuacionDesempenio = calcularPuntuacionDesempenio(candidato);

    const detalles = `
        <h2>${candidato.nombre}</h2>
        <hr>
        
        <h3>Información General</h3>
        <p><strong>Email:</strong> ${candidato.email}</p>
        <p><strong>Especialidad:</strong> ${candidato.especialidad}</p>
        <p><strong>Experiencia:</strong> ${candidato.experiencia} años</p>
        <p><strong>Fecha de Registro:</strong> ${new Date(candidato.fechaRegistro).toLocaleDateString('es-ES')}</p>
        
        <h3>🎯 Puntuaciones Principales</h3>
        <p><strong>Puntuación General:</strong> <span class="score-badge alto">${puntuacionGeneral}/100</span></p>
        <p><strong>Puntuación Técnica:</strong> <span class="score-badge">${puntuacionTecnica}/100</span></p>
        <p><strong>Puntuación de Desempeño:</strong> <span class="score-badge">${puntuacionDesempenio}/100</span></p>
        <p><strong>Score de Escucha Social:</strong> <span class="score-badge">${scoreSocial}/100</span></p>
        
        <h3>Métricas Técnicas</h3>
        <p><strong>Puntuación Técnica Base:</strong> ${candidato.puntuacionTecnica}/100</p>
        <p><strong>Certificaciones:</strong> ${candidato.certificaciones || 'Ninguna'}</p>
        <p><strong>Proyectos Completados:</strong> ${candidato.proyectosCompletados}</p>
        <p><strong>Confiabilidad:</strong> ${candidato.confiabilidad}%</p>
        
        <h3>Desempeño en Proyectos</h3>
        <p><strong>Tasa de Cumplimiento:</strong> ${candidato.tasaCumplimiento}%</p>
        <p><strong>Calificación de Clientes:</strong> ${candidato.calificacionClientes}/5 ⭐</p>
        <p><strong>Velocidad de Entrega Promedio:</strong> ${candidato.velocidadEntrega} días</p>
        
        <h3>Comunicación</h3>
        <p><strong>Calidad de Comunicación:</strong> ${candidato.comunicacion}/10</p>
        <p><strong>Tiempo Promedio de Respuesta:</strong> ${candidato.tiempoRespuesta} horas</p>
        
        <h3>📱 Presencia en Redes Sociales</h3>
        <p><strong>Seguidores GitHub:</strong> ${candidato.seguidoresGithub}</p>
        <p><strong>Repositorios Relevantes (GitHub):</strong> ${candidato.repositoriosGithub}</p>
        <p><strong>Seguidores LinkedIn:</strong> ${candidato.seguidoresLinkedin}</p>
        <p><strong>Endorsements LinkedIn:</strong> ${candidato.endorsementsLinkedin}</p>
        <p><strong>Seguidores Twitter/X:</strong> ${candidato.seguidoresTwitter}</p>
        <p><strong>Publicaciones Técnicas:</strong> ${candidato.publicacionesTecnicas}</p>
        <p><strong>Menciones en Web:</strong> ${candidato.mencionesWeb}</p>
        <p><strong>Puntos Stack Overflow:</strong> ${candidato.puntosStackOverflow}</p>
        <p><strong>Contribuciones Open Source:</strong> ${candidato.contribucionesOpenSource}</p>
        
        <h3>🔊 Score de Escucha Social (Detalles)</h3>
        <p><strong>Sentimiento en Redes:</strong> ${candidato.sentimientoRedes}/100</p>
        <p><strong>Relevancia Web:</strong> ${candidato.relevanciaWeb}/100</p>
        <p><strong>Engagement Promedio:</strong> ${candidato.engagementPromedio}%</p>
        <p><strong>Alcance Promedio por Post:</strong> ${candidato.alcancePromedio}</p>
    `;

    alert(detalles);
}

function mostrarRanking() {
    const contenedor = document.getElementById('rankingList');
    contenedor.innerHTML = '';

    let candidatosOrdenados = [...candidatos];

    // Ordenar según tipo
    if (ordenRankingActual === 'general') {
        candidatosOrdenados.sort((a, b) => calcularPuntuacionGeneral(b) - calcularPuntuacionGeneral(a));
    } else if (ordenRankingActual === 'tecnica') {
        candidatosOrdenados.sort((a, b) => calcularPuntuacionTecnica(b) - calcularPuntuacionTecnica(a));
    } else if (ordenRankingActual === 'social') {
        candidatosOrdenados.sort((a, b) => calcularScoreSocial(b) - calcularScoreSocial(a));
    } else if (ordenRankingActual === 'confiabilidad') {
        candidatosOrdenados.sort((a, b) => b.confiabilidad - a.confiabilidad);
    }

    candidatosOrdenados.forEach((candidato, index) => {
        const item = document.createElement('div');
        item.className = 'ranking-item';

        let puntuacion;
        if (ordenRankingActual === 'general') {
            puntuacion = calcularPuntuacionGeneral(candidato);
        } else if (ordenRankingActual === 'tecnica') {
            puntuacion = calcularPuntuacionTecnica(candidato);
        } else if (ordenRankingActual === 'social') {
            puntuacion = calcularScoreSocial(candidato);
        } else if (ordenRankingActual === 'confiabilidad') {
            puntuacion = candidato.confiabilidad;
        }

        const medallas = ['🥇', '🥈', '🥉'];
        const medalla = index < 3 ? medallas[index] : `${index + 1}.`;

        item.innerHTML = `
            <div class="ranking-numero">${medalla}</div>
            <div class="ranking-info">
                <div class="ranking-nombre">${candidato.nombre}</div>
                <div class="ranking-especialidad">${candidato.especialidad}</div>
            </div>
            <div class="ranking-score">
                <div style="font-size: 1.3em; font-weight: bold; color: #667eea;">${puntuacion.toFixed(2)}</div>
                <small>${candidato.experiencia} años exp.</small>
            </div>
        `;

        contenedor.appendChild(item);
    });

    if (candidatosOrdenados.length === 0) {
        contenedor.innerHTML = '<p style="text-align: center; color: #999; padding: 40px;">No hay candidatos registrados</p>';
    }
}

function ordenarRanking(tipo) {
    ordenRankingActual = tipo;
    
    // Actualizar botones activos
    document.querySelectorAll('.opciones-ranking button').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');

    mostrarRanking();
}

// ==================== ANÁLISIS ====================

function actualizarAnalisis() {
    if (candidatos.length === 0) {
        document.getElementById('totalCandidatos').textContent = '0';
        document.getElementById('promediogeneral').textContent = '0';
        document.getElementById('mejorCandidato').textContent = '-';
        document.getElementById('scoreocialPromedio').textContent = '0';
        return;
    }

    // Total de candidatos
    document.getElementById('totalCandidatos').textContent = candidatos.length;

    // Promedio general
    const promedio = candidatos.reduce((sum, c) => sum + calcularPuntuacionGeneral(c), 0) / candidatos.length;
    document.getElementById('promediogeneral').textContent = promedio.toFixed(2);

    // Mejor candidato
    const mejorCandidato = candidatos.reduce((max, c) => 
        calcularPuntuacionGeneral(c) > calcularPuntuacionGeneral(max) ? c : max
    );
    document.getElementById('mejorCandidato').textContent = mejorCandidato.nombre;

    // Score social promedio
    const promedioSocial = candidatos.reduce((sum, c) => sum + calcularScoreSocial(c), 0) / candidatos.length;
    document.getElementById('scoreocialPromedio').textContent = promedioSocial.toFixed(2);

    // Generar gráfico
    generarGrafico();
}

function generarGrafico() {
    const contenedor = document.getElementById('graficoAnalisis');
    contenedor.innerHTML = '';

    if (candidatos.length === 0) return;

    let html = '<h3>Distribución de Puntuaciones</h3><table style="width:100%; border-collapse: collapse;">';
    html += '<tr style="background: #667eea; color: white;"><th style="padding:10px; text-align:left;">Candidato</th><th style="padding:10px;">General</th><th style="padding:10px;">Técnica</th><th style="padding:10px;">Social</th></tr>';

    candidatos.forEach((c, idx) => {
        const bg = idx % 2 === 0 ? '#f9f9f9' : '#fff';
        const general = calcularPuntuacionGeneral(c);
        const tecnica = calcularPuntuacionTecnica(c);
        const social = calcularScoreSocial(c);

        html += `<tr style="background: ${bg};"><td style="padding:10px;">${c.nombre}</td>
                 <td style="padding:10px; text-align:center;"><strong>${general.toFixed(2)}</strong></td>
                 <td style="padding:10px; text-align:center;">${tecnica.toFixed(2)}</td>
                 <td style="padding:10px; text-align:center;">${social.toFixed(2)}</td></tr>`;
    });

    html += '</table>';
    contenedor.innerHTML = html;
}

// ==================== FILTROS ====================

function actualizarFiltros() {
    const especialidades = [...new Set(candidatos.map(c => c.especialidad))];
    const select = document.getElementById('filtroEspecialidad');
    const valorActual = select.value;

    select.innerHTML = '<option value="">Todas las especialidades</option>';
    especialidades.forEach(esp => {
        const option = document.createElement('option');
        option.value = esp;
        option.textContent = esp;
        select.appendChild(option);
    });

    select.value = valorActual;
}

function filtrarCandidatos() {
    mostrarCandidatos();
}

// ==================== PERSISTENCIA DE DATOS ====================

function guardarDatos() {
    localStorage.setItem('candidatos', JSON.stringify(candidatos));
}

function cargarDatos() {
    const datos = localStorage.getItem('candidatos');
    candidatos = datos ? JSON.parse(datos) : [];
}

// ==================== EXPORTAR DATOS ====================

function exportarDatos() {
    const datosExportar = {
        fechaExportacion: new Date().toISOString(),
        totalCandidatos: candidatos.length,
        candidatos: candidatos.map(c => ({
            ...c,
            puntuacionGeneral: calcularPuntuacionGeneral(c),
            puntuacionTecnica: calcularPuntuacionTecnica(c),
            scoreSocial: calcularScoreSocial(c),
            puntuacionDesempenio: calcularPuntuacionDesempenio(c)
        }))
    };

    const dataStr = JSON.stringify(datosExportar, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `reputacion-candidatos-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
}