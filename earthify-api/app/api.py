import os
import random
import shutil
import string
import uuid
import geopandas as gp
from typing import Union

import bcrypt
import cryptocode
import jwt
from fastapi import FastAPI, Body, Depends, File, UploadFile, Header, Request
import psycopg2 as pg
from fastapi_sqlalchemy import DBSessionMiddleware
from sqlalchemy.orm import Session
from decouple import config

from app import user_crud, job_crud
from app.auth.auth_bearer import JWTBearer, JWTBearerAdmin, JWTBearerData, JWTBearerQC
from app.auth.auth_handler import signJWT
from app.model import PostSchema, UserSchema, UserLoginSchema

import db.dbModel as models
import db.schema as schemas
from sqlalchemy.sql import text

from database import engine, SessionLocal

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


@app.get("/jobs", dependencies=[Depends(JWTBearerQC())], tags=["jobs"])
async def get_jobs(db: Session = Depends(get_db)) -> dict:
    return job_crud.get_jobs(db)


@app.get("/start_jobs", tags=["jobs"])
async def start_jobs(db: Session = Depends(get_db)) -> dict:
    return job_crud.get_jobs(db)


@app.get("/update_job/{job_id}/{status}", tags=["jobs"])
async def start_jobs(job_id: str, status: int, db: Session = Depends(get_db)) -> dict:
    return job_crud.update_job(db, job_id, status)


@app.get("/jobs/{job_id}", dependencies=[Depends(JWTBearerQC())], tags=["jobsget"])
async def get_single_job(job_id: str, db: Session = Depends(get_db)) -> dict:
    return job_crud.get_job_by_id(db, job_id)


@app.post("/create_job", dependencies=[Depends(JWTBearerAdmin())], tags=["create_job"])
async def create_job(file: UploadFile = File(...), req: Request = None, db: Session = Depends(get_db)):
    job = models.Jobs()
    userDetails = auth(req)
    job.user_id = userDetails["user_id"]
    job.job_id = str(uuid.uuid4())
    letters = string.ascii_lowercase
    job.table_name = ''.join(random.choice(letters) for i in range(10))
    job.path = os.path.abspath("uploads/"+job.job_id+"/")
    job.file_name = file.filename

    job_crud.create_job(db, job)
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

    return {"status": True, "message": f"Successfully uploaded {job.file_name}"}


@app.post("/user/signup", tags=["user"])
async def create_user(user: schemas.User = Body(...), db: Session = Depends(get_db)):
    users.append(user)  # replace with db call, making sure to hash the password first
    new_user = models.User()
    new_user.email = user.email
    new_user.password = user.password
    new_user.first_name = user.first_name
    new_user.last_name = user.last_name
    insertUser = user_crud.create_user(db, new_user)
    return signJWT(user.email, {"role": insertUser.role_id, "id": insertUser.id})


def check_user(user: UserLoginSchema, db):
    rec = user_crud.get_user_by_email(db, user.email)
    if rec is not None:
        if bcrypt.checkpw(user.password.encode('utf-8'), rec.password.encode('utf-8')):
            return {"status": True, "role": rec.role_id, "id": rec.id}
        else:
            return {"status": False, "role": -1, "id": -1}


@app.post("/user/login", tags=["user"])
async def user_login(user: UserLoginSchema = Body(...), db: Session = Depends(get_db)):
    result = check_user(user, db)
    if result["status"]:
        return signJWT(user.email, result)
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


@app.get("/user/delete/{user_id}", tags=["user-update"])
async def user_delete(user_id: int, db: Session = Depends(get_db)):
    return user_crud.update_user()

