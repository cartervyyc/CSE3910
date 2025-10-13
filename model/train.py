import json, pickle
from sklearn.feature_extraction.text import CountVectorizer
from sklearn.naive_bayes import MultinomialNB

# Open intents.json and save the data as a list
with open("intents.json", "r") as file:
    data = json.load(file)

patterns = []
tags = []

# Map each pattern and tag into their own lists
for intent in data["intents"]:
    for pattern in intent["patterns"]:
        patterns.append(pattern)
        tags.append(intent["tag"])

# Train the ML Model
# Vectorize the text because computers cannot understand full sentences
vectorizer = CountVectorizer()
train = vectorizer.fit_transform(patterns)

# Learn from the vectorized text
model = MultinomialNB()
model.fit(train, tags)

# Save the model as a .pkl file
with open("model.pkl", "wb") as savedModel:
    pickle.dump(model, savedModel)

# Save the vectorizer as a .pkl file
with open("vectorizer.pkl", "wb") as savedVectorizer:
    pickle.dump(vectorizer, savedVectorizer)