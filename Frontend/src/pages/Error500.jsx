import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Error500.css';

import planetinha from '../assets/planetinha.svg';
import fundinho from '../assets/fundinho.svg';

export default function Error500() {
  const navigate = useNavigate();

  return (
    <div className="error-container">
      {/* Imagem de fundo ajustada para não espalhar demais */}
      <img src={fundinho} alt="Fundo" className="bg-image" />

      <header className="error-header">
        <h1>Gen IA</h1>
      </header>

      <main className="error-content">
        <div className="error-code">
          <span>5</span>
          <img src={planetinha} alt="Planeta" className="planet-img" />
          <span>0</span>
        </div>

        <h2 className="error-subtitle">E R R O</h2>

        <h3 className="error-title">Oops! Ocorreu um erro</h3>
        <p className="error-message">
          Fique tranquilo, estamos cientes e trabalhando na correção
        </p>

        <button className="btn-home" onClick={() => navigate('/')}>
          Voltar para tela inicial
        </button>
      </main>
    </div>
  );
}