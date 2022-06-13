from sqlalchemy.orm import Session
import db.dbModel as models
import db.schema as schemas



def get_data(db: Session, email: str):
    return db.query(models.User).filter(models.User.email == email).first()

def get_job_by_id(db: Session, email: str):
    return db.query(models.User).filter(models.User.email == email).first()


def create_job(db: Session, user: schemas.UserCreate):
    fake_hashed_password = user.password + "notreallyhashed"
    db_user = models.User(email=user.email, password=fake_hashed_password)
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user
