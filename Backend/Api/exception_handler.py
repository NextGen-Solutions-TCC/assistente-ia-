import logging

from rest_framework.views import exception_handler as drf_exception_handler
from rest_framework.response import Response
from rest_framework import status

logger = logging.getLogger(__name__)


def custom_exception_handler(exc, context):
    """Garante que toda exceção não tratada vire uma resposta JSON estruturada
    (em vez da página de erro HTML padrão do Django) e fique registrada no log."""

    response = drf_exception_handler(exc, context)

    if response is not None:
        return response

    view = context.get("view")
    logger.exception("Erro não tratado em %s", view.__class__.__name__ if view else "view desconhecida")

    return Response(
        {"detail": "Erro interno no servidor. Tente novamente mais tarde."},
        status=status.HTTP_500_INTERNAL_SERVER_ERROR,
    )