<script setup>
defineProps({
  medicao: { type: Object, required: true },
  tanque: { type: Object, required: true }
})

defineEmits(['abrir-detalhe'])
</script>

<template>
  <button
    type="button"
    class="tank-sensor-tag"
    :class="medicao.classe"
    :aria-label="medicao.chave.startsWith('nivel') ? `${medicao.nome} do tanque ${tanque.nome}: normal. Abrir detalhes` : `${medicao.nome} do tanque ${tanque.nome}: ${medicao.valor}. Abrir detalhes`"
    @click="$emit('abrir-detalhe', medicao, tanque)"
  >
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