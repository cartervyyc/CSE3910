# Quick Start Guide

## ✅ Setup Complete!

Your project is now configured with **Python 3.11.14** and all dependencies.

## Quick Commands

### Activate Python 3.11 Environment
```bash
source activate.sh
# or
source venv/bin/activate
```

### Run Python Scripts
```bash
# Make sure you're in the project root directory
python predict.py "your message here"
```

### Build C++ Backend
```bash
cd backend
./build.sh
```

### Run C++ Chatbot
```bash
cd backend
./run.sh
```

## What's Installed

✓ Python 3.11.14  
✓ nltk 3.9.2  
✓ scikit-learn 1.7.2  
✓ regex 2025.11.3  
✓ pybind11 3.0.1  
✓ CMake 4.2.0  
✓ C++ backend compiled with pybind11

## File Locations

- **Python 3.11**: `/opt/homebrew/bin/python3.11`
- **Virtual Environment**: `venv/`
- **C++ Executable**: `backend/bin/chatbot`
- **Requirements**: `requirements.txt`
- **CMake Config**: `backend/CMakeLists.txt`

## Troubleshooting

**If Python scripts don't run:**
- Activate the venv: `source venv/bin/activate`
- Make sure you're in the project root directory

**If C++ build fails:**
- Run `./build.sh` from the `backend/` directory
- Check that CMake is installed: `cmake --version`

**If C++ chatbot can't find Python modules:**
- Use the `run.sh` script instead of running the binary directly
- The script sets up PYTHONPATH automatically
