from sqlalchemy import text
from sqlalchemy.orm import Session
import db.dbModel as models


def get_grid(db: Session, z, x, y):
    tile = db.execute('select public.tbl_grid(' + str(z) + ',' + str(x) + ',' + str(y) + ') as data').first()
    return tile.data


def get_county_grid(db: Session, z, x, y):
    tile = db.execute('select public.tbl_counties(' + str(z) + ',' + str(x) + ',' + str(y) + ') as data').first()
    return tile.data


def get_state_count(db: Session):
    count = db.query(models.States).count()
    return count


def get_county_count(db: Session):
    count = db.query(models.County).count()
    return count


def get_counties(db: Session):
    return db.query(models.County).distinct('NAME').all()


def get_states(db: Session):
    return db.query(models.States).distinct('NAME').all()


def get_schema_column(db: Session):
    return db.execute("SELECT column_name FROM information_schema.columns where table_name   = 'data'").all()


def del_schema_column(column: str, db: Session):
    result = db.execute("ALTER TABLE data DROP COLUMN " + column)
    db.commit()
    return {'status': True}


def add_schema_column(column: str, db: Session):
    db.execute("ALTER TABLE data ADD " + column + " text")
    db.commit()
    return {'status': True}
