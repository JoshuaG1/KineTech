# 🧍 Real-Time Pose Detection and Elbow Angle Measurement with Python

[![Python Version](https://img.shields.io/badge/python-3.12-blue.svg)](https://www.python.org/)
[![OpenCV](https://img.shields.io/badge/OpenCV-4.x-orange.svg)](https://opencv.org/)
[![MediaPipe](https://img.shields.io/badge/MediaPipe-0.10%2B-green.svg)](https://mediapipe.dev/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

This computer vision project implements a robust and scalable system in **Python** to detect body *landmarks* in real-time using a webcam. It uses the modern **MediaPipe Pose Landmarker** API, applies principles of vector geometry to dynamically calculate the **kinematic right elbow angle** (Shoulder - Elbow - Wrist), and performs an automated data dump into a structured **Excel (.xlsx)** file using the **openpyxl** library for subsequent biomechanical analysis.

---

## 📋 Table of Contents
1.  📌 Overview
2.  🔄 Project Evolution (Phases)
3.  🧠 Mathematical Foundation
4.  🛠️ System Requirements and Dependencies


---

## 1. 📌 Overview

The system captures live video stream from a webcam, sequentially processes each frame through an optimized computer vision pipeline, isolates the anatomical points of the torso and limbs omitting facial descriptors (to improve visual clarity and efficiency), calculates joint flexion-extension angles, and saves the log with a fixed software-controlled sampling rate.

**Key Features:**
* **Multi-point Tracking:** Precise detection of body landmarks in variable environments thanks to MediaPipe's integrated Deep Learning model.
* **Video Mode Processing:** Configured under `RunningMode.VIDEO` mode, allowing optimal temporal consistency between successive frames.
* **Structured Isolation:** Explicit filtering of the facial mask to focus the visualization on pure body biomechanics.
* **Automated Persistence:** Secure background storage using an exception handler (`try...finally`), ensuring the preservation of Excel logs even in the event of abrupt program exits.

---

## 2. 🔄 Project Evolution (Phases)

The ecosystem's development was structured incrementally in three modular development phases:

* **Phase 1: Pipeline Setup and Base Skeleton:** Initial implementation of the video capture reader with OpenCV, color space transformation (`BGR` to `RGB`), asynchronous initialization of the pose detector, and basic rendering of major anatomical connections.
* **Phase 2: Kinematic Engine and Visual Filtering:** Introduction of the mathematical function for angle calculation, mapping of normalized coordinates to absolute screen pixels, and aesthetic exclusion of facial landmarks (0 to 10).
* **Phase 3: Persistence Layer and Data Logging:** Integration of the `Workbook` object from openpyxl, temporal synchronization with relative timestamps in seconds, establishment of a timed writing loop with a constant update interval of **0.1s** (10 Hz), and resilient file saving.

---

## 3. 🧠 Mathematical Foundation

The calculation of the internal elbow angle is modeled mathematically using **linear algebra and Euclidean geometry** in a two-dimensional plane, determined by the pixelated coordinates of the image. 

Three points in space corresponding to the right-side landmarks are defined:
* **Point A** $(x_A,y_A)$: Right Shoulder (`RIGHT_SHOULDER` = 12)
* **Point B** $(x_B,y_B)$: Right Elbow (`RIGHT_ELBOW` = 14) $\rightarrow$ *Vertex of interest*
* **Point C** $(x_C,y_C)$: Right Wrist (`RIGHT_WRIST` = 16)

### 1. Position Vectors Construction
Two concurrent direction vectors oriented outwards with a common origin at the elbow vertex ($B$) are generated:

$$\vec{BA} = (x_A - x_B, y_A - y_B)$$

$$\vec{BC} = (x_C - x_B, y_C - y_B)$$

### 2. Dot Product
The dot product of both vectors is calculated as the sum of the products of their orthogonal components:

$$\vec{BA} \cdot \vec{BC} = (BA_x \cdot BC_x) + (BA_y \cdot BC_y)$$

### 3. Vector Magnitudes (Euclidean Norms)
We calculate the length or linear norm of each vector using the Pythagorean theorem:

$$\|\vec{BA}\| = \sqrt{BA_x^2 + BA_y^2}$$

$$\|\vec{BC}\| = \sqrt{BC_x^2 + BC_y^2}$$

### 4. Cosine and Angle in Degrees Calculation
From the geometric definition of the dot product ($\vec{BA} \cdot \vec{BC} = \|\vec{BA}\| \|\vec{BC}\| \cos(\theta)$), we solve for the cosine of the internal angle. A safety truncation is applied within the domain range $[-1.0, 1.0]$ to mitigate floating-point rounding errors:

$$\cos(\theta) = \max\left(-1.0, \min\left(1.0, \frac{\vec{BA} \cdot \vec{BC}}{\|\vec{BA}\| \|\vec{BC}\|}\right)\right)$$

Finally, the arccosine in radians is extracted and converted to the sexagesimal system (degrees):

$$\theta_{\text{rad}} = \arccos(\cos(\theta))$$

$$\theta_{\text{deg}} = \theta_{\text{rad}} \times \left(\frac{180}{\pi}\right)$$

---

## 4. 🛠️ System Requirements and Dependencies

* **Operating System:** Windows 10/11, macOS, or common Linux Distributions.
* **Python Version:** `Python 3.12`.
* **Video Camera:** Integrated webcam or compatible USB peripheral.

**Required External Libraries:**
* `opencv-python`: Video handling and graphical rendering.
* `mediapipe`: Inference framework for pose detection.
* `openpyxl`: Excel file manipulation without requiring Microsoft Office.

---
