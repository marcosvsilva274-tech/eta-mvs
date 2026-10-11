<script setup>
defineProps({
  tanque: { type: Object, required: true },
  selecionado: { type: Boolean, default: false }
})

defineEmits(['alternar-tanque', 'abrir-detalhe'])
</script>

<template>
  <article class="tank-control-card" :class="{ selected: selecionado }">
    <h4>{{ tanque.nome }}</h4>
    <div class="tank-control-body">
      <button
        type="button"
        class="tank-vessel"
        :aria-expanded="selecionado"
        :aria-label="`${tanque.nome} com ${tanque.percentualNivel}% de nível. ${selecionado ? 'Ocultar' : 'Mostrar'} acionamentos`"
        @click="$emit('alternar-tanque', tanque.id)"
      >
        <span class="tank-rim"></span>
        <span class="tank-water" :style="{ height: `${tanque.percentualNivel}%` }"></span>
        <span class="tank-base"></span>
      </button>
      <div class="tank-level-list">
        <button
          v-for="medicao in tanque.sensoresNivel"
          :key="medicao.chave"
          type="button"
          class="tank-level-item"
          :aria-label="`${medicao.nome} do tanque ${tanque.nome}: ${medicao.valor}. Abrir detalhes`"
          @click="$emit('abrir-detalhe', medicao, tanque)"
        >
          <span class="tank-level-name"><i :class="{ active: medicao.valor === 'LIGADO' }"></i>{{ medicao.nome }}</span>
        </button>
      </div>
    </div>
  </article>
</template>