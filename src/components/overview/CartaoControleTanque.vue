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
      <button type="button" class="tank-vessel" :aria-expanded="selecionado"
        :aria-label="`${tanque.nome} com ${tanque.percentualNivel}% de nível. ${selecionado ? 'Ocultar' : 'Mostrar'} acionamentos`"
        @click="$emit('alternar-tanque', tanque.id)">
        <span class="tank-rim"></span>
        <span class="tank-water" :id="`${tanque.id}`" :style="{ height: `${tanque.percentualNivel}%` }"></span>
        <span class="tank-base"></span>
      </button>
      <div class="tank-level-list">
        <button v-for="medicao in tanque.sensoresNivel" :key="medicao.chave" type="button" class="tank-level-item"
          :aria-label="`${medicao.nome} do tanque ${tanque.nome}: ${medicao.valor}. Abrir detalhes`"
          @click="$emit('abrir-detalhe', medicao, tanque)">
          <span class="tank-level-name"><i :class="{ active: medicao.valor === 'LIGADO' }"></i>{{ medicao.nome }}</span>
        </button>
      </div>
    </div>
  </article>
</template>

<style scoped>
#efluentes {
  background: linear-gradient(180deg, #00baff, #075d80 48%, #553b2d, #502d19);
  width: 100%;
  left: 0;
  bottom: 2px;
}

#efluentes::before {
  width: 100%;
  left: 0;
}

/*
#efluentes::after {
  background: #977864;
} 
*/

.tank-control-card {
  display: flex;
  flex-direction: column;
  min-width: 0;
  padding: 14px 15px;
  border: 1px solid rgba(0, 139, 207, 0.46);
  border-radius: 8px;
  background: linear-gradient(145deg, rgba(4, 27, 43, 0.95), rgba(1, 14, 24, 0.97));
}

.tank-control-card.selected {
  border-color: rgba(20, 191, 255, 0.78);
}

.tank-control-card h4 {
  color: #d6e4f7;
  font-size: 18px;
}

.tank-control-body {
  display: grid;
  flex: 1;
  grid-template-columns: minmax(100px, 1fr) minmax(105px, 1fr);
  align-items: center;
  gap: 10px;
  padding-top: 10px;
}

.tank-vessel {
  position: relative;
  display: block;
  width: min(100%, 142px);
  height: 278px;
  justify-self: center;
  padding: 0;
  border: 8px solid #a9c5db;
  border-top-width: 10px;
  border-bottom-width: 12px;
  border-radius: 20px 20px 32px 32px;
  background: linear-gradient(90deg, #19364c, #071a29 18%, #102c41 83%, #061723);
  box-shadow: inset 5px 0 8px #d2e9ff22, inset -5px 0 8px #0009, 0 5px 9px #0008;
  transition: filter 0.18s ease, box-shadow 0.18s ease;
}

.tank-vessel:hover {
  filter: brightness(1.12);
}

.tank-vessel:focus-visible {
  outline: 2px solid var(--cyan);
  outline-offset: 5px;
}

.tank-rim {
  position: absolute;
  z-index: 2;
  top: -14px;
  left: 10%;
  width: 80%;
  height: 14px;
  border: 3px solid #d4e3f2;
  border-radius: 50%;
  background: linear-gradient(#d7e6f4, #6e8ba5);
  box-shadow: 0 2px 5px #0008;
}

.tank-water {
  position: absolute;
  right: 4px;
  bottom: 5px;
  left: 4px;
  height: 52%;
  border-radius: 0 0 12px 12px;
  background: linear-gradient(180deg, #159fe9, #0878d0 48%, #064a96);
  box-shadow: inset 5px 8px 14px #a6efff30, inset -7px 0 12px #002f6a55, 0 0 12px #08aaff33;
  transition: height 0.35s ease;
}

.tank-water::before {
  position: absolute;
  top: -8px;
  left: -2%;
  width: 104%;
  height: 17px;
  border-radius: 50%;
  background: linear-gradient(180deg, #52d8ff, #20b5f4 72%, #138edc);
  box-shadow: 0 2px 5px #075a9a99;
  content: "";
}

.tank-water::after {
  position: absolute;
  top: -2px;
  left: 16%;
  width: 68%;
  height: 3px;
  border-radius: 50%;
  background: #c5f5ff;
  opacity: 0.38;
  content: "";
}

.tank-base {
  position: absolute;
  bottom: -13px;
  left: 8%;
  width: 84%;
  height: 12px;
  border: 3px solid #b7cde1;
  border-radius: 50%;
  background: linear-gradient(#a9bfd3, #314b60);
}

.tank-level-list {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-self: center;
  width: 100%;
  height: min(100%, 278px);
  min-width: 0;
}

.tank-level-item {
  display: flex;
  align-items: center;
  min-width: 0;
  padding: 0;
  border: 0;
  background: transparent;
  color: #c9dcf5;
  text-align: left;
}

.tank-level-item:focus-visible {
  outline: 2px solid var(--cyan);
  outline-offset: 4px;
}

.tank-level-name {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
}

.tank-level-name i {
  width: 12px;
  height: 12px;
  flex: 0 0 auto;
  border-radius: 50%;
  background: #58e89b;
  opacity: 0.58;
  box-shadow: 0 0 9px #2ade8a44;
}

.tank-level-name i.active {
  opacity: 1;
}

/* ==========================================================================
   Tema claro
   ========================================================================== */

.light-theme .tank-control-card {
  border-color: #c9d9e2;
  background: linear-gradient(145deg, #fff, #f3f8fb);
  box-shadow: 0 3px 12px rgba(29, 69, 93, 0.06);
}

.light-theme .tank-control-card.selected {
  border-color: #1685ad;
}

.light-theme .tank-level-item {
  color: var(--text);
}

/* ==========================================================================
   Responsividade
   ========================================================================== */

@media (max-width: 760px) {
  .tank-control-card h4 {
    align-self: center;
  }

  .tank-control-body {
    grid-template-columns: minmax(80px, 1.8fr) minmax(0, 1fr);
    gap: 8px;
    margin: auto;
  }

  .tank-vessel {
    height: 190px;
    width: 110px;
  }

  .tank-level-list {
    height: min(100%, 160px);
  }

  .tank-level-name {
    font-size: 11px;
  }

}
</style>