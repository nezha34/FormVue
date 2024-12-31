<template>
  <div id="app" :class="{ 'dark-mode': darkMode }">
    <div class="content">
      <router-view />
    </div>

    <footer>
      <div class="footer-content">
        <p>© 2024 Marocmétrie. Tous droits réservés.</p>
        <div class="footer-buttons">
          <button @click="toggleDarkMode" class="footer-btn">
            {{ darkMode ? 'Passer au Mode Clair' : 'Activer le Mode Sombre' }}
          </button>
          <button @click="handleLogout" class="footer-btn logout-btn">
            <i class="pi pi-sign-out"></i>
            Déconnexion
          </button>
        </div>
      </div>
    </footer>
  </div>
</template>

<script>
import Header from './components/header.vue';
import Admin from './views/Admin.vue';
import FormPage from './views/FormPage.vue';
import DataTable from 'primevue/datatable';

export default {
  name: 'App',
  components: {
    Header,
    Admin,
    FormPage, 
    DataTable
  },
  data() {
    return {
      darkMode: false,
    };
  },
  methods: {
    toggleDarkMode() {
      this.darkMode = !this.darkMode;
    },
    handleLogout() {
      // Redirect to logout endpoint or handle logout logic
      window.location.href = '/logout';
    }
  },
};
</script>

<style scoped>
footer {
  padding: 1rem;
  background: var(--surface-card);
  border-top: 1px solid var(--surface-border);
}

.footer-content {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
}

.footer-buttons {
  display: flex;
  gap: 0.75rem;
  align-items: center;
}

.footer-btn {
  padding: 0.5rem 1rem;
  border: 1px solid var(--surface-border);
  border-radius: 6px;
  background: var(--surface-card);
  color: var(--text-color);
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.footer-btn:hover {
  background: var(--surface-hover);
}

.logout-btn {
  color: var(--red-600);
  border-color: var(--red-200);
}

.logout-btn:hover {
  background: var(--red-50);
  border-color: var(--red-300);
}

.dark-mode .footer-btn {
  background: var(--surface-card);
  border-color: var(--surface-border);
}

.dark-mode .logout-btn {
  color: var(--red-400);
  border-color: var(--red-700);
}

.dark-mode .logout-btn:hover {
  background: var(--red-900);
  border-color: var(--red-600);
}
</style>