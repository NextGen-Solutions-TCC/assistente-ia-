import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./SettingsModal.css";
import Api from "../services/Api";
import configIcon from "../assets/configuracoes.svg";
import escudoIcon from "../assets/escudo.svg";
import perfilIcon from "../assets/perfil.svg";

const TABS = [
  { key: "geral", label: "Geral", icon: configIcon },
  { key: "seguranca", label: "Segurança", icon: escudoIcon },
  { key: "dados", label: "Controlar dados", icon: "database" },
  { key: "conta", label: "Conta", icon: perfilIcon },
];

function DatabaseIcon() {
  return (
    <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.8">
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
  const [nomeInput, setNomeInput] = useState("");
  const [loadingPerfil, setLoadingPerfil] = useState(false);

  const [geralMsg, setGeralMsg] = useState({ type: "", text: "" });
  const [senhaAtual, setSenhaAtual] = useState("");
  const [novaSenha, setNovaSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const [segurancaMsg, setSegurancaMsg] = useState({ type: "", text: "" });

  const [dadosMsg, setDadosMsg] = useState({ type: "", text: "" });
  const [confirmarLimparConversas, setConfirmarLimparConversas] = useState(false);

  const [confirmarExclusao, setConfirmarExclusao] = useState(false);
  const [senhaExclusao, setSenhaExclusao] = useState("");
  const [contaMsg, setContaMsg] = useState({ type: "", text: "" });

  useEffect(() => {
    if (!isOpen) return;

    setActiveTab("geral");
    setGeralMsg({ type: "", text: "" });
    setSegurancaMsg({ type: "", text: "" });
    setDadosMsg({ type: "", text: "" });
    setContaMsg({ type: "", text: "" });
    setSenhaAtual("");
    setNovaSenha("");
    setConfirmarSenha("");
    setConfirmarLimparConversas(false);
    setConfirmarExclusao(false);
    setSenhaExclusao("");

    setLoadingPerfil(true);
    Api.get("usuario/me/")
      .then((res) => {
        setPerfil({ nome: res.data.nome, email: res.data.email });
        setNomeInput(res.data.nome);
      })
      .catch(() => {
        setGeralMsg({ type: "error", text: "Não foi possível carregar seu perfil." });
      })
      .finally(() => setLoadingPerfil(false));
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSalvarNome = async () => {
    setGeralMsg({ type: "", text: "" });

    if (!nomeInput.trim()) {
      setGeralMsg({ type: "error", text: "O nome não pode ficar em branco." });
      return;
    }

    try {
      const res = await Api.patch("usuario/me/", { nome: nomeInput.trim() });
      setPerfil((prev) => ({ ...prev, nome: res.data.nome }));
      localStorage.setItem("user_name", res.data.nome);
      setGeralMsg({ type: "success", text: "Nome atualizado com sucesso." });
    } catch {
      setGeralMsg({ type: "error", text: "Não foi possível salvar o nome." });
    }
  };

  const handleAlterarSenha = async () => {
    setSegurancaMsg({ type: "", text: "" });

    if (!senhaAtual || !novaSenha || !confirmarSenha) {
      setSegurancaMsg({ type: "error", text: "Preencha todos os campos." });
      return;
    }

    try {
      const res = await Api.post("usuario/alterar-senha/", {
        senha_atual: senhaAtual,
        nova_senha: novaSenha,
        confirmar_senha: confirmarSenha,
      });
      setSegurancaMsg({ type: "success", text: res.data.detail || "Senha alterada com sucesso." });
      setSenhaAtual("");
      setNovaSenha("");
      setConfirmarSenha("");
    } catch (err) {
      const detail = err.response?.data?.detail;
      setSegurancaMsg({
        type: "error",
        text: Array.isArray(detail) ? detail.join(" ") : detail || "Não foi possível alterar a senha.",
      });
    }
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
      localStorage.removeItem("access");
      localStorage.removeItem("refresh");
      localStorage.removeItem("user_name");
      onClose();
      navigate("/login");
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
              <div className="settings-field">
                <label>Nome de exibição</label>
                <input
                  type="text"
                  value={nomeInput}
                  disabled={loadingPerfil}
                  onChange={(e) => setNomeInput(e.target.value)}
                />
              </div>
              {geralMsg.text && <p className={`settings-msg ${geralMsg.type}`}>{geralMsg.text}</p>}
              <button className="settings-primary-btn" onClick={handleSalvarNome} disabled={loadingPerfil}>
                Salvar
              </button>
            </>
          )}

          {activeTab === "seguranca" && (
            <>
              <h2 className="settings-title">Segurança</h2>
              <div className="settings-field">
                <label>Senha atual</label>
                <input type="password" value={senhaAtual} onChange={(e) => setSenhaAtual(e.target.value)} />
              </div>
              <div className="settings-field">
                <label>Nova senha</label>
                <input type="password" value={novaSenha} onChange={(e) => setNovaSenha(e.target.value)} />
              </div>
              <div className="settings-field">
                <label>Confirmar nova senha</label>
                <input type="password" value={confirmarSenha} onChange={(e) => setConfirmarSenha(e.target.value)} />
              </div>
              {segurancaMsg.text && <p className={`settings-msg ${segurancaMsg.type}`}>{segurancaMsg.text}</p>}
              <button className="settings-primary-btn" onClick={handleAlterarSenha}>
                Salvar alterações
              </button>
            </>
          )}

          {activeTab === "dados" && (
            <>
              <h2 className="settings-title">Controlar dados</h2>

              <div className="settings-row">
                <div>
                  <p className="settings-row-title">Baixar meus dados</p>
                  <p className="settings-row-subtitle">Exporta seu perfil e o histórico de conversas em JSON.</p>
                </div>
                <button className="settings-secondary-btn" onClick={handleBaixarDados}>
                  Baixar
                </button>
              </div>

              <div className="settings-row">
                <div>
                  <p className="settings-row-title">Apagar todas as conversas</p>
                  <p className="settings-row-subtitle">Remove permanentemente todo o seu histórico de chat.</p>
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
                  <p className="settings-row-subtitle">Essa ação é permanente e apaga todos os seus dados.</p>
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
                      Confirmar exclusão
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
