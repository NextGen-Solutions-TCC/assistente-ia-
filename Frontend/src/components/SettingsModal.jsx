import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./SettingsModal.css";
import Api from "../services/Api";
import configIcon from "../assets/configuracoes.svg";
import perfilIcon from "../assets/perfil.svg";

const TABS = [
  { key: "geral", label: "Geral", icon: configIcon },
  { key: "dados", label: "Controlar dados", icon: "database" },
  { key: "conta", label: "Conta", icon: perfilIcon },
];

function DatabaseIcon() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8">
      <ellipse cx="12" cy="5" rx="8" ry="3" />
      <path d="M4 5v6c0 1.66 3.58 3 8 3s8-1.34 8-3V5" />
      <path d="M4 11v6c0 1.66 3.58 3 8 3s8-1.34 8-3v-6" />
    </svg>
  );
}

function SettingsModal({ isOpen, onClose }) {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("geral");

  const [perfil, setPerfil] = useState({ nome: "", email: "" });

  // Estado do Tema (Escuro / Claro)
  const [tema, setTema] = useState(() => localStorage.getItem("theme") || "Escuro");
  const [isThemeDropdownOpen, setIsThemeDropdownOpen] = useState(false);

  const [dadosMsg, setDadosMsg] = useState({ type: "", text: "" });
  const [confirmarLimparConversas, setConfirmarLimparConversas] = useState(false);

  const [confirmarExclusao, setConfirmarExclusao] = useState(false);
  const [senhaExclusao, setSenhaExclusao] = useState("");
  const [contaMsg, setContaMsg] = useState({ type: "", text: "" });

  // Aplica o Tema na raiz (HTML/BODY)
  useEffect(() => {
    const root = document.documentElement;
    if (tema === "Claro") {
      root.classList.add("light-theme");
      root.classList.remove("dark-theme");
      localStorage.setItem("theme", "Claro");
    } else {
      root.classList.add("dark-theme");
      root.classList.remove("light-theme");
      localStorage.setItem("theme", "Escuro");
    }
  }, [tema]);

  useEffect(() => {
    if (!isOpen) return;

    setActiveTab("geral");
    setDadosMsg({ type: "", text: "" });
    setContaMsg({ type: "", text: "" });
    setConfirmarLimparConversas(false);
    setConfirmarExclusao(false);
    setSenhaExclusao("");
    setIsThemeDropdownOpen(false);

    Api.get("usuario/me/")
      .then((res) => {
        setPerfil({ nome: res.data.nome, email: res.data.email });
      })
      .catch(() => {});
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSairDoAparelho = () => {
    localStorage.removeItem("access");
    localStorage.removeItem("refresh");
    localStorage.removeItem("user_name");
    onClose();
    navigate("/login");
  };

  const handleBaixarDados = async () => {
    setDadosMsg({ type: "", text: "" });

    try {
      const res = await Api.get("usuario/exportar-dados/", { responseType: "blob" });
      const url = window.URL.createObjectURL(res.data);
      const link = document.createElement("a");
      link.href = url;
      link.download = "meus_dados.json";
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch {
      setDadosMsg({ type: "error", text: "Não foi possível baixar seus dados." });
    }
  };

  const handleApagarConversas = async () => {
    setDadosMsg({ type: "", text: "" });

    try {
      await Api.delete("usuario/apagar-conversas/");
      setDadosMsg({ type: "success", text: "Todas as suas conversas foram apagadas." });
      setConfirmarLimparConversas(false);
    } catch {
      setDadosMsg({ type: "error", text: "Não foi possível apagar suas conversas." });
    }
  };

  const handleExcluirConta = async () => {
    setContaMsg({ type: "", text: "" });

    if (!senhaExclusao) {
      setContaMsg({ type: "error", text: "Digite sua senha para confirmar." });
      return;
    }

    try {
      await Api.delete("usuario/excluir-conta/", { data: { senha: senhaExclusao } });
      handleSairDoAparelho();
    } catch (err) {
      setContaMsg({ type: "error", text: err.response?.data?.detail || "Não foi possível excluir a conta." });
    }
  };

  return (
    <div className="settings-overlay" onClick={onClose}>
      <div className="settings-modal" onClick={(e) => e.stopPropagation()}>
        <aside className="settings-nav">
          <button className="settings-close-btn" onClick={onClose} aria-label="Fechar">
            ✕
          </button>

          <nav className="settings-tabs">
            {TABS.map((tab) => (
              <button
                key={tab.key}
                className={`settings-tab-btn ${activeTab === tab.key ? "active" : ""}`}
                onClick={() => setActiveTab(tab.key)}
              >
                <span className="settings-tab-icon">
                  {tab.icon === "database" ? <DatabaseIcon /> : <img src={tab.icon} alt="" />}
                </span>
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>
        </aside>

        <section className="settings-content">
          {activeTab === "geral" && (
            <>
              <h2 className="settings-title">Geral</h2>

              {/* APARÊNCIA */}
              <div className="settings-row align-center">
                <span className="settings-row-title">Aparência</span>
                
                <div className="custom-select-wrapper">
                  <button 
                    className="custom-select-trigger"
                    onClick={() => setIsThemeDropdownOpen(!isThemeDropdownOpen)}
                  >
                    <span>{tema}</span>
                    <span className="select-arrow">❯</span>
                  </button>

                  {isThemeDropdownOpen && (
                    <div className="custom-dropdown-menu">
                      <div 
                        className={`dropdown-option ${tema === "Escuro" ? "selected" : ""}`}
                        onClick={() => {
                          setTema("Escuro");
                          setIsThemeDropdownOpen(false);
                        }}
                      >
                        <span>Escuro</span>
                        {tema === "Escuro" && <span className="check-icon">✓</span>}
                      </div>

                      <div 
                        className={`dropdown-option ${tema === "Claro" ? "selected" : ""}`}
                        onClick={() => {
                          setTema("Claro");
                          setIsThemeDropdownOpen(false);
                        }}
                      >
                        <span>Claro</span>
                        {tema === "Claro" && <span className="check-icon">✓</span>}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* SAIR DESTE APARELHO */}
              <div className="settings-row align-center">
                <span className="settings-row-title">Sair deste aparelho</span>
                <button className="settings-pill-btn" onClick={handleSairDoAparelho}>
                  Sair
                </button>
              </div>
            </>
          )}

          {activeTab === "dados" && (
            <>
              <h2 className="settings-title">Controlar dados</h2>

              <div className="settings-row">
                <div>
                  <p className="settings-row-title">Baixar meus dados</p>
                  <p className="settings-row-subtitle">Exporta seu perfil e conversas.</p>
                </div>
                <button className="settings-secondary-btn" onClick={handleBaixarDados}>
                  Baixar
                </button>
              </div>

              <div className="settings-row">
                <div>
                  <p className="settings-row-title">Apagar todas as conversas</p>
                  <p className="settings-row-subtitle">Remove o histórico de chat.</p>
                </div>
                {confirmarLimparConversas ? (
                  <div className="settings-confirm-inline">
                    <button className="settings-danger-btn" onClick={handleApagarConversas}>
                      Confirmar
                    </button>
                    <button className="settings-ghost-btn" onClick={() => setConfirmarLimparConversas(false)}>
                      Cancelar
                    </button>
                  </div>
                ) : (
                  <button className="settings-danger-btn" onClick={() => setConfirmarLimparConversas(true)}>
                    Apagar
                  </button>
                )}
              </div>

              {dadosMsg.text && <p className={`settings-msg ${dadosMsg.type}`}>{dadosMsg.text}</p>}
            </>
          )}

          {activeTab === "conta" && (
            <>
              <h2 className="settings-title">Conta</h2>

              <div className="settings-row">
                <span className="settings-row-title">Nome:</span>
                <span className="settings-row-value">{perfil.nome}</span>
              </div>

              <div className="settings-row">
                <span className="settings-row-title">Email:</span>
                <span className="settings-row-value">{perfil.email}</span>
              </div>

              <div className="settings-row">
                <div>
                  <p className="settings-row-title">Excluir conta</p>
                  <p className="settings-row-subtitle">Apaga todos os seus dados.</p>
                </div>
                {!confirmarExclusao && (
                  <button className="settings-danger-btn" onClick={() => setConfirmarExclusao(true)}>
                    Excluir
                  </button>
                )}
              </div>

              {confirmarExclusao && (
                <div className="settings-field">
                  <label>Digite sua senha para confirmar a exclusão</label>
                  <input
                    type="password"
                    value={senhaExclusao}
                    onChange={(e) => setSenhaExclusao(e.target.value)}
                  />
                  <div className="settings-confirm-inline" style={{ marginTop: "12px" }}>
                    <button className="settings-danger-btn" onClick={handleExcluirConta}>
                      Confirmar
                    </button>
                    <button
                      className="settings-ghost-btn"
                      onClick={() => {
                        setConfirmarExclusao(false);
                        setSenhaExclusao("");
                      }}
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              )}

              {contaMsg.text && <p className={`settings-msg ${contaMsg.type}`}>{contaMsg.text}</p>}
            </>
          )}
        </section>
      </div>
    </div>
  );
}

export default SettingsModal;