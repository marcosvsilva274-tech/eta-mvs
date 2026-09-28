<script setup>
// Importa a função ref do Vue para criar dados reativos
import { ref } from 'vue'

// Define os eventos que este componente pode emitir para o componente pai
const emit = defineEmits(['login'])

// Dados reativos para armazenar o nome de usuário
const username = ref('')
// Dados reativos para armazenar a senha
const password = ref('')
// Dados reativos para armazenar mensagens de erro
const erro = ref('')

// Objeto com as credenciais válidas de teste para autenticação
const credenciaisValidas = {
  admin: 'admin123',
  operador: 'senha123',
  supervisor: 'supervisor123'
}

// Função para validar e realizar o login
// Função para validar e realizar o login
const fazerLogin = () => {
  // Valida se os campos estão preenchidos
  if (!username.value || !password.value) {
    erro.value = 'Preencha usuário e senha'
    return
  }

  // Verifica se as credenciais são válidas
  if (credenciaisValidas[username.value] === password.value) {
    // Limpa qualquer mensagem de erro anterior
    erro.value = ''
    // Armazena o usuário logado no localStorage
    localStorage.setItem('usuario_logado', username.value)
    // Emite o evento 'login' para notificar o componente pai
    emit('login', username.value)
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
  <div class="login-container">
    <div class="login-box">
      <div class="login-header">
        <h1>🔐 Supervisório ETA</h1>
        <p>Sistema de Monitoramento de Estação de Tratamento de Água</p>
      </div>

      <form @submit.prevent="fazerLogin" class="login-form">
        <div class="form-group">
          <label for="username">Usuário:</label>
          <input
            id="username"
            v-model="username"
            type="text"
            placeholder="Digite o usuário"
            @keyup="handleEnter"
          />
        </div>

        <div class="form-group">
          <label for="password">Senha:</label>
          <input
            id="password"
            v-model="password"
            type="password"
            placeholder="Digite a senha"
            @keyup="handleEnter"
          />
        </div>

        <button type="submit" class="btn-login">Entrar</button>

        <div v-if="erro" class="erro-mensagem">
          ⚠️ {{ erro }}
        </div>
      </form>

    </div>
  </div>
</template>

<style scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
}

.login-box {
  background: white;
  border-radius: 12px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  padding: 40px;
  width: 100%;
  max-width: 400px;
}

.login-header {
  text-align: center;
  margin-bottom: 30px;
}

.login-header h1 {
  font-size: 28px;
  color: #333;
  margin: 0 0 10px 0;
}

.login-header p {
  color: #666;
  font-size: 14px;
  margin: 0;
}

.login-form {
  margin-bottom: 25px;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  color: #333;
  font-weight: 600;
  font-size: 14px;
}

.form-group input {
  width: 100%;
  padding: 12px;
  border: 2px solid #e0e0e0;
  border-radius: 6px;
  font-size: 14px;
  transition: border-color 0.3s;
  box-sizing: border-box;
}

.form-group input:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.btn-login {
  width: 100%;
  padding: 12px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
}

.btn-login:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 20px rgba(102, 126, 234, 0.3);
}

.btn-login:active {
  transform: translateY(0);
}

.erro-mensagem {
  margin-top: 15px;
  padding: 12px;
  background: #fee;
  color: #c33;
  border-radius: 6px;
  font-size: 14px;
  text-align: center;
  border: 1px solid #fcc;
}

</style>
