from fastapi import UploadFile, File, FastAPI, HTTPException
from PIL import Image, UnidentifiedImageError
from io import BytesIO
from pathlib import Path
from typing import List
import numpy as np
from mxnet import npx
from backend.modelling.face_identification import load_embeddings, inference, FaceAnalysis, Result

app = FastAPI()
drunk_embeddings, no_drunk_embeddings = load_embeddings(Path('../dataset'))
face_analysis = FaceAnalysis(ga_name=None)

if npx.num_gpus() > 0:
    face_analysis.prepare(0)
else:
    face_analysis.prepare(-1)


@app.post("/prediction/", response_model=List[Result])
async def upload_photo(photo: UploadFile = File(...)):
    try:
        photo_bytes = BytesIO(await photo.read())
        image = Image.open(photo_bytes)
        if image.mode == 'RGBA':
            image = image.convert('RGB')
        numpy_image = np.array(image)
        return inference(numpy_image, face_analysis, drunk_embeddings, no_drunk_embeddings)
    except UnidentifiedImageError:
        raise HTTPException(400, "Unsupported image format")
