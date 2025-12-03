import sys
import json
import base64
import os
from faster_whisper import WhisperModel

# Initialize model (downloaded on first run)
# 'tiny' is fast, 'base' is balanced, 'small' is accurate
model_size = "base" 
model = WhisperModel(model_size, device="cpu", compute_type="int8")

def transcribe_audio(audio_path):
    try:
        segments, info = model.transcribe(audio_path, beam_size=5)
        
        transcript = ""
        for segment in segments:
            transcript += segment.text + " "
            
        result = {
            "text": transcript.strip(),
            "language": info.language,
            "probability": info.language_probability
        }
        
        print(json.dumps(result))
        
    except Exception as e:
        print(json.dumps({"error": str(e)}))

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print(json.dumps({"error": "No audio file provided"}))
        sys.exit(1)
        
    audio_file = sys.argv[1]
    transcribe_audio(audio_file)
