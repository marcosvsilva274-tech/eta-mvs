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
            <span class="actuation-event-kind">{{ evento.tipo === 'modo' ? 'Modo de operação' : evento.identificador }}</span>
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