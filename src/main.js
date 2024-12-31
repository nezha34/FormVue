// main.js
import { createApp } from 'vue';
import App from './App.vue';
import PrimeVue from 'primevue/config';
import Aura from '@primevue/themes/lara';
import ConfirmationService from 'primevue/confirmationservice';
import Popover from "primevue/popover";
import router from './router'
import Toast from 'primevue/toast';
import ToastService from 'primevue/toastservice';
import Tabs from 'primevue/tabs';
import Card from 'primevue/card';
import Button from 'primevue/button';
import InputText from 'primevue/inputtext';
import Dropdown from 'primevue/dropdown';
import TabView from 'primevue/tabview';
import TabPanel from 'primevue/tabpanel';
import DatePicker from 'primevue/datepicker';
import Select from 'primevue/select';
import Textarea from 'primevue/textarea';
import Dialog from 'primevue/dialog';
import Divider from 'primevue/divider';

import 'primeicons/primeicons.css'

const app = createApp(App)

app.use(PrimeVue, {
    theme: {
        preset: Aura,
        options: {
            prefix: 'p',
            darkModeSelector: '.my-app-dark',
            cssLayer: {
                name: 'primevue',
                order: 'tailwind-base, primevue, tailwind-utilities'
            }
        }
    }
});

app.use(ConfirmationService);
app.component("Popover", Popover);
app.use(ToastService); // Register ToastService globally
app.component('Toast', Toast); // Important: register the component globally
app.component('Tabs', Tabs);

app.use(router);
app.component('Card', Card);
app.component('Button', Button);
app.component('InputText', InputText);
app.component('Dropdown', Dropdown);
app.component('TabView', TabView);
app.component('Divider', Divider);

app.component('TabPanel', TabPanel);
app.component('DatePicker', DatePicker);
app.component('Select', Select);
app.component('Textarea', Textarea);
app.component('Dialog', Dialog);





 app.mount('#app');



 

