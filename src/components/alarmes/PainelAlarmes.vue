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
    <!-- <div class="alarm-counter-box">
      <strong>{{ alarmesAtivos.length }}</strong>
      <span>Ativos</span>
    </div> -->
  </div>

  <div class="alarm-summary-grid">
    <div v-for="item in alarmesResumo" :key="item.label" class="alarm-summary-card" :class="item.tone">
      <span>{{ item.label }}</span>
      <strong>{{ item.value }}</strong>
    </div>
  </div>

  <div class="alarm-tabs" role="tablist" aria-label="Categorias de alarmes">
    <button type="button" class="tab-button" :class="{ active: filtroAlarmes === 'ativos' }"
      @click="$emit('atualizar-filtro', 'ativos')">
      Ativos ({{ alarmesAtivos.length }})
    </button>
    <button type="button" class="tab-button" :class="{ active: filtroAlarmes === 'historico' }"
      @click="$emit('atualizar-filtro', 'historico')">
      Histórico ({{ alarmesHistorico.length }})
    </button>
  </div>

  <div v-if="filtroAlarmes === 'ativos'" class="alarm-list">
    <article v-for="alarme in alarmesAtivos" :key="alarme.id || alarme.title" class="alarm-item" :class="alarme.type">
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
    <article v-for="alarme in alarmesHistorico" :key="alarme.id || alarme.title" class="alarm-item history-item"
      :class="alarme.type">
      <div class="alarm-icon" :class="alarme.type">{{ alarme.icon }}</div>
      <div class="alarm-body">
        <div class="alarm-line">
          <div class="alarm-text">
            <strong>{{ alarme.title }}</strong>
          </div>
          <!-- <button type="button" class="ack-button secondary" @click="$emit('reativar-alarme', alarme)">Reativar</button> -->
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

<style scoped>
.alarm-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 18px;
  margin-bottom: 20px;
}

.alarm-header h2 {
  font-size: clamp(2.1rem, 2.4vw, 3.2rem);
  line-height: 1.1;
  letter-spacing: -0.05em;
}

.alarm-header p {
  margin-top: 6px;
  color: rgba(196, 223, 239, 0.78);
  font-size: 1rem;
}

.alarm-summary-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 14px;
  margin-bottom: 18px;
}

.alarm-summary-card {
  display: flex;
  flex-direction: column;
  justify-content: center;
  min-height: 100px;
  padding: 12px 14px;
  border-radius: 12px;
  border: 1px solid rgba(111, 167, 210, 0.2);
  background: rgba(28, 49, 62, 0.9);
  color: #edf8ff;
}

.alarm-summary-card span {
  color: rgba(206, 228, 241, 0.78);
  font-size: 0.9rem;
}

.alarm-summary-card strong {
  margin-top: 8px;
  font-size: clamp(2.5rem, 2.5vw, 3.2rem);
  line-height: 1;
}

.alarm-summary-card.normal {
  background: rgba(47, 79, 104, 0.9);
}

.alarm-summary-card.warning {
  background: rgba(97, 73, 34, 0.88);
}

.alarm-summary-card.danger {
  background: rgba(95, 53, 56, 0.88);
}

.alarm-tabs {
  display: flex;
  gap: 10px;
  margin-bottom: 16px;
}

.tab-button {
  padding: 10px 14px;
  border: 1px solid rgba(111, 167, 210, 0.2);
  border-radius: 10px;
  background: rgba(20, 42, 54, 0.82);
  color: rgba(211, 235, 247, 0.75);
  font-size: 0.9rem;
  font-weight: 700;
}

.tab-button.active {
  background: rgba(24, 88, 112, 0.9);
  border-color: rgba(80, 190, 255, 0.45);
  color: #f3fbff;
}

.alarm-list {
  display: grid;
  gap: 0;
  border-top: 1px solid rgba(107, 157, 188, 0.3);
}

.alarm-item {
  display: flex;
  align-items: flex-start;
  gap: 16px;
  padding: 18px 0;
  border-bottom: 1px solid rgba(107, 157, 188, 0.3);
}

.alarm-item p {
  margin-top: 4px;
  color: rgba(190, 214, 228, 0.86);
  font-size: 0.95rem;
  line-height: 1.5;
}

.alarm-icon {
  display: grid;
  place-items: center;
  width: 30px;
  height: 30px;
  margin-top: 4px;
  padding-top: 2px;
  border-radius: 50%;
  background: rgba(255, 185, 92, 0.12);
  color: #eea94f;
  font-size: 1.2rem;
  flex-shrink: 0;
}

.alarm-icon.critical {
  background: rgba(255, 108, 122, 0.12);
  color: #ff6c7a;
}

.alarm-icon.info {
  background: rgba(108, 161, 255, 0.12);
  color: #7ca6ff;
}

.alarm-body {
  flex: 1;
  min-width: 0;
}

.alarm-line {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
}

.alarm-text {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

.alarm-text strong {
  font-size: clamp(1.2rem, 1.3vw, 1.8rem);
  line-height: 1.3;
}

/* .alarm-counter-box {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-width: 104px;
  min-height: 96px;
  padding: 12px 14px;
  border-radius: 18px;
  background: rgba(24, 38, 48, 0.8);
  border: 1px solid rgba(92, 152, 188, 0.28);
} */

/* .alarm-counter-box strong {
  font-size: clamp(2.4rem, 2.2vw, 3rem);
  line-height: 1;
  color: #f3fbff;
} */

/* .alarm-counter-box span {
  margin-top: 6px;
  color: rgba(196, 223, 239, 0.8);
  font-size: 0.9rem;
} */

.alarm-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 56px;
  padding: 6px 10px;
  border-radius: 999px;
  background: rgba(105, 205, 255, 0.14);
  border: 1px solid rgba(104, 186, 255, 0.22);
  color: rgba(211, 239, 255, 0.95);
  font-size: 0.78rem;
  font-weight: 700;
}

.ack-button {
  padding: 8px 12px;
  border: 1px solid rgba(112, 176, 216, 0.35);
  border-radius: 10px;
  background: rgba(28, 44, 57, 0.9);
  color: #edf7ff;
  font-size: 0.82rem;
  font-weight: 700;
}

.ack-button.secondary {
  border-color: rgba(143, 196, 255, 0.34);
  background: rgba(18, 45, 62, 0.9);
}

.alarm-meta {
  margin-top: 4px;
  color: rgba(216, 236, 247, 0.88);
  font-size: 0.88rem;
}

.history-item {
  opacity: 0.68;
}

.empty-history {
  padding: 20px 0 10px;
  color: rgba(204, 226, 239, 0.74);
  font-size: 0.95rem;
}

/* ==========================================================================
   Tema claro
   ========================================================================== */
.light-theme .alarm-header p {
  color: var(--muted);
}

.light-theme .alarm-summary-card {
  border-color: #d8e2e8;
  background: #f0f5f8;
  color: var(--text);
}

.light-theme .alarm-summary-card span {
  color: #526b7a;
}

.light-theme .alarm-summary-card.normal {
  background: #eaf2f6;
}

.light-theme .alarm-summary-card.warning {
  border-color: #ead5a8;
  background: #fff6df;
  color: #704b08;
}

.light-theme .alarm-summary-card.warning span {
  color: #765515;
}

.light-theme .alarm-summary-card.danger {
  border-color: #ebc4c9;
  background: #fff0f1;
  color: #8c2433;
}

.light-theme .alarm-summary-card.danger span {
  color: #8c3b47;
}

.light-theme .tab-button {
  border-color: #d3e0e7;
  background: #f3f7f9;
  color: #536b7a;
}

.light-theme .tab-button.active {
  border-color: #91c4d8;
  background: #e5f3f8;
  color: #075d80;
}

.light-theme .alarm-list {
  border-top-color: #dce5ea;
}

.light-theme .alarm-item {
  border-bottom-color: #dce5ea;
}

.light-theme .alarm-item p,
.light-theme .empty-history {
  color: #5c7180;
}

.light-theme .alarm-badge {
  border-color: #b9dbe8;
  background: #e8f5f9;
  color: #155c78;
}

.light-theme .ack-button {
  border-color: #c6d6df;
  background: #f4f8fa;
  color: #29485b;
}

.light-theme .ack-button.secondary {
  border-color: #b9d6e2;
  background: #eaf4f8;
  color: #155b78;
}

.light-theme .alarm-meta {
  color: #536b7a;
}

.light-theme .history-item {
  opacity: 0.78;
}

/* .light-theme .alarm-counter-box {
  border-color: #d5e0e6;
  background: #f2f6f8;
} */

/* .light-theme .alarm-counter-box strong {
  color: var(--text);
} */

/* .light-theme .alarm-counter-box span {
  color: var(--muted);
} */

/* ==========================================================================
   Responsividade
   ========================================================================== */
@media (max-width: 760px) {

  .alarm-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }

  .alarm-summary-grid {
    grid-template-columns: 1fr;
    gap: 10px;
  }

}
</style>