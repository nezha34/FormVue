<template>
    <div class="welcome-page">
      <!-- Wave Information -->
      <div class="wave-info">
        <Card class="wave-card">
          <template #content>
            <h3 class="wave-title">Vague Coïncidentale</h3>
            <p class="wave-dates">Début: 01/11/2024 - Fin: 30/11/2024</p>
          </template>
        </Card>
      </div>
  
      <!-- Logo and Welcome Message -->
      <div class="header-section">
        <div class="logo-container">
          <div class="logo-background" />
          <div class="logo-background rotated" />
          <img
            src="/Users/nezhanezha/Downloads/MarocMetrieLogo.Jpeg"
            alt="MarocMetrie Logo"
            class="logo-image"
          />
        </div>
        <h1 class="welcome-title">Bienvenue sur MarocMetrie</h1>
        <p class="welcome-subtitle">
          Votre plateforme de gestion des études d'audience et de mesure d'impact
        </p>
      </div>
  
      <!-- Action Buttons -->
      <div class="button-group">

        <Button 
        label="Voir les statistiques" 
        class="p-button-outlined stats-button"
        @click="showDrawer"
      />
      </div>
  
      <!-- Statistics Grid -->
      <div class="stats-grid">
        <Card v-for="stat in stats" :key="stat.title" class="stat-card">
          <template #content>
            <div class="stat-content">
              <div class="stat-icon">
                <component :is="stat.icon" />
              </div>
              <div class="stat-info">
                <h3 class="stat-title">{{ stat.title }}</h3>
                <p class="stat-value">{{ stat.value }}</p>
                <small class="stat-trend">{{ stat.trend }}</small>
              </div>
            </div>
          </template>
        </Card>
      </div>
    </div>
  </template>
  
  <script setup>
  import { defineProps, defineEmits } from 'vue';

  import { Home, Users, Phone, CalendarCheck } from 'lucide-vue-next'
  import Card from 'primevue/card'
  import Button from 'primevue/button'
  const props = defineProps({
  modelValue: {
    type: Boolean,
    required: true,
  },
});
const emit = defineEmits(['update:modelValue']);
const showDrawer = () => {
  emit('update:modelValue', true);
};
  const stats = [
    {
      icon: Home,
      title: 'Foyers',
      value: '2,500',
      trend: '+12% ce mois'
    },
    {
      icon: Users,
      title: 'Individus',
      value: '7,800',
      trend: '+8% ce mois'
    },
    {
      icon: Phone,
      title: 'Appels',
      value: '12,400',
      trend: '+15% ce mois'
    },
    {
      icon: CalendarCheck,
      title: 'Postes',
      value: '4,200',
      trend: '+5% ce mois'
    }
  ]
  </script>
  
  <style scoped>
  .welcome-page {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 1rem;
    background-color: #f8f9fa;
  }
  
  .wave-info {
    width: 100%;
    max-width: 600px;
    margin-bottom: 2rem;
  }
  
  .wave-card {
    background: linear-gradient(135deg, #4CAF50 0%, #45a049 100%);
    border: none;
    transform: skew(-2deg);
  }
  
  .wave-card :deep(.p-card-content) {
    padding: 1.5rem;
    text-align: center;
    transform: skew(2deg);
  }
  
  .wave-title {
    color: white;
    font-size: 1.25rem;
    font-weight: 600;
    margin: 0;
  }
  
  .wave-dates {
    color: rgba(255, 255, 255, 0.9);
    margin: 0.5rem 0 0;
  }
  
  .header-section {
    text-align: center;
    margin-bottom: 3rem;
  }
  
  .logo-container {
    position: relative;
    width: 120px;
    height: 120px;
    margin: 0 auto 2rem;
  }
  
  .logo-background {
    position: absolute;
    inset: 0;
    background-color: rgba(76, 175, 80, 0.1);
    border-radius: 1rem;
    transform: rotate(-12deg);
  }
  
  .logo-background.rotated {
    transform: rotate(12deg);
  }
  
  .logo-image {
    position: relative;
    width: 80px;
    height: 80px;
    object-fit: contain;
    margin: 20px;
  }
  
  .welcome-title {
    font-size: 2.5rem;
    font-weight: 700;
    color: #2c3e50;
    margin-bottom: 1rem;
  }
  
  .welcome-subtitle {
    font-size: 1.1rem;
    color: #666;
    max-width: 600px;
    margin: 0 auto;
  }
  
  .button-group {
    display: flex;
    gap: 1rem;
    margin-bottom: 3rem;
  }
  
  .start-button {
    background-color: #4CAF50 !important;
    border-color: #4CAF50 !important;
    padding: 1rem 2rem !important;
  }
  
  .start-button:hover {
    background-color: #45a049 !important;
    border-color: #45a049 !important;
  }
  
  .stats-button {
    color: #4CAF50 !important;
    border-color: #4CAF50 !important;
    padding: 1rem 2rem !important;
  }
  
  .stats-button:hover {
    background-color: rgba(76, 175, 80, 0.1) !important;
  }
  
  .stats-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 1.5rem;
    width: 100%;
    max-width: 1200px;
  }
  
  .stat-card {
    transition: all 0.3s ease;
  }
  
  .stat-card:hover {
    transform: translateY(-5px);
  }
  
  .stat-card :deep(.p-card-content) {
    padding: 1.5rem;
  }
  
  .stat-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
  }
  
  .stat-icon {
    background-color: rgba(76, 175, 80, 0.1);
    color: #4CAF50;
    width: 48px;
    height: 48px;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 1rem;
  }
  
  .stat-title {
    color: #666;
    font-size: 1rem;
    font-weight: 500;
    margin: 0 0 0.5rem;
  }
  
  .stat-value {
    color: #2c3e50;
    font-size: 1.75rem;
    font-weight: 700;
    margin: 0 0 0.25rem;
  }
  
  .stat-trend {
    color: #4CAF50;
    font-weight: 500;
  }
  
  /* Responsive Design */
  @media (max-width: 1200px) {
    .stats-grid {
      grid-template-columns: repeat(2, 1fr);
      max-width: 800px;
    }
  }
  
  @media (max-width: 768px) {
    .welcome-page {
      padding: 1.5rem;
    }
  
    .welcome-title {
      font-size: 2rem;
    }
  
    .button-group {
      flex-direction: column;
      width: 100%;
      max-width: 300px;
    }
  
    .start-button,
    .stats-button {
      width: 100%;
    }
  }
  
  @media (max-width: 480px) {
    .stats-grid {
      grid-template-columns: 1fr;
    }
  
    .wave-info {
      margin-bottom: 1.5rem;
    }
  
    .header-section {
      margin-bottom: 2rem;
    }
  }
  </style>