import random, pickle, json, sys, re, os
from abc import ABC, abstractmethod

# ---------------- BASE MODEL ----------------
class Model(ABC):
    def __init__(self, model, vectorizer, intents=None):
        self.model = model
        self.vectorizer = vectorizer
        self.intents = intents

    @abstractmethod
    def predict(self, vect):
        pass

    @abstractmethod
    def get_response(self, text):
        pass


# ---------------- GENERAL MODEL ----------------
class General_Model(Model):

    @staticmethod
    def clean_text(t):
        t = t.lower()
        t = re.sub(r"[^a-z0-9\s]", "", t)
        return t.strip()

    def predict(self, vect):
        tag = self.model.predict(vect)[0]
        confidence = max(self.model.predict_proba(vect)[0])
        return tag, confidence

    def exact_match(self, cleaned_text):
        for intent in self.intents["intents"]:
            for pattern in intent["patterns"]:
                if cleaned_text == self.clean_text(pattern):
                    return intent["tag"]
        return None

    def get_response(self, text, conversation_history):
        cleaned = self.clean_text(text)

        # ---- EXACT MATCH OVERRIDE ----
        exact_tag = self.exact_match(cleaned)
        if exact_tag:
            conversation_history["last_tag"] = exact_tag
            conversation_history["history"].append(cleaned)

            for intent in self.intents["intents"]:
                if intent["tag"] == exact_tag:
                    return random.choice(intent["responses"])

        # ---- ML FALLBACK ----
        vect = self.vectorizer.transform([cleaned])
        tag, confidence = self.predict(vect)

        conversation_history["last_tag"] = tag
        conversation_history["history"].append(cleaned)

        if confidence > 0.2:
            for intent in self.intents["intents"]:
                if intent["tag"] == tag:
                    return random.choice(intent["responses"])

        return ""


# ---------------- MATH MODEL ----------------
class Math_Model(Model):

    def predict(self, vect):
        tag = self.model.predict(vect)[0]
        confidence = max(self.model.predict_proba(vect)[0])
        return tag, confidence

    def get_response(self, text):
        if "+" in text:
            nums = list(map(int, re.findall(r"\d+", text)))
            if len(nums) >= 2:
                return "The answer is " + str(nums[0] + nums[1])

        elif "-" in text:
            nums = list(map(int, re.findall(r"\d+", text)))
            if len(nums) >= 2:
                return "The answer is " + str(nums[0] - nums[1])

        elif "*" in text:
            nums = list(map(int, re.findall(r"\d+", text)))
            if len(nums) >= 2:
                return "The answer is " + str(nums[0] * nums[1])

        elif "/" in text:
            nums = list(map(int, re.findall(r"\d+", text)))
            if len(nums) >= 2:
                return "The answer is " + str(nums[0] / nums[1] if nums[1] != 0 else "undefined")

        cleaned = General_Model.clean_text(text)
        vect = self.vectorizer.transform([cleaned])
        tag, confidence = self.predict(vect)

        nums = list(map(int, re.findall(r"\d+", text)))
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


# ---------------- MANAGER / ROUTER ----------------
class Manager:
    def __init__(self, general_model, math_model):
        self.general_model = general_model
        self.math_model = math_model
        self.conversation_history = {
            "last_tag": None,
            "history": []
        }

    @staticmethod
    def is_math_input(text):
        keywords = ["add", "subtract", "divide", "perimeter", "area", "multiply", "+", "-", "*", "/"]
        return any(k in text.lower() for k in keywords)

    def get_response(self, text):
        sentences = re.split(r"[.!?]", text)
        responses = []

        for s in sentences:
            s = s.strip()
            if not s:
                continue

            if self.is_math_input(s):
                resp = self.math_model.get_response(s)
            else:
                resp = self.general_model.get_response(s, self.conversation_history)

            if resp:
                responses.append(resp)

        if responses:
            return " ".join(responses)

        return "I'm not sure about that one."


# ---------------- LOAD MODELS ----------------
BASE_DIR = os.path.dirname(os.path.abspath(__file__))

with open(os.path.join(BASE_DIR, "model/model.pkl"), "rb") as f:
    general_model_obj = pickle.load(f)

with open(os.path.join(BASE_DIR, "model/vectorizer.pkl"), "rb") as f:
    general_vectorizer = pickle.load(f)

with open(os.path.join(BASE_DIR, "model/intents.json")) as f:
    general_intents = json.load(f)

with open(os.path.join(BASE_DIR, "math_model/math_model.pkl"), "rb") as f:
    math_model_obj = pickle.load(f)

with open(os.path.join(BASE_DIR, "math_model/math_vectorizer.pkl"), "rb") as f:
    math_vectorizer = pickle.load(f)

with open(os.path.join(BASE_DIR, "math_model/math_intents.json")) as f:
    math_intents = json.load(f)


# ---------------- INIT ----------------
general_model = General_Model(
    general_model_obj,
    general_vectorizer,
    general_intents
)

math_model = Math_Model(
    math_model_obj,
    math_vectorizer,
    math_intents
)

manager = Manager(general_model, math_model)


# ---------------- MAIN ----------------
if __name__ == "__main__":
    user_input = sys.argv[1]
    print(manager.get_response(user_input))
