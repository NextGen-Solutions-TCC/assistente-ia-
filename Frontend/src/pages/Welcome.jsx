import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./Welcome.css";

// IMPORTAÇÕES DOS SEUS ATIVOS
import robot from "../assets/robot-branco.png";
import iconRaio from "../assets/raio.svg";       
import iconEscudo from "../assets/escudo.svg";
import iconChat from "../assets/chat.svg";
import iconGrafico from "../assets/grafico.svg";

function Welcome() {
  const navigate = useNavigate();
  const [slideAtivo, setSlideAtivo] = useState(0);

  const slides = [
    {
      tituloPrincipal: "Bem vindo ao",
      tituloDestaque: "GEN IA",
      descricao: "Seu assistente inteligente para dúvidas sobre produtos. Centralize conhecimento, agilize respostas e aumente a produtividade da sua equipe.",
    },
    {
      tituloPrincipal: "Dividido por",
      tituloDestaque: "PRODUTOS",
      descricao: "Selecione o produto desejado e converse diretamente com a IA especializada. Cada produto tem sua própria base de conhecimento.",
    },
    {
      tituloPrincipal: "Respostas",
      tituloDestaque: "INSTANTÂNEAS",
      descricao: "Powered by IA avançada, o Gen IA entende o contexto das suas perguntas e entrega respostas precisas em segundos.",
    }
  ];

  // Passar para o próximo slide manualmente
  const proximoSlide = () => {
    setSlideAtivo((prev) => (prev + 1) % slides.length);
  };

  // Voltar para o slide anterior manualmente
  const slideAnterior = () => {
    setSlideAtivo((prev) => (prev - 1 + slides.length) % slides.length);
  };

  // Carrossel automático (muda a cada 5 segundos, mas reinicia o timer se o usuário clicar nas setas)
  useEffect(() => {
    const timer = setInterval(() => {
      proximoSlide();
    }, 5000);
    return () => clearInterval(timer);
  }, [slideAtivo]);

  return (
    <div className="welcome-container">
      
      <div className="welcome-left">
        <div className="logo-circle">
          <img src={robot} alt="Logo Robot" className="robot-logo" />
        </div>
        <div className="brand-badge">Chat & Ask AI</div>
      </div>

      <div className="welcome-right">
        <div className="carousel-indicators">
          {slides.map((_, index) => (
            <div 
              key={index} 
              className={`indicator-bar ${index === slideAtivo ? "active" : ""}`}
              onClick={() => setSlideAtivo(index)}
            />
          ))}
        </div>

        {/* CARROSSEL COM AS SETAS DE NAVEGAÇÃO LATERAIS */}
        <div className="carousel-wrapper">
          <button className="nav-arrow-btn prev" onClick={slideAnterior}>&larr;</button>
          
          <div className="slide-content">
            <h1>
              {slides[slideAtivo].tituloPrincipal} <br />
              <span>{slides[slideAtivo].tituloDestaque}</span>
            </h1>
            <p>{slides[slideAtivo].descricao}</p>
          </div>

          <button className="nav-arrow-btn next" onClick={proximoSlide}>&rarr;</button>
        </div>

        {/* GRID CORRIGIDO: CARDS LINDOS E IGUAIS (SEM SETA DENTRO) */}
        <div className="features-grid">
          <div className="feature-item">
            <img src={iconRaio} className="feature-icon-img" alt="ícone" />
            <span>Respostas Instantâneas</span>
          </div>

          <div className="feature-item">
            <img src={iconEscudo} className="feature-icon-img" alt="ícone" />
            <span>Seguro e confiável</span>
          </div>

          <div className="feature-item">
            <img src={iconChat} className="feature-icon-img" alt="ícone" />
            <span>Chat Inteligente</span>
          </div>

          <div className="feature-item">
            <img src={iconGrafico} className="feature-icon-img" alt="ícone" />
            <span>Alta Performance</span>
          </div>
        </div>

        <button className="access-btn" onClick={() => navigate("/login")}>
          Acessar plataforma
        </button>
      </div>
    </div>
  );
}

export default Welcome;