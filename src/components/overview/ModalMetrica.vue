<script setup>
defineProps({
  sensorSelecionado: { type: Object, default: null }
})

defineEmits(['fechar'])
</script>

<template>
  <div v-if="sensorSelecionado" class="metric-modal-overlay" tabindex="-1" @click="$emit('fechar')" @keydown.esc="$emit('fechar')">
    <section class="metric-modal" role="dialog" aria-modal="true" :aria-label="`Detalhes de ${sensorSelecionado.nome}`" @click.stop>
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
        <div class="modal-field"><span>Última atualização</span><strong>{{ sensorSelecionado.ultimaAtualizacao }}</strong></div>
        <div class="modal-field"><span>Histórico recente</span><strong>{{ sensorSelecionado.historico.join(' · ') }}</strong></div>
        <div class="modal-field"><span>Modo</span><strong>{{ sensorSelecionado.modo }}</strong></div>
      </div>
    </section>
  </div>
</template>

<style scoped>

/* ==========================================================================
   Tema compartilhado com PainelEquipamentos
   ========================================================================== */

</style>