#!/bin/bash

# =========================
# ACTIVATE SCRIPT FOR PICKLE
# =========================

# --- Step 0: Variables ---
BACKEND_DIR="./backend/src"
FRONTEND_DIR="../../frontend"
VENV_DIR="./venv"
PYTHON_BIN=python3
CPP_EXEC="server"

# --- Step 1: Setup Python virtual environment ---
if [ ! -d "$VENV_DIR" ]; then
    echo "Creating Python virtual environment..."
    $PYTHON_BIN -m venv $VENV_DIR
fi

echo "Activating virtual environment..."
source $VENV_DIR/bin/activate

# --- Step 2: Install Python packages ---
echo "Installing Python dependencies..."
pip install --upgrade pip
pip install -r "$BACKEND_DIR/requirements.txt" 2>/dev/null || echo "No requirements.txt found, skipping"

# --- Step 3: Compile C++ backend ---
echo "Compiling C++ backend..."
cd $BACKEND_DIR || exit
g++ main.cpp -o $CPP_EXEC -std=c++17 || { echo "Compilation failed"; exit 1; }

# --- Step 4: Start C++ backend ---
echo "Starting C++ backend..."
./$CPP_EXEC &
BACKEND_PID=$!

# --- Step 5: Start frontend server ---
echo "Starting frontend server..."
cd $FRONTEND_DIR || exit
python3 -m http.server 8000 &
FRONTEND_PID=$!

# --- Step 6: Display info ---
echo "------------------------------"
echo "Backend running on http://localhost:5000"
echo "Frontend running on http://localhost:8000"
echo "------------------------------"

# --- Step 7: Wait for user to exit ---
echo "Press [CTRL+C] to stop servers"
wait $BACKEND_PID $FRONTEND_PID
