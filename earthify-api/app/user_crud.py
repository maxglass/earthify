from sqlalchemy.orm import Session
import db.dbModel as models
import db.schema as schemas
import bcrypt


def get_users(db: Session):
    return db.query(models.User).all()


def get_user_by_email(db: Session, email: str):
    return db.query(models.User).filter(models.User.email == email).first()


def create_user(db: Session, user: schemas.User):
    admin_pass = bcrypt.hashpw('admin123'.encode('utf-8'), bcrypt.gensalt())
    admin_pass = admin_pass.decode('utf-8')
    db_user = models.User(
        email=user.email,
        password=admin_pass,
        first_name=user.first_name,
        last_name=user.last_name,
        role_id=2
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user


def delete_user(db: Session, email: str):
    stm = models.User.delete().where(models.User.email == email)
    db.execute(stm)
    db.commit()
    return True


def update_user(db: Session, user_id: int, data: schemas.UserUpdate):
    user = db.get(models.User, user_id)
    user_data = data.dict(exclude_unset=True)
    for key, value in user_data.items():
        if key == "password":
            admin_pass = bcrypt.hashpw(value.encode('utf-8'), bcrypt.gensalt())
            admin_pass = admin_pass.decode('utf-8')
            setattr(user, key, admin_pass)
        else:
            setattr(user, key, value)
    db.add(user)
    db.commit()
    db.refresh(user)
    return user
