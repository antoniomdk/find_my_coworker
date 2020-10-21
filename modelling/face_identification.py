import pickle
import face_recognition
from PIL import Image
import typer
from pathlib import Path
from insightface.app import FaceAnalysis

app = typer.Typer()


@app.command(name='create_dataset')
def extract_faces_from_folder(raw_images_folder: Path, faces_folder: Path):
    faces_folder.mkdir(parents=True, exist_ok=True)
    count_faces, count_images = 0, 0
    retina = FaceAnalysis()
    retina.prepare(-1)

    for file in raw_images_folder.iterdir():
        if not file.is_file() or file.suffix.lower() not in ['.png', '.jpg', '.jpeg']:
            continue

        img = face_recognition.load_image_file(file)
        faces = retina.get(img, det_thresh=0.5)
        count_faces += len(faces)

        for i, face in enumerate(faces):
            box = list(map(int, face.bbox))
            x0, x1 = min(box[0], box[2]), max(box[0], box[2])
            y0, y1 = min(box[1], box[3]), max(box[1], box[3])
            face_img = img[y0:y1, x0:x1]
            new_file = faces_folder / f'{file.stem}_{i}.jpg'
            print(face_img.shape, img.shape, box)
            Image.fromarray(face_img).save(new_file)
            with new_file.with_suffix('.pkl').open('wb') as f:
                pickle.dump(face, f)

        count_images += 1
    print(f'{count_faces} faces found in {count_images} images')


def inference(img, face_analysis: FaceAnalysis):
    faces = face_analysis.get(img)
    # TODO: Pass


if __name__ == "__main__":
    app()
