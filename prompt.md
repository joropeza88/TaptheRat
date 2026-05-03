# 🎮 Prompt para agente — Mini juego “Cat vs Rats (Cabinet Mode)”

Construir un mini juego casual inspirado en Whac-a-Mole, con mecánica lateral y estética de un gato cazando ratones dentro de una alacena con tablas horizontales. utilizando **Vue 3 + TailwindCSS v4 + TypeScript**, optimizado para **móvil en orientación vertical**, con arquitectura limpia, escalable y preparado como **PWA**.

---

# 🧠 Concepto del juego

El jugador controla un gato que está **detrás de 3 barras horizontales (tablas de madera)**.

Los ratones se asoman desde distintos lados de estas tablas:

- Izquierda
- Derecha
- Arriba
- Abajo

El gato permanece en el centro y reacciona a los clics del jugador.

---

# 🎯 Objetivo del juego

El **único objetivo para ganar un nivel es alcanzar una puntuación específica**.

No existen condiciones de tiempo para ganar (aunque sí puede haber tiempo límite opcional para presión).

# 🐭 Tipos de ratones (MVP)

Solo existirán 3 tipos principales + 1 especial negativo:

1. Ratón normal
1 tap para eliminar, da pocos puntos y tiempo visible estándar

2. Ratón resistente (2 taps)
Requiere 2 taps, primer tap = daño visual ,segundo tap = eliminado. Da más puntos

3. Ratón rápido
Solo 1 tap, permanece visible muy poco tiempo, da más puntos por dificultad

4. Ratón trampa (negativo)
Si se toca: resta puntos, No debe ser golpeado, Sirve para forzar precisión

# ⚙️ Configuración central

Toda la lógica debe ser configurable desde:
src/game/config/gameConfig.ts

````ejemplo
export const RAT_CONFIG = {
  normal: {
    points: 1,
    visibleTime: 1200,
    health: 1
  },
  armored: {
    points: 3,
    visibleTime: 1400,
    health: 2
  },
  fast: {
    points: 4,
    visibleTime: 600,
    health: 1
  },
  trap: {
    points: -3,
    visibleTime: 1000,
    health: 1
  }
}
````

# 🧱 Escenario (IMPORTANTE)

El escenario es clave visualmente:

Fondo tipo alacena
3 barras horizontales (tablas)
El gato está detrás (centrado)
Los ratones aparecen “entre” esas tablas

Representación conceptual:

========  ← tabla 1
   🐭

========  ← tabla 2
  🐱   🐭

========  ← tabla 3
   🐭

# 📍 Spawn points

Cada tabla debe tener puntos de aparición:

Izquierda
Derecha
Arriba
Abajo

Ejemplo de modelo:

````
type SpawnSide = 'left' | 'right' | 'top' | 'bottom'

interface SpawnPoint {
  id: string
  side: SpawnSide
  row: number // 0,1,2 para cada tabla
  isOccupied: boolean
}
````

# 🎮 Mecánica principal

Loop del juego:

El sistema genera un ratón en un punto disponible
El ratón aparece con animación
Permanece visible según su tipo
El jugador hace click sobre el ratón
Se evalúa:
daño
puntos
El ratón desaparece
Se valida si se alcanzó la puntuación objetivo

# 🧠 Sistema de spawn

Debe:

Leer configuración del nivel
Limitar cantidad de ratones activos
Elegir tipo según probabilidad
Elegir spawn libre
Crear ratón
Auto-remover al terminar su tiempo

# 🎲 Probabilidades

Ejemplo por nivel:

````
ratTypes: {
  normal: 60,
  armored: 20,
  fast: 15,
  trap: 5
}
````

# 🐱 Animación del gato (CLAVE)

El gato debe reaccionar visualmente al input del jugador.

Requerimiento:

El gato debe:

Permanecer centrado
Tener animación de ataque hacia:
izquierda
derecha
arriba
abajo
Detalle importante:

Debe parecer que usa:

mano izquierda cuando ataca izquierda
mano derecha cuando ataca derecha

# Implementación sugerida
Estado del gato:

````
type CatDirection = 'idle' | 'left' | 'right' | 'top' | 'bottom'

interface CatState {
  direction: CatDirection
  isAttacking: boolean
}
````

Lógica de ataque

Cuando el jugador hace click:

````
handleAttack(side: SpawnSide)
````

Debe:

Cambiar dirección del gato
Activar animación
Detectar si hay ratón en ese lado
Aplicar lógica de hit
Regresar a idle después de X ms
Animación visual (Tailwind)

Ejemplo:

izquierda → -translate-x
derecha → translate-x
arriba → -translate-y
abajo → translate-y

También puedes usar:

rotación leve
escala rápida
sprite alterno

# 🧮 Sistema de puntuación

````
score += rat.points
````

Para ratón trampa:

````
score -= penalty
````

# 🏁 Condición de victoria
````
if (score >= level.goal.target) {
  completeLevel()
}
````

# ❌ Condición de derrota

Opcional (pero recomendado):

Tiempo límite
Score negativo extremo

# 🧩 Estructura del proyecto

src/
├── components/
│   ├── GameBoard.vue
│   ├── CatPlayer.vue
│   ├── RatEnemy.vue
│   ├── SpawnPoint.vue
│   ├── GameHud.vue
│
├── game/
│   ├── config/
│   │   ├── gameConfig.ts
│   │   ├── levelsConfig.ts
│   │
│   ├── composables/
│   │   ├── useGameLoop.ts
│   │   ├── useSpawnSystem.ts
│   │   ├── useScore.ts
│   │
│   ├── services/
│   │   ├── ratFactory.ts
│   │   ├── probabilityService.ts
│   │
│   ├── models/
│   │   ├── Rat.ts
│   │   ├── GameState.ts
│   │
│   └── utils/
│       ├── random.ts


# 🧪 MVP mínimo

Debe incluir:

1 nivel
3 tablas
2 lados activos (izquierda/derecha)
3 tipos de ratón + 1 trampa
puntuación
animación básica del gato
spawn dinámico
eliminación automática

# 🎯 Resultado esperado

Un juego:

Rápido
Reactivo
Basado en reflejos
Con decisiones (evitar trampas)
Fácil de escalar con config
Pantalla home para precargar multimedia y boton de jugar
Pantalla del juego 
Pantalla de victoria con boton de salir (manda a la inicial)

# 🚀 Escalabilidad futura

El sistema debe permitir fácilmente:

Más tipos de ratones
Power-ups
Modo noche
Combos
Multiplicadores
Animaciones avanzadas
Sonido y feedback
⚠️ Reglas clave
NO hardcodear valores
TODO configurable
Componentes desacoplados
Lógica fuera de UI
Tipado fuerte con TypeScript