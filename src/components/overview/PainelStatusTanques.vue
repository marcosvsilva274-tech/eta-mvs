<script setup>
import TagSensorTanque from './TagSensorTanque.vue'

defineProps({
  statusTanques: { type: Array, required: true }
})

defineEmits(['abrir-detalhe'])
</script>

<template>
  <div class="tank-status-panel">
    <article v-for="tanque in statusTanques" :key="tanque.nome" class="tank-status-item">
      <strong>{{ tanque.nome }}<span>● NORMAL</span></strong>
      <div class="tank-sensor-tags">
        <TagSensorTanque
          v-for="medicao in tanque.medicoes"
          :key="medicao.chave"
          :medicao="medicao"
          :tanque="tanque"
          @abrir-detalhe="(m, t) => $emit('abrir-detalhe', m, t)"
        />
      </div>
    </article>
  </div>
</template>