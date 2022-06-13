import uuid

from sqlalchemy.orm import Session
import db.dbModel as models
import db.schema as schemas


def get_jobs(db: Session):
    return db.query(models.Jobs).all()


def get_job_by_id(db: Session, job_id: str):
    return db.query(models.Jobs).filter(models.Jobs.job_id == job_id).first()


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
