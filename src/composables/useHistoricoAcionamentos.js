import { ref, computed } from 'vue'

const CHAVE_HISTORICO_ACIONAMENTOS = 'supervisorio-historico-acionamentos-v1'

function carregarHistoricoAcionamentos() {
  try {
    const salvo = JSON.parse(localStorage.getItem(CHAVE_HISTORICO_ACIONAMENTOS))
    return Array.isArray(salvo) ? salvo : []
  } catch {
    return []
  }
}

export function useHistoricoAcionamentos(getUsuarioAtual) {
  const historicoAcionamentos = ref(carregarHistoricoAcionamentos())
  const filtroAcionamentos = ref('todos')

  const historicoAcionamentosFiltrado = computed(() => {
    if (filtroAcionamentos.value === 'todos') {
      return historicoAcionamentos.value
    }
    return historicoAcionamentos.value.filter((evento) => evento.tipo === filtroAcionamentos.value)
  })

  function registrarEventoAcionamento(evento) {
    const usuario = getUsuarioAtual() || 'Sistema'
    const registro = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      timestamp: Date.now(),
      usuario,
      ...evento,
    }
    historicoAcionamentos.value = [registro, ...historicoAcionamentos.value].slice(0, 500)
    try {
      localStorage.setItem(CHAVE_HISTORICO_ACIONAMENTOS, JSON.stringify(historicoAcionamentos.value))
    } catch {
      historicoAcionamentos.value = historicoAcionamentos.value.slice(0, 100)
    }
  }

  return {
    historicoAcionamentos,
    filtroAcionamentos,
    historicoAcionamentosFiltrado,
    registrarEventoAcionamento
  }
}