import json, pickle
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.naive_bayes import MultinomialNB
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report, confusion_matrix

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
vectorizer = TfidfVectorizer(ngram_range=(1, 2))
train = vectorizer.fit_transform(patterns)

# Learn from the vectorized text
model = MultinomialNB()
model.fit(train, tags)

# Function to test the accuracy of the model, using training data
def test_model():
    #  Load in testing data
    with open("testing_data.json", "r") as file:
        X_text = json.load(file)

    X_train, X_test, y_train, y_test = train_test_split(
        train, tags, test_size=0.2, random_state=42
    )

    model.fit(X_train, y_train)
    pred = model.predict(X_test)

    print(classification_report(y_test, pred))
    print(confusion_matrix(y_test, pred))

test_model()

# Metadata (for version control purposes)
metadata = {
    "model_version": "DILL-0.0.2",
    "training_samples": len(patterns),
    "vocab_size": len(vectorizer.vocabulary_),
    "preprocessing": {
        "lowercase": True,
        "punctuation_removed": True
    }
}

# Save the model as a .pkl file
with open("model.pkl", "wb") as savedModel:
    print("Saved model as model.pkl")
    pickle.dump(model, savedModel)

# Save the vectorizer as a .pkl file
with open("vectorizer.pkl", "wb") as savedVectorizer:
    print("Saved vectorizer as vectorizer.pkl")
    pickle.dump(vectorizer, savedVectorizer)

with open("metadata.json", "w") as savedMetadata:
    json.dump(metadata, savedMetadata, indent=4)