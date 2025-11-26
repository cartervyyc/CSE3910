# CSE3910 Chatbot Project

This project uses Python 3.11 with nltk, scikit-learn, regex, and pybind11 for C++ integration.

## Setup

### Prerequisites
- macOS with Homebrew
- Python 3.11 (installed via Homebrew)
- CMake (installed via Homebrew)

### Installation

All dependencies have been installed. The project uses:
- **Python 3.11.14** (via Homebrew at `/opt/homebrew/bin/python3.11`)
- **Virtual environment** at `venv/` with Python 3.11
- **Python packages**: nltk, scikit-learn, regex, pybind11
- **NLTK data**: punkt tokenizer (already downloaded)

## Project Structure

```
CSE3910/
├── venv/                  # Python 3.11 virtual environment
├── requirements.txt       # Python dependencies
├── predict.py            # Main prediction script
├── model/                # General chatbot model
│   ├── train.py
│   ├── model.pkl
│   └── vectorizer.pkl
├── math_model/           # Math-specific model
│   ├── math_train.py
│   ├── math_model.pkl
│   └── math_vectorizer.pkl
└── backend/              # C++ backend with pybind11
    ├── CMakeLists.txt    # CMake configuration
    ├── build.sh          # Build script
    ├── run.sh            # Run script (sets up environment)
    ├── src/
    │   └── main.cpp      # C++ source with pybind11
    └── bin/
        └── chatbot       # Compiled executable
```

## Usage

### Activating the Virtual Environment

```bash
source venv/bin/activate
```

### Training the Models

Train the general model:
```bash
cd model
python train.py
cd ..
```

Train the math model:
```bash
cd math_model
python math_train.py
cd ..
```

### Running Python Prediction Script

```bash
python predict.py "hello there"
python predict.py "what is 5 plus 3?"
```

## Python Version

All Python scripts now use **Python 3.11.14**. The virtual environment ensures consistent behavior across all scripts.

To verify Python version:
```bash
venv/bin/python --version
# Output: Python 3.11.14
```

## Dependencies

Python packages (installed in venv):
- **nltk** >= 3.8.1
- **scikit-learn** >= 1.3.0
- **regex** >= 2023.12.25
- **pybind11** >= 2.11.1

## Notes

- The C++ backend uses pybind11 to embed Python 3.11
- All paths are configured to use the venv Python installation
- NLTK data is installed at `~/nltk_data`
- The C++ executable must be run from the project root or with proper PYTHONPATH set (use `run.sh`)
