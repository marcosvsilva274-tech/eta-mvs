<script setup>
import { computed } from 'vue'
import CartaoControleTanque from './CartaoControleTanque.vue'
import CartaoEquipamento from './CartaoEquipamento.vue'
import DiagramaProcesso from './DiagramaProcesso.vue'
import { formatarEtapa } from '../../constantes/etapasProcesso'

const props = defineProps({
  modo: { type: String, required: true },
  manual: { type: Boolean, default: false },
  ehVisitante: { type: Boolean, default: false },
  tanquesPainel: { type: Array, required: true },
  tanqueSelecionadoId: { type: String, default: null },
  equipamentos: { type: Array, required: true },
  etapaAtual: { type: String, default: 'Inicial' }
})
const emit = defineEmits(['mudar-modo', 'alternar-tanque', 'abrir-detalhe', 'equipamento-toggle'])

const equipamentosDoTanque = computed(() => {
  if (!props.tanqueSelecionadoId) return []
  return props.equipamentos.filter((eq) => eq.tanqueId === props.tanqueSelecionadoId)
})

const tanqueAtual = computed(() => {
  return props.tanquesPainel.find((t) => t.id === props.tanqueSelecionadoId)
})

const etapa = computed(() => formatarEtapa(props.etapaAtual))
const porcentagem = computed(() => Math.round((etapa.value.numero / 17) * 100))
</script>

<template>
  <div class="action-panel">

    <div class="action-header">
      <div>
        <span class="section-kicker">ETA · PROCESSO</span>
        <h2>Modos de Operação</h2>
      </div>
      <div class="mode-toggle-group">
        <button type="button" class="mode-toggle" :class="{ active: modo === 'AUTOMÁTICO' }"
          :aria-pressed="modo === 'AUTOMÁTICO'" @click="$emit('mudar-modo', 'AUTOMÁTICO')">
          Automático
        </button>

        <button v-if="!ehVisitante" type="button" class="mode-toggle manual" :class="{ active: modo === 'MANUAL' }"
          :aria-pressed="modo === 'MANUAL'" @click="$emit('mudar-modo', 'MANUAL')">
          Manual
        </button>

        <button type="button" class="mode-toggle stop" :class="{ active: modo === 'PARADA' }"
          :aria-pressed="modo === 'PARADA'" @click="$emit('mudar-modo', 'PARADA')">
          Parada total
        </button>
      </div>
    </div>

    <!-- Barra de progresso da etapa do processo -->
    <!-- <div v-if="modo === 'AUTOMÁTICO'" class="process-progress-panel">
      <div class="progress-info">
        <span>
          <i class="live-dot"></i> ETAPA {{ etapa.numero }} DE {{ etapa.total }}
        </span>
        <strong>{{ etapa.nome }}</strong>
        <span>{{ porcentagem }}% Concluído</span>
      </div>

      <div class="progress-bar-track">
        <div class="progress-bar-fill" :style="{ width: `${porcentagem}%` }"></div>
      </div>
    </div> -->

    <!-- 1. Diagrama de Processo Interativo -->
    <DiagramaProcesso :equipamentos="equipamentos" :eh-visitante="ehVisitante" :tanques-painel="tanquesPainel"
      :manual="manual" @equipamento-toggle="(eq) => $emit('equipamento-toggle', eq)" />

    <div class="equipamentos-painal">
      <div class="equipamentos-header">
        <span class="section-kicker">Equipamentos</span>
        <h2>Monitoramento de Equipamentos</h2>
      </div>
      <!-- 2. Monitoramento Atual (Mantido conforme solicitado) -->
      <div class="equipment-board">
        <div class="tank-control-grid">
          <CartaoControleTanque v-for="tanque in tanquesPainel" :key="tanque.id" :tanque="tanque"
            :selecionado="tanqueSelecionadoId === tanque.id" @alternar-tanque="(id) => $emit('alternar-tanque', id)"
            @abrir-detalhe="(m, t) => $emit('abrir-detalhe', m, t)" />
        </div>
      </div>
    </div>

    <!-- Modal de acionamento do tanque individual -->
    <div v-if="tanqueSelecionadoId" class="metric-modal-overlay" tabindex="-1" @click="$emit('alternar-tanque', null)"
      @keydown.esc="$emit('alternar-tanque', null)">
      <section class="metric-modal tank-actuators-modal" role="dialog" aria-modal="true" @click.stop>
        <button type="button" class="modal-close" aria-label="Fechar" @click="$emit('alternar-tanque', null)">×</button>

        <div class="modal-header">
          <span class="modal-kicker">ACIONAMENTOS DO RESERVATÓRIO</span>
          <h3>{{ tanqueAtual?.nome || 'Tanque' }}</h3>
          <p v-if="!manual && !ehVisitante" class="manual-warning-text">
            ⚠️ Alterne para o modo <strong>MANUAL</strong> para acionar os equipamentos.
          </p>
        </div>

        <div v-if="equipamentosDoTanque.length" class="popup-equipment-grid">
          <CartaoEquipamento v-for="equipamento in equipamentosDoTanque" :key="equipamento.tag"
            :equipamento="equipamento" :manual="manual" :disabled="!manual || ehVisitante"
            @toggle="(eq) => $emit('equipamento-toggle', eq)" />
        </div>

        <p v-else class="empty-actuators-msg">Nenhum atuador configurado para este tanque.</p>
      </section>
    </div>
  </div>
</template>

<style scoped>
.tank-actuators-modal {
  width: min(850px, 95vw);
  max-height: 85vh;
  overflow-y: auto;
}

.manual-warning-text {
  margin-top: 6px;
  color: var(--amber);
  font-size: 0.85rem;
}

.popup-equipment-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 12px;
  margin-top: 18px;
}

.empty-actuators-msg {
  padding: 24px 0;
  color: var(--muted);
  text-align: center;
}

.equipamentos-header {
  align-items: center;
  margin-bottom: 18px;
  padding-bottom: 12px;
  border-bottom: 1px solid rgba(24, 59, 86, 0.8);
}

.equipamentos-header h2 {
  margin-top: 4px;
  color: var(--text);
  font-size: 20px;
}

.action-panel {
  margin-top: 20px;
  padding: 16px;
  border: 1px solid rgba(0, 151, 218, 0.42);
  border-radius: 9px;
  background: rgba(2, 17, 29, 0.74);
}

.action-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  min-height: 52px;
  margin-bottom: 12px;
  padding: 0 4px;
}

.action-header h3 {
  margin-top: 4px;
  color: #c9dcf5;
  font-size: 19px;
}

.mode-toggle-group {
  display: inline-flex;
  gap: 3px;
  padding: 3px;
  border: 1px solid var(--line);
  border-radius: 8px;
  background: var(--side);
}

.equipment-board {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  align-items: stretch;
  gap: 12px;
}

.tank-control-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 12px;
}

/* ==========================================================================
   Tema claro
   ========================================================================== */

.light-theme .action-panel {
  border-color: var(--line);
  background: rgba(255, 255, 255, 0.78);
  box-shadow: 0 4px 18px rgba(29, 69, 93, 0.05);
}


/* ==========================================================================
   Responsividade
   ========================================================================== */
@media (max-width: 1000px) {

  .tank-control-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 760px) {

  .action-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }

  .mode-toggle-group {
    width: 100%;
    justify-content: space-between;
  }

  .equipment-board {
    grid-template-columns: minmax(0, 1fr);
  }

  .tank-control-grid {
    grid-template-columns: 1fr;
  }

}
</style>