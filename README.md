## Getting started

### Starting the backend

1. Install `uv`: https://docs.astral.sh/uv/getting-started/installation/
2. Install python: `uv python install 3.13`
3. cd into the backend: `cd backend`
4. Run the app: `uv run fastapi dev main.py`

### Or directly with pip (not recommended)

1. cd into the backend `cd backend`
2. `pip install .`

To simulate heavy lifting change the variable `SIMULATED_DELAY` in `bounding_box.py` / `files.py`.

### Starting the frontend

1. Install node and npm: https://nodejs.org/en/download
2. cd into the frontend: `cd frontend`
3. Install dependencies: `npm ci`
4. Run the app: `npm run start`
