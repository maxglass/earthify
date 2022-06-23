import os
import time
from typing import Dict
import cryptocode
import jwt
from decouple import config

JWT_SECRET = config("secret")
JWT_ALGORITHM = config("algorithm")


def token_response(token: str):
    return {
        "access_token": token
    }


def signJWT(email: str, id: int, role: int) -> Dict[str, str]:
    role_route = ['management', 'upload', 'standard', 'normalise', 'map']
    payload = {
        "email": email,
        "user_id": id,
        "iat": time.time(),
        "exp": time.time() + 600,
        "route": role_route[role]
    }
    token = jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)

    return token_response(token)


def decodeJWT(token: str) -> dict:
    try:
        decoded_token = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        return decoded_token if decoded_token["exp"] >= time.time() else None
    except:
        return {}
