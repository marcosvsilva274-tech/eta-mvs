// Importa a função createApp do Vue 3 para criar a aplicação
import { createApp } from 'vue'
// Importa o arquivo de estilos global da aplicação
import './style.css'
import './comparison.css'
// Importa o componente raiz (App.vue) da aplicação
import App from './App.vue'

// Cria uma nova instância da aplicação Vue com o componente App
// e monta a aplicação no elemento HTML com id 'app'
createApp(App).mount('#app')
