<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'

// Importação dos componentes visuais
import LoginForm from './components/LoginForm.vue'
import BarraLateral from './components/common/BarraLateral.vue'
import CabecalhoPrincipal from './components/common/CabecalhoPrincipal.vue'
import FaixaStatus from './components/common/FaixaStatus.vue'

import PainelStatusTanques from './components/overview/PainelStatusTanques.vue'
import PainelEquipamentos from './components/overview/PainelEquipamentos.vue'
import ModalMetrica from './components/overview/ModalMetrica.vue'

import GraficoComparativo from './components/historico/GraficoComparativo.vue'
import HistoricoAcionamentos from './components/historico/HistoricoAcionamentos.vue'

import PainelAlarmes from './components/alarmes/PainelAlarmes.vue'

import GestaoUsuarios from './components/configuracoes/GestaoUsuarios.vue'

// Importação das regras de negócio (Composables) e autenticação
import { useMqtt } from './composables/useMqtt'
import { useHistoricoAcionamentos } from './composables/useHistoricoAcionamentos'
import { useTelemetria } from './composables/useTelemetria'
import { carregarUsuarios, salvarUsuarios } from './auth.js'

// --- ESTADO DE AUTENTICAÇÃO E NAVEGAÇÃO ---
const usuarioLogado = ref(localStorage.getItem('usuario_logado'))
const perfilUsuario = ref(localStorage.getItem('perfil_usuario') || (usuarioLogado.value === 'admin' ? 'admin' : 'operador'))
const ehAdministrador = computed(() => perfilUsuario.value === 'admin')
const usuarios = ref(carregarUsuarios())
const usuarioSenhaSelecionado = ref('')
const mensagemUsuarios = ref('')

// Configurações globais de tema e aba ativa
const temaEscuro = ref(true)
const pagina = ref(window.location.hash.startsWith('#historico-') ? 'historico' : 'visao')
const modo = ref('AUTOMÁTICO')
const manual = computed(() => modo.value === 'MANUAL')
const ehVisitante = computed(() => perfilUsuario.value === 'visitante')

// Contador para ignorar temporariamente as telemetrias do modo logo após enviar um comando de alteração
const ignorarTelemetriaModo = ref(0)

// Relógio em tempo real
const agora = ref(new Date())
const hora = computed(() => agora.value.toLocaleTimeString('pt-BR'))
const data = computed(() => agora.value.toLocaleDateString('pt-BR'))

// Mapeamento das páginas para a barra lateral
const paginas = [
  { id: 'visao', icone: '▦', titulo: 'Visão geral' },
  { id: 'historico', icone: '◷', titulo: 'Histórico' },
  { id: 'alarmes', icone: '♢', titulo: 'Alarmes', badge: 0 },
  { id: 'configuracoes', icone: '⚙', titulo: 'Configurações' }
]
const paginasVisiveis = computed(() => paginas.filter((item) => item.id !== 'configuracoes' || ehAdministrador.value))

// --- INICIALIZAÇÃO DOS COMPOSABLES ---
const { historicoAcionamentosFiltrado, filtroAcionamentos, registrarEventoAcionamento } = useHistoricoAcionamentos(() => usuarioLogado.value)
const {
  sensores,
  origemHistorico,
  periodo,
  marcadoresVisiveis,
  linhasSuaves,
  notificacaoHistorico,
  descricaoOrigemHistorico,
  statusTanques,
  tanquesPainel,
  graficosComparativos,
  atualizarHistoricoComparativo,
  compartilharGrafico
} = useTelemetria()

// Mapeamento completo dos 11 atuadores da planta, vinculando tags JSON, comandos MQTT e tanques do popup
const equipamentos = ref([
  { nome: 'Bomba Inicial (PM1)', tag: 'bomba_pm1', comando: 'PM1', tipo: 'pump', cor: '#078ee8', ativo: false, ignorarTelemetria: 0, tanqueId: 'agua-bruta' },
  { nome: 'Bomba Ativos (PM2)', tag: 'bomba_pm2', comando: 'PM2', tipo: 'pump', cor: '#078ee8', ativo: false, ignorarTelemetria: 0, tanqueId: 'tanque-ativos' },
  { nome: 'Bomba Efluentes (PM3)', tag: 'bomba_pm3', comando: 'PM3', tipo: 'pump', cor: '#078ee8', ativo: false, ignorarTelemetria: 0, tanqueId: 'efluentes' },
  { nome: 'Solenoide Efluentes (SV1)', tag: 'solenoide_hvk1', comando: 'SV1', tipo: 'solenoid', cor: '#e8ad45', ativo: false, ignorarTelemetria: 0, tanqueId: 'tanque-ativos' },
  { nome: 'Solenoide Final (SV2)', tag: 'solenoide_hvk2', comando: 'SV2', tipo: 'solenoid', cor: '#e8ad45', ativo: false, ignorarTelemetria: 0, tanqueId: 'tanque-ativos' },
  { nome: 'Mexedor Ativos (RM1)', tag: 'mexedor_rm1', comando: 'RM1', tipo: 'mixer', cor: '#19e69a', ativo: false, ignorarTelemetria: 0, tanqueId: 'tanque-ativos' },
  { nome: 'Mexedor Final (RM2)', tag: 'mexedor_rm2', comando: 'RM2', tipo: 'mixer', cor: '#19e69a', ativo: false, ignorarTelemetria: 0, tanqueId: 'agua-tratada' },
  { nome: 'Dosador Coagulante (DM1)', tag: 'dosador_fecl3_dm1', comando: 'DM1', tipo: 'doser', cor: '#ffc52e', ativo: false, ignorarTelemetria: 0, tanqueId: 'tanque-ativos' },
  { nome: 'Dosador Alcalinizante (DM2)', tag: 'dosador_caco3_dm2', comando: 'DM2', tipo: 'doser', cor: '#25d47d', ativo: false, ignorarTelemetria: 0, tanqueId: 'tanque-ativos' },
  { nome: 'Dosador Sanitizante (DM3)', tag: 'dosador_naclo_dm3', comando: 'DM3', tipo: 'doser', cor: '#078ee8', ativo: false, ignorarTelemetria: 0, tanqueId: 'tanque-ativos' },
  { nome: 'Lâmpada UV (H1)', tag: 'lampada_uv', comando: 'H1', tipo: 'lamp', cor: '#a855f7', ativo: false, ignorarTelemetria: 0, tanqueId: 'agua-tratada' },
])

let estadosAutomaticos = new Map()

// --- ESTADO DOS ALARMES ---
const alarmesAtivos = ref([])
const alarmesHistorico = ref([])
const filtroAlarmes = ref('ativos')

const alarmesResumo = computed(() => [
  { label: 'Total', value: alarmesAtivos.value.length + alarmesHistorico.value.length, tone: 'normal' },
  { label: 'Atenção', value: alarmesAtivos.value.filter((alarme) => alarme.type === 'warning').length, tone: 'warning' },
  { label: 'Críticos', value: alarmesAtivos.value.filter((alarme) => alarme.type === 'critical').length, tone: 'danger' },
])

// Atualiza a badge do menu lateral conforme quantidade de alarmes pendentes
const paginasComBadge = computed(() => paginasVisiveis.value.map((p) => p.id === 'alarmes' ? { ...p, badge: alarmesAtivos.value.length } : p))


/**
 * Mapeia e insere alertas recebidos no padrão "Código;Severidade;Descrição"
 */
function processarAlertaRecebido(alerta) {
  const mapaSeveridade = {
    0: { severity: 'Aviso', type: 'info', icon: 'ℹ' },
    1: { severity: 'Atenção', type: 'warning', icon: '⚡' },
    2: { severity: 'Crítico', type: 'critical', icon: '⚠' }
  }

  const infoSeveridade = mapaSeveridade[alerta.severidade] || mapaSeveridade[0]
  const horaEnvio = new Date().toLocaleTimeString('pt-BR')
  const indexExistente = alarmesAtivos.value.findIndex((a) => a.codigo === alerta.codigo)

  // Atualiza alarme se ele já existia nos ativos ou adiciona um novo no topo
  if (indexExistente !== -1) {
    alarmesAtivos.value[indexExistente] = {
      ...alarmesAtivos.value[indexExistente],
      title: alerta.descricao,
      severity: infoSeveridade.severity,
      type: infoSeveridade.type,
      icon: infoSeveridade.icon,
      horaEnvio,
      description: `Código #${alerta.codigo} — Atualizado às ${horaEnvio}`,
      status: 'Ativo'
    }
  } else {
    alarmesAtivos.value.unshift({
      id: `ativo-${alerta.codigo}-${Date.now()}`,
      codigo: alerta.codigo,
      title: alerta.descricao,
      severity: infoSeveridade.severity,
      status: 'Ativo',
      description: `Código #${alerta.codigo} — Recebido às ${horaEnvio}`,
      badge: 'Novo',
      type: infoSeveridade.type,
      icon: infoSeveridade.icon,
      horaEnvio
    })
  }
}

// --- CONEXÃO COM O BROKER MQTT E TRATAMENTO DE TELEMETRIA ---
const { etapaAtual, mqttStatus, publicarComando } = useMqtt(
  // 1. Processamento de Telemetria
  (pacote) => {
    atualizarHistoricoComparativo(pacote)

    // Sincroniza o modo de operação caso não esteja no período de trava (delay)
    if (pacote.modo_operacao) {
      if (ignorarTelemetriaModo.value > 0) {
        ignorarTelemetriaModo.value-- // Decrementa 1 das 2 leituras ignoradas
      } else {
        const modoMapeado = pacote.modo_operacao.toUpperCase()
        if (['AUTOMÁTICO', 'AUTOMATICO'].includes(modoMapeado)) modo.value = 'AUTOMÁTICO'
        else if (modoMapeado === 'MANUAL') modo.value = 'MANUAL'
        else if (['PARADA', 'EMERGENCIA'].includes(modoMapeado)) modo.value = 'PARADA'
      }
    }

    // Consolida todos os tanques do JSON em um objeto único de checagem
    const todosDispositivos = {
      ...pacote.tanque_armazenamento,
      ...pacote.tanque_ativos,
      ...pacote.tanque_efluentes,
      ...pacote.tanque_final
    }

    // Atualiza estado visual dos equipamentos ignorando o piscar durante a trava manual
    equipamentos.value.forEach((equipamento) => {
      if (todosDispositivos[equipamento.tag] !== undefined) {
        if (equipamento.ignorarTelemetria > 0) {
          equipamento.ignorarTelemetria-- // Decrementa a trava temporária
        } else {
          equipamento.ativo = Boolean(todosDispositivos[equipamento.tag])
        }
      }
    })
  },
  // 2. Processamento de Alertas
  (alerta) => {
    processarAlertaRecebido(alerta)
  }
)

const sensorSelecionado = ref(null)
const tanqueSelecionadoId = ref(null)

// --- AÇÕES DO USUÁRIO ---
function concluirLogin(sessao) {
  mudarModo('AUTOMÁTICO')
  usuarioLogado.value = sessao.usuario
  perfilUsuario.value = sessao.perfil
  pagina.value = 'visao'
  registrarEventoAcionamento({ tipo: 'modo', modo: modo.value, descricao: `Sessão iniciada em modo ${modo.value}` })
}

function navegar(paginaId) {
  if (paginaId === 'configuracoes' && !ehAdministrador.value) return
  pagina.value = paginaId
}

function sair() {
  localStorage.removeItem('usuario_logado')
  localStorage.removeItem('perfil_usuario')
  usuarioLogado.value = null
  perfilUsuario.value = null
  pagina.value = 'visao'
}

/**
 * Altera o modo de operação e envia o comando via MQTT
 */
function mudarModo(novoModo) {
  if (modo.value === novoModo) return
  const modoAnterior = modo.value

  if (modoAnterior === 'AUTOMÁTICO' && ['MANUAL', 'PARADA'].includes(novoModo)) {
    estadosAutomaticos = new Map(equipamentos.value.map((equipamento) => [equipamento.tag, equipamento.ativo]))
  }
  if (novoModo === 'PARADA') {
    equipamentos.value.forEach((equipamento) => { equipamento.ativo = false })
  } else if (novoModo === 'AUTOMÁTICO' && ['MANUAL', 'PARADA'].includes(modoAnterior)) {
    equipamentos.value.forEach((equipamento) => {
      if (estadosAutomaticos.has(equipamento.tag)) equipamento.ativo = estadosAutomaticos.get(equipamento.tag)
    })
  }

  modo.value = novoModo
  ignorarTelemetriaModo.value = 1 // Define delay de 2 telemetrias para o modo

  const comandoMqtt = novoModo === 'AUTOMÁTICO' ? 'AUTOMATICO' : novoModo === 'MANUAL' ? 'MANUAL' : 'EMERGENCIA'
  publicarComando(comandoMqtt)

  registrarEventoAcionamento({ tipo: 'modo', modo: novoModo, descricao: `Modo alterado de ${modoAnterior} para ${novoModo}` })
}

/**
 * Alterna estado de um equipamento manual e publica a tag no MQTT
 */
function equipamentoToggle(equipamento) {
  if (!manual.value) return
  equipamento.ativo = !equipamento.ativo
  equipamento.ignorarTelemetria = 1 // Trava o equipamento específico por 2 leituras

  publicarComando(equipamento.comando)

  registrarEventoAcionamento({
    tipo: 'equipamento',
    equipamento: equipamento.nome,
    identificador: equipamento.tag,
    estado: equipamento.ativo ? 'LIGADA' : 'DESLIGADA',
    descricao: `${equipamento.nome} ${equipamento.ativo ? 'ligada' : 'desligada'} no modo manual`,
  })
}

/**
 * Desativa um alarme ativo e salva um registro permanente no Histórico
 */
function desativarAlarme(alarme) {
  const horaDesativado = new Date().toLocaleTimeString('pt-BR')

  // Remove da lista de ativos
  alarmesAtivos.value = alarmesAtivos.value.filter((a) => (a.id ? a.id !== alarme.id : a.codigo !== alarme.codigo))

  // Adiciona uma nova entrada no histórico sem sobrescrever registros passados
  alarmesHistorico.value.unshift({
    id: `hist-${alarme.codigo ?? '0'}-${Date.now()}`,
    codigo: alarme.codigo,
    title: alarme.title,
    severity: alarme.severity,
    type: alarme.type,
    icon: alarme.icon,
    status: 'Desativado',
    horaEnvio: alarme.horaEnvio || horaDesativado,
    horaDesativado,
    description: `Código #${alarme.codigo} — Recebido às ${alarme.horaEnvio || horaDesativado} | Desativado às ${horaDesativado}`
  })

  if (alarme.codigo !== undefined) {
    publicarComando(`alerta/${alarme.codigo}`)
  }
}

/**
 * Reativa um alarme colocando-o de volta nos ativos sem remover o histórico existente
 */
function reativarAlarme(alarme) {
  const horaReativado = new Date().toLocaleTimeString('pt-BR')

  const jaAtivo = alarmesAtivos.value.some((a) => a.codigo === alarme.codigo)
  if (!jaAtivo) {
    alarmesAtivos.value.unshift({
      id: `ativo-${alarme.codigo}-${Date.now()}`,
      codigo: alarme.codigo,
      title: alarme.title,
      severity: alarme.severity,
      status: 'Ativo',
      description: `Código #${alarme.codigo} — Reativado às ${horaReativado}`,
      badge: 'Reativado',
      type: alarme.type,
      icon: alarme.icon,
      horaEnvio: horaReativado
    })
  }

  filtroAlarmes.value = 'ativos'
}

function abrirDetalhe(medicao, tanque) {
  sensorSelecionado.value = {
    ...medicao,
    tanque: tanque.nome,
    ultimaAtualizacao: hora.value,
    modo: modo.value,
    historico: [medicao.valor]
  }
}

function alternarControlesTanque(tanqueId) {
  tanqueSelecionadoId.value = tanqueSelecionadoId.value === tanqueId ? null : tanqueId
}

// Persistência local de cadastros
function persistirUsuarios() {
  salvarUsuarios(usuarios.value)
}

function adicionarUsuario({ usuario, senha, perfil }) {
  const nome = usuario.trim().toLowerCase()
  if (nome.length < 3) {
    mensagemUsuarios.value = 'O usuário deve ter pelo menos 3 caracteres.'
    return
  }
  if (usuarios.value.some((conta) => conta.usuario === nome)) {
    mensagemUsuarios.value = 'Este usuário já existe.'
    return
  }
  if (senha.length < 6) {
    mensagemUsuarios.value = 'A senha deve ter pelo menos 6 caracteres.'
    return
  }

  usuarios.value.push({ usuario: nome, senha, perfil })
  persistirUsuarios()
  mensagemUsuarios.value = `Usuário ${nome} criado.`
}

function excluirUsuario(conta) {
  if (conta.usuario === usuarioLogado.value) {
    mensagemUsuarios.value = 'Não é possível excluir a própria conta durante a sessão.'
    return
  }
  if (conta.perfil === 'admin' && usuarios.value.filter((u) => u.perfil === 'admin').length <= 1) {
    mensagemUsuarios.value = 'Mantenha pelo menos um administrador no sistema.'
    return
  }
  if (!window.confirm(`Excluir o usuário ${conta.usuario}?`)) return

  usuarios.value = usuarios.value.filter((u) => u.usuario !== conta.usuario)
  persistirUsuarios()
  mensagemUsuarios.value = `Usuário ${conta.usuario} excluído.`
}

function abrirTrocaSenha(conta) {
  usuarioSenhaSelecionado.value = usuarioSenhaSelecionado.value === conta.usuario ? '' : conta.usuario
  mensagemUsuarios.value = ''
}

function trocarSenha(conta, novaSenha) {
  if (novaSenha.length < 6) {
    mensagemUsuarios.value = 'A nova senha deve ter pelo menos 6 caracteres.'
    return
  }

  conta.senha = novaSenha
  persistirUsuarios()
  usuarioSenhaSelecionado.value = ''
  mensagemUsuarios.value = `Senha de ${conta.usuario} atualizada.`
}

let clock
onMounted(() => {
  clock = window.setInterval(() => { agora.value = new Date() }, 1000)
  if (usuarioLogado.value) registrarEventoAcionamento({ tipo: 'modo', modo: modo.value, descricao: `Sessão retomada em modo ${modo.value}` })
})

onBeforeUnmount(() => {
  window.clearInterval(clock)
})
</script>

<template>
  <!-- Formulário de Login (Caso não haja sessão ativa) -->
  <LoginForm v-if="!usuarioLogado" @login="concluirLogin" />

  <!-- Aplicação Principal -->
  <div v-else class="scada-app" :class="{ 'light-theme': !temaEscuro }">
    <BarraLateral :usuario-logado="usuarioLogado" :eh-administrador="ehAdministrador" :pagina="pagina"
      :paginas-visiveis="paginasComBadge" @navegar="navegar" @sair="sair" />

    <main class="main-area">
      <CabecalhoPrincipal :pagina="pagina" :paginas="paginas" :ws-status="mqttStatus" :hora="hora" :data="data"
        :tema-escuro="temaEscuro" @toggle-tema="temaEscuro = !temaEscuro" />

      <!-- Tela 1: Visão Geral e Controle por Tanque -->
      <section v-if="pagina === 'visao'" class="page-content">
        <FaixaStatus :hora="hora" :modo="modo" :qtd-alarmes-ativos="alarmesAtivos.length"
          @ver-alarmes="pagina = 'alarmes'" :etapa-atual="etapaAtual" />

        <div class="section-heading">
          <div><span class="section-kicker">MONITORAMENTO EM TEMPO REAL</span>
            <h2>Monitoramento por tanque</h2>
          </div>
          <span class="update-label">● Atualização automática</span>
        </div>

        <PainelStatusTanques :status-tanques="statusTanques" @abrir-detalhe="abrirDetalhe" />

        <PainelEquipamentos :modo="modo" :manual="manual" :ehVisitante="ehVisitante" :tanques-painel="tanquesPainel"
          :tanque-selecionado-id="tanqueSelecionadoId" :equipamentos="equipamentos" :etapa-atual="etapaAtual"
          @mudar-modo="mudarModo" @alternar-tanque="alternarControlesTanque" @abrir-detalhe="abrirDetalhe"
          @equipamento-toggle="equipamentoToggle" />

        <ModalMetrica :sensor-selecionado="sensorSelecionado" @fechar="sensorSelecionado = null" />
      </section>

      <!-- Tela 2: Histórico e Tendências Graficas -->
      <section v-else-if="pagina === 'historico'" class="page-content inner-page">
        <div class="comparison-heading">
          <div><span class="section-kicker">ANÁLISE OPERACIONAL</span>
            <h2>Histórico e tendências</h2>
            <p>Compare a evolução das variáveis entre os tanques.</p>
          </div>
          <span class="history-source" :class="origemHistorico">● {{ descricaoOrigemHistorico }}</span>
        </div>

        <div class="comparison-toolbar">
          <div class="period-control" role="group" aria-label="Período do histórico">
            <button v-for="horas in [1, 6, 12, 24]" :key="horas" type="button" :class="{ selected: periodo === horas }"
              :aria-pressed="periodo === horas" @click="periodo = horas">{{ horas }}h</button>
          </div>
          <details class="chart-options">
            <summary>Opções do gráfico</summary>
            <div class="chart-option-list">
              <label><input v-model="marcadoresVisiveis" type="checkbox"> Realçar pontos</label>
              <label><input v-model="linhasSuaves" type="checkbox"> Suavizar linhas</label>
            </div>
          </details>
        </div>

        <div class="comparison-grid">
          <GraficoComparativo v-for="grafico in graficosComparativos" :key="grafico.id" :titulo="grafico.titulo"
            :unidade="grafico.unidade" :labels="grafico.labels" :datasets="grafico.datasets"
            :valores-atuais="grafico.valoresAtuais" :tema-escuro="temaEscuro" :marcadores-visiveis="marcadoresVisiveis"
            :linhas-suaves="linhasSuaves">

          </GraficoComparativo>
        </div>

        <HistoricoAcionamentos :historico-acionamentos-filtrado="historicoAcionamentosFiltrado"
          :filtro-acionamentos="filtroAcionamentos" @atualizar-filtro="(f) => filtroAcionamentos = f" />

        <p v-if="notificacaoHistorico" class="history-notification" role="status">{{ notificacaoHistorico }}</p>
      </section>

      <!-- Tela 3: Painel de Alarmes -->
      <section v-else-if="pagina === 'alarmes'" class="page-content alarm-page">
        <PainelAlarmes :alarmes-ativos="alarmesAtivos" :alarmes-historico="alarmesHistorico"
          :alarmes-resumo="alarmesResumo" :filtro-alarmes="filtroAlarmes" @desativar-alarme="desativarAlarme"
          @reativar-alarme="reativarAlarme" @atualizar-filtro="(f) => filtroAlarmes = f" />
      </section>

      <!-- Tela 4: Gestão de Usuários e Sistema -->
      <section v-else-if="pagina === 'configuracoes' && ehAdministrador" class="page-content inner-page">
        <div class="page-title-row">
          <div><span class="section-kicker">ADMINISTRAÇÃO</span>
            <h2>Configurações do sistema</h2>
            <p>Gerencie contas e parâmetros da estação.</p>
          </div>
        </div>

        <GestaoUsuarios :usuarios="usuarios" :usuario-logado="usuarioLogado" :mensagem-usuarios="mensagemUsuarios"
          :usuario-senha-selecionado="usuarioSenhaSelecionado" @adicionar-usuario="adicionarUsuario"
          @excluir-usuario="excluirUsuario" @abrir-troca-senha="abrirTrocaSenha" @trocar-senha="trocarSenha" />
      </section>
    </main>
  </div>
</template>

<style scoped>
.scada-app {
  --bg: #071623;
  --side: #081d2c;
  --panel: #0b2234;
  --line: #183b56;
  --text: #ecf7ff;
  --muted: #8ca8bb;
  --cyan: #16b9f4;
  --green: #19e69a;
  --amber: #f5b544;
  --red: #ff5361;
  min-height: 100vh;
  background: radial-gradient(circle at 75% -15%, #123651, transparent 31%), var(--bg);
  color: var(--text);
}

.main-area {
  min-width: 0;
}

.update-label,
.flow-legend,
.manual-hint,
.lock-label {
  color: var(--muted);
  font-size: 10px;
}

.comparison-heading {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 18px;
  margin-bottom: 18px;
}

.comparison-heading h2 {
  margin-top: 5px;
  font-size: 27px;
}

.comparison-heading p {
  margin-top: 5px;
  color: var(--muted);
  font-size: 12px;
}

.history-source {
  flex: 0 0 auto;
  color: var(--muted);
  font-size: 11px;
}

.history-source.websocket {
  color: var(--green);
}

.history-source.local {
  color: var(--cyan);
}

.demo-notice {
  margin-bottom: 14px;
  padding: 10px 12px;
  border: 1px solid rgba(245, 181, 68, .28);
  border-radius: 6px;
  background: rgba(245, 181, 68, .07);
  color: #e9c77f;
  font-size: 11px;
}

.comparison-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
  margin-bottom: 14px;
}

.period-control {
  display: inline-flex;
  gap: 3px;
  padding: 3px;
  border: 1px solid var(--line);
  border-radius: 7px;
  background: var(--side);
}

.period-control button {
  min-width: 43px;
  padding: 7px 10px;
  border: 0;
  border-radius: 4px;
  background: transparent;
  color: var(--muted);
  font-size: 11px;
}

.period-control button.selected {
  background: #16b9f426;
  color: var(--text);
}

.chart-options {
  position: relative;
  z-index: 2;
  color: var(--text);
}

.chart-options summary {
  padding: 8px 10px;
  border: 1px solid var(--line);
  border-radius: 6px;
  color: var(--muted);
  cursor: pointer;
  font-size: 11px;
}

.chart-option-list {
  position: absolute;
  top: calc(100% + 6px);
  right: 0;
  display: grid;
  min-width: 180px;
  gap: 11px;
  padding: 12px;
  border: 1px solid var(--line);
  border-radius: 6px;
  background: var(--panel);
  box-shadow: 0 8px 22px rgba(0, 0, 0, .24);
}

.chart-option-list label {
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--text);
  font-size: 11px;
  white-space: nowrap;
}

.comparison-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  align-items: start;
  gap: 14px;
}

.share-chart-button {
  padding: 6px 9px;
  border: 1px solid var(--line);
  border-radius: 5px;
  background: transparent;
  color: var(--text);
  font-size: 10px;
}

.history-notification {
  position: fixed;
  right: 20px;
  bottom: 20px;
  z-index: 110;
  padding: 11px 14px;
  border: 1px solid var(--line);
  border-radius: 6px;
  background: var(--panel);
  color: var(--text);
  font-size: 12px;
}


/* ==========================================================================
   Tema claro
   ========================================================================== */
.scada-app.light-theme {
  --bg: #eef3f6;
  --side: #f8fafb;
  --panel: #ffffff;
  --line: #cfdae2;
  --text: #163044;
  --muted: #5e7483;
  --cyan: #087da5;
  --green: #087a50;
  --amber: #9a5c00;
  --red: #c53649;
  background: radial-gradient(circle at 75% -15%, #dcecf4, transparent 31%), var(--bg);
}


/* ==========================================================================
   Responsividade
   ========================================================================== */

@media (max-width: 900px) {
  .comparison-grid {
    grid-template-columns: 1fr;
  }
}
</style>