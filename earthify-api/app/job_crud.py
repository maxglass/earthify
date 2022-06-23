import uuid

from sqlalchemy.orm import Session
import db.dbModel as models
import db.schema as schemas
import geopandas as gpd

from database import engine


def get_jobs(db: Session):
    return db.query(models.Jobs).all()


def get_user_jobs(db: Session, user_id: int):
    return db.query(models.Jobs).filter(models.Jobs.user_id == user_id).all()


def get_job_by_id(db: Session, job_id: str):
    data = db.query(models.Jobs).filter(models.Jobs.job_id == job_id).first()
    file_location = data.path + data.file_name
    df = gpd.read_file(file_location)
    col_name = list(df.columns)
    return col_name


def create_job(db: Session, job: schemas.Jobs):
    db_job = models.Jobs(
        job_id=job.job_id,
        user_id=job.user_id,
        status=0,
        file_name=job.file_name,
        path=job.path,
        table_name=job.table_name
    )
    db.add(db_job)
    db.commit()
    db.refresh(db_job)
    return db_job


def create_job_details(db: Session, job_details: schemas.JobDetails):
    db_job_details = models.JobDetails(
        job_id=job_details.job_id,
        description=job_details.description,
        country=job_details.country,
        state=job_details.state,
        county=job_details.county,
        open_data_url=job_details.open_data_url,
        download_url=job_details.download_url,
        mapping_service_url=job_details.mapping_service_url,
        property_search_url=job_details.property_search_url,
        tax_collect_url=job_details.tax_collect_url
    )
    db.add(db_job_details)
    db.commit()
    db.refresh(db_job_details)
    return job_details


def delete_job(db: Session, job_id: str):
    stm = models.Jobs.delete().where(models.Jobs.job_id == job_id)
    db.execute(stm)
    db.commit()
    return True


def update_job(db: Session, job_id: str, status: int):
    job = db.query(models.Jobs).filter(models.Jobs.job_id == job_id).first()
    setattr(job, 'status', status)
    db.add(job)
    db.commit()
    db.refresh(job)
    return job


def start_job(db: Session, data: schemas.Data):
    job = db.query(models.Jobs).filter(models.Jobs.job_id == data.job_id).first()
    df = gpd.read_file(job.path + job.file_name)
    col = [job.col1, job.col2, job.col3, 'geometry']
    df = df[col]
    df.columns = ['col1', 'col2', 'col3', 'geometry']
    df.to_postgis('data', engine, if_exists='append')
    update_job(db, data.job_id, 1)
    return job
