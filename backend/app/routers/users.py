from fastapi import APIRouter, HTTPException, Depends
from typing import List
from ..database import users_collection
from ..models.user import UserCreate, UserInDB
from passlib.context import CryptContext
from bson import ObjectId

router = APIRouter()
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)

@router.post("/users/", response_model=UserInDB)
async def create_user(user: UserCreate):
    # Check if user already exists
    if await users_collection.find_one({"email": user.email}):
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # Create user document
    user_dict = user.dict()
    user_dict["hashed_password"] = get_password_hash(user.password)
    del user_dict["password"]
    
    # Insert user into database
    result = await users_collection.insert_one(user_dict)
    created_user = await users_collection.find_one({"_id": result.inserted_id})
    
    return UserInDB(**created_user)

@router.get("/users/", response_model=List[UserInDB])
async def get_users():
    users = []
    async for user in users_collection.find():
        users.append(UserInDB(**user))
    return users

@router.get("/users/{user_id}", response_model=UserInDB)
async def get_user(user_id: str):
    if not ObjectId.is_valid(user_id):
        raise HTTPException(status_code=400, detail="Invalid user ID")
    
    user = await users_collection.find_one({"_id": ObjectId(user_id)})
    if user is None:
        raise HTTPException(status_code=404, detail="User not found")
    
    return UserInDB(**user) 