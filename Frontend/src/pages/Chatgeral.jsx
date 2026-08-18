import { useState, useEffect, useRef } from "react";
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
import maisIcon from "../assets/mais.svg";
import perfilIcon from "../assets/perfil.svg";
import configIcon from "../assets/configuracoes.svg";
import ajudaIcon from "../assets/ajuda.svg";
import sairIcon from "../assets/sair.svg";
import setaCimaIcon from "../assets/seta-cima.svg";

function ChatGeral() {
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(true);
  const [inputMessage, setInputMessage] = useState("");
  const [chatHistory, setChatHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeProduct, setActiveProduct] = useState("geral");
  
  const [isSearching, setIsSearching] = useState(false);
  const [searchChatQuery, setSearchChatQuery] = useState("");
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);

  const messagesEndRef = useRef(null);
  const popoverRef = useRef(null);

  const userLoggedName = localStorage.getItem("user_name") || "Letícia Souza";

  const userInitials = userLoggedName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .substring(0, 2)
    .toUpperCase();

  // Rolar para o final do chat ao receber mensagens
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatHistory, isLoading]);

  // Fechar o Popover do perfil ao clicar fora
  useEffect(() => {
    function handleClickOutside(event) {
      if (popoverRef.current && !popoverRef.current.contains(event.target)) {
        setIsProfileMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleSidebar = () => {
    setIsSidebarExpanded(!isSidebarExpanded);
  };

  const handleProductChange = (product) => {
    setActiveProduct(product);
    setIsSearching(false);
    setIsProfileMenuOpen(false);
    setChatHistory([]); 
  };

  const handleSendMessage = async (messageText) => {
    const textToSend = messageText || inputMessage;
    if (!textToSend.trim()) return;

     const token = localStorage.getItem("access");

  console.log("========== CHATBOT ==========");
  console.log("TOKEN EXISTE:", !!token);
  console.log("TOKEN LENGTH:", token?.length);
  console.log("TOKEN:", token);
  console.log("=============================");


    const userMessage = {
      sender: "user",
      text: textToSend,
    };

    setChatHistory((prev) => [...prev, userMessage]);
    setInputMessage("");
    setIsLoading(true);

    try {
      const token = localStorage.getItem("access");

console.log("TOKEN DO CHAT:", token ? "TOKEN ENCONTRADO" : "TOKEN NÃO ENCONTRADO");

const response = await fetch(
  "http://127.0.0.1:8000/Api/chatbot/",
  {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`,
    },
    body: JSON.stringify({
      message: textToSend,
      context: activeProduct,
    }),
  }
);

      const data = await response.json();

      if (response.ok) {
        setChatHistory((prev) => [
          ...prev,
          {
            sender: "bot",
            text: data.message,
          },
        ]);
      }
    } catch (error) {
      console.error("ERRO:", error);
      setChatHistory((prev) => [
        ...prev,
        {
          sender: "bot",
          text: "Erro ao conectar com a IA.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const getTopics = () => {
    switch (activeProduct) {
      case "condominios":
        return [
          "Como gerar o boleto de condomínio?",
          "Qual o fluxo de prestação de contas?",
          "Como cadastrar uma unidade nova?",
          "Como configurar rateio por fração ideal?",
        ];
      case "imobiliarias":
        return [
          "Como reduzir a inadimplência de locatários?",
          "Quais são as obrigações legais de uma imobiliária?",
          "Quais soluções estão disponíveis para administração de condomínios?",
          "Como funciona a análise de crédito de clientes?",
        ];
      case "geral":
      default:
        return [
          "O que o LogicGen IA pode fazer?",
          "Como começar a usar?",
          "Quais produtos estão disponíveis?",
          "Como acessar a documentação?",
        ];
    }
  };

  return (
    <div className="chat-container">
      
      {/* SIDEBAR */}
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

          {isSidebarExpanded && (
            <button className="menu-toggle-btn" onClick={toggleSidebar}>
              <img src={menu} alt="menu" className="menu-toggle-icon" />
            </button>
          )}
        </div>

        {/* CONTEÚDO DO MENU */}
        <div className="sidebar-content">
          <div className="menu-section">
            <button 
              className={`sidebar-action-btn ${isSearching ? "active" : ""}`}
              onClick={() => {
                setIsSearching(true);
                setIsProfileMenuOpen(false);
              }}
            >
              <div className="menu-icon-wrapper">
                <img src={lupa} alt="buscar" className="sidebar-icon-img" />
              </div>
              <span className="menu-text">Buscar em Chats</span>
            </button>

            <button 
              className="sidebar-action-btn" 
              onClick={() => {
                setIsSearching(false);
                setIsProfileMenuOpen(false);
                setChatHistory([]);
              }}
            >
              <div className="menu-icon-wrapper">
                <img src={menuIcon} alt="nova conversa" className="sidebar-icon-img" />
              </div>
              <span className="menu-text">Nova Conversa</span>
            </button>
          </div>

          {/* PRODUTOS */}
          <div className="menu-section">
            <h3 className="section-title">PRODUTOS</h3>

            <button 
              className={`sidebar-menu-item ${activeProduct === "geral" && !isSearching ? "active" : ""}`}
              onClick={() => handleProductChange("geral")}
            >
              <div className="menu-icon-wrapper">
                <img src={messages} alt="chat" className="sidebar-icon-img" />
              </div>
              <span className="menu-text">Chat Geral</span>
            </button>

            <button 
              className={`sidebar-menu-item ${activeProduct === "condominios" && !isSearching ? "active" : ""}`}
              onClick={() => handleProductChange("condominios")}
            >
              <div className="menu-icon-wrapper">
                <img src={condominio} alt="condominio" className="sidebar-icon-img" />
              </div>
              <span className="menu-text">Condomínios</span>
            </button>

            <button 
              className={`sidebar-menu-item ${activeProduct === "imobiliarias" && !isSearching ? "active" : ""}`}
              onClick={() => handleProductChange("imobiliarias")}
            >
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

        {/* FOOTER DO USUÁRIO & POPUP DE PERFIL */}
        <div className="sidebar-footer-wrapper" ref={popoverRef}>
          
          {isProfileMenuOpen && (
            <div className="profile-popover-menu">
              <div className="popover-user-info">
                <div className="user-avatar">{userInitials}</div>
                <span className="popover-user-name">{userLoggedName}</span>
              </div>

              <button className="popover-item" onClick={() => console.log("Adicionar Conta")}>
                <div className="popover-icon-box">
                  <img src={maisIcon} alt="adicionar" className="popover-icon" />
                </div>
                <span className="popover-text">Adicionar outra conta</span>
              </button>

              <div className="popover-divider"></div>

              <button className="popover-item" onClick={() => console.log("Abrir Perfil")}>
                <div className="popover-icon-box">
                  <img src={perfilIcon} alt="perfil" className="popover-icon" />
                </div>
                <span className="popover-text">Perfil</span>
              </button>

              <button className="popover-item" onClick={() => console.log("Abrir Configurações")}>
                <div className="popover-icon-box">
                  <img src={configIcon} alt="configurações" className="popover-icon" />
                </div>
                <span className="popover-text">Configurações</span>
              </button>

              <button className="popover-item justify-between" onClick={() => console.log("Abrir Ajuda")}>
                <div className="popover-item-left">
                  <div className="popover-icon-box">
                    <img src={ajudaIcon} alt="ajuda" className="popover-icon" />
                  </div>
                  <span className="popover-text">Ajuda</span>
                </div>
                <span className="popover-arrow-right">❯</span>
              </button>

              <button className="popover-item logout" onClick={() => console.log("Sair")}>
                <div className="popover-icon-box">
                  <img src={sairIcon} alt="sair" className="popover-icon" />
                </div>
                <span className="popover-text">Sair</span>
              </button>
            </div>
          )}

          <div 
            className={`sidebar-footer ${isProfileMenuOpen ? "active" : ""}`}
            onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
          >
            <div className="footer-user-details">
              <div className="user-avatar">{userInitials}</div>
              <span className="user-name">{userLoggedName}</span>
            </div>
            
            {isSidebarExpanded && (
              <div className={`footer-chevron ${isProfileMenuOpen ? "open" : ""}`}>
                <img src={setaCimaIcon} alt="chevron" />
              </div>
            )}
          </div>

        </div>
      </aside>

      {/* ÁREA PRINCIPAL */}
      <main className={`chat-main ${isSearching ? "search-mode-bg" : ""}`}>
        
        {isSearching ? (
          <div className="search-chats-container">
            <div className="search-header-bar">
              <input 
                type="text" 
                placeholder="Buscar em Chats..." 
                value={searchChatQuery}
                onChange={(e) => setSearchChatQuery(e.target.value)}
                autoFocus
              />
              <button className="close-search-btn" onClick={() => setIsSearching(false)}>
                <span>✕</span> 
              </button>
            </div>

            <div className="search-empty-state">
              <div className="folder-icon-wrapper">
                <svg width="68" height="60" viewBox="0 0 68 60" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M7.55556 0C3.39111 0 0 3.39111 0 7.55556V52.4444C0 56.6089 3.39111 60 7.55556 60H60.4444C64.6089 60 68 56.6089 68 52.4444V15.1111C68 10.9467 64.6089 7.55556 60.4444 7.55556H34L26.4444 0H7.55556Z" fill="#5F6368"/>
                </svg>
              </div>
              <h2>Histórico de Conversas</h2>
              <p>(Não há conversas recentes)</p>
            </div>
          </div>
        ) : (
          <>
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
                    {getTopics().map((topic, idx) => (
                      <button key={idx} onClick={() => handleSendMessage(topic)}>
                        {topic}
                      </button>
                    ))}
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
                  <div ref={messagesEndRef} />
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
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                />
                <button className="send-message-btn" onClick={() => handleSendMessage()}>
                  <img src={enviar} alt="enviar" className="send-icon" />
                </button>
              </div>
            </footer>
          </>
        )}
      </main>
    </div>
  );
}

export default ChatGeral;