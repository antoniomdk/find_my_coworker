import os
import face_recognition
from PIL import Image
import typer
from pathlib import Path


app = typer.Typer()


def compute_encodings(images_folder):
    result = []
    for root, subdir, files in os.walk(images_folder):
        for file in files:
            img = face_recognition.load_image_file(os.path.join(root, file))
            encoding = face_recognition.face_encodings(img)[0]
            result.append(encoding)
    return result


@app.command(name='create_dataset')
def extract_faces_from_folder(raw_images_folder: Path, faces_folder: Path):
    faces_folder.mkdir(parents=True, exist_ok=True)
    count_faces, count_images = 0, 0
    for file in raw_images_folder.iterdir():
        if not file.is_file() or file.suffix.lower() not in ['.png', '.jpg', '.jpeg']:
            continue
        img = face_recognition.load_image_file(file)
        boxes = face_recognition.face_locations(img, number_of_times_to_upsample=3)
        for i, box in enumerate(boxes):
            face = img[box[0]:box[2], box[3]:box[1]]
            new_file = faces_folder / f'{file.stem}_{i}.jpg'
            Image.fromarray(face).save(new_file)
            count_faces += 1
        count_images += 1
    print(f'{count_faces} faces found in {count_images} images')


def inference(img, encodings):
    face_locations = face_recognition.face_locations(img)
    face_encoding = face_recognition.face_encodings(img, face_locations)
    return face_recognition.compare_faces(encodings, face_encoding)


if __name__ == "__main__":
    app()
