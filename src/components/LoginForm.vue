<script setup>
// Importa a função ref do Vue para criar dados reativos
import { ref } from 'vue'
import { carregarUsuarios } from '../auth.js'

// Define os eventos que este componente pode emitir para o componente pai
const emit = defineEmits(['login'])

// Dados reativos para armazenar o nome de usuário
const username = ref('')
// Dados reativos para armazenar a senha
const password = ref('')
const mostrarSenha = ref(false)
// Dados reativos para armazenar mensagens de erro
const erro = ref('')

// Função para validar e realizar o login
// Função para validar e realizar o login
const fazerLogin = () => {
  // Valida se os campos estão preenchidos
  if (!username.value || !password.value) {
    erro.value = 'Preencha usuário e senha'
    return
  }

  const usuario = username.value.trim().toLowerCase()
  const credencial = carregarUsuarios().find((conta) => conta.usuario === usuario)

  // Verifica as credenciais e o perfil associado
  if (credencial && credencial.senha === password.value) {
    // Limpa qualquer mensagem de erro anterior
    erro.value = ''
    // Armazena o usuário logado no localStorage
    localStorage.setItem('usuario_logado', usuario)
    localStorage.setItem('perfil_usuario', credencial.perfil)
    emit('login', { usuario, perfil: credencial.perfil })
  } else {
    // Exibe mensagem de erro se as credenciais forem inválidas
    erro.value = 'Usuário ou senha incorretos'
    // Limpa o campo de senha
    password.value = ''
  }
}

// Função para permitir login ao pressionar a tecla Enter
// Função para permitir login ao pressionar a tecla Enter
const handleEnter = (event) => {
  // Verifica se a tecla pressionada é Enter
  if (event.key === 'Enter') {
    // Chama a função de login
    fazerLogin()
  }
}
</script>

<template>
  <main class="login-screen">
    <section class="plant-side" aria-label="Estação de tratamento de água">
      <div class="plant-atmosphere"></div>
      <div class="plant-window"></div>
      <div class="plant-control-rack"><i></i><i></i><i></i><b></b><span></span></div>

      <div class="plant-pipe pipe-upper"></div>
      <div class="plant-pipe pipe-mid"></div>
      <div class="plant-pipe pipe-lower"></div>
      <div class="plant-pipe pipe-rise"></div>
      <div class="plant-pipe pipe-link"></div>
      <div class="pipe-glow glow-upper"></div>
      <div class="pipe-glow glow-lower"></div>

      <div class="process-vessel raw-vessel">
        <span class="vessel-label">ÁGUA BRUTA</span>
        <span class="vessel-neck"></span><span class="vessel-rim"></span>
        <span class="vessel-water"></span><span class="vessel-leg"></span>
      </div>
      <div class="process-vessel active-vessel">
        <span class="vessel-label">TANQUE<br>DE ATIVOS</span>
        <span class="vessel-neck"></span><span class="vessel-rim"></span>
        <span class="vessel-water"></span><span class="vessel-mixer"></span>
        <span class="vessel-leg"></span>
      </div>
      <div class="process-vessel treated-vessel">
        <span class="vessel-label">ÁGUA TRATADA</span>
        <span class="vessel-neck"></span><span class="vessel-rim"></span>
        <span class="vessel-water"></span><span class="vessel-light"></span>
        <span class="vessel-leg"></span>
      </div>

      <div class="plant-pump pump-left"><i></i><b></b><span></span></div>
      <div class="plant-pump pump-right"><i></i><b></b><span></span></div>
      <div class="plant-sensor sensor-one"><i></i><span></span></div>
      <div class="plant-sensor sensor-two"><i></i><span></span></div>
      <div class="plant-floor"></div>

      <div class="feature-rail">
        <div class="feature-item">
          <svg viewBox="0 0 32 32" aria-hidden="true"><rect x="4" y="5" width="24" height="17" rx="2"/><path d="M9 17l5-5 4 3 5-6M12 27h8M16 22v5"/></svg>
          <span>Monitoramento<br>em tempo real</span>
        </div>
        <div class="feature-item">
          <svg viewBox="0 0 32 32" aria-hidden="true"><path d="M12 4h8l1 4 3 2 4-1 3 6-3 3v4l3 3-3 6-4-1-3 2-1 4h-8l-1-4-3-2-4 1-3-6 3-3v-4l-3-3 3-6 4 1 3-2z" transform="translate(0 -3) scale(.94)"/><circle cx="16" cy="16" r="4"/></svg>
          <span>Controle de<br>processos</span>
        </div>
        <div class="feature-item">
          <svg viewBox="0 0 32 32" aria-hidden="true"><path d="M24 12a8 8 0 0 0-16 0c0 10-4 10-4 13h24c0-3-4-3-4-13M13 29h6"/></svg>
          <span>Alarmes<br>e eventos</span>
        </div>
        <div class="feature-item">
          <svg viewBox="0 0 32 32" aria-hidden="true"><path d="M5 26h5V17H5zM14 26h5V11h-5zM23 26h5V5h-5zM4 29h25"/></svg>
          <span>Operação<br>eficiente</span>
        </div>
      </div>
    </section>

    <section class="login-side">
      <div class="login-card">
        <header class="brand-lockup">
          <svg class="brand-drop" viewBox="0 0 110 130" role="img" aria-label="Logotipo de gota d'água">
            <path d="M55 4C43 25 12 62 12 83a43 43 0 0 0 86 0C98 62 67 25 55 4Z"/>
            <path class="drop-cut" d="M36 57c-8 10-13 20-13 29a32 32 0 0 0 27 32"/>
          </svg>
          <div class="brand-copy">
            <h1>ETA</h1>
            <p>ESTAÇÃO DE TRATAMENTO<br>DE ÁGUA</p>
          </div>
        </header>

        <div class="brand-divider"></div>
        <p class="login-subtitle">Supervisório e Controle</p>

        <form class="login-form" @submit.prevent="fazerLogin">
          <label class="login-field" for="username">
            <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="8" r="4"/><path d="M4 21v-2a8 8 0 0 1 16 0v2z"/></svg>
            <input id="username" v-model="username" type="text" autocomplete="username" aria-label="Usuário" placeholder="Usuário" required />
          </label>

          <label class="login-field password-field" for="password">
            <svg viewBox="0 0 24 24" aria-hidden="true"><rect x="4" y="10" width="16" height="11" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3M12 14v3"/></svg>
            <input id="password" v-model="password" :type="mostrarSenha ? 'text' : 'password'" autocomplete="current-password" aria-label="Senha" placeholder="Senha" required />
            <button class="password-toggle" type="button" :aria-label="mostrarSenha ? 'Ocultar senha' : 'Mostrar senha'" @click="mostrarSenha = !mostrarSenha">
              <svg v-if="!mostrarSenha" viewBox="0 0 24 24" aria-hidden="true"><path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/></svg>
              <svg v-else viewBox="0 0 24 24" aria-hidden="true"><path d="m3 3 18 18M10.6 6.1A11 11 0 0 1 12 6c6.5 0 10 6 10 6a17 17 0 0 1-3.1 3.6M6.2 6.3C3.5 8 2 12 2 12s3.5 6 10 6c1.4 0 2.7-.3 3.8-.8"/><path d="M9.9 9.9a3 3 0 0 0 4.2 4.2"/></svg>
            </button>
          </label>

          <button type="submit" class="btn-login"><span>Entrar</span><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14M13 5l7 7-7 7"/></svg></button>
          <p v-if="erro" class="login-error" role="alert">{{ erro }}</p>
        </form>
      </div>
      <div class="login-bottom-line"></div>
    </section>
  </main>
</template>

<style scoped>
.login-screen {
  --login-cyan: #08b8ee;
  --login-blue: #087fca;
  --login-ink: #061522;
  display: grid;
  grid-template-columns: minmax(0, 1.58fr) minmax(390px, .92fr);
  width: 100%;
  min-height: 100vh;
  overflow: hidden;
  color: #edf6ff;
  background: #04111e;
  font-family: Bahnschrift, 'Aptos', 'Segoe UI', sans-serif;
}
.plant-side {
  position: relative;
  display: flex;
  align-items: stretch;
  min-width: 0;
  min-height: 100vh;
  overflow: hidden;
  isolation: isolate;
  background:
    radial-gradient(ellipse at 48% 55%, rgba(13, 86, 138, .2), transparent 42%),
    linear-gradient(180deg, #0b1e30 0%, #061726 66%, #030d17 100%);
}
.plant-atmosphere {
  position: absolute;
  inset: 0;
  z-index: -3;
  background:
    linear-gradient(90deg, transparent 0 8%, rgba(54, 100, 139, .12) 8.2% 8.6%, transparent 8.8% 17%, rgba(85, 126, 161, .1) 17.3% 17.8%, transparent 18%),
    linear-gradient(180deg, transparent 0 16%, rgba(105, 142, 174, .12) 16.2% 16.7%, transparent 16.9% 37%, rgba(95, 130, 158, .1) 37.2% 37.7%, transparent 38%),
    repeating-linear-gradient(90deg, transparent 0 90px, rgba(111, 150, 182, .08) 91px 94px, transparent 96px 164px);
  opacity: .9;
}
.plant-window {
  position: absolute;
  inset: 0 0 17% 0;
  z-index: -2;
  background:
    linear-gradient(90deg, transparent 5%, rgba(25, 92, 150, .45) 5.5% 6%, transparent 6.5% 33%, rgba(15, 101, 170, .32) 33.5% 34%, transparent 34.5% 69%, rgba(14, 94, 157, .3) 70% 70.7%, transparent 71%),
    linear-gradient(180deg, transparent 39%, rgba(7, 16, 26, .82) 39.5% 42%, transparent 42.5% 72%, rgba(6, 18, 29, .6) 72.5% 74%, transparent 75%);
  filter: blur(1px);
}
.plant-control-rack {
  position: absolute;
  top: 18%;
  right: 6%;
  width: 32%;
  height: 31%;
  border: 2px solid rgba(149, 177, 203, .4);
  border-radius: 5px;
  background: linear-gradient(135deg, rgba(80, 99, 119, .8), rgba(21, 39, 57, .96));
  box-shadow: inset 0 0 20px #03101b, 0 15px 25px #0007;
}
.plant-control-rack::before {
  position: absolute;
  inset: 12% 8% 18%;
  border: 1px solid #92a8bc66;
  background: repeating-linear-gradient(90deg, transparent 0 19%, #0a1826 19.5% 20%, transparent 20.5% 39%), linear-gradient(#162b3e, #091724);
  content: "";
}
.plant-control-rack i { position: absolute; z-index: 1; top: 28%; left: 17%; width: 13%; height: 21%; border: 1px solid #285777; background: linear-gradient(145deg, #1a4664, #071726); }
.plant-control-rack i:nth-child(2) { left: 43%; }
.plant-control-rack i:nth-child(3) { left: 69%; }
.plant-control-rack b { position: absolute; z-index: 1; right: 11%; bottom: 27%; width: 29%; height: 7%; background: #08a9dc; box-shadow: 0 0 12px #00baff; }
.plant-control-rack span { position: absolute; bottom: 8%; left: 7%; width: 86%; height: 2px; background: #7790a6; }
.plant-pipe {
  position: absolute;
  z-index: 1;
  border-color: #576e82;
  filter: drop-shadow(0 3px 2px #0009);
}
.pipe-upper { top: 28%; left: 8%; width: 67%; height: 14%; border-top: 10px solid #63788c; border-right: 10px solid #63788c; border-radius: 12px 14px 0 0; }
.pipe-mid { top: 49%; left: 18%; width: 62%; height: 13%; border-top: 9px solid #647c91; border-left: 9px solid #647c91; border-radius: 15px 0 0; }
.pipe-lower { bottom: 18%; left: 4%; width: 87%; height: 13%; border-bottom: 12px solid #52697f; border-radius: 0 0 12px 14px; }
.pipe-rise { bottom: 18%; left: 8%; height: 55%; border-left: 10px solid #566c81; }
.pipe-link { top: 43%; right: 18%; height: 33%; border-left: 9px solid #536a80; }
.pipe-glow {
  position: absolute;
  z-index: 2;
  height: 4px;
  border-radius: 5px;
  background: #08c9ff;
  box-shadow: 0 0 7px 2px #00baff, 0 0 20px 5px #008bea99;
}
.glow-upper { top: 59.5%; left: 25%; width: 51%; }
.glow-lower { bottom: 18.7%; left: 23%; width: 59%; }
.process-vessel {
  position: absolute;
  z-index: 3;
  bottom: 24%;
  width: 19%;
  height: 39%;
  border: 5px solid rgba(194, 216, 232, .72);
  border-top: 6px solid #b7cadd;
  border-radius: 18px 18px 27px 27px;
  background: linear-gradient(90deg, rgba(222, 240, 250, .34), rgba(28, 67, 93, .22) 15%, rgba(11, 32, 49, .35) 80%, rgba(205, 228, 240, .25));
  box-shadow: inset 6px 0 8px #e8f8ff28, inset -6px 0 10px #0008, 0 12px 20px #0009;
}
.raw-vessel { left: 11%; height: 49%; width: 23%; bottom: 22%; }
.active-vessel { left: 41%; width: 26%; height: 28%; bottom: 22%; border-radius: 12px 12px 20px 20px; }
.treated-vessel { right: 4%; height: 39%; width: 22%; bottom: 22%; border-color: #8db2ce; box-shadow: inset 6px 0 10px #00baff33, 0 0 18px #00baff44, 0 12px 20px #0009; }
.vessel-label {
  position: absolute;
  z-index: 5;
  top: 6%;
  left: 50%;
  min-width: 78%;
  padding: 7px 9px;
  transform: translateX(-50%);
  border: 1px solid #087cb7;
  border-radius: 7px;
  background: linear-gradient(135deg, #0c537e, #062a47);
  box-shadow: 0 4px 12px #0007;
  color: #e6f6ff;
  font-size: clamp(8px, .95vw, 13px);
  font-weight: 700;
  line-height: 1.25;
  text-align: center;
  white-space: nowrap;
}
.vessel-neck { position: absolute; top: -15px; left: 30%; width: 40%; height: 14px; border: 3px solid #b8ccdc; border-bottom: 0; border-radius: 5px 5px 0 0; background: #182d41; }
.vessel-rim { position: absolute; z-index: 4; top: -7px; left: -3%; width: 106%; height: 12px; border: 3px solid #c9dcea; border-radius: 50%; background: linear-gradient(#d6e7f2, #687f93); }
.vessel-water { position: absolute; right: 4px; bottom: 4px; left: 4px; height: 54%; border-radius: 43% 40% 14px 14px / 8% 7% 12px 12px; background: linear-gradient(180deg, #1fc1ff 0 5%, #078bd9 18%, #075392 100%); box-shadow: inset 4px 7px 11px #b1f4ff38, 0 0 12px #009dff55; }
.raw-vessel .vessel-water { height: 59%; background: linear-gradient(180deg, #bec0b4 0 5%, #8b8069 14%, #51463c 100%); }
.active-vessel .vessel-water { height: 48%; }
.treated-vessel .vessel-water { height: 69%; }
.vessel-leg { position: absolute; bottom: -21px; left: 12%; width: 76%; height: 10px; border: 3px solid #8da7bc; border-radius: 50%; background: #263d52; }
.vessel-mixer { position: absolute; z-index: 3; bottom: 12%; left: 49%; height: 40%; border-left: 3px solid #273c50; }
.vessel-mixer::after { position: absolute; bottom: 0; left: -18px; width: 36px; height: 8px; border-top: 3px solid #283e51; border-bottom: 3px solid #283e51; content: ""; }
.vessel-light { position: absolute; z-index: 3; top: 28%; right: 9%; height: 50%; width: 5px; border-radius: 5px; background: #17d5ff; box-shadow: 0 0 12px 4px #00baff; }
.plant-pump { position: absolute; z-index: 4; bottom: 19%; width: 16%; height: 8%; border: 4px solid #0c6399; border-radius: 12px; background: repeating-linear-gradient(90deg, #075080 0 7px, #1286bd 8px 10px); box-shadow: inset 0 5px 7px #35bdf766, 0 9px 10px #0009; }
.plant-pump::before { position: absolute; top: 18%; left: -28%; width: 33%; height: 64%; border: 4px solid #0786c8; border-radius: 50% 0 0 50%; background: #075386; content: ""; }
.plant-pump::after { position: absolute; bottom: -9px; left: 12%; width: 76%; height: 7px; border-radius: 2px; background: #506c82; box-shadow: 0 4px 5px #0008; content: ""; }
.pump-left { left: 23%; }
.pump-right { right: 4%; }
.plant-sensor { position: absolute; z-index: 4; top: 44%; width: 15px; height: 105px; border: 2px solid #384e63; border-radius: 6px; background: repeating-linear-gradient(180deg, #131d29 0 17px, #d99b2e 18px 21px); box-shadow: 0 0 5px #000; }
.plant-sensor i { position: absolute; bottom: 10px; left: -6px; width: 23px; height: 19px; border-radius: 5px; background: linear-gradient(90deg, #056cb0, #12c3ff, #075d9b); box-shadow: 0 0 10px #00aaff88; }
.plant-sensor span { position: absolute; top: -13px; left: -8px; width: 26px; height: 12px; border-radius: 3px; background: #0c1926; }
.sensor-one { left: 31%; }
.sensor-two { right: 24%; top: 49%; }
.plant-floor { position: absolute; z-index: 5; right: 0; bottom: 16%; left: 0; height: 6%; border-top: 3px solid #41617b; background: linear-gradient(180deg, #172b3d, #07111c); box-shadow: 0 -8px 22px #0007; }
.feature-rail {
  position: absolute;
  z-index: 6;
  right: 5%;
  bottom: 2.4%;
  left: 5%;
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  min-height: 10%;
  border-top: 1px solid rgba(25, 116, 166, .34);
  background: linear-gradient(180deg, rgba(3, 16, 27, .78), rgba(3, 13, 22, .96));
}
.feature-item { display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 7px; min-width: 0; padding: 9px 4px 5px; color: #afc3d5; font-size: clamp(9px, 1vw, 14px); line-height: 1.35; text-align: center; }
.feature-item + .feature-item::before { position: absolute; align-self: flex-start; height: 48%; margin-top: 9px; border-left: 1px solid #54708766; content: ""; }
.feature-item svg { width: clamp(22px, 2.7vw, 38px); height: clamp(22px, 2.7vw, 38px); fill: none; stroke: var(--login-cyan); stroke-linecap: round; stroke-linejoin: round; stroke-width: 2.2; }
.login-side {
  position: relative;
  display: grid;
  place-items: center;
  min-width: 0;
  min-height: 100vh;
  padding: 42px clamp(25px, 5vw, 78px);
  border-left: 1px solid rgba(28, 131, 185, .28);
  background:
    radial-gradient(ellipse at 50% 87%, rgba(0, 91, 165, .22), transparent 48%),
    linear-gradient(145deg, #071522, #061421 60%, #03101b);
}
.login-card {
  position: relative;
  z-index: 1;
  width: min(100%, 480px);
  padding: clamp(30px, 4vw, 54px) clamp(26px, 4.1vw, 58px);
  border: 1px solid rgba(83, 137, 177, .26);
  border-radius: 24px;
  background: linear-gradient(150deg, rgba(8, 23, 37, .96), rgba(4, 18, 31, .97));
  box-shadow: 0 24px 70px #0008, inset 0 1px 0 #d7eeff0a;
}
.brand-lockup { display: flex; align-items: center; justify-content: center; gap: 18px; }
.brand-drop { width: clamp(62px, 6.8vw, 94px); height: clamp(78px, 8vw, 112px); flex: 0 0 auto; overflow: visible; fill: #079edb; filter: drop-shadow(0 7px 18px #009fe755); }
.brand-drop .drop-cut { fill: none; stroke: #082033; stroke-linecap: round; stroke-width: 6; }
.brand-copy h1 { color: #eef7ff; font-size: clamp(44px, 5vw, 68px); font-weight: 750; line-height: .95; }
.brand-copy p { margin-top: 9px; color: #d3e0eb; font-size: clamp(11px, 1.15vw, 15px); font-weight: 500; line-height: 1.35; }
.brand-divider { height: 1px; margin: 32px 0 14px; background: linear-gradient(90deg, transparent, #1384b8 18%, #168ec5 82%, transparent); box-shadow: 0 0 8px #08a9e955; }
.login-subtitle { margin-bottom: 38px; color: #91a9bd; font-size: 17px; text-align: center; }
.login-form { display: grid; gap: 15px; }
.login-field { display: flex; align-items: center; gap: 13px; min-height: 54px; padding: 0 14px; border: 1px solid rgba(94, 133, 163, .25); border-radius: 11px; background: rgba(15, 34, 51, .86); transition: border-color .18s ease, box-shadow .18s ease; }
.login-field:focus-within { border-color: rgba(8, 184, 238, .72); box-shadow: 0 0 0 3px rgba(8, 184, 238, .1); }
.login-field > svg { width: 22px; height: 22px; flex: 0 0 auto; fill: none; stroke: #91a8bd; stroke-linecap: round; stroke-linejoin: round; stroke-width: 1.8; }
.login-field input { width: 100%; min-width: 0; border: 0; outline: 0; background: transparent; color: #eef7ff; font: inherit; font-size: 15px; }
.login-field input::placeholder { color: #899daf; opacity: 1; }
.password-toggle { display: grid; place-items: center; width: 34px; height: 34px; flex: 0 0 auto; border: 0; border-radius: 6px; background: transparent; color: #91a8bd; }
.password-toggle:hover { color: #d9f5ff; background: #ffffff0b; }
.password-toggle svg { width: 20px; height: 20px; fill: none; stroke: currentColor; stroke-linecap: round; stroke-linejoin: round; stroke-width: 1.8; }
.btn-login { display: flex; align-items: center; justify-content: center; gap: 18px; width: 100%; min-height: 54px; margin-top: 9px; border: 1px solid #17a9ed; border-radius: 11px; background: linear-gradient(100deg, #0baeea, #0876be); box-shadow: inset 0 1px 0 #ffffff33, 0 8px 22px #006bac3b; color: #fff; font: inherit; font-size: 17px; font-weight: 650; transition: filter .18s ease, transform .18s ease; }
.btn-login:hover { filter: brightness(1.12); transform: translateY(-1px); }
.btn-login:active { transform: translateY(0); }
.btn-login:focus-visible, .password-toggle:focus-visible { outline: 2px solid #77e5ff; outline-offset: 3px; }
.btn-login svg { width: 23px; height: 23px; fill: none; stroke: currentColor; stroke-linecap: round; stroke-linejoin: round; stroke-width: 1.8; }
.login-error { padding: 10px 12px; border: 1px solid rgba(255, 104, 118, .45); border-radius: 8px; background: rgba(124, 26, 43, .24); color: #ffabb1; font-size: 13px; text-align: center; }
.login-bottom-line { position: absolute; right: 0; bottom: 10%; left: 0; height: 1px; background: linear-gradient(90deg, transparent, #048bd655, transparent); box-shadow: 0 -15px 35px #006ec733; }

@media (max-width: 900px) {
  .login-screen { grid-template-columns: minmax(0, 1fr) minmax(340px, .88fr); }
  .plant-control-rack { right: 3%; width: 40%; }
  .raw-vessel { left: 7%; width: 26%; }
  .active-vessel { left: 37%; width: 30%; }
  .treated-vessel { right: 2%; width: 25%; }
  .login-side { padding: 28px 22px; }
  .login-card { padding: 34px 28px; }
}
@media (max-width: 680px) {
  .login-screen { display: block; min-height: 100svh; overflow: auto; }
  .plant-side { min-height: 42svh; height: 42svh; }
  .plant-control-rack { top: 12%; right: 4%; width: 43%; height: 35%; }
  .process-vessel { bottom: 21%; height: 39%; }
  .raw-vessel { left: 7%; width: 25%; height: 43%; }
  .active-vessel { left: 39%; width: 28%; height: 28%; }
  .treated-vessel { right: 3%; width: 24%; height: 36%; }
  .plant-pipe.pipe-upper { top: 24%; }
  .plant-pipe.pipe-mid { top: 46%; }
  .plant-pipe.pipe-lower { bottom: 17%; }
  .plant-pipe.pipe-rise { bottom: 17%; }
  .glow-lower { bottom: 17.7%; }
  .plant-floor { bottom: 15%; }
  .feature-rail { right: 2%; bottom: 1%; left: 2%; min-height: 17%; }
  .feature-item { gap: 3px; font-size: 9px; }
  .feature-item svg { width: 22px; height: 22px; }
  .login-side { min-height: 58svh; padding: 20px 20px 30px; border-top: 1px solid rgba(28, 131, 185, .28); border-left: 0; }
  .login-card { width: min(100%, 440px); padding: 24px 25px; border-radius: 17px; }
  .brand-lockup { gap: 13px; }
  .brand-drop { width: 53px; height: 67px; }
  .brand-copy h1 { font-size: 43px; }
  .brand-copy p { font-size: 10px; }
  .brand-divider { margin: 20px 0 10px; }
  .login-subtitle { margin-bottom: 22px; font-size: 15px; }
  .login-form { gap: 12px; }
  .login-field, .btn-login { min-height: 49px; }
}
@media (prefers-reduced-motion: reduce) {
  .login-screen *, .login-screen *::before, .login-screen *::after { scroll-behavior: auto !important; transition-duration: .01ms !important; }
}
</style>
