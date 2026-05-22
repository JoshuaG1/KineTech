# 🧍 Detección de Pose y Medición de Ángulo de Codo en Tiempo Real con Python

[![Python Version](https://img.shields.io/badge/python-3.12-blue.svg)](https://www.python.org/)
[![OpenCV](https://img.shields.io/badge/OpenCV-4.x-orange.svg)](https://opencv.org/)
[![MediaPipe](https://img.shields.io/badge/MediaPipe-0.10%2B-green.svg)](https://mediapipe.dev/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

Este proyecto de visión por computadora implementa un sistema robusto y escalable en **Python** para detectar *landmarks* (puntos de referencia corporales) en tiempo real mediante la cámara web. Utiliza la API moderna de **MediaPipe Pose Landmarker**, aplica principios de geometría vectorial para calcular dinámicamente el **ángulo cinemático del codo derecho** (Hombro - Codo - Muñeca) y realiza un volcado de datos automatizado a un archivo estructurado de **Excel (.xlsx)** utilizando la librería **openpyxl** para análisis biomecánico posterior.

---

## 📋 Índice
1.  📌 Descripción general
2.  🔄 Evolución del proyecto (Fases)
3.  🧠 Fundamento matemático
4.  🛠️ Requisitos del sistema y dependencias


---

## 1. 📌 Descripción general

El sistema captura el flujo de video en vivo de una cámara web, procesa secuencialmente cada frame a través de un canal optimizado de visión artificial, aísla los puntos anatómicos del torso y extremidades omitiendo los descriptores faciales (para mejorar la limpieza visual y eficiencia), calcula los ángulos de flexo-extensión articular y guarda el registro con una tasa de muestreo fija controlada por software.

**Características Clave:**
* **Seguimiento Multi-punto:** Detección precisa de landmarks corporales en entornos variables gracias al modelo de Deep Learning integrado de MediaPipe.
* **Procesamiento en Modo Video:** Configurado bajo el modo `RunningMode.VIDEO`, permitiendo consistencia temporal óptima entre frames sucesivos.
* **Aislamiento Estructurado:** Filtrado explícito de la máscara facial para centrar la visualización en la biomecánica corporal pura.
* **Persistencia Automatizada:** Almacenamiento seguro en segundo plano mediante un manejador de excepciones (`try...finally`), garantizando la preservación de los registros en Excel incluso ante salidas abruptas del programa.

---

## 2. 🔄 Evolución del proyecto (Fases)

El desarrollo del ecosistema se estructuró de manera incremental en tres fases de desarrollo modular:

* **Fase 1: Configuración del Pipeline y Esqueleto Base:** Implementación inicial del lector de captura de video con OpenCV, transformación de espacio de color (`BGR` a `RGB`), inicialización asíncrona del detector de poses y renderizado básico de conexiones anatómicas principales.
* **Fase 2: Motor Cinemático y Filtrado Visual:** Introducción de la función matemática de cálculo angular, mapeo de coordenadas normalizadas a píxeles absolutos de pantalla y exclusión estética de los landmarks de la cara (0 al 10).
* **Fase 3: Capa de Persistencia y Logging de Datos:** Integración del objeto `Workbook` de openpyxl, sincronización temporal con marcas de tiempo relativas en segundos, establecimiento de un bucle de escritura temporizado con un intervalo constante de actualización de **0.1s** (10 Hz) y guardado resiliente de archivos.

---

## 3. 🧠 Fundamento matemático

El cálculo del ángulo interno del codo se modela matemáticamente utilizando **álgebra lineal y geometría euclidiana** en un plano bidimensional, determinado por las coordenadas pixeladas de la imagen. 

Se definen tres puntos en el espacio correspondientes a los landmarks del lado derecho:
* **Punto A** $(x_A,y_A)$: Hombro Derecho (`RIGHT_SHOULDER` = 12)
* **Punto B** $(x_B,y_B)$: Codo Derecho (`RIGHT_ELBOW` = 14) $\rightarrow$ *Vértice de interés*
* **Punto C** $(x_C,y_C)$: Muñeca Derecha (`RIGHT_WRIST` = 16)

### 1. Construcción de vectores de posición
Se generan dos vectores directores concurrentes orientados hacia afuera con origen común en el vértice del codo ($B$):

$$\vec{BA} = (x_A - x_B, y_A - y_B)$$

$$\vec{BC} = (x_C - x_B, y_C - y_B)$$

### 2. Producto escalar (Dot Product)
El producto escalar de ambos vectores se calcula como la suma de los productos de sus componentes ortogonales:

$$\vec{BA} \cdot \vec{BC} = (BA_x \cdot BC_x) + (BA_y \cdot BC_y)$$

### 3. Magnitudes vectoriales (Normas Euclidianas)
Calculamos la longitud o norma lineal de cada vector mediante el teorema de Pitágoras:

$$\|\vec{BA}\| = \sqrt{BA_x^2 + BA_y^2}$$

$$\|\vec{BC}\| = \sqrt{BC_x^2 + BC_y^2}$$

### 4. Cálculo del coseno y ángulo en grados
A partir de la definición geométrica del producto escalar ($\vec{BA} \cdot \vec{BC} = \|\vec{BA}\| \|\vec{BC}\| \cos(\theta)$), despejamos el coseno del ángulo interno. Se aplica un truncamiento de seguridad dentro del rango del dominio $[-1.0, 1.0]$ para mitigar errores de redondeo de punto flotante:

$$\cos(\theta) = \max\left(-1.0, \min\left(1.0, \frac{\vec{BA} \cdot \vec{BC}}{\|\vec{BA}\| \|\vec{BC}\|}\right)\right)$$

Finalmente, se extrae el arcocoseno en radianes y se convierte al sistema sexagesimal (grados):

$$\theta_{\text{rad}} = \arccos(\cos(\theta))$$

$$\theta_{\text{deg}} = \theta_{\text{rad}} \times \left(\frac{180}{\pi}\right)$$

---

## 4. 🛠️ Requisitos del sistema y dependencias

* **Sistema Operativo:** Windows 10/11, macOS, o Distribuciones Linux comunes.
* **Python Version:** `Python 3.12`.
* **Cámara de Video:** Webcam integrada o periférica USB compatible.

**Librerías Externas Requeridas:**
* `opencv-python`: Manejo de video y renderizado gráfico.
* `mediapipe`: Framework de inferencia para detección de la pose.
* `openpyxl`: Manipulación de archivos Excel sin requerir Microsoft Office.

---

