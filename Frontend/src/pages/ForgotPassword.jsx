import "./ForgotPassword.css";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import robot from "../assets/robot.svg"; 
import Card from "../components/Card";
import Input from "../components/Input";
import Button from "../components/Button";

function ForgotPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [errorEmail, setErrorEmail] = useState("");
  const [mensagemSucesso, setMensagemSucesso] = useState("");

  const validarEmail = (emailStr) => {
    return /\S+@\S+\.\S+/.test(emailStr);
  };

  const handleResetPassword = async () => {
    setErrorEmail("");
    setMensagemSucesso("");

    if (!email) {
      setErrorEmail("O campo de e-mail é obrigatório.");
      return;
    }

    if (!validarEmail(email)) {
      setErrorEmail("Digite um e-mail válido.");
      return;
    }

    try {
      const response = await fetch(
        "http://localhost:8000/api/auth/password/reset/",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email: email }),
        }
      );

      if (response.ok) {
        setMensagemSucesso("Link de recuperação enviado com sucesso! Verifique seu e-mail.");
        setEmail("");
      } else {
        const data = await response.json();
        setErrorEmail(data.email ? data.email[0] : "Erro ao processar a solicitação.");
      }
    } catch (error) {
      console.error("Erro na conexão:", error);
      setErrorEmail("Não foi possível conectar ao servidor.");
    }
  };

  return (
    <div className="forgot-container">
      <Card>
        {/* Ícone azul redondo de robô do seu print */}
        <div className="robot-circle-blue">
          <img src={robot} alt="robot" className="icon-blue" />
        </div>

        <h2>Esqueceu sua senha?</h2>

        <p className="forgot-description">
          Digite seu e-mail cadastrado e enviaremos um link para redefinir sua senha.
        </p>

        {/* Validação inline idêntica à do login */}
        <div className="input-group-validation">
          {errorEmail && <span className="error-message-inline">{errorEmail}</span>}
          {mensagemSucesso && <span className="success-message-inline">{mensagemSucesso}</span>}
          
          <div className={errorEmail ? "input-error-wrapper" : ""}>
            <Input
              type="email"
              placeholder="Email:"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (errorEmail) setErrorEmail("");
              }}
            />
          </div>
        </div>

        <Button text="Enviar link de recuperação" onClick={handleResetPassword} />

        <p className="back-to-login">
          Voltar para <Link to="/login"><span>Login</span></Link>
        </p>
      </Card>
    </div>
  );
}

export default ForgotPassword;