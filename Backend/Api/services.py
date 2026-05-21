# # seu_app/services.py
# import requests'

# def obter_token_jumpad():
#     url = "URL_DO_SEU_JUMPAD/api/token"  # Substitua pela URL real que está na doc
#     payload = {
#         'username': 'seu_usuario',
#         'password': 'sua_senha',
#         'grant_type': 'password'
#     }
#     try:
#         response = requests.post(url, data=payload)
#         response.raise_for_status() # Avisa se a senha estiver errada ou o site cair
#         return response.json().get('access_token')
#     except Exception as e:
#         print(f"Erro ao conectar no Jumpad: {e}")
#         return None

# def enviar_pergunta_jumpad(texto_usuario):
#     token = obter_token_jumpad()
#     if not token:
#         return "Erro de autenticação com a IA."

#     url = "URL_DO_SEU_JUMPAD/api/chats"
#     headers = {'Authorization': f'Bearer {token}'}
#     data = {"message": texto_usuario}

#     response = requests.post(url, json=data, headers=headers)
#     return response.json().get('response') # Ajuste conforme o JSON que a API devolve