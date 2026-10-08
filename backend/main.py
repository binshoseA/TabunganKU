from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Gunakan Optional untuk kolom yang boleh bernilai null/kosong dari React
class Transaction(BaseModel):
    id: Optional[int] = None
    type: str
    amount: int
    date: str
    paymentMethod: str
    category: str
    note: str
    receipt: Optional[str] = None

@app.post("/api/transactions")
async def process_transaction(tx: Transaction):
    note_text = tx.note.lower()
    predicted_category = tx.category 
    
    makan_keywords = ["kopi", "makan", "minum", "gacoan", "batagor", "roti", "indomaret"]
    transport_keywords = ["bensin", "grab", "gojek", "parkir", "tol", "krl"]
    tagihan_keywords = ["listrik", "cbn", "wifi", "air", "pulsa"]
    
    if tx.type == "expense":
        if any(word in note_text for word in makan_keywords):
            predicted_category = "Makan & Minum"
        elif any(word in note_text for word in transport_keywords):
            predicted_category = "Transport"
        elif any(word in note_text for word in tagihan_keywords):
            predicted_category = "Tagihan"

    tx.category = predicted_category

    return {
        "status": "success",
        "data": tx.dict()
    }