import random, pickle, json, sys, re
from nltk.tokenize import sent_tokenize

# --------------------- LOAD GENERAL MODEL ---------------------
with open("model/model.pkl", "rb") as savedModel:
    model = pickle.load(savedModel)

with open("model/vectorizer.pkl", "rb") as savedVectorizer:
    vectorizer = pickle.load(savedVectorizer)

with open("model/intents.json", "r") as savedData:
    data = json.load(savedData)

# --------------------- LOAD MATH MODEL ---------------------
with open("math_model/math_model.pkl", "rb") as savedModel:
    math_model = pickle.load(savedModel)

with open("math_model/math_vectorizer.pkl", "rb") as savedVectorizer:
    math_vectorizer = pickle.load(savedVectorizer)

with open("math_model/math_intents.json", "r") as savedData:
    math_data = json.load(savedData)

# ---------------- HISTORY ----------------
conversation_history = {
    "last_tag": None,
    "history": []
}

# ---------------- UTILS ----------------
def predict_general_tag(vect):
    predicted_tag = model.predict(vect)[0]
    confidence = max(model.predict_proba(vect)[0])
    return predicted_tag, confidence

def predict_math_tag(vect):
    predicted_tag = math_model.predict(vect)[0]
    confidence = max(math_model.predict_proba(vect)[0])
    return predicted_tag, confidence

def clean_text(t):
    t = t.lower()
    t = re.sub(r"[^a-z0-9\s]", "", t)
    return t.strip()

def is_math_input(text):
    keywords = ["add", "subtract", "divide", "perimeter", "area", "multiply", "+", "-", "*", "/"]
    return any(kw in text.lower() for kw in keywords)

# ---------------- GENERAL RESPONSE ----------------
def get_general_response(text):
    cleaned = clean_text(text)

    vect = vectorizer.transform([cleaned])
    tag, confidence = predict_general_tag(vect)

    conversation_history["last_tag"] = tag
    conversation_history["history"].append(cleaned)

    print(f"{tag} {confidence}")

    if confidence > 0.30:
        for intent in data["intents"]:
            if intent["tag"] == tag:
                return random.choice(intent["responses"])
            
                r
    return ""


# ---------------- MATH RESPONSE ----------------
def get_math_response(text):
    cleaned = clean_text(text)

    vect = math_vectorizer.transform([cleaned])
    tag, confidence = predict_math_tag(vect)

    nums = re.findall(r"\d+", text)
    nums = list(map(int, nums))

    if len(nums) < 2:
        return "Yo I need two numbers to do that."

    a, b = nums[0], nums[1]

    if tag == "add":
        return "The answer is " + str(a + b)
    elif tag == "subtract":
        return "The answer is " + str(a - b)
    elif tag == "multiply":
        return "The answer is " + str(a * b)
    elif tag == "divide":
        return "The answer is " + str(a / b if b != 0 else "undefined")
    elif tag == "area_rectangle":
        return "The answer is " + str(a * b)
    elif tag == "perimeter_rectangle":
        return "The answer is " + str(2 * (a + b))

    return "Not sure how to calculate that."

# ---------------- ROUTER ----------------
def get_response(text):
    sentences = re.split(r"[.!?]", text)
    final_responses = []

    for sentence in sentences:
        sentence = sentence.strip()
        if not sentence:
            continue

        if is_math_input(sentence):
            final_responses.append(get_math_response(sentence))
        else:
            final_responses.append(get_general_response(sentence))

    if final_responses:
        return " ".join(final_responses)

    return "I'm not sure about that one."


# ---------------- MAIN ----------------
if __name__ == "__main__":
    user_input = sys.argv[1]
    print(get_response(user_input))
