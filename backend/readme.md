How to run
==========

To run in development mode, install requirements and execute:

```bash
PYTHONPATH='.' uvicorn main:app --reload
```

To run in production mode with ngrok:

```bash
./ngrok authtoken <your_auth_token>
PYTHONPATH='..' python start.py
```
