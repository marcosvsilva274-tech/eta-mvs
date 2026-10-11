import { ref, computed } from 'vue'

const tanquesComparacao = [
  { id: 'agua-bruta', nome: 'Água bruta', cor: '#16b9f4' },
  { id: 'tanque-ativos', nome: 'Tanque de ativos', cor: '#19e69a' },
  { id: 'agua-tratada', nome: 'Água tratada', cor: '#f5b544' },
  { id: 'efluentes', nome: 'Efluentes', cor: '#ff7185' },
]

const variaveisComparacao = [
  { id: 'turbidez', titulo: 'Comparativo de turbidez', unidade: 'NTU', tanqueIds: ['tanque-ativos', 'agua-tratada'] },
  { id: 'ph', titulo: 'Comparativo de pH', unidade: 'pH', tanqueIds: ['tanque-ativos', 'agua-tratada'] },
  { id: 'temperatura', titulo: 'Comparativo de temperatura', unidade: '°C', tanqueIds: ['agua-bruta', 'tanque-ativos', 'agua-tratada'] },
]

const MAPA_CHAVES_TANQUES = {
  tanque_armazenamento: 'agua-bruta',
  tanque_ativos: 'tanque-ativos',
  tanque_efluentes: 'efluentes',
  tanque_final: 'agua-tratada',
}

export function useTelemetria() {
  const sensores = ref([
    { id: 'ph', nome: 'pH', valor: 7.12, unidade: 'pH', classe: 'cyan', icone: '🧪' },
    { id: 'temperatura', nome: 'Temperatura', valor: 24.3, unidade: '°C', classe: 'green', icone: '🌡️' },
    { id: 'turbidez', nome: 'Turbidez', valor: 0.82, unidade: 'NTU', classe: 'amber', icone: '💧' },
  ])

  const historicoComparativo = ref([])
  const origemHistorico = ref('websocket')
  const periodo = ref(24)
  const marcadoresVisiveis = ref(false)
  const linhasSuaves = ref(true)
  const notificacaoHistorico = ref('')
  let notificacaoTimer = null

  const descricaoOrigemHistorico = computed(() => {
    if (origemHistorico.value === 'websocket') return 'Recebendo dados por WebSocket'
    if (origemHistorico.value === 'local') return 'Histórico salvo neste navegador'
    return 'Valores demonstrativos'
  })

  function normalizarContato(valor) {
    if (valor === true) return 'LIGADO'
    if (valor === false) return 'DESLIGADO'
    return '—'
  }

  function valorSensorPorTanque(tanqueId, sensorId, valorPadrao) {
    for (const registro of [...historicoComparativo.value].reverse()) {
      const leitura = registro.sensores?.[tanqueId]?.[sensorId]
      if (leitura !== null && leitura !== undefined && leitura !== '') return leitura
    }
    return valorPadrao ?? '—'
  }

  function percentualNivelAtual(tanqueId) {
    for (const registro of [...historicoComparativo.value].reverse()) {
      const leituras = registro.sensores?.[tanqueId]
      if (!leituras) continue
      if (leituras.nivelAlto === 'LIGADO') return 90
      if (leituras.nivelBaixo === 'LIGADO') return 10
      return 50
    }
    return 50
  }

  const sensoresPorTanque = {
    'agua-bruta': ['temperatura', 'nivelAlto', 'nivelBaixo'],
    'tanque-ativos': ['turbidez', 'ph', 'temperatura', 'nivelAlto', 'nivelBaixo'],
    'agua-tratada': ['turbidez', 'ph', 'temperatura', 'nivelAlto', 'nivelBaixo'],
    efluentes: ['nivelAlto', 'nivelBaixo'],
  }

  const statusTanques = computed(() => tanquesComparacao.map((tanque) => ({
    id: tanque.id,
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

  const tanquesPainel = computed(() => statusTanques.value.map((tanque) => ({
    ...tanque,
    percentualNivel: percentualNivelAtual(tanque.id),
    sensoresNivel: tanque.medicoes.filter((medicao) => medicao.chave.startsWith('nivel')),
  })))

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
          data: registros.map((registro) => {
            const valor = registro?.sensores?.[tanqueId]?.[variavel.id]
            return Number.isFinite(Number(valor)) ? Number(valor) : null
          }),
          borderColor: tanque.cor,
          backgroundColor: tanque.cor,
          spanGaps: false,
        }
      }),
      valoresAtuais: variavel.tanqueIds.map((tanqueId) => {
        const tanque = tanquesComparacao.find((item) => item.id === tanqueId)
        const registro = [...historicoComparativo.value].reverse().find((item) => Number.isFinite(Number(item.sensores?.[tanqueId]?.[variavel.id])))
        const valor = registro ? Number(registro.sensores[tanqueId][variavel.id]) : null
        return { ...tanque, valor }
      }),
    }))
  })

  function atualizarHistoricoComparativo(pacote) {
    if (!pacote || typeof pacote !== 'object') return false

    const timestamp = pacote.data_hora ? new Date(pacote.data_hora).getTime() : Date.now()
    const leiturasTanques = {}

    for (const [chaveJson, tanqueId] of Object.entries(MAPA_CHAVES_TANQUES)) {
      const dadosTanque = pacote[chaveJson]
      if (!dadosTanque) continue

      leiturasTanques[tanqueId] = {
        temperatura: dadosTanque.temperatura ?? null,
        turbidez: dadosTanque.turbidez ?? null,
        ph: dadosTanque.ph ?? null,
        nivelAlto: normalizarContato(dadosTanque.nivel_alto),
        nivelBaixo: normalizarContato(dadosTanque.nivel_baixo)
      }
    }

    const base = historicoComparativo.value
    historicoComparativo.value = [...base, { timestamp, sensores: leiturasTanques }]
      .sort((a, b) => a.timestamp - b.timestamp)
      .slice(-2000)

    origemHistorico.value = 'websocket'
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

  return {
    sensores,
    historicoComparativo,
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
  }
}