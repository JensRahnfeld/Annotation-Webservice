import time
from typing import Annotated

from fastapi import Depends, HTTPException, Path, APIRouter
from sqlmodel import Field, Session, SQLModel, create_engine, select

SQLITE_URL = "sqlite:///./database.db"
SIMULATED_DELAY = 0  # seconds


class BoundingBox(SQLModel, table=True):
    id: int = Field(default=None, primary_key=True)
    filename: str = Field(index=True, nullable=False)
    x: float
    y: float
    w: float
    h: float


router = APIRouter(prefix="/bounding_boxes")
engine = create_engine(SQLITE_URL)


def create_db_and_tables():
    SQLModel.metadata.create_all(engine)


def get_session():
    with Session(engine) as session:
        yield session


SessionDep = Annotated[Session, Depends(get_session)]


@router.get("/{filename}")
async def read_bounding_boxes(
    filename: str,
    session: SessionDep,
) -> list[BoundingBox]:
    """
    Should list bounding boxes from a subfolder and return a list of the filenames
    """
    statement = select(BoundingBox).where(BoundingBox.filename == filename)
    results = session.exec(statement).all()
    if not results:
        return []
    time.sleep(SIMULATED_DELAY)
    return results


@router.post("/{filename}")
async def create_bounding_box(
    filename: str,
    bounding_box: BoundingBox,
    session: SessionDep,
) -> BoundingBox:
    """
    Should create a new bounding box for the given filename
    """
    bounding_box.filename = filename
    session.add(bounding_box)
    session.commit()
    session.refresh(bounding_box)
    time.sleep(SIMULATED_DELAY)
    return bounding_box


@router.delete("/{id}")
async def delete_bounding_box(
    id: int,
    session: SessionDep,
) -> dict[str, str]:
    """
    Should delete a bounding box by id
    """
    statement = select(BoundingBox).where(BoundingBox.id == id)
    bounding_box = session.exec(statement).first()
    if not bounding_box:
        raise HTTPException(status_code=404, detail="Bounding box not found")
    session.delete(bounding_box)
    session.commit()
    time.sleep(SIMULATED_DELAY)
    return {"message": "Bounding box deleted successfully"}
