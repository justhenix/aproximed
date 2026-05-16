from fastapi import FastAPI, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
import uvicorn

app = FastAPI(title="Aproximed API")

# Enable CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def health_check():
    return {"message": "Aproximed API is running"}

@app.post("/compress")
async def compress_image(image: UploadFile = File(...), rank: int = Form(...)):
    # Placeholder for SVD logic
    return {
        "message": "compress endpoint scaffold ready",
        "filename": image.filename,
        "rank": rank
    }

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.1", port=8000, reload=True)