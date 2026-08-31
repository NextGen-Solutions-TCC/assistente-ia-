import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Error404.css';

import astronauta from '../assets/astronauta.svg';
import fundinho from '../assets/fundinho.svg';

export default function Error404() {
  const navigate = useNavigate();

  return (
    <div className="error404-container">
      {/* Fundo glow/imagem igual ao layout original */}
      <img src={fundinho} alt="Fundo" className="bg-image-404" />

      <header className="error404-header">
        <h1>Gen IA</h1>
      </header>

      <main className="error404-content">
        {/* Lado Esquerdo: Textos e Botão */}
        <div className="error404-text-side">
          <h2 className="error404-code">404-ERRO</h2>
          <p className="error404-subtitle">Página não encontrada</p>

          <button className="btn-home-404" onClick={() => navigate('/')}>
            Voltar para tela inicial
          </button>
        </div>

        {/* Lado Direito: Ilustração do Astronauta */}
        <div className="error404-image-side">
          <img src={astronauta} alt="Astronauta lendo" className="astronaut-img" />
        </div>
      </main>
    </div>
  );
}