import os
import uuid
import requests
from dotenv import load_dotenv

load_dotenv()


def enviar_pergunta_langflow(pergunta):
    langflow_url = os.getenv("LANGFLOW_URL")
    flow_id = os.getenv("LANGFLOW_FLOW_ID")
    api_key = os.getenv("LANGFLOW_API_KEY")

    if not langflow_url or not flow_id or not api_key:
        raise Exception("Configuração do Langflow não encontrada no .env")

    url = f"{langflow_url}/api/v1/run/{flow_id}"

    payload = {
        "output_type": "chat",
        "input_type": "chat",
        "input_value": pergunta,
        "session_id": str(uuid.uuid4()),
    }

    headers = {
        "x-api-key": api_key,
        "Content-Type": "application/json",
    }

    response = requests.post(
        url,
        json=payload,
        headers=headers,
        timeout=120,
    )

    response.raise_for_status()

    data = response.json()

    try:
        return data["outputs"][0]["outputs"][0]["results"]["message"]["text"]
    except (KeyError, IndexError, TypeError):
        raise Exception(
            f"Resposta inesperada do Langflow: {data}"
        )