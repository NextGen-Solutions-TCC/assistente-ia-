from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Usuario, Conversa, Mensagem, ModeloIA


class UsuarioSerializer(serializers.ModelSerializer):
    class Meta:
        model = Usuario
        fields = '__all__'


class RegisterSerializer(serializers.Serializer):
    username = serializers.CharField()
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)
    nome = serializers.CharField(required=False)
    tipo = serializers.ChoiceField(choices=Usuario.TIPO_CHOICES)
    data_criacao = serializers.DateTimeField(required=False)

    def create(self, validated_data):
    
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password']
        )

       
        usuario = Usuario.objects.create(
            user=user,
            nome=validated_data.get('nome', user.username),
            email=validated_data['email'],
            tipo=validated_data['tipo'],
            data_criacao=validated_data.get('data_criacao')
        )

        return usuario



class ModeloIASerializer(serializers.ModelSerializer):
    class Meta:
        model = ModeloIA
        fields = ['id', 'nome_modelo', 'versao', 'data_lancamento']


class ConversaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Conversa
        fields = ['id', 'usuario', 'titulo']
        read_only_fields = ['usuario']



class MensagemSerializer(serializers.ModelSerializer):
    class Meta:
        model = Mensagem
        fields = ['id', 'conversa', 'modelo', 'remetente', 'texto', 'data_envio']