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
        <TagSensorTanque v-for="medicao in tanque.medicoes" :key="medicao.chave" :medicao="medicao" :tanque="tanque"
          @abrir-detalhe="(m, t) => $emit('abrir-detalhe', m, t)" />
      </div>
    </article>
  </div>
</template>

<style scoped>
.tank-status-panel {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 18px;
  margin-top: 18px;
}

.tank-status-item {
  min-width: 0;
  min-height: 276px;
  padding: 19px 20px 17px;
  border: 1px solid rgba(108, 165, 201, 0.28);
  border-radius: 11px;
  background: rgba(8, 29, 39, 0.88);
  box-shadow: inset 0 0 0 1px rgba(135, 202, 240, 0.06);
  transition: transform 0.18s ease, border-color 0.18s ease, box-shadow 0.18s ease;
}

.tank-status-item:hover {
  transform: translateY(-2px);
  border-color: rgba(95, 205, 255, 0.5);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.16), inset 0 0 0 1px rgba(135, 202, 240, 0.06);
}

.tank-status-item>strong {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  margin-bottom: 14px;
  padding-bottom: 12px;
  border-bottom: 1px solid rgba(122, 188, 220, 0.14);
  color: var(--text);
  font-size: 15px;
}

.tank-status-item>strong span {
  flex: 0 0 auto;
  color: var(--green);
  font-size: 9px;
  letter-spacing: 0.08em;
}

.tank-sensor-tags {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 9px;
}

/* ==========================================================================
   Tema claro
   ========================================================================== */
.light-theme .tank-status-item {
  border-color: #cbd9e1;
  background: linear-gradient(150deg, #fff, #f7fafc);
  box-shadow: 0 3px 12px rgba(29, 69, 93, 0.06);
}

.light-theme .tank-status-item>strong {
  border-bottom-color: #dbe5eb;
}

/* ==========================================================================
   Responsividade
   ========================================================================== */
@media (max-width: 1100px) {
  .tank-status-panel {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }

}

@media (max-width: 1000px) {
  .tank-status-panel {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

}

@media (max-width: 760px) {
  .tank-status-panel {
    grid-template-columns: 1fr;
    gap: 12px;
  }

  .tank-status-item {
    min-height: 0;
    padding: 15px;
  }

}

@media (max-width: 480px) {
  .tank-sensor-tags {
    grid-template-columns: 1fr;
  }
}
</style>