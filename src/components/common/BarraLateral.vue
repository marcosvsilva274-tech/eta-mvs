<script setup>
defineProps({
  usuarioLogado: { type: String, required: true },
  ehAdministrador: { type: Boolean, default: false },
  pagina: { type: String, required: true },
  paginasVisiveis: { type: Array, required: true }
})

defineEmits(['navegar', 'sair'])
</script>

<template>
  <aside class="sidebar">
    <div class="brand-mark">
      <span class="brand-drop">◢</span>
      <div><strong>ETA</strong><small>SUPERVISÓRIO</small></div>
    </div>
    <div class="plant-label">Estação de Tratamento<br>de Água</div>
    <nav class="main-nav">
      <button
        v-for="item in paginasVisiveis"
        :key="item.id"
        class="nav-item"
        :class="{ active: pagina === item.id }"
        @click="$emit('navegar', item.id)"
      >
        <span class="nav-icon">{{ item.icone }}</span>
        <span>{{ item.titulo }}</span>
        <b v-if="item.badge" class="nav-badge">{{ item.badge }}</b>
      </button>
    </nav>
    <div class="sidebar-footer">
      <span class="user-avatar" @click="$emit('sair')">{{ usuarioLogado.slice(0, 1).toUpperCase() }}</span>
      <div>
        <strong>{{ usuarioLogado }}</strong>
        <small>{{ ehAdministrador ? 'Administrador' : '' }}</small>
      </div>
      <button class="icon-button" title="Sair" @click="$emit('sair')">⇥</button>
    </div>
  </aside>
</template>