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
  <div class="status-strip" :class="{
    'modo-auto': modo === 'AUTOMÁTICO',
    'modo-manual': modo === 'MANUAL',
    'modo-parada': modo === 'PARADA'
  }">
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

<style scoped>
.status-strip {
  display: flex;
  align-items: center;
  gap: 25px;
  padding: 14px 18px;
  border: 1px solid var(--line);
  background: #19e69a0f;
  border-radius: 8px;
}

.status-strip.modo-manual {
  background: #fce3a126;
  border: 1px solid #5a5036;
}

.status-strip.modo-manual strong {
  color: #fce3a1;
}

.status-strip.modo-manual>.outline-button {
  border: 1px solid #5a5036;
}

.status-strip.modo-manual>.strip-metric {
  border-left: 1px solid #5a5036;
}

.status-strip.modo-parada {
  background: #ff879026;
  border: 1px solid #5f3639;
}

.status-strip.modo-parada strong {
  color: #ff8790;
}

.status-strip.modo-parada>.outline-button {
  border: 1px solid #5f3639;
}

.status-strip.modo-parada>.strip-metric {
  border-left: 1px solid #5f3639;
}

.status-strip>div:first-child {
  display: flex;
  align-items: center;
  gap: 9px;
  flex: 1;
}

.status-strip strong {
  display: block;
  color: var(--green);
  font-size: 13px;
}

.status-strip small {
  display: block;
  color: var(--muted);
  font-size: 10px;
}

.strip-metric {
  padding-left: 20px;
  border-left: 1px solid var(--line);
}

.strip-metric span {
  display: block;
  color: var(--muted);
  font-size: 10px;
}

.outline-button {
  padding: 8px 14px;
  border: 1px solid var(--line);
  border-radius: 5px;
  background: transparent;
  color: var(--text);
  font-size: 12px;
  transition: background-color 0.18s ease;
}

.outline-button:hover {
  background: rgba(255, 255, 255, 0.05);
}

.stage-label {
  display: flex;
  align-items: center;
  gap: 7px;
  color: var(--cyan);
}

.stage-pulse-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background-color: var(--cyan);
  box-shadow: 0 0 8px var(--cyan);
  animation: stage-dot-pulse 1.2s ease-in-out infinite alternate;
}

@keyframes stage-dot-pulse {
  0% {
    opacity: 0.4;
    transform: scale(0.8);
  }

  100% {
    opacity: 1;
    transform: scale(1.2);
  }
}

/* ==========================================================================
   Tema claro
   ========================================================================== */
.light-theme .status-strip {
  border-color: #b9ddc8;
  background: #e8f5ed;
}

.light-theme .status-strip.modo-manual {
  background: #fce3a126;
  border: 1px solid #c2a350;
}

.light-theme .status-strip.modo-manual strong {
  color: #9a5c00;
}

.light-theme .status-strip.modo-manual>.outline-button {
  border: 1px solid #c2a350;
}

.light-theme .status-strip.modo-manual>.strip-metric {
  border-left: 1px solid #c2a350;
}

.light-theme .status-strip.modo-parada {
  background: #ff879026;
  border: 1px solid #c99ca3;
}

.light-theme .status-strip.modo-parada strong {
  color: #a82035;
}

.light-theme .status-strip.modo-parada>.outline-button {
  border: 1px solid #c99ca3;
}

.light-theme .status-strip.modo-parada>.strip-metric {
  border-left: 1px solid #c99ca3;
}

/* ==========================================================================
   Responsividade
   ========================================================================== */
@media (max-width: 760px) {
  .status-strip {
    flex-wrap: wrap;
    gap: 12px;
    padding: 12px 14px;
  }

  .status-strip>div:first-child {
    flex-basis: 100%;
  }

  .strip-metric {
    padding-left: 0;
    border-left: 0;
  }

}
</style>