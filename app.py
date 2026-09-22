from fastapi import FastAPI
from pydantic import BaseModel
import joblib

app = FastAPI(
    title="AI Support Ticket Intelligence Platform",
    description="Ticket Type Prediction API",
    version="1.0.0"
)

model = joblib.load("ticket_type_model.pkl")
tfidf = joblib.load("ticket_type_tfidf.pkl")

print("Model and TF-IDF loaded successfully")


class TicketInput(BaseModel):
    title: str
    body: str


@app.get("/")
def home():
    return {
        "message": "AI Support Ticket Intelligence Platform API is running",
        "status": "success"
    }


@app.get("/health")
def health():
    return {
        "status": "healthy",
        "model_loaded": True
    }


@app.post("/predict")
def predict_ticket(data: TicketInput):

    ticket_text = data.title + " " + data.body

    ticket_tfidf = tfidf.transform([ticket_text])

    prediction = model.predict(ticket_tfidf)

    return {
        "prediction": str(prediction[0])
    }