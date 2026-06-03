import { useState } from "react";
import "./ChatGeral.css";
import robot from "../assets/robot.svg";
import robotMini from "../assets/minirobot.svg";
import menu from "../assets/menu.svg";
import menuIcon from "../assets/more.svg";
import lupa from "../assets/lupa.png";
import messages from "../assets/messages.svg";
import condominio from "../assets/condominio.svg";
import historico from "../assets/historico.svg";
import enviar from "../assets/enviar.svg";
import imobiliaria from "../assets/imobiliaria.svg";

function ChatGeral() {
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(true);
  const [inputMessage, setInputMessage] = useState("");
  const [chatHistory, setChatHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const userLoggedName = localStorage.getItem("user_name") || "Letícia Souza";

  const userInitials = userLoggedName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .substring(0, 2)
    .toUpperCase();

  const toggleSidebar = () => {
    setIsSidebarExpanded(!isSidebarExpanded);
  };

  const handleSendMessage = async (messageText) => {
    const textToSend = messageText || inputMessage;
    if (!textToSend.trim()) return;

    const userMessage = {
      sender: "user",
      text: textToSend,
    };

    setChatHistory((prev) => [...prev, userMessage]);
    setInputMessage("");
    setIsLoading(true);

    try {
      const response = await fetch("http://127.0.0.1:8000/api/chat/ask/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          message: textToSend,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setChatHistory((prev) => [
          ...prev,
          {
            sender: "bot",
            text: data.response,
          },
        ]);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="chat-container">
      
      {/* SIDEBAR DINÂMICA */}
      <aside className={`sidebar ${isSidebarExpanded ? "expanded" : "collapsed"}`}>
        
        {/* HEADER */}
        <div className="sidebar-header" onClick={!isSidebarExpanded ? toggleSidebar : undefined}>
          <div className="logo-area">
            <div className="robot-icon-container">
              <img
                src={isSidebarExpanded ? robot : robotMini}
                alt="robot"
                className="sidebar-robot-img"
              />
            </div>
            {isSidebarExpanded && (
              <div className="header-text-group">
                <span className="brand-name">Gen IA</span>
              </div>
            )}
          </div>

          {/* SÓ MOSTRA O BOTÃO HAMBÚRGUER SE TIVER EXPANDIDO */}
          {isSidebarExpanded && (
            <button className="menu-toggle-btn" onClick={toggleSidebar}>
              <img src={menu} alt="menu" className="menu-toggle-icon" />
            </button>
          )}
        </div>

        {/* CONTEÚDO DO MENU */}
        <div className="sidebar-content">
          <div className="menu-section">
            <button className="sidebar-action-btn">
              <div className="menu-icon-wrapper">
                <img src={lupa} alt="buscar" className="sidebar-icon-img" />
              </div>
              <span className="menu-text">Buscar em Chats</span>
            </button>

            <button className="sidebar-action-btn">
              <div className="menu-icon-wrapper">
                <img src={menuIcon} alt="nova conversa" className="sidebar-icon-img" />
              </div>
              <span className="menu-text">Nova Conversa</span>
            </button>
          </div>

          {/* PRODUTOS */}
          <div className="menu-section">
            <h3 className="section-title">PRODUTOS</h3>

            <button className="sidebar-menu-item active">
              <div className="menu-icon-wrapper">
                <img src={messages} alt="chat" className="sidebar-icon-img" />
              </div>
              <span className="menu-text">Chat Geral</span>
            </button>

            <button className="sidebar-menu-item">
              <div className="menu-icon-wrapper">
                <img src={condominio} alt="condominio" className="sidebar-icon-img" />
              </div>
              <span className="menu-text">Condomínios</span>
            </button>

            <button className="sidebar-menu-item">
              <div className="menu-icon-wrapper">
                <img src={imobiliaria} alt="imobiliaria" className="sidebar-icon-img" />
              </div>
              <span className="menu-text">Imobiliárias</span>
            </button>
          </div>

          {/* CONVERSAS */}
          <div className="menu-section">
            <h3 className="section-title">CONVERSAS</h3>

            <button className="sidebar-menu-item">
              <div className="menu-icon-wrapper">
                <img src={historico} alt="historico" className="sidebar-icon-img" />
              </div>
              <span className="menu-text historico-text">Histórico de conversas</span>
            </button>
          </div>
        </div>

        {/* FOOTER */}
        <div className="sidebar-footer">
          <div className="user-avatar">{userInitials}</div>
          <span className="user-name">{userLoggedName}</span>
        </div>
      </aside>

      {/* ÁREA PRINCIPAL */}
      <main className="chat-main">
        <div className="chat-view-area">
          {chatHistory.length === 0 ? (
            <div className="welcome-chat-view">
              <h1 className="welcome-heading">
                Ei, {userLoggedName.split(" ")[0]}. Como posso te ajudar?
              </h1>

              <p className="welcome-subheading">
                Escolha um tópico abaixo ou digite sua pergunta para começar.
              </p>

              <div className="topics-grid">
                <button onClick={() => handleSendMessage("O que o LogicGen IA pode fazer?")}>
                  O que o LogicGen IA pode fazer?
                </button>

                <button onClick={() => handleSendMessage("Como começar a usar?")}>
                  Como começar a usar?
                </button>

                <button onClick={() => handleSendMessage("Quais produtos estão disponíveis?")}>
                  Quais produtos estão disponíveis?
                </button>

                <button onClick={() => handleSendMessage("Como acessar a documentação?")}>
                  Como acessar a documentação?
                </button>
              </div>
            </div>
          ) : (
            <div className="messages-list">
              {chatHistory.map((msg, index) => (
                <div key={index} className={`message-bubble-wrapper ${msg.sender}`}>
                  <div className={`message-bubble ${msg.sender}`}>{msg.text}</div>
                </div>
              ))}

              {isLoading && (
                <div className="message-bubble-wrapper bot">
                  <div className="message-bubble bot">Digitando...</div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* INPUT REESTRUTURADO */}
        <footer className="chat-input-container">
          <div className="input-box-wrapper">
            <input
              type="text"
              placeholder="Pergunte alguma coisa..."
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
            />

            <button className="send-message-btn" onClick={() => handleSendMessage()}>
              <img src={enviar} alt="enviar" className="send-icon" />
            </button>
          </div>
        </footer>
      </main>
    </div>
  );
}

export default ChatGeral;