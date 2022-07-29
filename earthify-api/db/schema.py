import datetime
import fileinput

from pydantic import BaseModel


class User(BaseModel):
    email: str
    password: str
    first_name: str
    last_name: str

    class Config:
        orm_mode = True


class Users(BaseModel):
    email: str
    first_name: str
    last_name: str
    role_id: int
    time_created: datetime.datetime

    class Config:
        orm_mode = True


class AddUser(BaseModel):
    email: str
    first_name: str
    last_name: str
    role_id: int
    password: str

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


class JobDetails(BaseModel):
    job_id: str
    description: str
    country: str
    state: str
    county: str
    open_data_url: str
    download_url: str
    mapping_service_url: str
    property_search_url: str
    tax_collect_url: str

    class Config:
        orm_mode = True


class UserUpdate(BaseModel):
    email: str
    first_name: str
    last_name: str
    role_id: int

    class Config:
        schema_extra = {
            "example": {
                "first_name": "First name",
                "last_name": "Last name",
                "role": "User Role"
            }
        }


class UserPassword(BaseModel):
    email: str
    password: str

    class Config:
        schema_extra = {
            "example": {
                "password": "any password"
            }
        }
