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

# Get a response from the ML model
def get_response(text):
    responses = []
    
    # Use regex to split by commas, periods, question marks, exclamation marks, semicolons
    text = text.lower()
    sentences = sent_tokenize(text)

    for sentence in sentences:
        # Predict what tag the text falls under
        train = vectorizer.transform([sentence.strip()])
        tag = model.predict(train)[0]

        # Cross referencing each tag in the json file with the tag that we predicted
        # Edge cases fall under else so that we still get an answer from the model
        for intent in data["intents"]:
            if intent["tag"] == tag:
                responses.append(random.choice(intent["responses"]))
                break
        
    if responses:
        return " ".join(responses)
    return "I'm not sure about that one"

if __name__ == "__main__":
# Get the first command line argument passed in
    user_input = sys.argv[1]
    print(get_response(user_input))