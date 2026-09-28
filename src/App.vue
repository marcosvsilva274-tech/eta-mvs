<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import LoginForm from './components/LoginForm.vue'

const usuarioLogado = ref(localStorage.getItem('usuario_logado'))
const temaEscuro = ref(true)
const pagina = ref('visao')
const modo = ref('AUTOMÁTICO')
const agora = ref(new Date())
const periodo = ref('24h')
const wsStatus = ref('fallback')
const sensores = ref([
  { id: 'ph', nome: 'pH', valor: 7.12, unidade: 'pH', classe: 'cyan' },
  { id: 'temperatura', nome: 'Temperatura', valor: 24.3, unidade: '°C', classe: 'green' },
  { id: 'turbidez', nome: 'Turbidez', valor: 0.82, unidade: 'NTU', classe: 'amber' },
  { id: 'nivel', nome: 'Nível tratado', valor: 86, unidade: '%', classe: 'blue' },
])
const tanques = ref([{ nome: 'Água bruta', nivel: 78 }, { nome: 'Tratamento', nivel: 64 }, { nome: 'Água tratada', nivel: 86 }])
const equipamentos = ref([
  { nome: 'Bomba de captação', tag: 'B1', estado: 'LIGADA', ativo: true },
  { nome: 'Bomba de distribuição', tag: 'B2', estado: 'LIGADA', ativo: true },
  { nome: 'Agitador / floculação', tag: 'M1', estado: 'LIGADO', ativo: true },
  { nome: 'Dosadora coagulante', tag: 'D1', estado: 'LIGADA', ativo: true },
  { nome: 'Dosadora alcalinizante', tag: 'D2', estado: 'LIGADA', ativo: true },
  { nome: 'Dosadora sanitizante', tag: 'D3', estado: 'LIGADA', ativo: true },
])
const alarmes = ref([
  { prioridade: 'alta', equipamento: 'Comunicação', descricao: 'Última resposta do ESP32 há 12 segundos', hora: '14:26:19', ativo: true },
  { prioridade: 'media', equipamento: 'Reservatório tratado', descricao: 'Nível acima do limite de atenção (85%)', hora: '14:20:44', ativo: true },
  { prioridade: 'baixa', equipamento: 'Filtro', descricao: 'Manutenção preventiva programada', hora: '12:00:00', ativo: false },
])
const paginas = [{ id: 'visao', icone: '▦', titulo: 'Visão geral' }, { id: 'historico', icone: '◷', titulo: 'Histórico' }, { id: 'alarmes', icone: '♢', titulo: 'Alarmes', badge: 2 }, { id: 'configuracoes', icone: '⚙', titulo: 'Configurações' }]
const hora = computed(() => agora.value.toLocaleTimeString('pt-BR'))
const data = computed(() => agora.value.toLocaleDateString('pt-BR'))
const ativos = computed(() => alarmes.value.filter((alarme) => alarme.ativo))
const manual = computed(() => modo.value === 'MANUAL')
let clock
let socket

function equipamentoToggle(equipamento) {
  if (!manual.value) return
  equipamento.ativo = !equipamento.ativo
  equipamento.estado = equipamento.ativo ? 'LIGADA' : 'DESLIGADA'
}
function mudarModo(novoModo) {
  modo.value = novoModo
  if (novoModo === 'PARADA') equipamentos.value.forEach((equipamento) => { equipamento.ativo = false; equipamento.estado = 'DESLIGADA' })
}
function reconhecer(alarme) { alarme.ativo = false }
function sair() { localStorage.removeItem('usuario_logado'); usuarioLogado.value = null }
function iniciarWebSocket() {
  const url = import.meta.env.VITE_WS_URL
  if (!url) return
  try {
    socket = new WebSocket(url)
    socket.onopen = () => { wsStatus.value = 'online' }
    socket.onclose = () => { wsStatus.value = 'offline' }
    socket.onerror = () => { wsStatus.value = 'offline' }
    socket.onmessage = ({ data: mensagem }) => {
      const pacote = JSON.parse(mensagem)
      if (pacote.sensores) sensores.value = sensores.value.map((sensor) => pacote.sensores[sensor.id] === undefined ? sensor : { ...sensor, valor: pacote.sensores[sensor.id] })
    }
  } catch { wsStatus.value = 'offline' }
}
onMounted(() => { clock = window.setInterval(() => { agora.value = new Date() }, 1000); iniciarWebSocket() })
onBeforeUnmount(() => { window.clearInterval(clock); socket?.close() })
</script>

<template>
  <LoginForm v-if="!usuarioLogado" @login="usuarioLogado = $event" />
  <div v-else class="scada-app" :class="{ 'light-theme': !temaEscuro }">
    <aside class="sidebar">
      <div class="brand-mark"><span class="brand-drop">◢</span><div><strong>ETA</strong><small>SUPERVISÓRIO</small></div></div>
      <div class="plant-label">Estação de Tratamento<br>de Água</div>
      <nav class="main-nav"><button v-for="item in paginas" :key="item.id" class="nav-item" :class="{ active: pagina === item.id }" @click="pagina = item.id"><span class="nav-icon">{{ item.icone }}</span><span>{{ item.titulo }}</span><b v-if="item.badge" class="nav-badge">{{ item.badge }}</b></button></nav>
      <div class="sidebar-footer"><span class="user-avatar">{{ usuarioLogado.slice(0, 1).toUpperCase() }}</span><div><strong>{{ usuarioLogado }}</strong><small>Operador</small></div><button class="icon-button" @click="sair">⇥</button></div>
    </aside>
    <main class="main-area">
      <header class="topbar"><div><span class="breadcrumb">SUPERVISÓRIO / {{ paginas.find((item) => item.id === pagina)?.titulo.toUpperCase() }}</span><h1>{{ pagina === 'visao' ? 'Visão geral da planta' : paginas.find((item) => item.id === pagina)?.titulo }}</h1></div><div class="topbar-actions"><div class="communication"><span class="live-dot" :class="wsStatus"></span><div><strong>{{ wsStatus === 'online' ? 'ESP32 ONLINE' : 'ESP32 OFFLINE' }}</strong><small>Backend conectado</small></div></div><div class="date-time"><strong>{{ hora }}</strong><span>{{ data }} · Quinta-feira</span></div><button class="theme-toggle" @click="temaEscuro = !temaEscuro">{{ temaEscuro ? '☀' : '☾' }}</button></div></header>

      <section v-if="pagina === 'visao'" class="page-content">
        <div class="status-strip"><div><span class="status-dot"></span><strong>Sistema operando normalmente</strong><small>Última sincronização {{ hora }}</small></div><div class="strip-metric"><span>Modo atual</span><strong>{{ modo }}</strong></div><div class="strip-metric"><span>Alarmes ativos</span><strong class="danger">{{ ativos.length }}</strong></div><button class="outline-button" @click="pagina = 'alarmes'">Ver alarmes →</button></div>
        <div class="section-heading"><div><span class="section-kicker">MONITORAMENTO EM TEMPO REAL</span><h2>Qualidade da água</h2></div><span class="update-label">● Atualização automática</span></div>
        <div class="sensor-grid"><article v-for="sensor in sensores" :key="sensor.id" class="sensor-card" :class="sensor.classe"><div class="card-top"><span>{{ sensor.nome }}</span><span class="sensor-state">● Normal</span></div><div class="sensor-reading"><strong>{{ sensor.valor }}</strong><small>{{ sensor.unidade }}</small></div><div class="card-bottom"><span>Atualizado às {{ hora }}</span><span class="trend">↗ 0.4%</span></div></article></div>
        <div class="section-heading process-heading"><div><span class="section-kicker">FLUXO DO PROCESSO</span><h2>ETA em operação</h2></div><span class="flow-legend">● Fluxo ativo</span></div>
        <div class="process-panel"><div class="process-line"></div><div class="process-stages"><div class="stage"><div class="stage-icon pump">◉</div><span class="stage-index">01</span><strong>Captação</strong><small>Bomba B1 · ligada</small><span class="flow-arrow">›</span></div><div class="stage"><div class="tank-visual"><span :style="{ height: `${tanques[0].nivel}%` }"></span></div><span class="stage-index">02</span><strong>Água bruta</strong><small>{{ tanques[0].nivel }}% · 10.000 L</small><span class="flow-arrow">›</span></div><div class="stage"><div class="stage-icon treatment">✦</div><span class="stage-index">03</span><strong>Dosagem</strong><small>D1 · D2 · D3 ativas</small><span class="flow-arrow">›</span></div><div class="stage"><div class="stage-icon mixer">↻</div><span class="stage-index">04</span><strong>Floculação</strong><small>Agitador M1 · ligado</small><span class="flow-arrow">›</span></div><div class="stage"><div class="filter-visual"><span></span></div><span class="stage-index">05</span><strong>Filtração</strong><small>Pressão normal</small><span class="flow-arrow">›</span></div><div class="stage"><div class="stage-icon uv">UV</div><span class="stage-index">06</span><strong>Desinfecção</strong><small>UV · ativo</small><span class="flow-arrow">›</span></div><div class="stage"><div class="tank-visual treated"><span :style="{ height: `${tanques[2].nivel}%` }"></span></div><span class="stage-index">07</span><strong>Água tratada</strong><small>{{ tanques[2].nivel }}% · pronta</small></div></div></div>
        <div class="lower-grid"><section class="panel-block"><div class="section-heading compact"><div><span class="section-kicker">ATUAÇÃO</span><h2>Equipamentos</h2></div><span class="manual-hint">{{ manual ? 'Comandos liberados' : 'Selecione MANUAL para comandar' }}</span></div><div class="equipment-grid"><button v-for="equipamento in equipamentos" :key="equipamento.tag" class="equipment-row" :class="{ on: equipamento.ativo }" :disabled="!manual" @click="equipamentoToggle(equipamento)"><span class="equipment-symbol">≋</span><span class="equipment-name"><strong>{{ equipamento.nome }}</strong><small>{{ equipamento.tag }}</small></span><span class="equipment-state">● {{ equipamento.estado }}</span></button></div></section><section class="panel-block mode-panel"><div class="section-heading compact"><div><span class="section-kicker">CONTROLE</span><h2>Modo de operação</h2></div><span class="lock-label">▣ Controle local</span></div><div class="mode-buttons"><button v-for="opcao in ['AUTOMÁTICO', 'MANUAL', 'PARADA']" :key="opcao" :class="{ selected: modo === opcao, stop: opcao === 'PARADA' }" @click="mudarModo(opcao)"><span>{{ opcao === 'AUTOMÁTICO' ? '▶' : opcao === 'MANUAL' ? '✋' : '■' }}</span>{{ opcao }}</button></div><div class="mode-description">● {{ modo === 'MANUAL' ? 'Operador no controle dos atuadores' : modo === 'PARADA' ? 'Atuadores em estado seguro' : 'ESP32 executando lógica de controle' }}</div></section></div>
      </section>

      <section v-else-if="pagina === 'historico'" class="page-content inner-page"><div class="page-title-row"><div><span class="section-kicker">DADOS ARMAZENADOS</span><h2>Histórico e tendências</h2><p>Leituras recebidas do backend e persistidas no banco de dados.</p></div><select v-model="periodo"><option value="1h">Última hora</option><option value="6h">Últimas 6 horas</option><option value="24h">Últimas 24 horas</option><option value="7d">Últimos 7 dias</option></select></div><div class="chart-grid"><div v-for="sensor in sensores.slice(0, 3)" :key="sensor.id" class="chart-card"><div class="chart-head"><strong>{{ sensor.nome }}</strong><span>{{ sensor.valor }} {{ sensor.unidade }}</span></div><svg viewBox="0 0 400 130" preserveAspectRatio="none" class="chart"><path d="M0 95 C30 80 40 105 70 72 S120 85 145 55 S190 80 220 48 S265 68 290 38 S340 72 370 30 S390 42 400 22" fill="none" stroke="currentColor" stroke-width="3"/><path d="M0 95 C30 80 40 105 70 72 S120 85 145 55 S190 80 220 48 S265 68 290 38 S340 72 370 30 S390 42 400 22 V130 H0Z" fill="currentColor" opacity=".09"/></svg><small>Período: {{ periodo }}</small></div></div></section>
      <section v-else-if="pagina === 'alarmes'" class="page-content inner-page"><div class="page-title-row"><div><span class="section-kicker">EVENTOS DO SISTEMA</span><h2>Alarmes e ocorrências</h2><p>Prioridades operacionais e reconhecimento pelo operador.</p></div><div class="alarm-summary"><strong>{{ ativos.length }}</strong><span>ativos agora</span></div></div><div class="alarm-tabs"><button class="active">Ativos ({{ ativos.length }})</button><button>Reconhecidos</button><button>Histórico</button></div><div class="alarm-list"><div v-for="alarme in alarmes" :key="alarme.equipamento" class="alarm-row" :class="alarme.prioridade"><span class="alarm-icon">!</span><div><strong>{{ alarme.equipamento }}</strong><p>{{ alarme.descricao }}</p></div><span class="alarm-time">{{ alarme.hora }}</span><span class="priority-label">{{ alarme.prioridade }}</span><button v-if="alarme.ativo" class="ack-button" @click="reconhecer(alarme)">Reconhecer</button><span v-else class="acknowledged">Reconhecido</span></div></div></section>
      <section v-else class="page-content inner-page"><div class="page-title-row"><div><span class="section-kicker">INTEGRAÇÃO</span><h2>Configurações do sistema</h2><p>Parâmetros de comunicação e extensibilidade da planta.</p></div></div><div class="config-grid"><div class="config-card"><span class="config-icon">⇄</span><div><strong>WebSocket / MQTT bridge</strong><p>Canal bidirecional para telemetria e comandos</p></div><span class="config-status">AGUARDANDO</span></div><div class="config-card"><span class="config-icon">▣</span><div><strong>Banco de dados</strong><p>Histórico de medições, estados, eventos e alarmes</p></div><span class="config-status">PRONTO</span></div><div class="config-card"><span class="config-icon">＋</span><div><strong>Modelo modular</strong><p>Novos sensores e atuadores podem ser adicionados por ID</p></div><span class="config-status">ATIVO</span></div></div></section>
    </main>
  </div>
</template>
