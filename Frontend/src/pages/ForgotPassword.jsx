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
  const [isSent, setIsSent] = useState(false); // Controla a exibição da tela de confirmação
  const [loading, setLoading] = useState(false);

  const validarEmail = (emailStr) => {
    return /\S+@\S+\.\S+/.test(emailStr);
  };

  const handleResetPassword = async () => {
    setErrorEmail("");

    if (!email) {
      setErrorEmail("O campo de e-mail é obrigatório.");
      return;
    }

    if (!validarEmail(email)) {
      setErrorEmail("Digite um e-mail válido.");
      return;
    }

    setLoading(true);

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
        setIsSent(true); // Exibe a tela de "Verifique seu e-mail"
      } else {
        const data = await response.json();
        setErrorEmail(
          data.email ? data.email[0] : "Erro ao processar a solicitação."
        );
      }
    } catch (error) {
      console.error("Erro na conexão:", error);
      setErrorEmail("Não foi possível conectar ao servidor.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="forgot-container">
      <Card>
        {/* Ícone azul redondo */}
        <div className="robot-circle-blue">
          <img src={robot} alt="robot" className="icon-blue" />
        </div>

        {!isSent ? (
          /* TELA 1: Formulário para digitar o e-mail */
          <>
            <h2>Esqueceu sua senha?</h2>

            <p className="forgot-description">
              Digite seu e-mail cadastrado e enviaremos um link para redefinir
              sua senha.
            </p>

            <div className="input-group-validation">
              {errorEmail && (
                <span className="error-message-inline">{errorEmail}</span>
              )}

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

            <Button
              text={loading ? "Enviando..." : "Enviar link de recuperação"}
              onClick={handleResetPassword}
              disabled={loading}
            />
          </>
        ) : (
          /* TELA 2: Confirmação de envio (Print 1) */
          <>
            <h2>Verifique seu e-mail</h2>

            <p className="forgot-description">
              Enviamos um link para redefinir sua senha para:
              <br />
              <strong className="user-email-highlight">{email}</strong>
            </p>

            <span className="spam-warning">
              Não recebeu? Verifique sua caixa de spam ou tente novamente.
            </span>

            <Button
              text={loading ? "Reenviando..." : "Enviar link de recuperação"}
              onClick={handleResetPassword}
              disabled={loading}
            />
          </>
        )}

        <p className="back-to-login">
          Voltar para{" "}
          <Link to="/login">
            <span>Login</span>
          </Link>
        </p>
      </Card>
    </div>
  );
}

export default ForgotPassword;