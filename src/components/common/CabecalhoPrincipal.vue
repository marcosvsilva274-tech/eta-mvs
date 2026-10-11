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
