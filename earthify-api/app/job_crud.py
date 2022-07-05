import json
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
    data_details = db.query(models.JobDetails).filter(models.JobDetails.job_id == job_id).first()
    file_location = data.path + data.file_name
    df = gpd.read_file(file_location)
    col_name = list(df.columns)
    col_filter = col_name
    if "geom" in col_filter:
        col_filter.remove("geom")
    if "geometry" in col_filter:
        col_filter.remove("geometry")
    df = df[col_filter]
    return {'name': data.file_name, 'details': data_details, 'columns': col_name, 'attributes':  json.loads(json.dumps(list(df.head(15).T.to_dict().values())))}


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
    job = db.query(models.Jobs).filter(models.Jobs.job_id == job_id).first()
    job_details = db.query(models.JobDetails).filter(models.JobDetails.job_id == job_id).first()

    db.delete(job)
    db.commit()

    db.delete(job_details)
    db.commit()

    return {'status': True}


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
    col = []
    db_col = []
    if data.col1 != '':
        col.append(data.col1)
        db_col.append('col1')
    if data.col2 != '':
        col.append(data.col2)
        db_col.append('col2')
    if data.col3 != '':
        col.append(data.col3)
        db_col.append('col3')
    db_col.append('geometry')
    col.append('geometry')
    df = df[col]
    df.columns = db_col
    df = df.assign(job_id=data.job_id)
    df = df[df['geometry'].apply(lambda x: x.type == 'Polygon' or x.type == 'MultiPolygon')]
    df.to_postgis('data', engine, if_exists='append')
    update_job(db, data.job_id, 1)
    return {'status': True, 'message': 'Job processed successfully!'}
