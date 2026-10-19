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
      <button v-for="item in paginasVisiveis" :key="item.id" class="nav-item" :class="{ active: pagina === item.id }"
        @click="$emit('navegar', item.id)">
        <span class="nav-icon">{{ item.icone }}</span>
        <span>{{ item.titulo }}</span>
        <b v-if="item.badge" class="nav-badge">{{ item.badge }}</b>
      </button>
    </nav>
    <div class="sidebar-footer">
      <span class="user-avatar" @click="$emit('sair')">{{ usuarioLogado.slice(0, 1).toUpperCase() }}</span>
      <div>
        <strong>{{ usuarioLogado }}</strong>
        <small>{{ ehAdministrador ? 'Administrador' : 'Usuário' }}</small>
      </div>
      <button class="icon-button" title="Sair" @click="$emit('sair')">⇥</button>
    </div>
  </aside>
</template>

<style scoped>
.sidebar {
  width: 100%;
  display: flex;
  align-items: center;
  background: var(--side);
  border-bottom: 1px solid var(--line);
}

.user-avatar {
  display: grid;
  place-items: center;
  width: 31px;
  height: 31px;
  border-radius: 50%;
  background: #1b77a1;
  font-weight: bold;
}

.icon-button {
  border: 0;
  background: transparent;
  color: var(--muted);
}

.brand-mark {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 13px 25px;
}

.brand-mark strong {
  display: block;
  font-size: 28px;
  line-height: 1;
}

.brand-mark small {
  display: block;
  color: var(--cyan);
  font-size: 9px;
  letter-spacing: 0.2em;
}

.main-nav {
  display: flex;
  flex: 1;
  justify-content: center;
  gap: 5px;
  padding: 0 12px;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 9px;
  padding: 11px 15px;
  border: 0;
  border-radius: 7px;
  background: transparent;
  color: var(--muted);
  font-size: 13px;
  transition: background-color 0.18s ease, color 0.18s ease;
}

.nav-item.active,
.nav-item:hover {
  background: rgba(22, 185, 244, 0.12);
  color: var(--text);
}

.nav-icon {
  color: var(--cyan);
  font-size: 19px;
}

.nav-badge {
  margin-left: 3px;
  padding: 2px 6px;
  border-radius: 50%;
  background: var(--red);
  color: #ffffff;
  font-size: 10px;
}

.sidebar-footer {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 18px;
  border-left: 1px solid var(--line);
}

.sidebar-footer strong,
.sidebar-footer small {
  display: block;
}

.sidebar-footer small {
  color: var(--muted);
  font-size: 10px;
}

@media (max-width: 760px) {

  .brand-mark {
    padding: 12px 13px;
  }

  .brand-mark div {
    display: none;
  }

  .main-nav {
    justify-content: flex-start;
    overflow-x: auto;
    padding: 6px 12px;
  }

  .nav-item {
    flex: 0 0 auto;
    padding: 10px;
  }

  .nav-item span:not(.nav-icon) {
    display: none;
  }

  .sidebar-footer {
    padding: 8px;
  }

  .sidebar-footer div,
  .sidebar-footer .icon-button {
    display: none;
  }

}
</style>