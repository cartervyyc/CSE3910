#!/bin/bash
# Quick activation script for the Python 3.11 virtual environment
# Usage: source activate.sh

if [ -f "venv/bin/activate" ]; then
    source venv/bin/activate
    echo "✓ Activated Python 3.11 virtual environment"
    python --version
else
    echo "Error: venv/bin/activate not found"
    exit 1
fi
