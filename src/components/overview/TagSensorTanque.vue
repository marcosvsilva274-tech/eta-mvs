<script setup>
defineProps({
  medicao: { type: Object, required: true },
  tanque: { type: Object, required: true }
})

defineEmits(['abrir-detalhe'])
</script>

<template>
  <button type="button" class="tank-sensor-tag" :class="medicao.classe" :aria-label="medicao.chave.startsWith('nivel')
    ? `${medicao.nome} do tanque ${tanque.nome}: normal. Abrir detalhes`
    : `${medicao.nome} do tanque ${tanque.nome}: ${medicao.valor}. Abrir detalhes`"
    @click="$emit('abrir-detalhe', medicao, tanque)">
    <span class="tag-icon">{{ medicao.icone }}</span>
    <template v-if="medicao.chave.startsWith('nivel')">
      <span>Nível</span>
      <strong>{{ medicao.chave === 'nivelAlto' ? 'Alto' : 'Baixo' }}</strong>
    </template>
    <template v-else>
      <span>{{ medicao.nome }}</span>
      <strong>{{ medicao.valor }}</strong>
    </template>
    <small>{{ medicao.estado }}</small>
  </button>
</template>

<style scoped>
.tank-sensor-tag {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: center;
  width: 100%;
  min-width: 0;
  min-height: 89px;
  padding: 9px 10px;
  border: 1px solid rgba(122, 188, 220, 0.22);
  border-radius: 9px;
  background: rgba(18, 72, 93, 0.7);
  color: #dfeef9;
  cursor: pointer;
  text-align: left;
  transition: transform 0.16s ease, filter 0.16s ease, border-color 0.16s ease, box-shadow 0.16s ease;
}

.tank-sensor-tag:hover {
  transform: translateY(-2px);
  filter: brightness(1.12);
  border-color: rgba(95, 205, 255, 0.65);
  box-shadow: 0 5px 14px rgba(0, 0, 0, 0.2);
}

.tank-sensor-tag:active {
  transform: translateY(0);
}

.tank-sensor-tag:focus-visible {
  outline: 2px solid var(--cyan);
  outline-offset: 2px;
}

.tank-sensor-tag.green {
  border-color: rgba(25, 230, 154, 0.35);
}

.tank-sensor-tag.amber {
  border-color: rgba(245, 181, 68, 0.35);
}

.tank-sensor-tag.cyan {
  border-color: rgba(22, 185, 244, 0.38);
}

.tank-sensor-tag.blue {
  border-color: rgba(78, 141, 255, 0.4);
}

.tank-sensor-tag .tag-icon {
  margin-bottom: 4px;
  font-size: 12px;
}

.tank-sensor-tag>span:not(.tag-icon) {
  color: #b7cedd;
  font-size: 10px;
  font-weight: 400;
}

.tank-sensor-tag>strong {
  max-width: 100%;
  overflow-wrap: anywhere;
  color: var(--text);
  font-size: 11px;
  line-height: 1.25;
}

.tank-sensor-tag>small {
  color: var(--green);
  font-size: 9px;
  font-weight: 700;
  letter-spacing: 0.06em;
}

/* ==========================================================================
   Tema claro
   ========================================================================== */

.light-theme .tank-sensor-tag {
  border-color: #d2e0e7;
  background: #f0f6f9;
  color: var(--text);
}

.light-theme .tank-sensor-tag>span:not(.tag-icon) {
  color: #526c7c;
}

.light-theme .tank-sensor-tag.green {
  border-color: #b8dcca;
}

.light-theme .tank-sensor-tag.amber {
  border-color: #e6d2aa;
}

.light-theme .tank-sensor-tag.cyan,
.light-theme .tank-sensor-tag.blue {
  border-color: #bfd8e5;
}

.light-theme .tank-sensor-tag:hover {
  background: #e8f6fb;
  border-color: #62a9c7;
}
</style>