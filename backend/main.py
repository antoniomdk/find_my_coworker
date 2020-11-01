from fastapi import UploadFile, File, FastAPI, HTTPException
from PIL import Image, UnidentifiedImageError
from io import BytesIO

app = FastAPI()

@app.post("/prediction/")
async def upload_photo(photo: UploadFile = File(...)):
  try:
    photo_bytes = BytesIO(await photo.read())
    image = Image.open(photo_bytes)

    image.save(photo.filename)

    return {"filename": photo.filename, "type": photo.content_type}
  except UnidentifiedImageError:
    raise HTTPException(400, "Unsupported image format")