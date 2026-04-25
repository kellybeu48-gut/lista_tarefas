/* TaskFlow – app.js | React via CDN + Babel Standalone */
const { useState, useEffect, useCallback, useMemo, useRef } = React;

// ─── Constantes ──────────────────────────────────────────────
const CATEGORIAS = [
  { id: 'trabalho', label: 'Trabalho',  cls: 'tag-trabalho', cor: '#6366f1' },
  { id: 'pessoal',  label: 'Pessoal',   cls: 'tag-pessoal',  cor: '#ec4899' },
  { id: 'estudos',  label: 'Estudos',   cls: 'tag-estudos',  cor: '#10b981' },
  { id: 'outros',   label: 'Outros',    cls: 'tag-outros',   cor: '#f59e0b' },
];

const PRIORIDADES = [
  { id: 'alta',  label: 'Alta',  cls: 'tag-alta',  cor: '#ef4444', borda: 'pri-alta'  },
  { id: 'media', label: 'Média', cls: 'tag-media', cor: '#f59e0b', borda: 'pri-media' },
  { id: 'baixa', label: 'Baixa', cls: 'tag-baixa', cor: '#22c55e', borda: 'pri-baixa' },
];

// ─── Supabase Config ──────────────────────────────────────────
const SUPABASE_URL = 'https://iieuzdhcowfhayyrmqdv.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlpZXV6ZGhjb3dmaGF5eXJtcWR2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzcxMzM5MDgsImV4cCI6MjA5MjcwOTkwOH0.wPmi1zyfVmJ7Z_rYmjGvGCRWNaDZ8etjz8qrowbvHSA';
const supabase = window.supabase ? window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY) : null;

// ─── Helpers ─────────────────────────────────────────────────
function lerStorage() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || []; }
  catch { return []; }
}

async function carregarTarefasDB() {
  if (!supabase) return lerStorage();
  const { data, error } = await supabase
    .from('tarefas')
    .select('*')
    .order('criada_em', { ascending: false });
  
  if (error) {
    console.error('Erro ao carregar do Supabase:', error);
    return lerStorage();
  }
  
  // Mapear criada_em de volta para criadaEm para o frontend
  const dadosMapeados = data.map(({ criada_em, ...rest }) => ({
    ...rest,
    criadaEm: criada_em
  }));
  
  // Sincronizar local
  localStorage.setItem(STORAGE_KEY, JSON.stringify(dadosMapeados));
  return dadosMapeados;
}

async function salvarTarefaDB(tarefa) {
  if (!supabase) return;
  // Mapear criadaEm para criada_em para o banco de dados
  const { criadaEm, ...dados } = tarefa;
  const payload = { ...dados, criada_em: criadaEm };
  
  console.log('Salvando no Supabase:', payload);
  const { error } = await supabase.from('tarefas').upsert(payload);
  if (error) {
    console.error('Erro detalhado do Supabase:', error.message, error.details, error.hint);
  } else {
    console.log('Salvo com sucesso!');
  }
}

async function excluirTarefaDB(id) {
  if (!supabase) return;
  const { error } = await supabase.from('tarefas').delete().eq('id', id);
  if (error) console.error('Erro ao excluir no Supabase:', error);
}
function uid() { return Date.now().toString(36) + Math.random().toString(36).slice(2); }
function hoje() { return new Date().toISOString().split('T')[0]; }
function formatarData(iso) {
  if (!iso) return null;
  const [y, m, d] = iso.split('-');
  return `${d}/${m}/${y}`;
}
function estaVencida(iso) {
  if (!iso) return false;
  return iso < hoje();
}
function getCat(id) { return CATEGORIAS.find(c => c.id === id) || CATEGORIAS[3]; }
function getPri(id) { return PRIORIDADES.find(p => p.id === id) || PRIORIDADES[1]; }

// ─── Ícones SVG inline ───────────────────────────────────────
const SVGS = {
  plus:         <path d="M12 5v14M5 12h14" />,
  trash:        <><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/></>,
  calendar:     <><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></>,
  alert:        <><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></>,
  logout:       <><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></>,
  x:            <><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></>,
};

function Icon({ name, size = 16, style, className }) {
  const paths = SVGS[name] || SVGS.x;
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round"
      strokeLinejoin="round" style={{ display:'inline-block', verticalAlign:'middle', flexShrink:0, ...style }}
      className={className}>
      {paths}
    </svg>
  );
}

// ─── Navbar ──────────────────────────────────────────────────
function Navbar({ paginaAtiva, setPagina }) {
  const links = [
    { id: 'tarefas',    label: 'Tarefas'   },
    { id: 'analises',   label: 'Análises'  },
    { id: 'calendario', label: 'Calendário' },
  ];
  return (
    <nav className="navbar">
      <div className="navbar-brand">
        ✦ <span>Task</span>Flow
      </div>
      <div className="navbar-links">
        {links.map(l => (
          <button
            key={l.id}
            id={`nav-${l.id}`}
            className={`nav-btn${paginaAtiva === l.id ? ' active' : ''}`}
            onClick={() => setPagina(l.id)}
          >{l.label}</button>
        ))}
        <div className="nav-divider" />
        <button
          id="btn-sair"
          className="btn-sair"
          onClick={() => alert('Funcionalidade de login chegará com o Supabase!')}
        >
          <Icon name="logout" size={14} />
          Sair
        </button>
      </div>
    </nav>
  );
}

// ─── TaskCard ─────────────────────────────────────────────────
function TaskCard({ tarefa, onToggle, onExcluir }) {
  const cat = getCat(tarefa.categoria);
  const pri = getPri(tarefa.prioridade);
  const vencida = !tarefa.concluida && estaVencida(tarefa.data);

  return (
    <div className={`task-card ${pri.borda}${tarefa.concluida ? ' done' : ''}`}>
      {/* Checkbox */}
      <div
        id={`chk-${tarefa.id}`}
        className={`custom-checkbox${tarefa.concluida ? ' checked' : ''}`}
        onClick={() => onToggle(tarefa.id)}
        role="checkbox"
        aria-checked={tarefa.concluida}
        tabIndex={0}
        onKeyDown={e => e.key === 'Enter' && onToggle(tarefa.id)}
      >
        {tarefa.concluida && (
          <svg className="check-icon" width="12" height="12" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        )}
      </div>

      {/* Corpo */}
      <div className="task-body">
        <div className="task-tags">
          <span className={`tag ${cat.cls}`}>{cat.label}</span>
          <span className={`tag ${pri.cls}`}>{pri.label}</span>
        </div>
        <div className="task-title">{tarefa.titulo}</div>
        {tarefa.data && (
          <div className={`task-date${vencida ? ' vencida' : ''}`}>
            <Icon name={vencida ? 'alert' : 'calendar'} size={13} />
            {vencida ? 'Vencida em ' : ''}{formatarData(tarefa.data)}
          </div>
        )}
      </div>

      {/* Excluir */}
      <button
        id={`del-${tarefa.id}`}
        className="btn-delete"
        onClick={() => onExcluir(tarefa.id)}
        aria-label="Excluir tarefa"
        title="Excluir"
      >
        <Icon name="trash" size={15} />
      </button>
    </div>
  );
}

// ─── TaskForm (Modal) ─────────────────────────────────────────
function TaskForm({ onSalvar, onFechar, dataInicial = '' }) {
  const [titulo, setTitulo] = useState('');
  const [categoria, setCategoria] = useState('trabalho');
  const [prioridade, setPrioridade] = useState('media');
  const [data, setData] = useState(dataInicial);

  function handleSubmit(e) {
    e.preventDefault();
    if (!titulo.trim()) return;
    onSalvar({ id: uid(), titulo: titulo.trim(), categoria, prioridade, data, concluida: false, criadaEm: new Date().toISOString() });
    onFechar();
  }

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onFechar()}>
      <div className="modal" role="dialog" aria-modal="true" aria-labelledby="modal-titulo">
        <div className="modal-header">
          <h2 className="modal-title" id="modal-titulo">Nova Tarefa</h2>
          <button className="modal-close" onClick={onFechar} aria-label="Fechar"><Icon name="x" size={16} /></button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {/* Título */}
            <div className="form-group">
              <label className="form-label" htmlFor="input-titulo">Título</label>
              <input
                id="input-titulo"
                className="form-input"
                type="text"
                placeholder="O que precisa ser feito?"
                value={titulo}
                onChange={e => setTitulo(e.target.value)}
                autoFocus
                required
              />
            </div>

            <div className="form-row">
              {/* Categoria */}
              <div className="form-group">
                <label className="form-label" htmlFor="select-categoria">Categoria</label>
                <select id="select-categoria" className="form-select" value={categoria} onChange={e => setCategoria(e.target.value)}>
                  {CATEGORIAS.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
                </select>
              </div>

              {/* Prioridade */}
              <div className="form-group">
                <label className="form-label" htmlFor="select-prioridade">Prioridade</label>
                <select id="select-prioridade" className="form-select" value={prioridade} onChange={e => setPrioridade(e.target.value)}>
                  {PRIORIDADES.map(p => <option key={p.id} value={p.id}>{p.label}</option>)}
                </select>
              </div>
            </div>

            {/* Data */}
            <div className="form-group">
              <label className="form-label" htmlFor="input-data">Data de Conclusão</label>
              <input
                id="input-data"
                className="form-input"
                type="date"
                value={data}
                min={hoje()}
                onChange={e => setData(e.target.value)}
              />
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn-cancel" onClick={onFechar}>Cancelar</button>
            <button type="submit" className="btn-primary" id="btn-salvar-tarefa">
              <Icon name="plus" size={14} />
              Salvar Tarefa
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── FilterBar ────────────────────────────────────────────────
function FilterBar({ filtro, setFiltro, contagens }) {
  const opcoes = [
    { id: 'todas',     label: 'Todas',     n: contagens.todas     },
    { id: 'pendentes', label: 'Pendentes', n: contagens.pendentes },
    { id: 'concluidas',label: 'Concluídas',n: contagens.concluidas},
  ];
  return (
    <div className="filter-bar">
      {opcoes.map(o => (
        <button
          key={o.id}
          id={`filtro-${o.id}`}
          className={`filter-btn${filtro === o.id ? ' active' : ''}`}
          onClick={() => setFiltro(o.id)}
        >
          {o.label}
          <span className="filter-count">{o.n}</span>
        </button>
      ))}
    </div>
  );
}

// ─── TasksPage ────────────────────────────────────────────────
function TasksPage({ tarefas, setTarefas }) {
  const [filtro, setFiltro] = useState('todas');
  const [modalAberto, setModalAberto] = useState(false);

  const lista = useMemo(() => {
    if (filtro === 'pendentes')  return tarefas.filter(t => !t.concluida);
    if (filtro === 'concluidas') return tarefas.filter(t =>  t.concluida);
    return tarefas;
  }, [tarefas, filtro]);

  const contagens = useMemo(() => ({
    todas:      tarefas.length,
    pendentes:  tarefas.filter(t => !t.concluida).length,
    concluidas: tarefas.filter(t =>  t.concluida).length,
  }), [tarefas]);

  async function adicionarTarefa(nova) {
    const atualizado = [nova, ...tarefas];
    setTarefas(atualizado);
    await salvarTarefaDB(nova);
  }

  async function toggleTarefa(id) {
    const t = tarefas.find(x => x.id === id);
    if (!t) return;
    const novaTarefa = { ...t, concluida: !t.concluida };
    const atualizado = tarefas.map(x => x.id === id ? novaTarefa : x);
    setTarefas(atualizado);
    await salvarTarefaDB(novaTarefa);
  }

  async function excluirTarefa(id) {
    const atualizado = tarefas.filter(t => t.id !== id);
    setTarefas(atualizado);
    await excluirTarefaDB(id);
  }

  return (
    <>
      <div className="page-header">
        <div>
          <h1 className="page-title">Minhas Tarefas</h1>
          <p className="page-subtitle">{contagens.pendentes} pendente{contagens.pendentes !== 1 ? 's' : ''} · {contagens.concluidas} concluída{contagens.concluidas !== 1 ? 's' : ''}</p>
        </div>
        <button id="btn-nova-tarefa" className="btn-primary" onClick={() => setModalAberto(true)}>
          <Icon name="plus" size={15} />
          Nova Tarefa
        </button>
      </div>

      <FilterBar filtro={filtro} setFiltro={setFiltro} contagens={contagens} />

      {lista.length === 0 ? (
        <div className="empty-state">
          <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="#5c5a6a" strokeWidth="1.5">
            <path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/>
          </svg>
          <h3>Nenhuma tarefa aqui</h3>
          <p>{filtro === 'todas' ? 'Crie sua primeira tarefa clicando em "Nova Tarefa".' : `Sem tarefas ${filtro === 'pendentes' ? 'pendentes' : 'concluídas'} no momento.`}</p>
        </div>
      ) : (
        <div className="task-list">
          {lista.map(t => (
            <TaskCard key={t.id} tarefa={t} onToggle={toggleTarefa} onExcluir={excluirTarefa} />
          ))}
        </div>
      )}

      {modalAberto && <TaskForm onSalvar={adicionarTarefa} onFechar={() => setModalAberto(false)} />}
    </>
  );
}

// ─── AnalyticsPage ────────────────────────────────────────────
function AnalyticsPage({ tarefas }) {
  const total      = tarefas.length;
  const concluidas = tarefas.filter(t => t.concluida).length;
  const pendentes  = total - concluidas;
  const pct = v => total > 0 ? Math.round((v / total) * 100) : 0;

  const porCat = CATEGORIAS.map(c => ({
    ...c, count: tarefas.filter(t => t.categoria === c.id).length
  }));
  const porPri = PRIORIDADES.map(p => ({
    ...p, count: tarefas.filter(t => t.prioridade === p.id).length
  }));

  return (
    <>
      <div className="page-header">
        <div>
          <h1 className="page-title">Análises</h1>
          <p className="page-subtitle">Visão geral das suas tarefas</p>
        </div>
      </div>

      <div className="analytics-grid">
        {[
          { n: total,      l: 'Total de Tarefas' },
          { n: concluidas, l: 'Concluídas'        },
          { n: pendentes,  l: 'Pendentes'          },
          { n: `${pct(concluidas)}%`, l: 'Taxa de Conclusão' },
        ].map((s, i) => (
          <div className="stat-card" key={i}>
            <div className="stat-number">{s.n}</div>
            <div className="stat-label">{s.l}</div>
          </div>
        ))}
      </div>

      <div className="progress-section">
        <div className="progress-title">Por Categoria</div>
        {porCat.map(c => (
          <div className="progress-item" key={c.id}>
            <div className="progress-header">
              <span>{c.label}</span>
              <span>{c.count} tarefa{c.count !== 1 ? 's' : ''}</span>
            </div>
            <div className="progress-bar-bg">
              <div className="progress-bar" style={{ width: `${pct(c.count)}%`, background: c.cor }} />
            </div>
          </div>
        ))}
      </div>

      <div className="progress-section">
        <div className="progress-title">Por Prioridade</div>
        {porPri.map(p => (
          <div className="progress-item" key={p.id}>
            <div className="progress-header">
              <span>{p.label}</span>
              <span>{p.count} tarefa{p.count !== 1 ? 's' : ''}</span>
            </div>
            <div className="progress-bar-bg">
              <div className="progress-bar" style={{ width: `${pct(p.count)}%`, background: p.cor }} />
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

// ─── CalendarPage ─────────────────────────────────────────────
function CalendarPage({ tarefas, setTarefas }) {
  const agora = new Date();
  const [ano, setAno]  = useState(agora.getFullYear());
  const [mes, setMes]  = useState(agora.getMonth());
  const [modalData, setModalData] = useState(null);

  function abrirModalDia(dia) {
    const iso = `${ano}-${String(mes + 1).padStart(2,'0')}-${String(dia).padStart(2,'0')}`;
    setModalData(iso);
  }

  async function adicionarTarefaCalendario(nova) {
    const atualizado = [nova, ...tarefas];
    setTarefas(atualizado);
    await salvarTarefaDB(nova);
  }

  const DIAS_SEMANA = ['Dom','Seg','Ter','Qua','Qui','Sex','Sáb'];
  const MESES = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];

  const primeiroDia = new Date(ano, mes, 1).getDay();
  const diasNoMes   = new Date(ano, mes + 1, 0).getDate();
  const diasMesAnt  = new Date(ano, mes, 0).getDate();

  const celulas = [];
  for (let i = primeiroDia - 1; i >= 0; i--) celulas.push({ dia: diasMesAnt - i, outro: true });
  for (let i = 1; i <= diasNoMes; i++) celulas.push({ dia: i, outro: false });
  while (celulas.length % 7 !== 0) celulas.push({ dia: celulas.length - diasNoMes - primeiroDia + 1, outro: true });

  function tarefasDoDia(dia) {
    const iso = `${ano}-${String(mes + 1).padStart(2,'0')}-${String(dia).padStart(2,'0')}`;
    return tarefas.filter(t => t.data === iso);
  }

  function isHoje(dia) {
    return dia === agora.getDate() && mes === agora.getMonth() && ano === agora.getFullYear();
  }

  function navMes(delta) {
    let nm = mes + delta, na = ano;
    if (nm < 0) { nm = 11; na--; }
    if (nm > 11){ nm = 0;  na++; }
    setMes(nm); setAno(na);
  }

  return (
    <>
      <div className="page-header">
        <div>
          <h1 className="page-title">Calendário</h1>
          <p className="page-subtitle">Tarefas por data de conclusão</p>
        </div>
      </div>

      <div className="cal-nav">
        <button className="cal-nav-btn" id="cal-prev" onClick={() => navMes(-1)}>← Anterior</button>
        <span className="cal-month-title">{MESES[mes]} {ano}</span>
        <button className="cal-nav-btn" id="cal-next" onClick={() => navMes(1)}>Próximo →</button>
      </div>

      <div className="calendar-grid">
        {DIAS_SEMANA.map(d => <div key={d} className="cal-header">{d}</div>)}
        {celulas.map((c, i) => {
          const ts = !c.outro ? tarefasDoDia(c.dia) : [];
          return (
            <div
              key={i}
              className={`cal-day${c.outro ? ' other-month' : ''}${!c.outro && isHoje(c.dia) ? ' today' : ''}`}
              onClick={() => !c.outro && abrirModalDia(c.dia)}
              style={!c.outro ? { cursor: 'pointer' } : {}}
              title={!c.outro ? 'Clique para adicionar tarefa neste dia' : ''}
            >
              <div className="cal-day-num">{c.dia}</div>
              {ts.slice(0, 3).map(t => {
                const pri = getPri(t.prioridade);
                return <span key={t.id} className="cal-dot" style={{ background: pri.cor }} title={t.titulo} />;
              })}
            </div>
          );
        })}
      </div>

      <div style={{ marginTop: '1.5rem', display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
        <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>💡 Clique em um dia para adicionar uma tarefa</span>
        {PRIORIDADES.map(p => (
          <span key={p.id} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
            <span className="cal-dot" style={{ background: p.cor, width: 10, height: 10 }} />
            {p.label}
          </span>
        ))}
      </div>

      {modalData && (
        <TaskForm
          dataInicial={modalData}
          onSalvar={adicionarTarefaCalendario}
          onFechar={() => setModalData(null)}
        />
      )}
    </>
  );
}

// ─── App Root ─────────────────────────────────────────────────
function App() {
  const [tarefas, setTarefas] = useState(() => lerStorage());
  const [pagina, setPagina]   = useState('tarefas');

  useEffect(() => {
    carregarTarefasDB().then(data => setTarefas(data));
  }, []);

  return (
    <div>
      <Navbar paginaAtiva={pagina} setPagina={setPagina} />
      <main className="main-content">
        {pagina === 'tarefas'    && <TasksPage     tarefas={tarefas} setTarefas={setTarefas} />}
        {pagina === 'analises'   && <AnalyticsPage  tarefas={tarefas} />}
        {pagina === 'calendario' && <CalendarPage   tarefas={tarefas} setTarefas={setTarefas} />}
      </main>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
