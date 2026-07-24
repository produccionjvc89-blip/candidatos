# 🎯 Sistema de Gestión de Reputación de Candidatos

Un sistema completo para evaluar y seleccionar los mejores candidatos basado en múltiples métricas de reputación, incluyendo análisis de redes sociales y presencia web.

## ✨ Características

### 📊 Métricas Evaluadas

#### Técnicas (40%)
- Puntuación técnica base (0-100)
- Años de experiencia
- Certificaciones profesionales
- Número de proyectos completados
- Índice de confiabilidad

#### Desempeño (35%)
- Tasa de cumplimiento de proyectos
- Calificación de clientes
- Velocidad de entrega
- Calidad de comunicación
- Tiempo de respuesta

#### Redes Sociales y Web (25%)
- **Score de Escucha Social**: Sentimiento en redes, relevancia web, engagement
- GitHub: Seguidores, repositorios relevantes
- LinkedIn: Seguidores, endorsements
- Twitter/X: Alcance y followers
- Stack Overflow: Puntos y respuestas
- Open Source: Contribuciones
- Publicaciones técnicas y menciones web

### 🎯 Puntuación General
Fórmula ponderada que combina:
- 40% Puntuación Técnica
- 35% Puntuación de Desempeño
- 25% Score de Escucha Social

## 🚀 Cómo Usar

### 1. Agregar Candidatos
1. Ve a la pestaña "Agregar Candidato"
2. Completa el formulario con toda la información disponible
3. Haz clic en "Guardar Candidato"

### 2. Ver Candidatos
1. Ve a la pestaña "Candidatos"
2. Usa los filtros para buscar por nombre o especialidad
3. Haz clic en una tarjeta para ver detalles completos

### 3. Ranking
1. Ve a la pestaña "Ranking"
2. Selecciona el criterio de ordenamiento:
   - Puntuación General
   - Puntuación Técnica
   - Score Social
   - Confiabilidad

### 4. Análisis
1. Ve a la pestaña "Análisis"
2. Visualiza estadísticas agregadas
3. Exporta los datos en JSON para análisis en Google AI Studio

## 📱 Integración con Google AI Studio

### Pasos:
1. Exporta los datos JSON desde la pestaña "Análisis"
2. Ve a [Google AI Studio](https://aistudio.google.com)
3. Crea un nuevo proyecto
4. Pega el JSON de candidatos
5. Haz preguntas como:
   - "Analiza el mejor candidato"
   - "¿Quién es mejor para un proyecto web?"
   - "Compara estos dos candidatos"
   - "Predice el éxito en un proyecto de X"

## 📊 Ejemplo de Puntuación

```
Candidato: Juan García

Puntuación Técnica: 85/100
- Puntuación base: 85
- 8 años experiencia: +8pts
- 3 certificaciones: +15pts
- 45 proyectos: +20pts
- Confiabilidad: +90pts
Total: 85/100

Puntuación de Desempeño: 78/100
- Tasa cumplimiento: 95% (33.25pts)
- Clientes: 4.5/5 estrellas (31.5pts)
- Velocidad: 15 días (25pts)
- Comunicación: 8/10 (8pts)
Total: 78/100

Score Social: 72/100
- Sentimiento: 75
- Relevancia: 70
- Engagement: 68%
- GitHub: 250 followers
- LinkedIn: 1200 followers
- Stack Overflow: 5000 puntos
Total: 72/100

PUNTUACIÓN GENERAL: 80.3/100 🏆
```

## 🗄️ Estructura de Datos

```json
{
  "candidatos": [
    {
      "id": 1234567890,
      "nombre": "Juan García",
      "email": "juan@example.com",
      "especialidad": "Desarrollo Web",
      "puntuacionTecnica": 85,
      "experiencia": 8,
      "tasaCumplimiento": 95,
      "calificacionClientes": 4.5,
      "confiabilidad": 90,
      "comunicacion": 8,
      "sentimientoRedes": 75,
      "relevanciaWeb": 70,
      "engagementPromedio": 68,
      "seguidoresGithub": 250,
      "puntosStackOverflow": 5000,
      "contribucionesOpenSource": 45,
      "fechaRegistro": "2024-01-15T10:30:00.000Z"
    }
  ]
}
```

## 🔐 Almacenamiento

- Los datos se guardan en **localStorage** del navegador
- Perfectamente privado y seguro
- Puedes exportar/importar en cualquier momento

## 🎨 Personalización

### Cambiar pesos de puntuación
Edita las constantes `pesos` en `script.js`:

```javascript
const pesos = {
    tecnica: 0.40,      // 40%
    desempenio: 0.35,   // 35%
    social: 0.25        // 25%
};
```

### Agregar nuevas métricas
1. Agrega el campo en el formulario HTML
2. Captura en la función `agregarCandidato()`
3. Incluye en los cálculos de puntuación

## 📈 Casos de Uso

✅ Selección de candidatos para contratar
✅ Evaluación de freelancers
✅ Identificación de talento en equipos
✅ Análisis de especialistas por proyecto
✅ Predicción de performance

## 🛠️ Requisitos

- Navegador moderno (Chrome, Firefox, Safari, Edge)
- JavaScript habilitado
- LocalStorage disponible

## 📝 Notas

- Los datos son locales y no se envían a servidores
- Puedes compartir datos exportando JSON
- Compatible con Google AI Studio para análisis IA avanzado

## 📞 Soporte

Para cambios o mejoras, personaliza los archivos según tus necesidades.

---

**Versión**: 1.0.0
**Última actualización**: 2024