import cv2
import time
import math
from pathlib import Path
import mediapipe as mp
from mediapipe.tasks import python
from mediapipe.tasks.python import vision


MODEL_PATH = Path(__file__).resolve().parent / "pose_landmarker_lite.task"

# Landmarks del lado derecho
RIGHT_SHOULDER = 12
RIGHT_ELBOW = 14
RIGHT_WRIST = 16


def calculate_angle(a, b, c):
    """
    Calcula el ángulo ABC en grados.
    El vértice del ángulo es b.
    """
    ba = (a[0] - b[0], a[1] - b[1])
    bc = (c[0] - b[0], c[1] - b[1])

    mag_ba = math.sqrt(ba[0] ** 2 + ba[1] ** 2)
    mag_bc = math.sqrt(bc[0] ** 2 + bc[1] ** 2)

    if mag_ba == 0 or mag_bc == 0:
        return None

    dot_product = ba[0] * bc[0] + ba[1] * bc[1]
    cos_angle = dot_product / (mag_ba * mag_bc)
    cos_angle = max(-1.0, min(1.0, cos_angle))

    angle = math.degrees(math.acos(cos_angle))
    return angle


def landmark_to_pixel(landmark, width, height):
    x = int(landmark.x * width)
    y = int(landmark.y * height)
    return (x, y)


def draw_pose_without_face(frame, pose_landmarks):
    """
    Dibuja el cuerpo completo, pero sin líneas de la cara.
    """
    h, w, _ = frame.shape

    # Conexiones del cuerpo sin rostro
    body_connections = [
        # Hombros y torso
        (11, 12),
        (11, 23), (12, 24),
        (23, 24),

        # Brazo izquierdo
        (11, 13), (13, 15), (15, 17), (15, 19), (15, 21),

        # Brazo derecho
        (12, 14), (14, 16), (16, 18), (16, 20), (16, 22),

        # Pierna izquierda
        (23, 25), (25, 27), (27, 29), (29, 31),

        # Pierna derecha
        (24, 26), (26, 28), (28, 30), (30, 32)
    ]

    # Dibujar puntos del cuerpo excepto cara
    for i, landmark in enumerate(pose_landmarks):
        if i <= 10:
            continue  # omitir cara

        x = int(landmark.x * w)
        y = int(landmark.y * h)

        if 0 <= x < w and 0 <= y < h:
            cv2.circle(frame, (x, y), 4, (0, 255, 0), -1)

    # Dibujar líneas
    for start_idx, end_idx in body_connections:
        x1 = int(pose_landmarks[start_idx].x * w)
        y1 = int(pose_landmarks[start_idx].y * h)
        x2 = int(pose_landmarks[end_idx].x * w)
        y2 = int(pose_landmarks[end_idx].y * h)

        if (
            0 <= x1 < w and 0 <= y1 < h and
            0 <= x2 < w and 0 <= y2 < h
        ):
            cv2.line(frame, (x1, y1), (x2, y2), (255, 0, 0), 2)


def main():
    if not MODEL_PATH.exists():
        print(f"Error: no se encontró el modelo en:\n{MODEL_PATH}")
        return

    base_options = python.BaseOptions(model_asset_path=str(MODEL_PATH))
    options = vision.PoseLandmarkerOptions(
        base_options=base_options,
        running_mode=vision.RunningMode.VIDEO,
        num_poses=1,
        min_pose_detection_confidence=0.5,
        min_pose_presence_confidence=0.5,
        min_tracking_confidence=0.5,
        output_segmentation_masks=False
    )

    landmarker = vision.PoseLandmarker.create_from_options(options)

    cap = cv2.VideoCapture(0, cv2.CAP_DSHOW)
    if not cap.isOpened():
        print("Error: no se pudo abrir la cámara.")
        return

    prev_time = time.time()

    while True:
        ret, frame = cap.read()
        if not ret:
            print("Error: no se pudo leer la cámara.")
            break

        frame = cv2.flip(frame, 1)
        height, width, _ = frame.shape

        rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        mp_image = mp.Image(image_format=mp.ImageFormat.SRGB, data=rgb_frame)

        timestamp_ms = int(time.time() * 1000)
        result = landmarker.detect_for_video(mp_image, timestamp_ms)

        if result.pose_landmarks:
            pose_landmarks = result.pose_landmarks[0]

            # Dibujar cuerpo completo sin cara
            draw_pose_without_face(frame, pose_landmarks)

            # Puntos para el ángulo del codo derecho
            shoulder = landmark_to_pixel(pose_landmarks[RIGHT_SHOULDER], width, height)
            elbow = landmark_to_pixel(pose_landmarks[RIGHT_ELBOW], width, height)
            wrist = landmark_to_pixel(pose_landmarks[RIGHT_WRIST], width, height)

            # Calcular ángulo del codo
            elbow_angle = calculate_angle(shoulder, elbow, wrist)

            # Resaltar hombro, codo y muñeca
            cv2.circle(frame, shoulder, 7, (0, 255, 255), -1)
            cv2.circle(frame, elbow, 7, (0, 0, 255), -1)
            cv2.circle(frame, wrist, 7, (0, 255, 255), -1)

            cv2.putText(frame, "Hombro", (shoulder[0] + 8, shoulder[1] - 8),
                        cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 255, 255), 2)
            cv2.putText(frame, "Codo", (elbow[0] + 8, elbow[1] - 8),
                        cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 0, 255), 2)
            cv2.putText(frame, "Muneca", (wrist[0] + 8, wrist[1] - 8),
                        cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 255, 255), 2)

            if elbow_angle is not None:
                cv2.putText(
                    frame,
                    f"Codo: {elbow_angle:.1f} deg",
                    (elbow[0] + 10, elbow[1] + 25),
                    cv2.FONT_HERSHEY_SIMPLEX,
                    0.7,
                    (0, 255, 255),
                    2
                )

                cv2.putText(
                    frame,
                    f"Angulo del codo: {elbow_angle:.1f} deg",
                    (10, 30),
                    cv2.FONT_HERSHEY_SIMPLEX,
                    0.8,
                    (0, 255, 255),
                    2
                )

        current_time = time.time()
        fps = 1.0 / (current_time - prev_time) if current_time > prev_time else 0.0
        prev_time = current_time

        cv2.putText(
            frame,
            f"FPS: {int(fps)}",
            (10, height - 20),
            cv2.FONT_HERSHEY_SIMPLEX,
            0.7,
            (0, 255, 0),
            2
        )

        cv2.putText(
            frame,
            "Presiona q para salir",
            (10, height - 50),
            cv2.FONT_HERSHEY_SIMPLEX,
            0.7,
            (255, 255, 255),
            2
        )

        cv2.imshow("Fase 2 - Angulo del codo", frame)

        if cv2.waitKey(1) & 0xFF == ord("q"):
            break

    cap.release()
    cv2.destroyAllWindows()
    landmarker.close()


if __name__ == "__main__":
    main()