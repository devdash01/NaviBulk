import os
import sys

# Ensure backend root directory is on the python path
current_dir = os.path.dirname(os.path.abspath(__file__))
backend_root = os.path.dirname(current_dir)
if backend_root not in sys.path:
    sys.path.insert(0, backend_root)

from main import app

# Vercel serverless function entrypoint
app = app
