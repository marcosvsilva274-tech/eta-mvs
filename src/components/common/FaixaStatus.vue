<script setup>
defineProps({
  hora: { type: String, required: true },
  modo: { type: String, required: true },
  qtdAlarmesAtivos: { type: Number, required: true }
})

defineEmits(['ver-alarmes'])
</script>

<template>
  <div 
    class="status-strip" 
    :class="{
      'modo-auto': modo === 'AUTOMÁTICO',
      'modo-manual': modo === 'MANUAL',
      'modo-parada': modo === 'PARADA'
    }"
  >
    <div>
      <span class="status-dot"></span>
      <strong>Sistema operando normalmente</strong>
      <small>Última sincronização {{ hora }}</small>
    </div>
    <div class="strip-metric">
      <span>Modo atual</span>
      <strong>{{ modo }}</strong>
    </div>
    <div class="strip-metric">
      <span>Alarmes ativos</span>
      <strong class="danger">{{ qtdAlarmesAtivos }}</strong>
    </div>
    <button class="outline-button" @click="$emit('ver-alarmes')">Ver alarmes →</button>
  </div>
</template>