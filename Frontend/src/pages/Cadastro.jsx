import "./Cadastro.css";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import robot from "../assets/robot.svg";
import google from "../assets/google.png";
import Card from "../components/Card";
import Input from "../components/Input";
import Button from "../components/Button";

import Api from "../services/Api"; 

function Cadastro() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [agreeTerms, setAgreeTerms] = useState(false);

  const [errorName, setErrorName] = useState("");
  const [errorEmail, setErrorEmail] = useState("");
  const [errorPassword, setErrorPassword] = useState("");
  const [errorConfirmPassword, setErrorConfirmPassword] = useState("");
  const [errorTerms, setErrorTerms] = useState("");
  const [errorGeral, setErrorGeral] = useState("");

  const validarEmail = (emailStr) => {
    return /\S+@\S+\.\S+/.test(emailStr);
  };

  const handleCadastro = async () => {
    setErrorName("");
    setErrorEmail("");
    setErrorPassword("");
    setErrorConfirmPassword("");
    setErrorTerms("");
    setErrorGeral("");

    let erroDetectado = false;

    if (!name && !email && !password && !confirmPassword) {
      setErrorGeral("Preencha todos os campos para continuar");
      return;
    }

    if (!name) {
      setErrorName("O nome de usuário é obrigatório");
      erroDetectado = true;
    }

    if (!email) {
      setErrorEmail("O campo de e-mail é obrigatório");
      erroDetectado = true;
    } else if (!validarEmail(email)) {
      setErrorEmail("Digite um e-mail válido");
      erroDetectado = true;
    }

    if (!password) {
      setErrorPassword("A senha é obrigatória");
      erroDetectado = true;
    } else if (password.length < 8) {
      setErrorPassword("A senha deve ter no mínimo 8 caracteres");
      erroDetectado = true;
    }

    if (password !== confirmPassword) {
      setErrorConfirmPassword("As senhas não conferem");
      erroDetectado = true;
    }

    if (!agreeTerms) {
      setErrorTerms("Você precisa aceitar os termos para continuar");
      erroDetectado = true;
    }

    if (erroDetectado) return;

    try {
      await Api.post("auth/register/", {
        username: email,
        email: email,
        password: password,
        nome: name,
        confirmar_password: confirmPassword,
      });

      navigate("/login");

    } catch (error) {
      console.error("Erro na requisição:", error);

      if (!error.response || error.response.status === 500) {
        navigate("/erro-servidor");
        return;
      }

      const data = error.response.data;

      if (data) {
        if (data.username) setErrorName("Nome de usuário inválido ou já existente.");
        if (data.email) setErrorEmail("Este e-mail já está cadastrado.");
        
        if (data.password) {
          setErrorPassword(Array.isArray(data.password) ? data.password[0] : data.password);
        } else if (data.non_field_errors) {
          setErrorGeral(data.non_field_errors[0]);
        } else if (data.detail) {
          setErrorGeral(data.detail);
        } else {
          setErrorGeral("Erro ao realizar o cadastro. Verifique os dados fornecidos.");
        }
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
        
        <h2>Bem vindo ao <span>CADASTRO</span></h2>

        {errorGeral && <span className="error-message-inline geral">{errorGeral}</span>}

        <div className="input-group-validation">
          <div className="label-row">
            <label className="input-label">Nome Completo</label>
            {errorName && <span className="error-message-inline">{errorName}</span>}
          </div>
          <div className={errorName ? "input-error-wrapper" : ""}>
            <Input
              type="text"
              placeholder="Escreva seu nome completo"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (errorName) setErrorName("");
              }}
            />
          </div>
        </div>

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
              placeholder="Crie uma senha forte (Mínimo 8 caracteres)"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (errorPassword) setErrorPassword("");
              }}
            />
          </div>
        </div>

        <div className="input-group-validation">
          <div className="label-row">
            <label className="input-label">Confirmar senha</label>
            {errorConfirmPassword && <span className="error-message-inline">{errorConfirmPassword}</span>}
          </div>
          <div className={errorConfirmPassword ? "input-error-wrapper" : ""}>
            <Input
              type="password"
              placeholder="Digite a senha novamente"
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value);
                if (errorConfirmPassword) setErrorConfirmPassword("");
              }}
            />
          </div>
        </div>

        <div className="checkbox-container-group">
          <div className="checkbox-area">
            <input
              type="checkbox"
              id="terms"
              checked={agreeTerms}
              onChange={(e) => {
                setAgreeTerms(e.target.checked);
                if (errorTerms) setErrorTerms("");
              }}
            />
            <label htmlFor="terms">Eu concordo com Termos e Condições</label>
          </div>
          {errorTerms && <span className="error-message-inline terms-error">{errorTerms}</span>}
        </div>

        <Button text="Cadastrar-se" onClick={handleCadastro} />

        <button className="google-btn" type="button" onClick={handleGoogleLogin}>
          <img src={google} alt="google" />
          Continuar com Google
        </button>

        <p className="login-text">
          Já tem conta? 
          <Link to="/login">
            <span> Entrar</span>
          </Link>
        </p>
      </Card>
    </div>
  );
}

export default Cadastro;