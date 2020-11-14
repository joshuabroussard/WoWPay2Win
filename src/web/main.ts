import Vue from 'vue'

// ----------------------------------------------------------------------------
// Quasar
// ----------------------------------------------------------------------------

import 'material-design-icons-iconfont/dist/material-design-icons.css'
import 'quasar/dist/quasar.min.css'
import Quasar from 'quasar'

Vue.use(Quasar, {
    config: {
        dark: true,
        brand: {
            primary: '#297acc',
            secondary: '#41a4fa',
            accent: '#9C27B0',
            dark: '#222',

            positive: '#2e8743',
            negative: '#C10015',
            info: '#31CCEC',
            warning: '#F2C037',
        },
    },
})

// ----------------------------------------------------------------------------
// App
// ----------------------------------------------------------------------------

import '@css/main.scss'
import App from '@components/App.vue'
import store from '@store/AppStore'
import router from '@router/AppRouter'

const app = new App({
    store: store,
    router: router,
})

try {
    app.$mount('#app')
} catch (err) {
    const error = err as Error
    console.error('Application Error', error)
}
