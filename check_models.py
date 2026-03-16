import google.generativeai as genai
import os

API_KEY = "AIzaSyDeZAu2bTPouXmerAfNHGSLTDBc-K6Uz7s"
genai.configure(api_key=API_KEY)

with open("models_list.txt", "w") as f:
    f.write("Listing all available models:\n")
    try:
        models = genai.list_models()
        for m in models:
            f.write(f"Model: {m.name}, Methods: {m.supported_generation_methods}\n")
    except Exception as e:
        f.write(f"Error: {e}\n")
