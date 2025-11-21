import random, pickle, json, sys, re
from nltk.tokenize import sent_tokenize

# Import saved model
with open("model.pkl", "rb") as savedModel:
    model = pickle.load(savedModel)

# Import saved vectorizer
with open("vectorizer.pkl", "rb") as savedVectorizer:
    vectorizer = pickle.load(savedVectorizer)

# Import intents.json
with open("intents.json", "r") as savedData:
    data = json.load(savedData)

# Predict tag function that also returns a probability of how confident it is
def predict_tag(vect):
    predicted_tag = model.predict(vect)[0]
    probabilities = model.predict_proba(vect)[0]
    confidence = max(probabilities)
    return predicted_tag, confidence


# Get a response from the ML model
def get_response(text):
    responses = []
    
    # Preprocess the text to ensure consistent formatting for the model
    text = text.lower()
    text = re.sub(r"[^a-zA-Z0-9\s]", "", text).strip()  # keep only letters/numbers/spaces
    sentences = sent_tokenize(text)

    for sentence in sentences:
        # Predict what tag the text falls under
        vect = vectorizer.transform([sentence])
        tag = model.predict(vect)[0]
        tag, confidence = predict_tag(vect)

        # Cross referencing each tag in the json file with the tag that we predicted
        # Edge cases fall under else so that we still get an answer from the model
        if confidence > 0.45:
            for intent in data["intents"]:
                if intent["tag"] == tag:
                    responses.append(random.choice(intent["responses"]))
                    break
        else:
            responses.append("I got no clue what you are trying to say")
        
    if responses:
        return " ".join(responses)
    return "I'm not sure about that one"

if __name__ == "__main__":
# Get the first command line argument passed in
    user_input = sys.argv[1]
    print(get_response(user_input))