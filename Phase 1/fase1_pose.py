import cv2
import time
import mediapipe as mp
from mediapipe.tasks import python
from mediapipe.tasks.python import vision


MODEL_PATH = "pose_landmarker_lite.task"


def draw_pose(frame, detection_result):
    """
    Dibuja los landmarks y conexiones del cuerpo sobre el frame.
    """
    if not detection_result.pose_landmarks:
        return frame

    pose_landmarks_list = detection_result.pose_landmarks
    annotated_image = frame.copy()

    for pose_landmarks in pose_landmarks_list:
        # Dibujar puntos
        for landmark in pose_landmarks:
            x = int(landmark.x * annotated_image.shape[1])
            y = int(landmark.y * annotated_image.shape[0])

            if 0 <= x < annotated_image.shape[1] and 0 <= y < annotated_image.shape[0]:
                cv2.circle(annotated_image, (x, y), 4, (0, 255, 0), -1)

        # Dibujar conexiones principales
        connections = [
            (11, 12),  # hombros
            (11, 13), (13, 15),  # brazo izq
            (12, 14), (14, 16),  # brazo der
            (11, 23), (12, 24), (23, 24),  # torso
            (23, 25), (25, 27),  # pierna izq
            (24, 26), (26, 28),  # pierna der
            (27, 31), (28, 32)   # pies
        ]

        for start_idx, end_idx in connections:
            if start_idx < len(pose_landmarks) and end_idx < len(pose_landmarks):
                x1 = int(pose_landmarks[start_idx].x * annotated_image.shape[1])
                y1 = int(pose_landmarks[start_idx].y * annotated_image.shape[0])
                x2 = int(pose_landmarks[end_idx].x * annotated_image.shape[1])
                y2 = int(pose_landmarks[end_idx].y * annotated_image.shape[0])

                if (
                    0 <= x1 < annotated_image.shape[1]
                    and 0 <= y1 < annotated_image.shape[0]
                    and 0 <= x2 < annotated_image.shape[1]
                    and 0 <= y2 < annotated_image.shape[0]
                ):
                    cv2.line(annotated_image, (x1, y1), (x2, y2), (255, 0, 0), 2)

    return annotated_image


def main():
    # Configuración del modelo
    base_options = python.BaseOptions(model_asset_path=MODEL_PATH)
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

        # OpenCV usa BGR; MediaPipe Image puede construirse con SRGB
        rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        mp_image = mp.Image(image_format=mp.ImageFormat.SRGB, data=rgb_frame)

        timestamp_ms = int(time.time() * 1000)
        result = landmarker.detect_for_video(mp_image, timestamp_ms)

        annotated_frame = draw_pose(frame, result)

        # FPS
        current_time = time.time()
        fps = 1.0 / (current_time - prev_time) if current_time > prev_time else 0.0
        prev_time = current_time

        cv2.putText(
            annotated_frame,
            f"FPS: {int(fps)}",
            (10, 30),
            cv2.FONT_HERSHEY_SIMPLEX,
            1,
            (0, 255, 0),
            2
        )

        cv2.putText(
            annotated_frame,
            "Presiona q para salir",
            (10, 65),
            cv2.FONT_HERSHEY_SIMPLEX,
            0.7,
            (255, 255, 255),
            2
        )

        cv2.imshow("Fase 1 - Pose Landmarker", annotated_frame)

        if cv2.waitKey(1) & 0xFF == ord("q"):
            break

    cap.release()
    cv2.destroyAllWindows()
    landmarker.close()


if __name__ == "__main__":
    main()