<script setup>
import { ref } from 'vue'

const props = defineProps({
  usuarios: { type: Array, required: true },
  usuarioLogado: { type: String, required: true },
  mensagemUsuarios: { type: String, default: '' },
  usuarioSenhaSelecionado: { type: String, default: '' }
})

const emit = defineEmits(['adicionar-usuario', 'excluir-usuario', 'abrir-troca-senha', 'trocar-senha'])

const novoUsuario = ref('')
const novaSenha = ref('')
const novoPerfil = ref('operador')
const senhaAtualizada = ref('')

function submitNovoUsuario() {
  emit('adicionar-usuario', {
    usuario: novoUsuario.value,
    senha: novaSenha.value,
    perfil: novoPerfil.value
  })
  novoUsuario.value = ''
  novaSenha.value = ''
  novoPerfil.value = 'operador'
}

function submitTrocaSenha(conta) {
  emit('trocar-senha', conta, senhaAtualizada.value)
  senhaAtualizada.value = ''
}
</script>

<template>
  <section class="users-section" aria-labelledby="users-title">
    <div class="users-section-heading">
      <div>
        <span class="section-kicker">ACESSO AO SISTEMA</span>
        <h3 id="users-title">Usuários</h3>
      </div>
      <span class="users-count">{{ usuarios.length }} contas</span>
    </div>

    <form class="user-create-form" @submit.prevent="submitNovoUsuario">
      <label class="user-field">
        <span>Usuário</span>
        <input v-model="novoUsuario" autocomplete="off" minlength="3" required placeholder="Nome de acesso">
      </label>
      <label class="user-field">
        <span>Senha inicial</span>
        <input v-model="novaSenha" type="password" autocomplete="new-password" minlength="6" required
          placeholder="Mínimo 6 caracteres">
      </label>
      <label class="user-field">
        <span>Perfil</span>
        <select v-model="novoPerfil">
          <option value="operador">Operador</option>
          <option value="admin">Administrador</option>
        </select>
      </label>
      <button type="submit" class="user-primary-button">Adicionar usuário</button>
    </form>

    <p v-if="mensagemUsuarios" class="users-feedback" role="status">{{ mensagemUsuarios }}</p>

    <div class="users-table-wrap">
      <table class="users-table">
        <thead>
          <tr>
            <th>Usuário</th>
            <th>Perfil</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          <template v-for="conta in usuarios" :key="conta.usuario">
            <tr>
              <td>
                <strong>{{ conta.usuario }}</strong>
                <small v-if="conta.usuario === usuarioLogado">Sessão atual</small>
              </td>
              <td>
                <span class="user-role" :class="conta.perfil">
                  {{ conta.perfil === 'admin' ? 'Administrador' : 'Operador' }}
                </span>
              </td>
              <td class="user-actions">
                <button type="button" class="user-secondary-button" @click="$emit('abrir-troca-senha', conta)">
                  {{ usuarioSenhaSelecionado === conta.usuario ? 'Cancelar' : 'Trocar senha' }}
                </button>
                <button type="button" class="user-delete-button" :disabled="conta.usuario === usuarioLogado"
                  @click="$emit('excluir-usuario', conta)">Excluir</button>
              </td>
            </tr>
            <tr v-if="usuarioSenhaSelecionado === conta.usuario" class="password-edit-row">
              <td colspan="3">
                <form class="password-edit-form" @submit.prevent="submitTrocaSenha(conta)">
                  <label class="user-field">
                    <span>Nova senha para {{ conta.usuario }}</span>
                    <input v-model="senhaAtualizada" type="password" autocomplete="new-password" minlength="6" required
                      placeholder="Mínimo 6 caracteres">
                  </label>
                  <button type="submit" class="user-primary-button">Salvar senha</button>
                </form>
              </td>
            </tr>
          </template>
        </tbody>
      </table>
    </div>
  </section>
</template>

<style scoped>
.users-section {
  margin: 22px 0;
  padding: 18px;
  border: 1px solid var(--line);
  border-radius: 7px;
  background: var(--panel);
}

.users-section-heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 16px;
}

.users-section-heading h3 {
  margin-top: 5px;
  font-size: 20px;
}

.users-count {
  color: var(--muted);
  font-size: 12px;
}

.user-create-form,
.password-edit-form {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr)) auto;
  align-items: end;
  gap: 12px;
  padding: 14px;
  border: 1px solid var(--line);
  border-radius: 6px;
  background: rgba(3, 19, 30, 0.48);
}

.user-field {
  display: grid;
  gap: 6px;
  min-width: 0;
}

.user-field>span {
  color: var(--muted);
  font-size: 11px;
  font-weight: 600;
}

.user-field input,
.user-field select {
  width: 100%;
  min-height: 38px;
  padding: 8px 10px;
  border: 1px solid var(--line);
  border-radius: 5px;
  background: var(--bg);
  color: var(--text);
  font-size: 12px;
}

.user-field input:focus,
.user-field select:focus {
  outline: 2px solid var(--cyan);
  outline-offset: 1px;
}

.user-primary-button,
.user-secondary-button,
.user-delete-button {
  min-height: 36px;
  padding: 7px 11px;
  border: 1px solid var(--line);
  border-radius: 5px;
  background: transparent;
  color: var(--text);
  font-size: 11px;
  font-weight: 600;
  white-space: nowrap;
}

.user-primary-button {
  border-color: rgba(22, 185, 244, 0.5);
  background: rgba(22, 185, 244, 0.14);
  color: #bdeaff;
}

.users-feedback {
  margin: 12px 2px 0;
  color: var(--cyan);
  font-size: 12px;
}

.users-table-wrap {
  margin-top: 14px;
  overflow-x: auto;
}

.users-table {
  width: 100%;
  border-collapse: collapse;
  text-align: left;
}

.users-table th {
  padding: 10px 12px;
  border-bottom: 1px solid var(--line);
  color: var(--muted);
  font-size: 10px;
  font-weight: 600;
  text-transform: uppercase;
}

.users-table td {
  padding: 11px 12px;
  border-bottom: 1px solid rgba(24, 59, 86, 0.7);
  color: var(--text);
  font-size: 12px;
}

.users-table td:first-child strong,
.users-table td:first-child small {
  display: block;
}

.users-table td:first-child small {
  margin-top: 3px;
  color: var(--muted);
  font-size: 10px;
}

.user-role {
  color: #b7cedd;
}

.user-role.admin {
  color: #74d6ff;
}

.user-actions {
  display: flex;
  justify-content: flex-end;
  gap: 7px;
}

.user-secondary-button:hover {
  border-color: var(--cyan);
}

.user-delete-button {
  border-color: rgba(255, 83, 97, 0.35);
  color: #ff929a;
}

.user-delete-button:disabled {
  cursor: not-allowed;
  opacity: 0.4;
}

.password-edit-row td {
  padding-top: 8px;
  background: rgba(3, 19, 30, 0.35);
}

.password-edit-form {
  grid-template-columns: minmax(220px, 1fr) auto;
  max-width: 600px;
  margin-left: auto;
}

/* ==========================================================================
   Tema claro
   ========================================================================== */
.light-theme .user-create-form,
.light-theme .password-edit-form {
  border-color: #d7e2e8;
  background: #f4f8fa;
}

.light-theme .user-primary-button {
  border-color: #9fcbdc;
  background: #e7f4f9;
  color: #075d80;
}

.light-theme .users-table td {
  border-bottom-color: #e1e8ed;
}

.light-theme .user-role {
  color: #526c7c;
}

.light-theme .user-role.admin {
  color: #08658a;
}

.light-theme .user-delete-button {
  border-color: #e5b8bf;
  color: #a52639;
}

.light-theme .password-edit-row td {
  background: #f5f8fa;
}

/* ==========================================================================
   Responsividade
   ========================================================================== */
@media (max-width: 760px) {
  .user-create-form {
    grid-template-columns: 1fr;
  }

  .user-create-form .user-primary-button {
    width: 100%;
  }

  .password-edit-form .user-primary-button {
    justify-self: start;
  }

  .users-table th,
  .users-table td {
    padding: 9px 7px;
  }

  .user-actions {
    min-width: 155px;
  }

  .password-edit-form {
    grid-template-columns: 1fr;
  }

}
</style>