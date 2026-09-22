# AI Support Ticket Intelligence Platform

An AI Support Ticket Intelligence Platform built using Machine Learning, Natural Language Processing, React, Firebase, and FastAPI.

## Project Overview

IT support teams receive a large number of support tickets every day. Manually reviewing and organizing these tickets can take time.

This project uses Machine Learning to analyze support ticket text and provide two main capabilities:

1. **Ticket Type Prediction**
   - Predicts whether a ticket is an **Incident** or a **Request**.
   - Uses ticket title and body as input.
   - TF-IDF is used for text representation.
   - A tuned LinearSVC model is used for classification.

2. **Support Ticket Clustering**
   - Groups similar support tickets without using a predefined target label.
   - Uses TF-IDF text features.
   - K-Means clustering is used with 4 clusters.

## ML Tasks

### 1. Ticket Type Prediction

**Type:** Classification

**Input:**
- Ticket title
- Ticket body

**Output:**
- `0` → Incident
- `1` → Request

**Model:** Tuned LinearSVC

**Text Processing:** TF-IDF

### 2. Support Ticket Clustering

**Type:** Unsupervised Clustering

**Input:**
- Ticket title
- Ticket body

**Algorithm:** K-Means

**Number of clusters:** 4

## Technology Stack

- Python
- Scikit-learn
- TF-IDF
- LinearSVC
- K-Means
- FastAPI
- React
- Firebase Authentication
- Cloud Firestore

## Application Features

- User Sign In and Sign Up
- User Dashboard
- Ticket Type Prediction
- Prediction Result Display
- User Prediction History
- Support Ticket Clustering
- Cluster-wise ticket analysis
- Important word analysis
- About Project page
- Logout
- FastAPI ML backend

## Project Structure

```text
AI-Support-Ticket-Intelligence-Platform
│
├── public
│   └── endava_tickets_final_clustered.csv
│
├── src
│   ├── App.jsx
│   ├── AuthPage.jsx
│   ├── HistoryPage.jsx
│   ├── firebase.js
│   ├── App.css
│   ├── index.css
│   └── main.jsx
│
├── app.py
├── requirements.txt
├── ticket_type_model.pkl
├── ticket_type_tfidf.pkl
├── package.json
├── package-lock.json
├── vite.config.js
└── index.html
