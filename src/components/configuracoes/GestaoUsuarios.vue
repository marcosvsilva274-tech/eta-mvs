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
      <div><span class="section-kicker">ACESSO AO SISTEMA</span><h3 id="users-title">Usuários</h3></div>
      <span class="users-count">{{ usuarios.length }} contas</span>
    </div>

    <form class="user-create-form" @submit.prevent="submitNovoUsuario">
      <label class="user-field"><span>Usuário</span><input v-model="novoUsuario" autocomplete="off" minlength="3" required placeholder="Nome de acesso"></label>
      <label class="user-field"><span>Senha inicial</span><input v-model="novaSenha" type="password" autocomplete="new-password" minlength="6" required placeholder="Mínimo 6 caracteres"></label>
      <label class="user-field"><span>Perfil</span><select v-model="novoPerfil"><option value="operador">Operador</option><option value="admin">Administrador</option></select></label>
      <button type="submit" class="user-primary-button">Adicionar usuário</button>
    </form>

    <p v-if="mensagemUsuarios" class="users-feedback" role="status">{{ mensagemUsuarios }}</p>

    <div class="users-table-wrap">
      <table class="users-table">
        <thead><tr><th>Usuário</th><th>Perfil</th><th>Ações</th></tr></thead>
        <tbody>
          <template v-for="conta in usuarios" :key="conta.usuario">
            <tr>
              <td><strong>{{ conta.usuario }}</strong><small v-if="conta.usuario === usuarioLogado">Sessão atual</small></td>
              <td><span class="user-role" :class="conta.perfil">{{ conta.perfil === 'admin' ? 'Administrador' : 'Operador' }}</span></td>
              <td class="user-actions">
                <button type="button" class="user-secondary-button" @click="$emit('abrir-troca-senha', conta)">{{ usuarioSenhaSelecionado === conta.usuario ? 'Cancelar' : 'Trocar senha' }}</button>
                <button type="button" class="user-delete-button" :disabled="conta.usuario === usuarioLogado" @click="$emit('excluir-usuario', conta)">Excluir</button>
              </td>
            </tr>
            <tr v-if="usuarioSenhaSelecionado === conta.usuario" class="password-edit-row">
              <td colspan="3">
                <form class="password-edit-form" @submit.prevent="submitTrocaSenha(conta)">
                  <label class="user-field"><span>Nova senha para {{ conta.usuario }}</span><input v-model="senhaAtualizada" type="password" autocomplete="new-password" minlength="6" required placeholder="Mínimo 6 caracteres"></label>
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