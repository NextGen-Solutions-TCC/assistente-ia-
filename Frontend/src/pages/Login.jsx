import "./Login.css";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import robot from "../assets/robot.svg";
import google from "../assets/google.png";
import Card from "../components/Card";
import Input from "../components/Input";
import Button from "../components/Button";

// Importe a sua instância do Axios
import Api from "../services/Api"; // Ajuste o caminho se necessário

function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [errorEmail, setErrorEmail] = useState("");
  const [errorPassword, setErrorPassword] = useState("");
  const [errorGeral, setErrorGeral] = useState("");

  const validarEmail = (emailStr) => {
    return /\S+@\S+\.\S+/.test(emailStr);
  };

  const handleLogin = async () => {
    setErrorEmail("");
    setErrorPassword("");
    setErrorGeral("");

    let erroDetectado = false;

    if (!email && !password) {
      setErrorGeral("Preencha todos os campos");
      return;
    }

    if (!email) {
      setErrorEmail("O campo de e-mail é obrigatório");
      erroDetectado = true;
    } else if (!validarEmail(email)) {
      setErrorEmail("Digite um email válido");
      erroDetectado = true;
    }

    if (!password) {
      setErrorPassword("O campo de senha é obrigatório");
      erroDetectado = true;
    }

    if (erroDetectado) return;

    try {
      const response = await Api.post("login/", {
        email: email,
        password: password,
      });

      // Salva os tokens e o nome do usuário
      localStorage.setItem("access", response.data.access);
      localStorage.setItem("refresh", response.data.refresh);
      localStorage.setItem("user_name", response.data.nome);

      navigate("/chat");

    } catch (error) {
      // Se o erro for 500 ou queda de servidor, o Api.js (interceptador) já redireciona sozinho!
      // Aqui tratamos APENAS os erros de validação do formulário (Ex: 400 Bad Request)
      if (error.response && error.response.status < 500) {
        const data = error.response.data;
        setErrorGeral(data.message || data.detail || "Email ou senha incorretos");
      }
    }
  };

  const handleGoogleLogin = () => {
    window.location.href = "http://127.0.0.1:8000/accounts/google/login/?process=login";
  };

  return (
    <div className="container">
      <Card>
        <img src={robot} alt="robot" className="icon" />
        <h2>Bem vindo ao <span>LOGIN</span></h2>

        {errorGeral && <span className="error-message-inline geral">{errorGeral}</span>}

        <div className="input-group-validation">
          <div className="label-row">
            <label className="input-label">E-mail</label>
            {errorEmail && <span className="error-message-inline">{errorEmail}</span>}
          </div>
          <div className={errorEmail ? "input-error-wrapper" : ""}>
            <Input
              type="email"
              placeholder="Digite seu e-mail (Ex: nome@email.com)"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (errorEmail) setErrorEmail("");
              }}
            />
          </div>
        </div>

        <div className="input-group-validation">
          <div className="label-row">
            <label className="input-label">Senha</label>
            {errorPassword && <span className="error-message-inline">{errorPassword}</span>}
          </div>
          <div className={errorPassword ? "input-error-wrapper" : ""}>
            <Input
              type="password"
              placeholder="Digite sua senha (Mínimo 8 caracteres)"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (errorPassword) setErrorPassword("");
              }}
            />
          </div>
        </div>

        <Link to="/esqueci-senha" style={{ textDecoration: "none", width: "100%" }}>
          <span className="forgot">esqueci minha senha</span>
        </Link>

        <Button text="Entrar" onClick={handleLogin} />

        <button className="google-btn" type="button" onClick={handleGoogleLogin}>
          <img src={google} alt="google" />
          Continuar com Google
        </button>

        <p className="signup">
          Não tem conta?
          <Link to="/cadastro">
            <span> Criar uma conta</span>
          </Link>
        </p>
      </Card>
    </div>
  );
}

export default Login;