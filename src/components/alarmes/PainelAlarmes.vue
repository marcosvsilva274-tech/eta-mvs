<script setup>
defineProps({
  alarmesAtivos: { type: Array, required: true },
  alarmesHistorico: { type: Array, required: true },
  alarmesResumo: { type: Array, required: true },
  filtroAlarmes: { type: String, required: true }
})

defineEmits(['desativar-alarme', 'reativar-alarme', 'atualizar-filtro'])
</script>

<template>
  <div class="alarm-header">
    <div>
      <h2>Alarmes e eventos</h2>
      <p>Monitoramento da ETA</p>
    </div>
    <div class="alarm-counter-box">
      <strong>{{ alarmesAtivos.length }}</strong>
      <span>Ativos</span>
    </div>
  </div>

  <div class="alarm-summary-grid">
    <div v-for="item in alarmesResumo" :key="item.label" class="alarm-summary-card" :class="item.tone">
      <span>{{ item.label }}</span>
      <strong>{{ item.value }}</strong>
    </div>
  </div>

  <div class="alarm-tabs" role="tablist" aria-label="Categorias de alarmes">
    <button type="button" class="tab-button" :class="{ active: filtroAlarmes === 'ativos' }" @click="$emit('atualizar-filtro', 'ativos')">
      Ativos ({{ alarmesAtivos.length }})
    </button>
    <button type="button" class="tab-button" :class="{ active: filtroAlarmes === 'historico' }" @click="$emit('atualizar-filtro', 'historico')">
      Histórico
    </button>
  </div>

  <div v-if="filtroAlarmes === 'ativos'" class="alarm-list">
    <article v-for="alarme in alarmesAtivos" :key="alarme.title" class="alarm-item" :class="alarme.type">
      <div class="alarm-icon" :class="alarme.type">{{ alarme.icon }}</div>
      <div class="alarm-body">
        <div class="alarm-line">
          <div class="alarm-text">
            <strong>{{ alarme.title }}</strong>
            <span v-if="alarme.badge" class="alarm-badge">{{ alarme.badge }}</span>
          </div>
          <button type="button" class="ack-button" @click="$emit('desativar-alarme', alarme)">Desativar</button>
        </div>
        <div class="alarm-meta">
          <span>{{ alarme.severity }} · {{ alarme.status }}</span>
        </div>
        <p>{{ alarme.description }}</p>
      </div>
    </article>
  </div>

  <div v-else class="alarm-list history-list">
    <article v-for="alarme in alarmesHistorico" :key="alarme.title" class="alarm-item history-item" :class="alarme.type">
      <div class="alarm-icon" :class="alarme.type">{{ alarme.icon }}</div>
      <div class="alarm-body">
        <div class="alarm-line">
          <div class="alarm-text">
            <strong>{{ alarme.title }}</strong>
          </div>
          <button type="button" class="ack-button secondary" @click="$emit('reativar-alarme', alarme)">Reativar</button>
        </div>
        <div class="alarm-meta">
          <span>{{ alarme.severity }} · {{ alarme.status }}</span>
        </div>
        <p>{{ alarme.description }}</p>
      </div>
    </article>
    <div v-if="!alarmesHistorico.length" class="empty-history">Nenhum evento no histórico.</div>
  </div>
</template>