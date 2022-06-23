import os
import random
import shutil
import string
import uuid
from typing import Union

import bcrypt
import jwt
from fastapi import FastAPI, Body, Depends, File, UploadFile, Header, Request, Response
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from decouple import config

from app import user_crud, job_crud
from app.auth.auth_bearer import JWTBearerAdmin, JWTBearerST, JWTBearerData, JWTBearer, JWTBearerNR
from app.auth.auth_handler import signJWT
from app.model import UserLoginSchema

import db.dbModel as models
import db.schema as schemas

from database import engine, SessionLocal
import app.send_email as send_email
from fastapi.middleware.cors import CORSMiddleware
from fastapi_pagination import Page, add_pagination
from fastapi_pagination.ext.sqlalchemy import paginate
from fastapi.templating import Jinja2Templates
from pathlib import Path

posts = [
    {
        "id": 1,
        "title": "Pancake",
        "content": "Lorem Ipsum ..."
    }
]

users = []
models.Base.metadata.create_all(bind=engine)

app = FastAPI()

templates = Jinja2Templates(directory="templates")
CHUNK_SIZE = 5*1024*1024
video_path = Path("uploads/earth.mp4")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# app.add_middleware(DBSessionMiddleware, db_url="postgresql://postgres:postgres@localhost/earthify")

# Dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@app.get("/", tags=["root"])
async def read_root() -> dict:
    return {"message": "Welcome to your blog!."}


@app.get("/jobs", dependencies=[Depends(JWTBearerST())], tags=["jobs"])
async def get_jobs(db: Session = Depends(get_db)) -> dict:
    return job_crud.get_jobs(db)


@app.get("/jobs/user", dependencies=[Depends(JWTBearerData())], tags=["jobs"])
async def get_jobs(db: Session = Depends(get_db), req: Request = None) -> dict:
    user = auth(req)
    print(user)
    if user["route"] == "management":
        return job_crud.get_jobs(db)
    return job_crud.get_user_jobs(db, user.get('user_id'))


@app.post("/start_jobs", tags=["jobs"])
async def start_jobs(data: schemas.Data = Body(...), db: Session = Depends(get_db)) -> dict:
    return job_crud.start_job(db, data)


@app.get("/update_job/{job_id}/{status}", tags=["jobs"])
async def start_jobs(job_id: str, status: int, db: Session = Depends(get_db)) -> dict:
    return job_crud.update_job(db, job_id, status)


@app.get("/check/user/upload", tags=["user-check"], dependencies=[Depends(JWTBearerData())])
async def start_jobs() -> dict:
    return {"status": True}


@app.get("/check/user/standard", tags=["user-check"], dependencies=[Depends(JWTBearerST())])
async def start_jobs() -> dict:
    return {"status": True}


@app.get("/check/user/normalize", tags=["user-check"], dependencies=[Depends(JWTBearerNR())])
async def start_jobs() -> dict:
    return {"status": True}


@app.get("/check/user/admin", tags=["user-check"], dependencies=[Depends(JWTBearerAdmin())])
async def start_jobs() -> dict:
    return {"status": True}


@app.get("/jobs/{job_id}", dependencies=[Depends(JWTBearerST())], tags=["jobsget"])
async def get_single_job(job_id: str, db: Session = Depends(get_db)) -> dict:
    return job_crud.get_job_by_id(db, job_id)


@app.post("/create_job", dependencies=[Depends(JWTBearerData())], tags=["create_job"])
async def create_job(file: UploadFile = File(...), req: Request = None, db: Session = Depends(get_db)):
    job = models.Jobs()
    userDetails = auth(req)
    job.user_id = userDetails["user_id"]
    job.job_id = str(uuid.uuid4())
    letters = string.ascii_lowercase
    job.table_name = ''.join(random.choice(letters) for i in range(10))
    job.path = os.path.abspath("uploads/"+job.job_id)+"/"
    job.file_name = file.filename

    try:
        if not os.path.exists(job.path):
            os.mkdir(os.path.abspath("uploads/" + job.job_id))
        contents = await file.read()
        with open(job.path + job.file_name, 'wb') as f:
            f.write(contents)
    except Exception as e:
        return {"status": False, "message": "There was an error uploading the file", "e": e}
    finally:
        await file.close()
    job_crud.create_job(db, job)
    return {"status": True, "message": f"Successfully uploaded {job.file_name}", "job_id":  job.job_id}


@app.post("/create_job_details", tags=["create_job"])
async def create_job_details(data: schemas.JobDetails = Body(...), db: Session = Depends(get_db)):
    return job_crud.create_job_details(db, data)


@app.post("/user/signup", tags=["user"])
async def create_user(user: schemas.User = Body(...), db: Session = Depends(get_db)):
    users.append(user)  # replace with db call, making sure to hash the password first
    new_user = models.User()
    new_user.email = user.email
    new_user.password = user.password
    new_user.first_name = user.first_name
    new_user.last_name = user.last_name
    insertUser = user_crud.create_user(db, new_user)
    return signJWT(user.email, insertUser.id, 4)


def check_user(user: UserLoginSchema, db):
    rec = user_crud.get_user_by_email(db, user.email)
    if rec is not None:
        if bcrypt.checkpw(user.password.encode('utf-8'), rec.password.encode('utf-8')):
            return {"status": True, "role": rec.role_id, "id": rec.id}
    return {"status": False, "role": -1, "id": -1}


@app.post("/user/login", tags=["user"])
async def user_login(user: UserLoginSchema = Body(...), db: Session = Depends(get_db)):
    result = check_user(user, db)
    if result["status"]:
        return signJWT(user.email, result.get("id"), result.get("role"))
    return {
        "error": "Wrong login details!"
    }


def auth(req: Request):
    token = req.headers["Authorization"]
    token = token.replace("Bearer ", "")
    JWT_SECRET = config("secret")
    JWT_ALGORITHM = config("algorithm")
    try:
        decoded_token = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        return decoded_token
    except:
        return None


@app.post("/user/{user_id}/update", tags=["user-update"])
async def user_update(user_id: int, user: schemas.UserUpdate = Body(...), db: Session = Depends(get_db)):
    return user_crud.update_user(db, user_id, user)


@app.get("/profile", tags=["user"])
async def user_update(req: Request = None, db: Session = Depends(get_db)):
    email = auth(req).get('email')
    data = user_crud.get_user_by_email(db, email)
    delattr(data, "password")
    delattr(data, "role_id")
    return data


@app.get("/user/delete/{user_id}", tags=["user-update"])
async def user_delete(user_id: int, db: Session = Depends(get_db)):
    return user_crud.update_user()


@app.get('/send-email/{email}', tags=["email"])
async def send_mail(email: str):
    print(email)
    lsit = {'name': 'Hello World', 'detail': 'John Doe', 'code': 'wahab'}
    await send_email.send_email_async('Test', email, lsit)
    return {'status': True}


@app.get('/getEarthVideo')
async def video_endpoint():
    return FileResponse(os.path.abspath(__file__).replace("app/api.py","uploads/earth.mp4"))


@app.get('/users', response_model=Page[schemas.Users], tags=["user"])
async def users(db: Session = Depends(get_db)):
    return paginate(db.query(models.User))


add_pagination(app)
