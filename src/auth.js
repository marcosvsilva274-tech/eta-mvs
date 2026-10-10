export const USUARIOS_STORAGE_KEY = 'supervisorio-usuarios-v1'

const usuariosIniciais = [
  { usuario: 'admin', senha: 'admin123', perfil: 'admin' },
  { usuario: 'operador', senha: 'senha123', perfil: 'operador' },
]

export function carregarUsuarios() {
  try {
    const armazenados = JSON.parse(localStorage.getItem(USUARIOS_STORAGE_KEY))
    if (Array.isArray(armazenados) && armazenados.length) return armazenados
  } catch {
    return usuariosIniciais.map((usuario) => ({ ...usuario }))
  }

  return usuariosIniciais.map((usuario) => ({ ...usuario }))
}

export function salvarUsuarios(usuarios) {
  localStorage.setItem(USUARIOS_STORAGE_KEY, JSON.stringify(usuarios))
}