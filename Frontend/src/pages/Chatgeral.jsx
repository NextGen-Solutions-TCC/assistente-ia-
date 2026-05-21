import { useState } from "react";
import "./ChatGeral.css";
import robot from "../assets/robot.svg";
import lupa from "../assets/lupa.png"
import more from "../assets/more.svg"

function ChatGeral() {
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(false);
  const [inputMessage, setInputMessage] = useState("");
  const [chatHistory, setChatHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarExpanded(!isSidebarExpanded);
  };

  const handleSendMessage = async (messageText) => {
    const textToSend = messageText || inputMessage;
    if (!textToSend.trim()) return;

    const userMessage = { sender: "user", text: textToSend };
    setChatHistory((prev) => [...prev, userMessage]);
    setInputMessage("");
    setIsLoading(true);

    try {
      const response = await fetch("http://127.0.0.1:8000/api/chat/ask/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("token")}`
        },
        body: JSON.stringify({ message: textToSend }),
      });

      const data = await response.json();

      if (response.ok) {
        setChatHistory((prev) => [...prev, { sender: "bot", text: data.response }]);
      } else {
        setChatHistory((prev) => [...prev, { sender: "bot", text: "Ops, deu um erro ao processar sua pergunta." }]);
      }
    } catch (error) {
      console.error("Erro ao conectar com a IA:", error);
      setChatHistory((prev) => [...prev, { sender: "bot", text: "Não consegui conectar ao servidor de IA." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="chat-container">
      <aside className={`sidebar ${isSidebarExpanded ? "expanded" : "collapsed"}`}>
        <div className="sidebar-header" onClick={toggleSidebar}>
          <div className="robot-icon-container">
            <img src={robot} alt="Gen IA" className="sidebar-robot-img" />
          </div>
          {isSidebarExpanded && (
            <div className="header-text-group">
              <span className="brand-name">Gen IA</span>
              <span className="sub-brand-name">Chat Geral</span>
            </div>
          )}
        </div>

        <div className="sidebar-content">
          <div className="menu-section">
            <button className="sidebar-action-btn">
              <div className="menu-icon-wrapper">
                <img src={lupa} alt="Buscar" className="lupa" />
              </div>
              {isSidebarExpanded && <span className="menu-text">Buscar em Chats</span>}
            </button>
            <button className="sidebar-action-btn">
              <div className="menu-icon-wrapper">
                <img src={more} alt="Novo" className="more" />
              </div>
              {isSidebarExpanded && <span className="menu-text">Nova Conversa</span>}
            </button>
          </div>

          <div className="menu-section">
            {isSidebarExpanded && <h3 className="section-title">Produtos</h3>}
            <button className="sidebar-menu-item active">
              <div className="menu-icon-wrapper">
                <img src="" alt="Chat Geral" className="sidebar-icon-img" />
              </div>
              {isSidebarExpanded && <span className="menu-text">Chat Geral</span>}
            </button>
            <button className="sidebar-menu-item">
              <div className="menu-icon-wrapper">
                <img src="" alt="Condomínios" className="condomin" />
              </div>
              {isSidebarExpanded && <span className="menu-text">Condomínios</span>}
            </button>
            <button className="sidebar-menu-item">
              <div className="menu-icon-wrapper">
                <img src="" alt="Imobiliárias" className="sidebar-icon-img" />
              </div>
              {isSidebarExpanded && <span className="menu-text">Imobiliárias</span>}
            </button>
          </div>

          <div className="menu-section">
            {isSidebarExpanded && <h3 className="section-title">Conversas</h3>}
            <button className="sidebar-menu-item">
              <div className="menu-icon-wrapper">
                <img src="" alt="Histórico" className="sidebar-icon-img" />
              </div>
              {isSidebarExpanded && <span className="menu-text">Histórico de conversas</span>}
            </button>
          </div>
        </div>

        <div className="sidebar-footer">
          <div className="user-avatar">LS</div>
          {isSidebarExpanded && (
            <div className="user-info">
              <span className="user-name">Letícia Souza</span>
              <div className="arrow-icon-wrapper">
                <img src="" alt="Expandir" className="arrow-icon-img" />
              </div>
            </div>
          )}
        </div>
      </aside>

      <main className="chat-main">
        <header className="chat-main-header">
          {!isSidebarExpanded && <h1 className="top-brand-title">Gen IA</h1>}
        </header>

        <div className="chat-view-area">
          {chatHistory.length === 0 ? (
            <div className="welcome-chat-view">
              <h2 className="welcome-heading">Ei, Leticia. Como posso te ajudar?</h2>
              <p className="welcome-subheading">Escolha um tópico abaixo ou digite sua pergunta para começar.</p>

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
                  <div className={`message-bubble ${msg.sender}`}>
                    {msg.text}
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="message-bubble-wrapper bot">
                  <div className="message-bubble bot loading">
                    Digitando...
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

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
              <img src="" alt="Enviar" className="send-icon-img" />
            </button>
          </div>
        </footer>
      </main>
    </div>
  );
}

export default ChatGeral;