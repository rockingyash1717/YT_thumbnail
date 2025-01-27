import os
import google.generativeai as genai


genai.configure(api_key="*******************") # Add your API key here

def generate_newsummary(prompt):

    generation_config = {
    "temperature": 1,
    "top_p": 0.95,
    "top_k": 40,
    "max_output_tokens": 8192,
    "response_mime_type": "text/plain",
    }

    model = genai.GenerativeModel(
    model_name="gemini-1.5-pro",
    generation_config=generation_config,
    )

    chat_session = model.start_chat(
    history=[
    ]
    )
    response = chat_session.send_message(prompt)

    return response.text

if __name__ == "__main__":
    text=generate_newsummary(""""give only one best style for image using following points:\
    Target Audience: Programmers, particularly those learning C programming language\
    Thumbnail Style:\
    Visual: A simple, clean design with a focus on a code snippet or diagram illustrating pointer concepts.\
   Color Scheme: A combination of dark and light colors, such as a dark background with bright text and graphics.\
   Composition: A centered, minimalist layout with clear and concise elements.\
   Overall Aesthetic: Technical, informative, and visually appealing"
   """)
    print(text)