export const USUARIOS_STORAGE_KEY = 'supervisorio-usuarios-v1'

const usuariosIniciais = [
  { usuario: 'admin', senha: '8s1]%We?4M2', perfil: 'admin' },
  { usuario: 'operador', senha: '</g,Zzf0(7+8', perfil: 'operador' },
  { usuario: 'visitante', senha: '1234', perfil: 'visitante' },
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