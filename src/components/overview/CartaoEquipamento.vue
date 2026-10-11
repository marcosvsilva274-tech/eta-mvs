<script setup>
defineProps({
  equipamento: { type: Object, required: true },
  manual: { type: Boolean, default: false }
})

defineEmits(['toggle'])
</script>

<template>
  <button type="button" class="action-card" :class="{ on: equipamento.ativo }" :disabled="!manual"
    :aria-pressed="equipamento.ativo" :aria-label="`${equipamento.nome}: ${equipamento.ativo ? 'ligado' : 'desligado'}`"
    :style="{ '--equipment-color': equipamento.cor }" @click="$emit('toggle', equipamento)">
    <div class="action-card-top">
      <h4>{{ equipamento.nome }}</h4>
    </div>

    <div class="equipment-art" :class="equipamento.tipo" aria-hidden="true">
      <!-- BOMBA -->
      <template v-if="equipamento.tipo === 'pump'">
        <span class="pump-inlet"></span><span class="pump-body"><i></i></span><span class="pump-nozzle"></span><span
          class="pump-coupling"></span><span class="pump-motor"></span><span class="pump-foot"></span>
      </template>

      <!-- DOSADOR (Com LED no doser-head) -->
      <template v-else-if="equipamento.tipo === 'doser'">
        <span class="doser-cap"></span>
        <span class="doser-head"><i class="doser-led"></i></span>
        <span class="doser-neck"></span>
        <span class="doser-container"><span></span></span>
        <span class="doser-tube"></span>
      </template>

      <!-- MEXEDOR (Com LED no mixer-head) -->
      <template v-else-if="equipamento.tipo === 'mixer'">
        <span class="mixer-cap"></span>
        <span class="mixer-head"><i class="mixer-led"></i></span>
        <span class="mixer-shaft"></span>
        <span class="mixer-blade"></span>
      </template>

      <!-- SOLENOIDE (Com LED no valve-coil) -->
      <template v-else>
        <span class="valve-coil"><i class="valve-led"></i></span>
        <span class="valve-stem"></span>
        <span class="valve-body"></span>
        <span class="valve-pipe left"></span>
        <span class="valve-pipe right"></span>
      </template>
    </div>

    <span class="equipment-state" :class="{ on: equipamento.ativo }">
      <span></span>{{ equipamento.ativo ? 'LIGADA' : 'DESLIGADA' }}
    </span>
  </button>
</template>