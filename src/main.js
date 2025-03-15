import { createApp } from 'vue'
import {createPinia} from "pinia";
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import router from "./routers/index.js";
import './style.css'
import App from './App.vue'
const pinia=createPinia()
createApp(App).use(router).use(pinia).use(ElementPlus).mount('#app')
