<script setup>
defineProps({
  sensorSelecionado: { type: Object, default: null }
})

defineEmits(['fechar'])
</script>

<template>
  <div v-if="sensorSelecionado" class="metric-modal-overlay" tabindex="-1" @click="$emit('fechar')"
    @keydown.esc="$emit('fechar')">
    <section class="metric-modal" role="dialog" aria-modal="true" :aria-label="`Detalhes de ${sensorSelecionado.nome}`"
      @click.stop>
      <button type="button" class="modal-close" aria-label="Fechar detalhes" @click="$emit('fechar')">×</button>
      <div class="modal-header">
        <span class="modal-kicker">{{ sensorSelecionado.tanque }} · {{ sensorSelecionado.nome }}</span>
        <h3>{{ sensorSelecionado.valor }}</h3>
      </div>
      <div class="modal-status good">{{ sensorSelecionado.estado }}</div>
      <div class="modal-grid">
        <div class="modal-field"><span>Tanque</span><strong>{{ sensorSelecionado.tanque }}</strong></div>
        <div class="modal-field"><span>Valor atual</span><strong>{{ sensorSelecionado.valor }}</strong></div>
        <div class="modal-field"><span>Estado</span><strong>{{ sensorSelecionado.estado }}</strong></div>
        <div class="modal-field"><span>Última atualização</span><strong>{{ sensorSelecionado.ultimaAtualizacao
        }}</strong></div>
        <div class="modal-field"><span>Histórico recente</span><strong>{{ sensorSelecionado.historico.join(' · ')
        }}</strong></div>
        <div class="modal-field"><span>Modo</span><strong>{{ sensorSelecionado.modo }}</strong></div>
      </div>
    </section>
  </div>
</template>

<style scoped>
.modal-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
  margin-top: 18px;
}

.modal-status {
  display: inline-flex;
  align-items: center;
  padding: 6px 10px;
  border-radius: 999px;
  background: rgba(25, 230, 154, 0.12);
  color: var(--green);
  font-size: 10px;
  font-weight: 700;
  text-transform: uppercase;
}

.modal-field {
  min-width: 0;
  padding: 10px 12px;
  border: 1px solid rgba(122, 188, 220, 0.18);
  border-radius: 8px;
  background: rgba(12, 30, 40, 0.7);
}

.modal-field span {
  display: block;
  color: var(--muted);
  font-size: 9px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.modal-field strong {
  display: block;
  margin-top: 5px;
  overflow-wrap: anywhere;
  color: var(--text);
  font-size: 13px;
}


/* ==========================================================================
   Tema claro
   ========================================================================== */

.light-theme .modal-field {
  border-color: #d7e2e8;
  background: #f4f8fa;
}


/* ==========================================================================
Responsividade
========================================================================== */
@media (max-width: 480px) {
  .modal-grid {
    grid-template-columns: 1fr;
  }
}
</style>
