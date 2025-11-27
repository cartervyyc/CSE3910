# Pickle AI Chatbot

Pickle is a local AI chatbot project that uses a Python model backend with a C++ HTTP server bridge and a web-based frontend.

---

## Table of Contents

- [Features](#features)
- [Requirements](#requirements)
- [Project Structure](#project-structure)
- [Setup & Usage](#setup--usage)
- [How It Works](#how-it-works)
- [Customization](#customization)
- [Troubleshooting](#troubleshooting)

---

## Features

- Local AI chatbot with multiple models:
  - **Dill** – Conversational
  - **Cucumber** – Math-focused
  - **Gourmet** – Premium
- Custom overlay scrollbar
- Model and scrollbar selection persistence
- Fully local – no external API required

---

## Requirements

- **Python 3.11+**
- **C++17 capable compiler** (`g++` or `clang++`)
- Linux, macOS, or Windows Subsystem for Linux (WSL)
- Optional: `pip` for Python packages

Python dependencies are installed via virtual environment automatically.

---

## Setup & Usage

1. **Make the script executable:**

```bash
chmod +x activate.sh
```

2. **Run the activation script:**

```bash
./activate.sh
```

This will:

- Create and activate a Python virtual environment (`venv`)
- Install Python dependencies (`pip install -r requirements.txt`)
- Compile the C++ backend (`main.cpp`)
- Start the backend server on `http://localhost:5000`
- Start a frontend web server on `http://localhost:8000`

3. **Open the frontend in your browser:**

Go to: `http://localhost:8000`

4. **Chat with Pickle AI:**

- Enter your message in the input box and click **Send**
- Select different AI models or change scrollbar preferences

---

## How It Works

- **Frontend (JS/HTML/CSS):**  
  Handles UI, input validation, and sends user messages to the C++ backend via HTTP POST.

- **C++ Backend (main.cpp + httplib/json.hpp):**  
  Receives requests, calls the Python model script (`predict.py`), and returns AI responses as JSON.

- **Python Backend (predict.py):**  
  Contains your AI logic, loads models, and generates responses based on user input.

---

## Customization

- **Models:** Update `predict.py` to add or modify AI models.
- **Server Port:** Change in `main.cpp` if needed.
- **UI:** Edit `frontend/index.html` and `frontend/style.css` for styling.

---

## Troubleshooting

- **Python script not found:**  
  Make sure `predict.py` path in `main.cpp` is correct relative to the C++ binary.

- **Port conflicts:**  
  Ensure ports `5000` (backend) and `8000` (frontend) are free.

- **Dependencies missing:**  
  Activate the virtual environment manually:

```bash
source venv/bin/activate
pip install -r backend/src/requirements.txt
```

- **Compilation errors:**  
  Ensure you have `g++` or `clang++` with C++17 support and headers (`httplib.h` and `json.hpp`) in the right folder.

---

## License

This project is for educational purposes and personal use.
