<script setup>
import { computed } from 'vue'
import { formatarEtapa } from '../../constantes/etapasProcesso.js'

const props = defineProps({
  hora: { type: String, required: true },
  modo: { type: String, required: true },
  qtdAlarmesAtivos: { type: Number, required: true },
  etapaAtual: { type: String, default: 'Inicial' } // Chave recebida do MQTT (ex: 'DosandoCoagulante')
})

defineEmits(['ver-alarmes'])

const etapaInfo = computed(() => formatarEtapa(props.etapaAtual))
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

    <!-- Métrica exibida quando em modo AUTOMÁTICO -->
    <div v-if="modo === 'AUTOMÁTICO'" class="strip-metric">
      <span>Etapa do Processo ({{ etapaInfo.numero }}/{{ etapaInfo.total }})</span>
      <strong class="stage-label">
        <i class="stage-pulse-dot"></i> {{ etapaInfo.nome }}
      </strong>
    </div>

    <div class="strip-metric">
      <span>Alarmes ativos</span>
      <strong class="danger">{{ qtdAlarmesAtivos }}</strong>
    </div>

    <button class="outline-button" @click="$emit('ver-alarmes')">Ver alarmes →</button>
  </div>
</template>