<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import LoginForm from './components/LoginForm.vue'
import ComparisonChart from './components/ComparisonChart.vue'

const usuarioLogado = ref(localStorage.getItem('usuario_logado'))
const temaEscuro = ref(true)
const pagina = ref(window.location.hash.startsWith('#historico-') ? 'historico' : 'visao')
const modo = ref('AUTOMÁTICO')
const agora = ref(new Date())
const periodo = ref(24)
const wsStatus = ref('fallback')
const sensores = ref([
  { id: 'ph', nome: 'pH', valor: 7.12, unidade: 'pH', classe: 'cyan', icone: '🧪' },
  { id: 'temperatura', nome: 'Temperatura', valor: 24.3, unidade: '°C', classe: 'green', icone: '🌡️' },
  { id: 'turbidez', nome: 'Turbidez', valor: 0.82, unidade: 'NTU', classe: 'amber', icone: '💧' },
  { id: 'nivel', nome: 'Nível tratado', valor: 86, unidade: '%', classe: 'blue', icone: '🔵' },
])
const sensorSelecionado = ref(null)
const tanquesComparacao = [
  { id: 'agua-bruta', nome: 'Água bruta', cor: '#16b9f4' },
  { id: 'tanque-ativos', nome: 'Tanque de ativos', cor: '#19e69a' },
  { id: 'agua-tratada', nome: 'Água tratada', cor: '#f5b544' },
  { id: 'efluentes', nome: 'Efluentes', cor: '#ff7185' },
]
const variaveisComparacao = [
  { id: 'turbidez', titulo: 'Comparativo de turbidez', unidade: 'NTU', tanqueIds: ['agua-bruta', 'tanque-ativos', 'agua-tratada'] },
  { id: 'ph', titulo: 'Comparativo de pH', unidade: 'pH', tanqueIds: ['tanque-ativos', 'agua-tratada'] },
  { id: 'temperatura', titulo: 'Comparativo de temperatura', unidade: '°C', tanqueIds: ['agua-bruta', 'agua-tratada'] },
  { id: 'nivel', titulo: 'Nível dos reservatórios', unidade: '%', tanqueIds: tanquesComparacao.map((tanque) => tanque.id) },
]
const valoresDemonstrativos = {
  'agua-bruta': { turbidez: [1.2, 1.8, 1.3, 2.0, 1.5, 2.8, 2.4], temperatura: [24.3, 24.5, 24.6, 24.4, 24.8, 24.5, 24.3], nivel: [78, 80, 76, 82, 85, 83, 86] },
  'tanque-ativos': { turbidez: [4.4, 3.8, 3.5, 2.9, 2.5, 2.2, 2.0], ph: [7.1, 7.0, 7.2, 7.1, 7.2, 7.1, 7.1], nivel: [64, 66, 65, 68, 68, 70, 72] },
  'agua-tratada': { turbidez: [0.8, 0.7, 0.9, 0.6, 0.5, 0.7, 0.8], ph: [7.2, 7.2, 7.1, 7.2, 7.1, 7.2, 7.2], temperatura: [24.3, 24.2, 24.4, 24.3, 24.5, 24.4, 24.3], nivel: [86, 88, 89, 90, 88, 91, 92] },
  efluentes: { nivel: [42, 45, 44, 43, 46, 48, 47] },
}
const chaveHistorico = 'supervisorio-historico-comparativo-v1'
function criarHistoricoDemonstrativo() {
  return Array.from({ length: 7 }, (_, indice) => ({
    timestamp: Date.now() - (6 - indice) * 4 * 60 * 60 * 1000,
    sensores: Object.fromEntries(tanquesComparacao.map((tanque) => [
      tanque.id,
      Object.fromEntries(Object.entries(valoresDemonstrativos[tanque.id]).map(([sensor, leituras]) => [sensor, leituras[indice]])),
    ])),
  }))
}
function carregarHistoricoSalvo() {
  try {
    const salvo = JSON.parse(localStorage.getItem(chaveHistorico))
    return Array.isArray(salvo) && salvo.length ? salvo : null
  } catch {
    return null
  }
}
const historicoSalvo = carregarHistoricoSalvo()
const historicoComparativo = ref(historicoSalvo || criarHistoricoDemonstrativo())
const origemHistorico = ref(historicoSalvo ? 'local' : 'demonstrativo')
const marcadoresVisiveis = ref(false)
const linhasSuaves = ref(true)
const notificacaoHistorico = ref('')
const descricaoOrigemHistorico = computed(() => origemHistorico.value === 'websocket'
  ? 'Recebendo dados por WebSocket'
  : origemHistorico.value === 'local'
    ? 'Histórico salvo neste navegador'
    : 'Valores demonstrativos')
const graficosComparativos = computed(() => {
  const limite = Date.now() - periodo.value * 60 * 60 * 1000
  const registros = historicoComparativo.value.filter((registro) => registro.timestamp >= limite)

  return variaveisComparacao.map((variavel) => ({
    ...variavel,
    labels: registros.map((registro) => new Date(registro.timestamp).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })),
    datasets: variavel.tanqueIds.map((tanqueId) => {
      const tanque = tanquesComparacao.find((item) => item.id === tanqueId)
      return {
        label: tanque.nome,
        data: registros.map((registro) => leituraNumerica(registro, tanqueId, variavel.id)),
        borderColor: tanque.cor,
        backgroundColor: tanque.cor,
        spanGaps: false,
      }
    }),
    valoresAtuais: variavel.tanqueIds.map((tanqueId) => {
      const tanque = tanquesComparacao.find((item) => item.id === tanqueId)
      const registro = [...historicoComparativo.value].reverse().find((item) => leituraNumerica(item, tanqueId, variavel.id) !== null)
      return { ...tanque, valor: registro ? leituraNumerica(registro, tanqueId, variavel.id) : null }
    }),
  }))
})
const tanques = ref([{ nome: 'Água bruta', nivel: 78 }, { nome: 'Tratamento', nivel: 64 }, { nome: 'Água tratada', nivel: 86 }])
const sensoresPorTanque = {
  'agua-bruta': ['temperatura', 'turbidez', 'nivelAlto', 'nivelBaixo'],
  'tanque-ativos': ['turbidez', 'ph', 'nivelAlto', 'nivelBaixo'],
  'agua-tratada': ['temperatura', 'turbidez', 'ph', 'nivelAlto'],
  efluentes: ['nivelAlto', 'nivelBaixo'],
}
const statusTanques = computed(() => tanquesComparacao.map((tanque) => ({
  nome: tanque.nome,
  medicoes: sensoresPorTanque[tanque.id].map((sensorId) => {
    const sensor = sensores.value.find((item) => item.id === sensorId)
    const nome = sensor?.nome || (sensorId === 'nivelAlto' ? 'Nível alto' : 'Nível baixo')
    const icone = sensor?.icone || (sensorId === 'nivelAlto' ? '🔵' : '⚪')
    const valorAtual = valorSensorPorTanque(tanque.id, sensorId, sensor?.valor)
    const valor = typeof valorAtual === 'number' && sensor
      ? `${valorAtual.toFixed(sensorId === 'temperatura' ? 1 : 2).replace('.', ',')} ${sensor.unidade}`.trim()
      : valorAtual

    return { chave: sensorId, nome, icone, valor, estado: 'NORMAL', estadoClasse: 'good', classe: sensor?.classe || 'blue' }
  }),
})))
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
function abrirDetalhe(medicao, tanque) {
  const historico = historicoComparativo.value
    .map((registro) => registro.sensores?.[tanque.id]?.[medicao.chave])
    .filter((valor) => valor !== null && valor !== undefined && valor !== '')

  sensorSelecionado.value = {
    ...medicao,
    tanque: tanque.nome,
    ultimaAtualizacao: hora.value,
    modo: modo.value,
    historico: historico.length ? historico.slice(-5) : [medicao.valor],
  }
}
function valorSensorPorTanque(tanqueId, sensorId, valorPadrao) {
  for (const registro of [...historicoComparativo.value].reverse()) {
    const valor = registro.sensores?.[tanqueId]?.[sensorId]
    if (valor !== null && valor !== undefined && valor !== '') return valor
  }
  if (sensorId === 'nivelAlto') return 'LIGADO'
  if (sensorId === 'nivelBaixo') return 'DESLIGADO'
  return valorPadrao ?? '—'
}
function leituraNumerica(registro, tanqueId, sensorId) {
  const valor = registro?.sensores?.[tanqueId]?.[sensorId]
  return valor !== null && valor !== undefined && valor !== '' && Number.isFinite(Number(valor)) ? Number(valor) : null
}
function persistirHistorico() {
  try {
    localStorage.setItem(chaveHistorico, JSON.stringify(historicoComparativo.value))
  } catch {
    notificacaoHistorico.value = 'Não foi possível salvar o histórico neste navegador.'
  }
}
function atualizarHistoricoComparativo(pacote) {
  const sensoresRecebidos = pacote.sensores
  if (!sensoresRecebidos || typeof sensoresRecebidos !== 'object' || Array.isArray(sensoresRecebidos)) return false

  const atualizacoes = {}
  for (const tanque of tanquesComparacao) {
    const leituras = sensoresRecebidos[tanque.id]
    if (!leituras || typeof leituras !== 'object' || Array.isArray(leituras)) continue

    for (const sensor of ['turbidez', 'ph', 'temperatura', 'nivel']) {
      const recebido = leituras[sensor]
      if (recebido === null || recebido === undefined || recebido === '') continue
      const valor = Number(recebido)
      if (!Number.isFinite(valor) || (sensor === 'nivel' && (valor < 0 || valor > 100))) continue
      atualizacoes[tanque.id] ||= {}
      atualizacoes[tanque.id][sensor] = valor
    }
  }
  if (!Object.keys(atualizacoes).length) return false

  const base = origemHistorico.value === 'demonstrativo' ? [] : historicoComparativo.value
  const anterior = base.at(-1)
  const leiturasAtuais = Object.fromEntries(Object.entries(anterior?.sensores || {}).map(([id, leituras]) => [id, { ...leituras }]))
  for (const [tanqueId, leituras] of Object.entries(atualizacoes)) {
    leiturasAtuais[tanqueId] = { ...leiturasAtuais[tanqueId], ...leituras }
  }

  const recebido = pacote.timestamp ? new Date(pacote.timestamp).getTime() : Date.now()
  const timestamp = Number.isFinite(recebido) ? recebido : Date.now()
  historicoComparativo.value = [...base, { timestamp, sensores: leiturasAtuais }].sort((a, b) => a.timestamp - b.timestamp).slice(-2000)
  origemHistorico.value = 'websocket'
  persistirHistorico()
  return true
}
async function compartilharGrafico(grafico) {
  const url = new URL(window.location.href)
  url.hash = `historico-${grafico.id}`
  try {
    if (navigator.share) {
      await navigator.share({ title: grafico.titulo, text: 'Comparativo de leituras da ETA', url: url.toString() })
      return
    }
    await navigator.clipboard.writeText(url.toString())
    notificacaoHistorico.value = 'Link do gráfico copiado.'
  } catch (erro) {
    if (erro.name !== 'AbortError') notificacaoHistorico.value = 'Não foi possível compartilhar o gráfico.'
  }
  window.clearTimeout(notificacaoTimer)
  notificacaoTimer = window.setTimeout(() => { notificacaoHistorico.value = '' }, 3000)
}
let notificacaoTimer
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
      const comparativoAtualizado = atualizarHistoricoComparativo(pacote)
      if (pacote.sensores && !comparativoAtualizado) {
        sensores.value = sensores.value.map((sensor) => pacote.sensores[sensor.id] === undefined ? sensor : { ...sensor, valor: pacote.sensores[sensor.id] })
      }
    }
  } catch { wsStatus.value = 'offline' }
}
onMounted(() => { clock = window.setInterval(() => { agora.value = new Date() }, 1000); iniciarWebSocket() })
onBeforeUnmount(() => { window.clearInterval(clock); window.clearTimeout(notificacaoTimer); socket?.close() })
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
        <div class="section-heading"><div><span class="section-kicker">MONITORAMENTO EM TEMPO REAL</span><h2>Monitoramento por tanque</h2></div><span class="update-label">● Atualização automática</span></div>
        <div class="tank-status-panel">
          <article v-for="tanque in statusTanques" :key="tanque.nome" class="tank-status-item">
            <strong>{{ tanque.nome }}<span>● NORMAL</span></strong>
            <div class="tank-sensor-tags">
              <button v-for="medicao in tanque.medicoes" :key="medicao.chave" type="button" class="tank-sensor-tag" :class="medicao.classe" :aria-label="`${medicao.nome} do tanque ${tanque.nome}: ${medicao.valor}. Abrir detalhes`" @click="abrirDetalhe(medicao, tanque)">
                <span class="tag-icon">{{ medicao.icone }}</span>
                <span>{{ medicao.nome }}</span>
                <strong>{{ medicao.valor }}</strong>
                <small>{{ medicao.estado }}</small>
              </button>
            </div>
          </article>
        </div>
        <div v-if="sensorSelecionado" class="metric-modal-overlay" tabindex="-1" @click="sensorSelecionado = null" @keydown.esc="sensorSelecionado = null">
          <section class="metric-modal" role="dialog" aria-modal="true" :aria-label="`Detalhes de ${sensorSelecionado.nome}`" @click.stop>
            <button type="button" class="modal-close" aria-label="Fechar detalhes" @click="sensorSelecionado = null">×</button>
            <div class="modal-header">
              <span class="modal-kicker">{{ sensorSelecionado.tanque }} · {{ sensorSelecionado.nome }}</span>
              <h3>{{ sensorSelecionado.valor }}</h3>
            </div>
            <div class="modal-status good">{{ sensorSelecionado.estado }}</div>
            <div class="modal-grid">
              <div class="modal-field"><span>Tanque</span><strong>{{ sensorSelecionado.tanque }}</strong></div>
              <div class="modal-field"><span>Valor atual</span><strong>{{ sensorSelecionado.valor }}</strong></div>
              <div class="modal-field"><span>Estado</span><strong>{{ sensorSelecionado.estado }}</strong></div>
              <div class="modal-field"><span>Última atualização</span><strong>{{ sensorSelecionado.ultimaAtualizacao }}</strong></div>
              <div class="modal-field"><span>Histórico recente</span><strong>{{ sensorSelecionado.historico.join(' · ') }}</strong></div>
              <div class="modal-field"><span>Modo</span><strong>{{ sensorSelecionado.modo }}</strong></div>
            </div>
          </section>
        </div>
        <div class="section-heading process-heading"><div><span class="section-kicker">FLUXO DO PROCESSO</span><h2>ETA em operação</h2></div><span class="flow-legend">● Fluxo ativo</span></div>
        <div class="process-panel"><div class="process-line"></div><div class="process-stages"><div class="stage"><div class="stage-icon pump">◉</div><span class="stage-index">01</span><strong>Captação</strong><small>Bomba B1 · ligada</small><span class="flow-arrow">›</span></div><div class="stage"><div class="tank-visual"><span :style="{ height: `${tanques[0].nivel}%` }"></span></div><span class="stage-index">02</span><strong>Água bruta</strong><small>{{ tanques[0].nivel }}% · 10.000 L</small><span class="flow-arrow">›</span></div><div class="stage"><div class="stage-icon treatment">✦</div><span class="stage-index">03</span><strong>Dosagem</strong><small>D1 · D2 · D3 ativas</small><span class="flow-arrow">›</span></div><div class="stage"><div class="stage-icon mixer">↻</div><span class="stage-index">04</span><strong>Floculação</strong><small>Agitador M1 · ligado</small><span class="flow-arrow">›</span></div><div class="stage"><div class="filter-visual"><span></span></div><span class="stage-index">05</span><strong>Filtração</strong><small>Pressão normal</small><span class="flow-arrow">›</span></div><div class="stage"><div class="stage-icon uv">UV</div><span class="stage-index">06</span><strong>Desinfecção</strong><small>UV · ativo</small><span class="flow-arrow">›</span></div><div class="stage"><div class="tank-visual treated"><span :style="{ height: `${tanques[2].nivel}%` }"></span></div><span class="stage-index">07</span><strong>Água tratada</strong><small>{{ tanques[2].nivel }}% · pronta</small></div></div></div>
        <div class="lower-grid"><section class="panel-block"><div class="section-heading compact"><div><span class="section-kicker">ATUAÇÃO</span><h2>Equipamentos</h2></div><span class="manual-hint">{{ manual ? 'Comandos liberados' : 'Selecione MANUAL para comandar' }}</span></div><div class="equipment-grid"><button v-for="equipamento in equipamentos" :key="equipamento.tag" class="equipment-row" :class="{ on: equipamento.ativo }" :disabled="!manual" @click="equipamentoToggle(equipamento)"><span class="equipment-symbol">≋</span><span class="equipment-name"><strong>{{ equipamento.nome }}</strong><small>{{ equipamento.tag }}</small></span><span class="equipment-state">● {{ equipamento.estado }}</span></button></div></section><section class="panel-block mode-panel"><div class="section-heading compact"><div><span class="section-kicker">CONTROLE</span><h2>Modo de operação</h2></div><span class="lock-label">▣ Controle local</span></div><div class="mode-buttons"><button v-for="opcao in ['AUTOMÁTICO', 'MANUAL', 'PARADA']" :key="opcao" :class="{ selected: modo === opcao, stop: opcao === 'PARADA' }" @click="mudarModo(opcao)"><span>{{ opcao === 'AUTOMÁTICO' ? '▶' : opcao === 'MANUAL' ? '✋' : '■' }}</span>{{ opcao }}</button></div><div class="mode-description">● {{ modo === 'MANUAL' ? 'Operador no controle dos atuadores' : modo === 'PARADA' ? 'Atuadores em estado seguro' : 'ESP32 executando lógica de controle' }}</div></section></div>
      </section>

      <section v-else-if="pagina === 'historico'" class="page-content inner-page">
        <div class="comparison-heading">
          <div><span class="section-kicker">ANÁLISE OPERACIONAL</span><h2>Histórico e tendências</h2><p>Compare a evolução das variáveis entre os tanques.</p></div>
          <span class="history-source" :class="origemHistorico">● {{ descricaoOrigemHistorico }}</span>
        </div>
        <p v-if="origemHistorico === 'demonstrativo'" class="demo-notice">Exemplo ilustrativo. Envie leituras identificadas por tanque pelo WebSocket para ver dados reais.</p>
        <div class="comparison-toolbar">
          <div class="period-control" role="group" aria-label="Período do histórico">
            <button v-for="horas in [1, 6, 12, 24]" :key="horas" type="button" :class="{ selected: periodo === horas }" :aria-pressed="periodo === horas" @click="periodo = horas">{{ horas }}h</button>
          </div>
          <details class="chart-options">
            <summary>Opções do gráfico</summary>
            <div class="chart-option-list">
              <label><input v-model="marcadoresVisiveis" type="checkbox"> Mostrar pontos</label>
              <label><input v-model="linhasSuaves" type="checkbox"> Suavizar linhas</label>
            </div>
          </details>
        </div>
        <div class="comparison-grid">
          <ComparisonChart
            v-for="grafico in graficosComparativos"
            :key="grafico.id"
            :titulo="grafico.titulo"
            :unidade="grafico.unidade"
            :labels="grafico.labels"
            :datasets="grafico.datasets"
            :valores-atuais="grafico.valoresAtuais"
            :marcadores-visiveis="marcadoresVisiveis"
            :linhas-suaves="linhasSuaves"
          >
            <template #actions>
              <button type="button" class="share-chart-button" @click="compartilharGrafico(grafico)">Compartilhar</button>
            </template>
          </ComparisonChart>
        </div>
        <p v-if="notificacaoHistorico" class="history-notification" role="status">{{ notificacaoHistorico }}</p>
      </section>
      <section v-else-if="pagina === 'alarmes'" class="page-content inner-page"><div class="page-title-row"><div><span class="section-kicker">EVENTOS DO SISTEMA</span><h2>Alarmes e ocorrências</h2><p>Prioridades operacionais e reconhecimento pelo operador.</p></div><div class="alarm-summary"><strong>{{ ativos.length }}</strong><span>ativos agora</span></div></div><div class="alarm-tabs"><button class="active">Ativos ({{ ativos.length }})</button><button>Reconhecidos</button><button>Histórico</button></div><div class="alarm-list"><div v-for="alarme in alarmes" :key="alarme.equipamento" class="alarm-row" :class="alarme.prioridade"><span class="alarm-icon">!</span><div><strong>{{ alarme.equipamento }}</strong><p>{{ alarme.descricao }}</p></div><span class="alarm-time">{{ alarme.hora }}</span><span class="priority-label">{{ alarme.prioridade }}</span><button v-if="alarme.ativo" class="ack-button" @click="reconhecer(alarme)">Reconhecer</button><span v-else class="acknowledged">Reconhecido</span></div></div></section>
      <section v-else class="page-content inner-page"><div class="page-title-row"><div><span class="section-kicker">INTEGRAÇÃO</span><h2>Configurações do sistema</h2><p>Parâmetros de comunicação e extensibilidade da planta.</p></div></div><div class="config-grid"><div class="config-card"><span class="config-icon">⇄</span><div><strong>WebSocket / MQTT bridge</strong><p>Canal bidirecional para telemetria e comandos</p></div><span class="config-status">AGUARDANDO</span></div><div class="config-card"><span class="config-icon">▣</span><div><strong>Banco de dados</strong><p>Histórico de medições, estados, eventos e alarmes</p></div><span class="config-status">PRONTO</span></div><div class="config-card"><span class="config-icon">＋</span><div><strong>Modelo modular</strong><p>Novos sensores e atuadores podem ser adicionados por ID</p></div><span class="config-status">ATIVO</span></div></div></section>
    </main>
  </div>
</template>
