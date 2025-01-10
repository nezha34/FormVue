<template>
    <Drawer
        :visible="visible"
        :modal="false"
        position="left"
        class="agent-stats-drawer"
        :style="{ width: '400px' }"
        @update:visible="(val) => $emit('update:visible', val)"
    >
        <template #container="{ closeCallback }">
            <div class="drawer-content">
                <!-- Close Button -->
                <Button
                    type="button"
                    @click="() => $emit('update:visible', false)" 
                    icon="pi pi-times"
                    rounded
                    outlined
                    class="close-button"
                />

                <!-- Header -->
                <div class="drawer-header">
                    <span class="drawer-title">User Dashboard</span>
                </div>

                <!-- Agent Stats -->
                <div v-if="agentStats" class="drawer-body">
                    <!-- Stats Summary -->
                    <div class="stats-section">
                        <h4 class="stats-title">Stats Pour User {{ agentStats.agent_id }}</h4>
                        <div class="stats-summary">
                            <h5>Résumé</h5>
                            <div class="stats-grid">
                                <div class="stat-item">
                                    <span class="stat-label">Date:</span>
                                    <span class="stat-value">{{ agentStats.day }}</span>
                                </div>
                                <div class="stat-item">
                                    <span class="stat-label">Total Foyers:</span>
                                    <span class="stat-value">{{ agentStats.total_foyers }}</span>
                                </div>
                                <div class="stat-item">
                                    <span class="stat-label">Appels Complétés:</span>
                                    <span class="stat-value">{{ agentStats.completed_calls }}</span>
                                </div>
                                <div class="stat-item">
                                    <span class="stat-label">Appels Rendez-vous:</span>
                                    <span class="stat-value">{{ agentStats.rendezvous_calls }}</span>
                                </div>
                                <div class="stat-item">
                                    <span class="stat-label">Appels Injoignables:</span>
                                    <span class="stat-value">{{ agentStats.unreached_calls }}</span>
                                </div>
                                <div class="stat-item">
                                    <span class="stat-label">Appels Refusés:</span>
                                    <span class="stat-value">{{ agentStats.rejected_calls }}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Upcoming Appointments Section -->
                    <div class="appointments-section">
                        <h4 class="appointments-title">
                            <i class="pi pi-calendar"></i>
                            Rendez-vous à venir
                        </h4>
                        <div class="appointments-list" v-if="agentStats.upcoming_rendezvous?.length">
                            <div v-for="(rendezvous, index) in agentStats.upcoming_rendezvous" 
                                 :key="index"
                                 class="appointment-card"
                            >
                                <div class="appointment-header">             
                                     
                                    <span class="foyer-id">Foyer #
                                        <a href="#" @click.prevent="selectFoyer(rendezvous.foyer_id)" class="foyer-link">
                {{ rendezvous.foyer_id }}
              </a></span>
                                    <span class="appointment-indicator"></span>
                                </div>
                                <div class="appointment-time">
                                    <i class="pi pi-clock"></i>
                                    {{ formatTime(rendezvous.rendezvous_details) }}
                                </div>
                            </div>
                        </div>
                        <div v-else class="no-appointments">
                            <i class="pi pi-calendar-times"></i>
                            <span>Aucun rendez-vous prévu</span>
                        </div>
                    </div>
                </div>

                <!-- Error Message -->
                <div v-if="error" class="error-message">
                    {{ error }}
                </div>
            </div>
        </template>
    </Drawer>
</template>

<script setup>
import { defineProps, defineEmits, watch, getCurrentInstance } from 'vue';
import Drawer from 'primevue/drawer';
import Button from 'primevue/button';
import { useToast } from 'primevue/usetoast';
import axios from 'axios';

const toast = useToast();

// Access current Vue instance for proxy
const { proxy } = getCurrentInstance();

// Define props
const props = defineProps({
    agentStats: {
        type: Object,
        required: false,
    },
    visible: {
        type: Boolean,
        required: true,
    },
    error: {
        type: String,
        required: false,
        default: null,
    },
});

// Method to format time
const formatTime = (dateTime) => {
    const date = new Date(dateTime);
    const hours = String(date.getHours()).padStart(2, '0');  // Ensures two-digit hours
    const minutes = String(date.getMinutes()).padStart(2, '0');  // Ensures two-digit minutes
    return `${hours}:${minutes}`;
};

// Define emits
const emit = defineEmits(['update:visible', 'foyer-selected']);

// Watch for changes in agentStats.upcoming_rendezvous
watch(
    () => props.agentStats?.upcoming_rendezvous, // Use props explicitly
    (rendezvousList) => {
        if (!rendezvousList || rendezvousList.length === 0) {
            return; // Exit if rendezvousList is empty or undefined
        }

        const now = new Date();
        rendezvousList.forEach((rendezvous) => {
            const rendezvousTime = rendezvous.rendezvous_details
                ? new Date(rendezvous.rendezvous_details)
                : null;

            if (rendezvousTime === null || isNaN(rendezvousTime)) {
                console.warn("Invalid rendezvous_time: ", rendezvous.rendezvous_details);
                return; // Skip invalid or null values
            }

            // Calculate the time difference in milliseconds
            const timeDifference = rendezvousTime - now;

            // Check if the rendezvous is within 15 minutes (900,000 milliseconds)
            if (timeDifference > 0 && timeDifference <= 15 * 60 * 1000) {
                if (proxy?.$toast?.add) {
                    proxy.$toast.add({
                        severity: "info",
                        summary: "Rendezvous Dans 15minutes",
                        detail: `Foyer  ID: ${rendezvous.foyer_id} à ${formatTime(rendezvous.rendezvous_details)}`,
                        life: 10000,
                    });
                } else {
                    console.warn("Toast service is not available.");
                }
            }
        });
    },
    { immediate: true }
);


const selectFoyer = async (foyerId) => {
  console.log('Attempting to lock foyer:', foyerId);
  console.log('Agent ID:', props.agentStats.agent_id);

  try {
    const response = await axios.patch(
      `http://127.0.0.1:8000/foyers/${foyerId}/lock?agent_id=${props.agentStats.agent_id}`
    );
    console.log('Lock successful:', response.data);

    emit('foyer-selected', foyerId);
  } catch (error) {
    if (error.response && error.response.status === 409) {
      console.error('Conflict Error:', error.response.data);
      toast.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Le foyer est verrouillé par un autre agent.',
        life: 3000,
      });
    } else {
      console.error('Unexpected Error:', error.response || error.message);
      toast.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Échec de la sélection du foyer',
        life: 3000,
      });
    }
  }
};

</script>


<style scoped>
.agent-stats-drawer {
    background: #f8fafc;
}

.drawer-content {
    display: flex;
    flex-direction: column;
    height: 100%;
    position: relative;
    padding: 1rem;
}

.close-button {
    position: absolute;
    top: 1.5rem;
    right: 1.5rem;
    width: 2.5rem !important;
    height: 2.5rem !important;
    background: white !important;
    border: 1px solid #e2e8f0 !important;
    color: #64748b !important;
    transition: all 0.2s ease;
}

.close-button:hover {
    background: #f1f5f9 !important;
    color: #0f172a !important;
    transform: rotate(90deg);
}

.drawer-header {
    padding-top: 0.5rem;
}

.drawer-title {
    font-size: 1.5rem;
    font-weight: 600;
    color: #0f172a;
    line-height: 1.2;
}

.drawer-body {
    flex: 1;
    overflow-y: auto;
}

.stats-section {
    background: white;
    border-radius: 1rem;
    padding: 1.5rem;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.stats-title {
    font-size: 1.25rem;
    font-weight: 600;
    color: #0f172a;
    margin-bottom: 1.5rem;
    padding-bottom: 1rem;
    border-bottom: 2px solid #e2e8f0;
}

.stats-summary h5 {
    font-size: 1.1rem;
    font-weight: 500;
    color: #64748b;
    margin-bottom: 1rem;
}

.stats-grid {
    display: flex;
    flex-direction: column;
    gap: 1rem;
}

.stat-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem;
    background: #f8fafc;
    border-radius: 0.75rem;
    border: 1px solid #e2e8f0;
    transition: all 0.2s ease;
}

.stat-item:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
    border-color: #cbd5e1;
}

.stat-label {
    font-size: 0.875rem;
    color: #64748b;
    font-weight: 500;
}

.stat-value {
    font-size: 1rem;
    color: #0f172a;
    font-weight: 600;
}

.error-message {
    margin-top: 1rem;
    padding: 1rem;
    background: #fef2f2;
    border: 1px solid #fee2e2;
    border-radius: 0.75rem;
    color: #dc2626;
    font-size: 0.875rem;
}

/* PrimeVue Drawer Override Styles */
:deep(.p-drawer) {
    background: #f8fafc;
    border: none;
}

:deep(.p-drawer-content) {
    background: #f8fafc;
    padding: 0;
}
.appointments-section {
    margin-top: 1rem;
    background: white;
    border-radius: 1rem;
    padding: 1.5rem;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.appointments-title {
    font-size: 1.25rem;
    font-weight: 600;
    color: #0f172a;
    margin-bottom: 1.5rem;
    padding-bottom: 1rem;
    border-bottom: 2px solid #e2e8f0;
    display: flex;
    align-items: center;
    gap: 0.75rem;
}

.appointments-title i {
    color: #3b82f6;
}

.appointments-list {
    display: flex;
    flex-direction: column;
    gap: 1rem;
}

.appointment-card {
    background: #f8fafc;
    border-radius: 0.75rem;
    border: 1px solid #e2e8f0;
    padding: 1rem;
    transition: all 0.2s ease;
}

.appointment-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
    border-color: #cbd5e1;
}

.appointment-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 0.75rem;
}

.foyer-id {
    font-weight: 600;
    color: #0f172a;
    font-size: 1rem;
}
foyer-id {
  font-weight: 600;
  color: #0f172a;
  font-size: 1rem;
}

.foyer-link {
  color: #3b82f6;
  text-decoration: none;
  font-weight: 600;
  transition: color 0.2s ease;
}

.foyer-link:hover {
  color: #2563eb;
  text-decoration: underline;
}

.appointment-indicator {
  width: 8px;
  height: 8px;
  background: #3b82f6;
  border-radius: 50%;
  animation: pulse 2s infinite;
}

.appointment-time {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #64748b;
  font-size: 0.875rem;
}

.appointment-time i {
  color: #3b82f6;
  font-size: 0.875rem;
}

.no-appointments {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
  padding: 2rem;
  color: #64748b;
  text-align: center;
}

.no-appointments i {
    font-size: 2rem;
    color: #94a3b8;
}

@keyframes pulse {
    0% {
        transform: scale(0.95);
        box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.7);
    }
    
    70% {
        transform: scale(1);
        box-shadow: 0 0 0 10px rgba(59, 130, 246, 0);
    }
    
    100% {
        transform: scale(0.95);
        box-shadow: 0 0 0 0 rgba(59, 130, 246, 0);
    }
}

/* Responsive Adjustments */
@media (max-width: 640px) {
    .agent-stats-drawer {
        width: 100% !important;
    }

    .stats-section {
        padding: 1rem;
    }

    .stat-item {
        padding: 0.75rem;
    }
}
</style>