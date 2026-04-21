import os
import time
from google import genai
from dotenv import load_dotenv

load_dotenv()
api_key = os.getenv("GEMINI_API_KEY")

def generar_con_respaldo(prompt):
    client = genai.Client(api_key=api_key)
    
    # Nombres de modelos actualizados para 2026 (ajustados según tu tabla)
    modelos = [
        'gemini-2.5-flash-lite', # Este es tu mejor apuesta ahorita (10 RPM y está libre)
        'gemini-2.5-flash',
        'gemini-1.5-flash',
        'gemini-2.0-flash'
    ]
    
    for nombre_modelo in modelos:
        try:
            print(f"🚀 Intentando con {nombre_modelo}...")
            response = client.models.generate_content(
                model=nombre_modelo, 
                contents=prompt
            )
            return response.text
            
        except Exception as e:
            error_str = str(e)
            # Si el modelo no existe (404) o está saturado (429), saltamos al siguiente
            if "404" in error_str or "429" in error_str:
                razon = "no encontrado" if "404" in error_str else "saturado"
                print(f"⚠️ {nombre_modelo} {razon}. Saltando al siguiente...")
                continue 
            else:
                return f"❌ Error técnico: {e}"
    
    return "❌ No se pudo conectar con ningún modelo disponible."

# --- PRUEBA ---
if api_key:
    resultado = generar_con_respaldo("Escribe un eslogan para Nappancakes.")
    print(f"\n✨ RESULTADO:\n{resultado}")