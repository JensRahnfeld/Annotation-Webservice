from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from bounding_box import create_db_and_tables
from bounding_box import router as bounding_box_router
from files import router as files_router


app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:4200"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(files_router)
app.include_router(bounding_box_router)


@app.on_event("startup")
def on_startup():
    create_db_and_tables()


@app.get("/")
def read_root():
    return {"Hello": "World"}
