# Parchís de Hogwarts - Las 4 Casas 🧙‍♂️🎲

Una webapp mágica y moderna del clásico juego del Parchís adaptada con las cuatro casas de Hogwarts (**Gryffindor, Slytherin, Ravenclaw y Hufflepuff**), diseñada especialmente para jugar en navegadores de **iPhone, iPad (Safari touch)** y ordenadores.

---

## ✨ Características Principales

- **Las 4 Casas Emblemáticas**:
  - 🦁 **Gryffindor**: Rojo carmesí y oro noble (Harry Potter). Salida en casilla 5.
  - 🐍 **Slytherin**: Verde esmeralda y plata bruñida (Draco Malfoy). Salida en casilla 22.
  - 🦅 **Ravenclaw**: Azul zafiro y bronce estelar (Luna Lovegood). Salida en casilla 39.
  - 🦡 **Hufflepuff**: Amarillo canario y obsidiana (Cedric Diggory). Salida en casilla 56.
- **De 1 a 4 Jugadores**: Juega en solitario contra Magos Bots con IA inteligente o en modo multijugador local pasa-y-juega con amigos y familia.
- **Tirador de 1 o 2 Dados**:
  - Elige jugar con **1 dado** tradicional o con **2 dados** (con opción de repartir valores entre fichas o sumarlos).
  - Animación 3D realista con física de giro y cubilete mágico.
  - Turno extra al sacar un 6 (o dobles con 2 dados).
- **Tablero Tradicional Fiel de 68 Casillas**:
  - 12 casillas seguras (incluidas las 4 salidas).
  - Regla de barreras y puentes (máximo 2 fichas por casilla).
  - Capturas mágicas (*¡Expelliarmus!*) con bonificación de +20 casillas.
  - Pasillo de llegada y entrada al Gran Comedor / Castillo de Hogwarts con bonificación de +10 casillas.
- **Efectos de Sonido Mágicos (Web Audio API)**:
  - Sonidos sintetizados 100% nativos (sin descargas externas): dados de madera rodando, hechizos de captura, arpegios de salida y fanfarria triunfal de la Copa de las Casas.
- **Optimizado para iOS y Safari Móvil**:
  - Compatible con iPhone y iPad: soporte táctil nativo con hitboxes ergonómicos ($\ge 44\text{px}$).
  - Zoom interactivo, centrado automático y adaptación apaisada / vertical.
  - Guardado automático en `localStorage` para reanudar la partida en cualquier momento.

---

## 🚀 Cómo Desplegar en GitHub Pages (Paso a Paso)

Sigue estos sencillos pasos para publicar tu juego gratis en GitHub Pages:

### Paso 1: Crear el repositorio en GitHub
1. Inicia sesión en tu cuenta de [GitHub](https://github.com).
2. Haz clic en el botón verde **New** (Nuevo repositorio).
3. Nombra tu repositorio: `parchis-hogwarts`.
4. Elige si quieres que sea **Público** (necesario para GitHub Pages en cuentas gratuitas).
5. Haz clic en **Create repository**.

### Paso 2: Subir los archivos
1. Puedes descargar el paquete completo desde el botón **"📦 Exportar para GitHub"** dentro de la propia aplicación.
2. Sube el archivo `index.html` y este `README.md` a la raíz de tu repositorio `parchis-hogwarts`.
3. Haz clic en **Commit changes**.

### Paso 3: Activar GitHub Pages
1. En tu repositorio, entra en **Settings** (pestaña superior derecha con engranaje).
2. En el menú lateral izquierdo, haz clic en **Pages**.
3. En la sección **Build and deployment**:
   - **Source**: Selecciona `Deploy from a branch`.
   - **Branch**: Selecciona `main` (o `master`) y la carpeta `/ (root)`.
4. Pulsa **Save**.

### Paso 4: ¡A disfrutar de la partida!
En unos 60 segundos, GitHub Pages habrá publicado tu juego en la URL:
```text
https://TU-USUARIO.github.io/parchis-hogwarts/
```
Puedes abrir este enlace en Safari desde tu iPhone o iPad y agregarlo a la Pantalla de Inicio mediante el botón **Compartir → Añadir a pantalla de inicio** para disfrutarlo como una app nativa a pantalla completa.

---

## 📜 Licencia y Atribución
Inspirado en el universo mágico de Hogwarts y las reglas tradicionales del Parchís español. Creado con fines lúdicos y educativos.
