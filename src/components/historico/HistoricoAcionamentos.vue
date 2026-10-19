<script setup>
defineProps({
  historicoAcionamentosFiltrado: { type: Array, required: true },
  filtroAcionamentos: { type: String, required: true }
})

defineEmits(['atualizar-filtro'])
</script>

<template>
  <section class="actuation-history" aria-labelledby="actuation-history-title">
    <div class="actuation-history-header">
      <div>
        <span class="section-kicker">RASTREABILIDADE</span>
        <h3 id="actuation-history-title">Histórico de acionamentos</h3>
        <p>Trocas de modo e comandos manuais registrados por usuário.</p>
      </div>
      <span class="actuation-history-count">{{ historicoAcionamentosFiltrado.length }} registros</span>
    </div>
    <div class="actuation-history-filters" role="group" aria-label="Filtrar histórico de acionamentos">
      <button
        v-for="filtro in [{ id: 'todos', nome: 'Todos' }, { id: 'modo', nome: 'Modos' }, { id: 'equipamento', nome: 'Equipamentos' }]"
        :key="filtro.id"
        type="button"
        :class="{ selected: filtroAcionamentos === filtro.id }"
        :aria-pressed="filtroAcionamentos === filtro.id"
        @click="$emit('atualizar-filtro', filtro.id)"
      >
        {{ filtro.nome }}
      </button>
    </div>
    <div v-if="historicoAcionamentosFiltrado.length" class="actuation-history-list">
      <article v-for="evento in historicoAcionamentosFiltrado" :key="evento.id" class="actuation-history-item" :class="evento.tipo">
        <span class="actuation-event-marker" aria-hidden="true"></span>
        <div class="actuation-event-main">
          <div class="actuation-event-heading">
            <strong>{{ evento.tipo === 'modo' ? evento.modo : evento.equipamento }}</strong>
          </div>
          <p>{{ evento.descricao }}</p>
        </div>
        <div class="actuation-event-meta">
          <time :datetime="new Date(evento.timestamp).toISOString()">{{ new Date(evento.timestamp).toLocaleString('pt-BR') }}</time>
          <span>Por <strong>{{ evento.usuario }}</strong></span>
        </div>
      </article>
    </div>
    <p v-else class="actuation-history-empty">Nenhum acionamento registrado neste filtro.</p>
  </section>
</template>

<style scoped>

.actuation-history {
  margin-top: 22px;
  padding: 17px;
  border: 1px solid var(--line);
  border-radius: 7px;
  background: var(--panel);
}

.actuation-history-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 14px;
  margin-bottom: 15px;
}

.actuation-history-filters {
  display: inline-flex;
  gap: 3px;
  margin-bottom: 9px;
  padding: 3px;
  border: 1px solid var(--line);
  border-radius: 6px;
  background: var(--side);
}

.actuation-history-filters button {
  padding: 6px 10px;
  border: 0;
  border-radius: 4px;
  background: transparent;
  color: var(--muted);
  font-size: 10px;
}

.actuation-history-filters button.selected {
  background: rgba(22, 185, 244, .14);
  color: var(--text);
}

.actuation-history-item {
  display: grid;
  grid-template-columns: 10px minmax(0, 1fr) minmax(130px, auto);
  align-items: center;
  gap: 12px;
  padding: 13px 3px;
  border-top: 1px solid var(--line);
}

.actuation-event-marker {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--cyan);
}
.actuation-event-heading span,
.actuation-event-heading strong {
  margin-right: 10px;
}

.actuation-event-main p {
  margin-top: 4px;
  color: var(--muted);
  font-size: 15px;
}

.actuation-event-meta {
  display: grid;
  justify-items: end;
  gap: 4px;
  color: var(--muted);
  font-size: 10px;
  text-align: right;
}
</style>