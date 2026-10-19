<script setup>
defineProps({
  pagina: { type: String, required: true },
  paginas: { type: Array, required: true },
  wsStatus: { type: String, required: true },
  hora: { type: String, required: true },
  data: { type: String, required: true },
  temaEscuro: { type: Boolean, default: true }
})

defineEmits(['toggle-tema'])
</script>

<template>
  <header class="topbar">
    <div>
      <span class="breadcrumb">SUPERVISÓRIO / {{paginas.find((item) => item.id === pagina)?.titulo.toUpperCase()
        }}</span>
      <h1>{{pagina === 'visao' ? 'Visão geral da planta' : paginas.find((item) => item.id === pagina)?.titulo}}</h1>
    </div>
    <div class="topbar-actions">
      <div class="communication">
        <span class="live-dot" :class="wsStatus"></span>
        <div>
          <strong>{{ wsStatus === 'online' ? 'ESP32 ONLINE' : 'ESP32 OFFLINE' }}</strong>
          <small>Backend conectado</small>
        </div>
      </div>
      <div class="date-time">
        <strong>{{ hora }}</strong>
        <span>{{ data }} · Quinta-feira</span>
      </div>
      <button class="theme-toggle" @click="$emit('toggle-tema')">
        {{ temaEscuro ? '☀' : '🌖' }}
      </button>
    </div>
  </header>
</template>

<style scoped>
.topbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  min-height: 99px;
  padding: 20px 35px;
  border-bottom: 1px solid var(--line);
}

.topbar h1 {
  margin-top: 5px;
  font-size: 25px;
}

.topbar-actions,
.communication,
.date-time {
  display: flex;
  align-items: center;
}

.topbar-actions {
  gap: 27px;
}

.breadcrumb,
.section-kicker {
  color: var(--muted);
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.14em;
}

.communication {
  gap: 10px;
  padding-right: 22px;
  border-right: 1px solid var(--line);
}

.communication strong {
  display: block;
  color: var(--green);
  font-size: 11px;
}

.date-time {
  flex-direction: column;
  align-items: flex-end;
}

.communication small,
.date-time span {
  display: block;
  color: var(--muted);
  font-size: 10px;
}

.theme-toggle {
  display: grid;
  place-items: center;
  width: 39px;
  height: 39px;
  border: 1px solid var(--line);
  border-radius: 50%;
  background: var(--panel);
  color: var(--amber);
  font-size: 16px;
  transition: transform 0.2s ease;
}

.theme-toggle:hover {
  transform: scale(1.05);
}

/* ==========================================================================
   Responsividade
   ========================================================================== */
@media (max-width: 1100px) {

  .topbar,
  .page-content {
    padding-left: 24px;
    padding-right: 24px;
  }
}

@media (max-width: 760px) {

  /* Topbar empilhada */
  .topbar {
    align-items: flex-start;
    gap: 15px;
    flex-direction: column;
    padding: 16px 20px;
    min-height: auto;
  }

  .topbar-actions {
    width: 100%;
    justify-content: space-between;
    gap: 12px;
  }

  .communication {
    border: 0;
    padding: 0;
  }

  .date-time {
    margin-left: auto;
  }

}
</style>