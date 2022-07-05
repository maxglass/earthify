import psycopg2
from decouple import config
from fastapi import Request, HTTPException
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import cryptocode

from .auth_handler import decodeJWT


def getRoleFromDB(email):
    conn = None
    role = None
    try:
        conn = psycopg2.connect(
            host=config("DATABASE_HOST"),
            database=config("DATABASE_DATABASE"),
            user=config("DATABASE_USER"),
            password=config("DATABASE_PASS")
        )
        cur = conn.cursor()
        cur.execute("SELECT role_id from users where email='" + email + "'")
        roles = cur.fetchone()
        if roles is not None:
            role = roles[0]
    finally:
        if conn is not None:
            conn.close()
    return role


class JWTBearerAdmin(HTTPBearer):
    def __init__(self, auto_error: bool = True):
        super(JWTBearerAdmin, self).__init__(auto_error=auto_error)

    async def __call__(self, request: Request):
        credentials: HTTPAuthorizationCredentials = await super(JWTBearerAdmin, self).__call__(request)
        if credentials:
            if not credentials.scheme == "Bearer":
                raise HTTPException(status_code=403, detail="Invalid authentication scheme.")
            if not self.verify_jwt(credentials.credentials):
                raise HTTPException(status_code=403, detail="Invalid token or expired token.")
            return credentials.credentials
        else:
            raise HTTPException(status_code=403, detail="Invalid authorization code.")

    def verify_jwt(self, jwtoken: str) -> bool:
        isTokenValid: bool = False
        try:
            payload = decodeJWT(jwtoken)
        except:
            payload = None
        if payload:
            email = payload.get('email')
            role = getRoleFromDB(email)
            if role is not None:
                if role == 0:
                    isTokenValid = True
        return isTokenValid


class JWTBearerST(HTTPBearer):
    def __init__(self, auto_error: bool = True):
        super(JWTBearerST, self).__init__(auto_error=auto_error)

    async def __call__(self, request: Request):
        credentials: HTTPAuthorizationCredentials = await super(JWTBearerST, self).__call__(request)
        if credentials:
            if not credentials.scheme == "Bearer":
                raise HTTPException(status_code=403, detail="Invalid authentication scheme.")
            if not self.verify_jwt(credentials.credentials):
                raise HTTPException(status_code=403, detail="Invalid token or expired token.")
            return credentials.credentials
        else:
            raise HTTPException(status_code=403, detail="Invalid authorization code.")

    def verify_jwt(self, jwtoken: str) -> bool:
        isTokenValid: bool = False
        try:
            payload = decodeJWT(jwtoken)
        except:
            payload = None
        if payload:
            email = payload.get('email')
            role = getRoleFromDB(email)
            if role is not None:
                if role == 2 or role == 0:
                    isTokenValid = True
        return isTokenValid


class JWTBearer(HTTPBearer):
    def __init__(self, auto_error: bool = True):
        super(JWTBearer, self).__init__(auto_error=auto_error)

    async def __call__(self, request: Request):
        credentials: HTTPAuthorizationCredentials = await super(JWTBearer, self).__call__(request)
        if credentials:
            if not credentials.scheme == "Bearer":
                raise HTTPException(status_code=403, detail="Invalid authentication scheme.")
            if not self.verify_jwt(credentials.credentials):
                raise HTTPException(status_code=403, detail="Invalid token or expired token.")
            return credentials.credentials
        else:
            raise HTTPException(status_code=403, detail="Invalid authorization code.")

    def verify_jwt(self, jwtoken: str) -> bool:
        isTokenValid: bool = False
        try:
            payload = decodeJWT(jwtoken)
        except:
            payload = None
        if payload:
            email = payload.get('email')
            role = getRoleFromDB(email)
            if role is not None:
                if role == 4 or role == 0:
                    isTokenValid = True
        return isTokenValid


class JWTBearerData(HTTPBearer):
    def __init__(self, auto_error: bool = True):
        super(JWTBearerData, self).__init__(auto_error=auto_error)

    async def __call__(self, request: Request):
        credentials: HTTPAuthorizationCredentials = await super(JWTBearerData, self).__call__(request)
        if credentials:
            if not credentials.scheme == "Bearer":
                raise HTTPException(status_code=403, detail="Invalid authentication scheme.")
            if not self.verify_jwt(credentials.credentials):
                raise HTTPException(status_code=403, detail="Invalid token or expired token.")
            return credentials.credentials
        else:
            raise HTTPException(status_code=403, detail="Invalid authorization code.")


    def verify_jwt(self, jwtoken: str) -> bool:
        isTokenValid: bool = False
        try:
            payload = decodeJWT(jwtoken)
        except:
            payload = None
        if payload:
            email = payload.get('email')
            role = getRoleFromDB(email)
            if role is not None:
                if role == 1 or role == 0:
                    isTokenValid = True
        return isTokenValid


class JWTBearerNR(HTTPBearer):
    def __init__(self, auto_error: bool = True):
        super(JWTBearerNR, self).__init__(auto_error=auto_error)

    async def __call__(self, request: Request):
        credentials: HTTPAuthorizationCredentials = await super(JWTBearerNR, self).__call__(request)
        if credentials:
            if not credentials.scheme == "Bearer":
                raise HTTPException(status_code=403, detail="Invalid authentication scheme.")
            if not self.verify_jwt(credentials.credentials):
                raise HTTPException(status_code=403, detail="Invalid token or expired token.")
            return credentials.credentials
        else:
            raise HTTPException(status_code=403, detail="Invalid authorization code.")


    def verify_jwt(self, jwtoken: str) -> bool:
        isTokenValid: bool = False
        try:
            payload = decodeJWT(jwtoken)
        except:
            payload = None
        if payload:
            email = payload.get('email')
            role = getRoleFromDB(email)
            if role is not None:
                if role == 3 or role == 0:
                    isTokenValid = True
        return isTokenValid


class JWTBearerAll(HTTPBearer):
    def __init__(self, auto_error: bool = True):
        super(JWTBearerAll, self).__init__(auto_error=auto_error)

    async def __call__(self, request: Request):
        credentials: HTTPAuthorizationCredentials = await super(JWTBearerAll, self).__call__(request)
        if credentials:
            if not credentials.scheme == "Bearer":
                raise HTTPException(status_code=403, detail="Invalid authentication scheme.")
            if not self.verify_jwt(credentials.credentials):
                raise HTTPException(status_code=403, detail="Invalid token or expired token.")
            return credentials.credentials
        else:
            raise HTTPException(status_code=403, detail="Invalid authorization code.")


    def verify_jwt(self, jwtoken: str) -> bool:
        isTokenValid: bool = False
        try:
            payload = decodeJWT(jwtoken)
        except:
            payload = None
        if payload:
            email = payload.get('email')
            role = getRoleFromDB(email)
            if role is not None:
                isTokenValid = True
        return isTokenValid