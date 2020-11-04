import pickle
from PIL import Image
import typer
from pathlib import Path
from typing import List, Dict, Tuple
from pydantic import BaseModel
from insightface.app import FaceAnalysis, Face
from numpy.linalg import norm
import numpy as np
import shutil
import PIL
from sklearn.cluster import DBSCAN


app = typer.Typer()


class Result(BaseModel):
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
            except Exception as e:
                print(e)
        print(f'Processed image: {file}')
        count_images += 1
    print(f'{count_faces} faces found in {count_images} images')


def compute_score(face: Face, face_database: List[Face], agg='mean'):
    embeddings = [face.embedding for face in face_database]
    embeddings = np.unique(embeddings, axis=0)
    scores = [np.dot(face.embedding, embedding) / (norm(face.embedding) * norm(embedding))
              for embedding in embeddings]
    return np.mean(scores) if agg == 'mean' else np.max(scores)


def get_closest_embedding(face: Face, embeddings: Dict[str, List[Face]]):
    scores = {k: compute_score(face, v) for k, v in embeddings.items()}
    return max(scores.items(), key=lambda x: x[1])


def load_embeddings(embeddings_folder: Path) -> Tuple[Dict[str, List[Face]], Dict[str, List[Face]]]:
    drunk, no_drunk = {}, {}
    subdirectories = [x for x in embeddings_folder.iterdir() if x.is_dir()]
    for subdir in subdirectories:
        drunk_files = subdir.glob('drunk/*.pkl')
        no_drunk_files = subdir.glob('no_drunk/*.pkl')
        drunk[subdir.name] = [pickle.load(x.open('rb')) for x in drunk_files]
        no_drunk[subdir.name] = [pickle.load(x.open('rb')) for x in no_drunk_files]
        if not no_drunk_files and not drunk_files:
            no_drunk[subdir.name] = [pickle.load(x.open('rb')) for x in subdir.glob('*.pkl')]
    return drunk, no_drunk


def merge_embedding_dicts(d1, d2):
    result = {}
    for k, v in d1.items():
        result[k] = d2[k] + v
    return result


def inference(img: np.ndarray, face_analysis: FaceAnalysis,
              drunk_embeddings: Dict[str, List[Face]],
              no_drunk_embeddings: Dict[str, List[Face]]) -> List[Result]:
    faces = face_analysis.get(img)
    result = []
    embeddings = merge_embedding_dicts(drunk_embeddings, no_drunk_embeddings)

    for face in faces:
        box = convert_bounding_box(face.bbox)
        box = [float(box[0]) / img.shape[1], float(box[1]) / img.shape[0],
               float(box[2]) / img.shape[1], float(box[3]) / img.shape[0]]
        person, score = get_closest_embedding(face, embeddings)
        drunk_embs = drunk_embeddings.get(person)
        if drunk_embs:
            drunk_score = compute_score(face, drunk_embs, agg='max')
            no_drunk_score = compute_score(face, no_drunk_embeddings[person], agg='max')
        else:
            no_drunk_score = 1
            drunk_score = 0
        drunk = drunk_score > no_drunk_score
        age = np.mean([face.age for face in no_drunk_embeddings[person]])
        gender = no_drunk_embeddings[person][0].gender
        result.append(Result(box=box, person=person, score=score, drunk=drunk, age=age, gender=gender))

    return result


@app.command(name='clustering')
def faces_clustering(input_directory: Path, output_directory: Path):
    faces_files = list(input_directory.glob('*.pkl'))
    faces: List[Face] = [pickle.load(x.open('rb')) for x in faces_files]
    clustering = DBSCAN(eps=0.95, metric="euclidean", n_jobs=-1)
    embeddings = np.array([face.normed_embedding for face in faces])
    clustering.fit(embeddings)
    labels_ids = np.unique(clustering.labels_)
    num_unique_faces = len(np.where(labels_ids > -1)[0])
    print(num_unique_faces, 'unique faces')

    for label in labels_ids:
        indices = np.where(clustering.labels_ == label)[0]
        subdir = output_directory / f'person_{label}'
        subdir.mkdir(parents=True, exist_ok=True)

        for i in indices:
            face_filename = faces_files[i]
            face_img = face_filename.with_suffix('.jpg')
            shutil.copy(face_filename, subdir / face_filename.name)
            if face_img.exists():
                shutil.copy(face_img, subdir / face_img.name)


if __name__ == "__main__":
    app()
