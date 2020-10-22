import pickle
from PIL import Image
import typer
from pathlib import Path
from typing import List, Dict, NamedTuple, Tuple
from insightface.app import FaceAnalysis, Face
from numpy.linalg import norm
import numpy as np
import PIL

app = typer.Typer()


class Result(NamedTuple):
    box: Tuple[int, int, int, int]
    person: str
    score: float
    drunk: bool
    age: int
    gender: bool


def convert_bounding_box(box):
    box = list(map(int, box))
    x0, x1 = min(box[0], box[2]), max(box[0], box[2])
    y0, y1 = min(box[1], box[3]), max(box[1], box[3])
    return x0, y0, x1, y1


def load_image_file(file, mode='RGB'):
    im = PIL.Image.open(file)
    if mode:
        im = im.convert(mode)
    return np.array(im)


@app.command(name='create_dataset')
def extract_faces_from_folder(raw_images_folder: Path, faces_folder: Path):
    faces_folder.mkdir(parents=True, exist_ok=True)
    count_faces, count_images = 0, 0
    retina = FaceAnalysis()
    retina.prepare(-1)

    for file in raw_images_folder.iterdir():
        if not file.is_file() or file.suffix.lower() not in ['.png', '.jpg', '.jpeg']:
            continue

        img = load_image_file(file)
        faces = retina.get(img, det_thresh=0.5)
        count_faces += len(faces)

        for i, face in enumerate(faces):
            try:
                x0, y0, x1, y1 = convert_bounding_box(face.bbox)
                print(x0, y0, x1, y1)
                face_img = img[y0:y1, x0:x1]
                new_file = faces_folder / f'{file.stem}_{i}.jpg'
                Image.fromarray(face_img).save(new_file)
                with new_file.with_suffix('.pkl').open('wb') as f:
                    pickle.dump(face, f)
            except:
                pass

        count_images += 1
    print(f'{count_faces} faces found in {count_images} images')


def compute_mean_score(face: Face, embeddings: List[Face]):
    scores = [np.dot(face.embedding, other.embedding) / (norm(face.embedding) * norm(other.embedding))
              for other in embeddings]
    return np.mean(scores)


def get_closest_embedding(face: Face, embeddings: Dict[str, List[Face]]):
    scores = {k: compute_mean_score(face, v) for k, v in embeddings.items()}
    return max(scores.items(), key=lambda x: x[1])


def load_embeddings(embeddings_folder: Path) -> Tuple[Dict[str, List[Face]], Dict[str, List[Face]]]:
    drunk, no_drunk = {}, {}
    subdirectories = [x for x in embeddings_folder.iterdir() if x.is_dir()]
    for subdir in subdirectories:
        drunk_files = subdir.glob('drunk/*.pkl')
        np_drunk_files = subdir.glob('no_drunk/*.pkl')
        drunk[subdir.name] = [pickle.load(x.open('rb')) for x in drunk_files]
        no_drunk[subdir.name] = [pickle.load(x.open('rb')) for x in np_drunk_files]
    return drunk, no_drunk


def merge_embedding_dicts(d1, d2):
    result = {}
    for k, v in d1.items():
        result[k] = d2[k] + v
    return result


def inference(img, face_analysis: FaceAnalysis,
              drunk_embeddings: Dict[str, List[Face]],
              no_drunk_embeddings: Dict[str, List[Face]]) -> List[Result]:
    faces = face_analysis.get(img)
    result = []
    embeddings = merge_embedding_dicts(drunk_embeddings, no_drunk_embeddings)

    for face in faces:
        box = convert_bounding_box(face.bbox)
        person, score = get_closest_embedding(face, embeddings)
        drunk_embs = drunk_embeddings.get(person)
        if drunk_embs:
            _, drunk_score = get_closest_embedding(face, drunk_embeddings)
            _, no_drunk_score = get_closest_embedding(face, no_drunk_embeddings)
        else:
            no_drunk_score = 1
            drunk_score = 0
        drunk = drunk_score > no_drunk_score
        result.append(Result(box, person, score, drunk, face.age, face.gender))

    return result


if __name__ == "__main__":
    app()
