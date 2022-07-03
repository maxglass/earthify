from sqlalchemy import text
from sqlalchemy.orm import Session


def get_grid(db: Session, z, x, y):
    tile = db.execute('select public.tbl_grid(' + str(z) + ','+str(x)+','+str(y)+') as data').first()
    return tile.data
