<template>
    <!-- Daily Objective Section -->
    <div class="daily-objectives">
      <h2 class="sidebar-title">Objectifs</h2>
      <div class="kpi-card">
        <span>G1: {{ dailyObjective.objectives.group1 || 0 }}</span>
        <span>G2: {{ dailyObjective.objectives.group2 || 0}}</span>
        <span>G3: {{ dailyObjective.objectives.group3 || 0}}</span>
      </div>
    </div>
  
    <!-- List of Foyers to Call (Local Pagination) -->
    <div class="foyer-list">
      <h2 class="sidebar-title">Foyers à appeler</h2>
      
      <!-- Search Panels -->
      <div class="search-panels">
        <div class="search-panel">
          <div class="search-input-wrapper">
            <i class="pi pi-search search-icon"></i>
            <input 
              v-model="searchFoyerId" 
              type="text" 
              placeholder="Rechercher par ID Foyer" 
              class="search-input"
            />
          </div>
        </div>
        <div class="search-panel">
          <div class="search-input-wrapper">
            <i class="pi pi-users search-icon"></i>
            <input 
              v-model="searchGroup" 
              type="text" 
              placeholder="Rechercher par Groupe" 
              class="search-input"
            />
          </div>
        </div>
      </div>
  
      <table>
        <thead>
          <tr>
            <th>ID Foyer</th>
            <th>Groupe</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="foyer in paginatedFoyers" :key="foyer.no_foyer">
            <td>
              <a href="#" @click.prevent="selectFoyer(foyer)" class="foyer-link">
                {{ foyer.no_foyer }}
              </a>
            </td>
            <td>{{ foyer.taille_foyer }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  
    <div class="pagination-controls">
      <Button label="Précédent" @click="prevPage" :disabled="currentPage === 1" />
      <Button label="Suivant" @click="nextPage" :disabled="currentPage >= totalPages" />
    </div>
  </template>
  
  <script setup>
  import { ref, computed, onMounted } from 'vue';
  import axios from 'axios';
  import { useToast } from 'primevue/usetoast';
  import Button from 'primevue/button';
  
  const props = defineProps({
    agent: {
      type: Number,
      required: true,
    },
  });

  const emit = defineEmits(['foyer-selected']);
  const toast = useToast();
  
  const dailyObjective = ref({
    objectives: {
        group1: 0,
        group2: 0,
        group3: 0
    }
});
  const foyersList = ref([]);
  const currentPage = ref(1);
  const rowsPerPage = ref(3);
  const searchFoyerId = ref('');
  const searchGroup = ref('');
  
  const itemsPerPage = rowsPerPage;
  
  const filteredFoyers = computed(() => {
    const foyerIdQuery = searchFoyerId.value.toLowerCase().trim();
    const groupQuery = searchGroup.value.toLowerCase().trim();
    return foyersList.value.filter(foyer => {
      const foyerIdMatch = foyer.no_foyer.toString().toLowerCase().includes(foyerIdQuery);
      const groupMatch = foyer.taille_foyer.toString().toLowerCase().includes(groupQuery);
      return foyerIdMatch && groupMatch;
    });
  });
  
  const paginatedFoyers = computed(() => {
    const start = (currentPage.value - 1) * itemsPerPage.value;
    const end = start + itemsPerPage.value;
    return filteredFoyers.value.slice(start, end);
  });
  
  const totalPages = computed(() => {
    return Math.ceil(filteredFoyers.value.length / itemsPerPage.value);
  });
  
  const fetchFoyers = async () => {
    try {
      const response = await axios.get('http://127.0.0.1:8000/foyers/assigned', {
        params: { agent_id: props.agent }
      });
      foyersList.value = response.data || [];
      
    } catch (err) {
      toast.add({
        severity: 'error',
        summary: 'Error',
        detail: err.message || 'Failed to fetch foyers',
        life: 3000
      });
    }
  };
  const fetchobjective= async () => {
    try {

    const response2 = await axios.get(`http://127.0.0.1:8000/admin/daily-objectives/${props.agent}`
      );
      dailyObjective.value= response2.data ;
  } catch (error) {
      toast.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Failed to fetch objectives',
        life: 3000
      });
    }
  };
 
  const selectFoyer = async (foyer) => {
    try {
      await axios.patch(`http://127.0.0.1:8000/foyers/${foyer.no_foyer}/lock`, {
        agent_id: props.agent
      });
  
      emit('foyer-selected', foyer.no_foyer);
      foyersList.value = foyersList.value.filter(f => f.no_foyer !== foyer.no_foyer);
    } catch (error) {
      toast.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Failed to select foyer',
        life: 3000
      });
    }
};
  
  const prevPage = () => {
    if (currentPage.value > 1) {
      currentPage.value--;
    }
  };
  
  const nextPage = () => {
    if (currentPage.value < totalPages.value) {
      currentPage.value++;
    }
  };
  
  onMounted(() => {
    fetchFoyers();
    fetchobjective();
  });
  </script>
  
  <style scoped>
  .daily-objectives {
    margin-bottom: 2rem;
  }
  
  .sidebar-title {
    font-size: 1.125rem;
    font-weight: 600;
    color: #1a1a1a;
    margin-bottom: 1rem;
    padding-bottom: 0.5rem;
    border-bottom: 2px solid #f1f5f9;
  }
  
  .kpi-card {
    background-color: #f8fafc;
    padding: 1rem 1.25rem;
    border-radius: 0.75rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
    border: 1px solid #e2e8f0;
  }
  
  .kpi-card span {
    font-size: 0.875rem;
    font-weight: 500;
    color: #475569;
  }
  
  .foyer-list {
    margin-bottom: 2rem;
  }
  
  .foyer-list table {
    width: 100%;
    border-collapse: separate;
    border-spacing: 0;
    margin-top: 0.5rem;
  }
  
  .foyer-list th {
    background-color: #f8fafc;
    color: #475569;
    font-weight: 500;
    font-size: 0.875rem;
    text-align: left;
    padding: 0.75rem 1rem;
    border-bottom: 2px solid #e2e8f0;
  }
  
  .foyer-list td {
    padding: 0.875rem 1rem;
    color: #1e293b;
    font-size: 0.875rem;
    border-bottom: 1px solid #e2e8f0;
    background-color: #ffffff;
  }
  
  .foyer-list tr:hover td {
    background-color: #f8fafc;
  }
  
  .foyer-list tr:last-child td {
    border-bottom: none;
  }
  
  .pagination-controls {
    display: flex;
    justify-content: space-between;
    gap: 0.75rem;
    padding-top: 1rem;
    border-top: 1px solid #e2e8f0;
  }
  
  .pagination-controls .p-button {
    flex: 1;
    background-color: #f8fafc !important;
    border: 1px solid #e2e8f0 !important;
    color: #475569 !important;
    font-weight: 500;
    font-size: 0.875rem;
    padding: 0.5rem 1rem;
    transition: all 0.2s ease;
  }
  
  .pagination-controls .p-button:hover:not(:disabled) {
    background-color: #f1f5f9 !important;
    border-color: #cbd5e1 !important;
  }
  
  .pagination-controls .p-button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
  
  .search-panels {
    display: flex;
    gap: 1rem;
    margin-bottom: 1rem;
  }
  
  .search-panel {
    flex: 1;
  }
  
  .search-input-wrapper {
    position: relative;
    max-width: 100%;
  }
  
  .search-icon {
    position: absolute;
    left: 1rem;
    top: 50%;
    transform: translateY(-50%);
    color: #64748b;
  }
  
  .search-input {
    width: 100%;
    padding: 0.75rem 1rem 0.75rem 2.5rem;
    border: 1px solid #e2e8f0;
    border-radius: 0.5rem;
    font-size: 0.875rem;
    color: #1e293b;
    background-color: #ffffff;
    transition: all 0.2s ease;
  }
  
  .search-input:focus {
    outline: none;
    border-color: #94a3b8;
    box-shadow: 0 0 0 2px rgba(148, 163, 184, 0.1);
  }
  
  .search-input::placeholder {
    color: #94a3b8;
  }
  
  @media (max-width: 768px) {
    .kpi-card {
      padding: 0.75rem 1rem;
      flex-direction: column;
      gap: 0.5rem;
      align-items: flex-start;
    }
  
    .foyer-list th,
    .foyer-list td {
      padding: 0.625rem 0.75rem;
    }
  
    .search-panels {
      flex-direction: column;
    }
  }
  </style>
  
  