from Api.services import enviar_pergunta_langflow


resposta = enviar_pergunta_langflow(
    "Olá! Responda apenas: integração funcionando."
)

print(resposta)