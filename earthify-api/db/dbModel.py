from sqlalchemy import Column, DateTime, ForeignKey, Integer, String, Float, Boolean, JSON, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from database import Base


class User(Base):
    __tablename__ = 'users'
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    email = Column(String)
    password = Column(String)
    first_name = Column(String)
    last_name = Column(String)
    role_id = Column(Integer)
    time_created = Column(DateTime(timezone=True), server_default=func.now())
    time_updated = Column(DateTime(timezone=True), onupdate=func.now())


class UserRoles(Base):
    __tablename__ = 'user_roles'
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    role_id = Column(Integer)
    title = Column(String)


class Jobs(Base):
    __tablename__ = 'jobs'
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    job_id = Column(String)
    user_id = Column(Integer)
    start_time = Column(DateTime(timezone=True), server_default=func.now())
    end_time = Column(DateTime(timezone=True), server_default=func.now())
    status = Column(Integer)
    file_name = Column(String)
    path = Column(Text)
    table_name = Column(String)


class Data(Base):
    __tablename__ = 'data'
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    job_id = Column(Integer, primary_key=True, index=True)
    col1 = Column(Integer)
    col2 = Column(String)
    col3 = Column(String)
    attributes = Column(JSON)



