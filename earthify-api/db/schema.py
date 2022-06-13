from pydantic import BaseModel


class User(BaseModel):
    email: str
    password: str
    first_name: str
    last_name: str

    class Config:
        orm_mode = True


class UserRoles(BaseModel):
    role_id: int
    title: str

    class Config:
        orm_mode = True


class Jobs(BaseModel):
    job_id: str
    user_id: int
    status: int
    file_name: str
    path: str
    table_name: str

    class Config:
        orm_mode = True


class Data(BaseModel):
    job_id: str
    col1: str
    col2: str
    col3: str
    attributes: str

    class Config:
        orm_mode = True


class UserUpdate(BaseModel):
    password: str
    first_name: str
    last_name: str

    class Config:
        schema_extra = {
            "example": {
                "first_name": "First name",
                "last_name": "Last name",
                "password": "any password"
            }
        }
