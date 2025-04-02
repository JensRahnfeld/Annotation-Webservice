import pathlib
import time

from fastapi import HTTPException, Path, APIRouter
from fastapi.responses import FileResponse
from pydantic import BaseModel

SIMULATED_DELAY = 0  # seconds

# Define the subfolder where files are stored
files_folder = pathlib.Path("files")

# Create the subfolder if it doesn't exist

assert files_folder.exists()
router = APIRouter(prefix="/files")


class ImageFile(BaseModel):
    id: str
    filename: str
    thumb_filename: str


file_ids = {
    "CfDAo3C3bvQ",
    "n4ZnguY391E",
    "nKNTGRsYaS0",
    "T-0EW-SEbsE",
}
image_files = [
    ImageFile(id=id, filename=f"{id}.jpg", thumb_filename=f"{id}.thumb.jpg")
    for id in file_ids
]


@router.get("/")
async def read_files() -> list[ImageFile]:
    """
    Should list files from a subfolder and return a list of the filenames
    """
    time.sleep(SIMULATED_DELAY)
    return image_files


@router.get("/{filename}")
async def read_file(
    filename: str = Path(
        ...,
        regex=r"^[a-zA-Z0-9_\-\.]+$",
        description="The filename must contain only alphanumeric characters, underscores, hyphens, and periods",
    ),
) -> bytes:
    if filename.split(".")[0] not in file_ids:
        raise HTTPException(status_code=404, detail="File not found")

    # Define the path to the file
    file_path = files_folder / filename

    # Check if the file exists
    if not file_path.exists() or not file_path.is_file():
        raise HTTPException(status_code=404, detail="File not found")

    time.sleep(SIMULATED_DELAY)

    return FileResponse(file_path)
