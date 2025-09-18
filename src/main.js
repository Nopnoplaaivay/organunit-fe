import { createApp } from 'vue'
import { createPinia } from 'pinia'
import PrimeVue from 'primevue/config'
import Aura from '@primevue/themes/aura'
import ToastService from 'primevue/toastservice'
import ConfirmationService from 'primevue/confirmationservice'
import router from './router'
import App from './App.vue'

import 'primeicons/primeicons.css'
import './assets/base.css'

const app = createApp(App)
app.use(router)
app.use(createPinia())
app.use(PrimeVue, {
  theme: {
    preset: Aura,
    options: {
      darkModeSelector: 'none', // Disable dark mode
    },
  },
  ripple: true,
  inputStyle: 'outlined',
})
app.use(ToastService)
app.use(ConfirmationService)

// Optionally: register a few used components globally to reduce imports in SFCs
import Button from 'primevue/button'
import Dialog from 'primevue/dialog'
import InputText from 'primevue/inputtext'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Tag from 'primevue/tag'
import Skeleton from 'primevue/skeleton'
import Splitter from 'primevue/splitter'
import SplitterPanel from 'primevue/splitterpanel'
import Toolbar from 'primevue/toolbar'
import Toast from 'primevue/toast'
import ConfirmDialog from 'primevue/confirmdialog'
import Tree from 'primevue/tree'
import Textarea from 'primevue/textarea'

app.component('Button', Button)
app.component('Dialog', Dialog)
app.component('InputText', InputText)
app.component('Textarea', Textarea)
app.component('DataTable', DataTable)
app.component('Column', Column)
app.component('Tag', Tag)
app.component('Skeleton', Skeleton)
app.component('Splitter', Splitter)
app.component('SplitterPanel', SplitterPanel)
app.component('Toolbar', Toolbar)
app.component('Toast', Toast)
app.component('ConfirmDialog', ConfirmDialog)
app.component('Tree', Tree)

app.mount('#app')
