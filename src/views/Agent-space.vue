<template>
    <Header />

    <div class="agent-space">
        <h1 class="title">Agent Space: {{ selectedAgentName }}</h1>

        <div class="table-container">
            <DataTable :value="filteredFoyers" :rowClass="rowClass" ref="foyerTable" class="foyer-table">
                <Column field="no_foyer" header="Foyer ID" />
                <Column field="taille_foyer" header="Taille Foyer" />
                <Column field="status" header="Status">
                    <template #body="slotProps">
                        <span :class="getStatusClass(slotProps.data.status)">
                            {{ getStatusLabel(slotProps.data.status) }}
                        </span>
                    </template>
                </Column>
                <Column field="current_agent" header="Progress">
                    <template #body="slotProps">
                        <span v-if="slotProps.data.current_agent && slotProps.data.current_agent !== selectedAgent"
                            class="in-progress">
                            En cours de Traitement par un autre agent
                        </span>
                        <span v-else-if="slotProps.data.current_agent && slotProps.data.current_agent === selectedAgent"
                            class="in-progress-self">
                            En cours de Traitement (Vous)
                        </span>
                        <span v-else class="not-in-progress">
                            Disponible
                        </span>
                    </template>
                </Column>
                <Column header="Action">
                    <template #body="slotProps">
                        <Button v-if="!slotProps.data.current_agent" label="Appelez" icon="pi pi-phone"
                            class="p-button-rounded p-button-success mr-2"
                            @click="lockAndNavigateToForm(slotProps.data.no_foyer)" />
                        <Button v-else-if="slotProps.data.current_agent === selectedAgent" label="Resume"
                            icon="pi pi-eye" class="p-button-rounded p-button-warning mr-2"
                            @click="navigateToForm(slotProps.data.no_foyer)" />
                        <Button v-else label="View" icon="pi pi-eye" class="p-button-rounded p-button-secondary mr-2"
                            :disabled="true" />
                    </template>
                </Column>
            </DataTable>
            <InputText v-model="globalFilter" placeholder="Global Search" class="global-search" />
        </div>
    </div>
</template>

<script>
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import axios from 'axios';
import Select from 'primevue/select';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import Button from 'primevue/button';
import InputText from 'primevue/inputtext';
import Chart from 'primevue/chart';
import Header from '@/components/header.vue';

export default {
    name: 'AgentSpace',
    components: {
        Header,
        Select,
        DataTable,
        Column,
        Button,
        InputText,
        Chart,
    },
    setup() {
        const router = useRouter();

        // Refs
        const selectedAgent = ref(null);
        const selectedAgentName = ref('');
        const foyerList = ref([]);      // Will hold the foyers from /foyers
        const dimFoyerData = ref([]);   // Will hold the foyer status data from another endpoint
        const globalFilter = ref('');

        // Map numeric statuses to string labels
        const mapStatus = (status) => {
            switch (status) {
                case 0:
                    return 'answered';    // Complété
                case 2:
                    return 'rendezvous'; // Rendez-vous
                case 3:
                    return 'refus';      // Refus
                default:
                    return 'pending';    // En attente
            }
        };

        onMounted(async () => {
            const storedAgent = localStorage.getItem('currentAgent');
            if (storedAgent) {
                const parsedAgent = JSON.parse(storedAgent);
                selectedAgent.value = parsedAgent.id;
                selectedAgentName.value = parsedAgent.name;

                // Fetch dimFoyerData first
                await fetchDimFoyerData();
                // Then fetch all foyers and update their statuses
                await fetchAssignedFoyers();
                updateFoyerStatuses();
            } else {
                console.error('No agent found in localStorage');
                router.push('/login'); // Redirect to login if no agent is found
            }
        });

        const fetchDimFoyerData = async () => {
            try {
                // Adjust this endpoint to the correct one that returns status info for foyers
                const response = await axios.get('http://127.0.0.1:8000/foyersForm');
                dimFoyerData.value = response.data;
                console.log("dimFoyerData:", dimFoyerData.value);
            } catch (error) {
                console.error('Error fetching dimFoyerData:', error);
            }
        };

        // Fetch all foyers (common list)
        const fetchAssignedFoyers = async () => {
            try {
                // Fetch assigned foyers from the backend for the current agent
                const response = await axios.get(`http://127.0.0.1:8000/foyers/assigned`);
                console.log("Assigned foyer data:", response.data);

                // Extract the agent-specific data
                const agentData = response.data.assignments[selectedAgentName.value];
                if (agentData) {
                    foyerList.value = agentData.currentList.map((foyer) => ({
                        ...foyer,
                        status: mapStatus(foyer.status), // Map numeric status to labels
                    }));
                } else {
                    console.warn("No data found for the current agent.");
                }
            } catch (error) {
                console.error('Error fetching assigned foyers:', error);
            }
        };

        const processCall = async (no_foyer, status) => {
            try {
                // Simulate processing the call (update status in the backend)
                await axios.post(`http://127.0.0.1:8000/foyers/${no_foyer}/process`, {
                    agent_id: selectedAgent.value,
                    status,
                });

                // Refresh the assigned foyers after processing
                await fetchAssignedFoyers();
            } catch (err) {
                console.error("Error processing call:", err);
                alert("Unable to update this foyer. Please try again.");
            }
        };

        // Update the action logic to handle calls dynamically
        const lockAndNavigateToForm = async (no_foyer) => {
            try {
                // Lock the foyer and navigate to the form
                await axios.patch(`http://127.0.0.1:8000/foyers/${no_foyer}/lock`, { agent_id: selectedAgent.value });
                navigateToForm(no_foyer);
            } catch (err) {
                console.error("Error locking foyer:", err);
                alert("Unable to lock this foyer. Please try again.");
            }
        };


        const updateFoyerStatuses = () => {
            // Make sure dimFoyerData is available
            if (!dimFoyerData.value || dimFoyerData.value.length === 0) {
                console.warn("No dimFoyerData available to map statuses.");
                return;
            }

            foyerList.value.forEach((foyer) => {
                const statusEntry = dimFoyerData.value.find(
                    (entry) => entry.no_foyer === foyer.no_foyer
                );

                if (statusEntry) {
                    console.log(`Foyer ${foyer.no_foyer}: original status ${statusEntry.status}`);
                    foyer.status = mapStatus(statusEntry.status);
                    console.log(`Foyer ${foyer.no_foyer}: mapped status ${foyer.status}`);

                } else {
                    // If no entry found in dimFoyerData, default to pending
                    foyer.status = 'pending';
                }
            });
        };

        const filteredFoyers = computed(() => {
            let filtered = foyerList.value;
            if (globalFilter.value) {
                filtered = filtered.filter((f) =>
                    Object.values(f)
                        .map((val) => String(val).toLowerCase())
                        .some((val) => val.includes(globalFilter.value.toLowerCase()))
                );
            }
            return filtered;
        });

        const navigateToForm = (no_foyer) => {
            const storedAgent = JSON.parse(localStorage.getItem('currentAgent'));
            const agentId = storedAgent?.id;

            if (!agentId) {
                console.error('Agent ID is missing');
                return;
            }

            router.push({
                path: `/form/${no_foyer}`,
                query: { agent: agentId },
            });
        };

        // Attempt to "lock" the foyer for this agent before navigating

        const getStatusLabel = (status) => {
            return status === 'answered' ? 'Completé'
                : status === 'rendezvous' ? 'Rendez-vous'
                    : status === 'refus' ? 'Refus'
                        : 'En attente';
        };

        const getStatusClass = (status) => {
            return {
                'status-answered': status === 'answered',
                'status-rendezvous': status === 'rendezvous',
                'status-refus': status === 'refus',
                'status-pending': status === 'pending',
            };
        };

        const rowClass = (data) => {
            return data.id === null ? 'highlighted-row' : '';
        };

        return {
            selectedAgent,
            selectedAgentName,
            globalFilter,
            filteredFoyers,
            navigateToForm,
            lockAndNavigateToForm,
            getStatusLabel,
            getStatusClass,
            rowClass,
        };
    },
};
</script>

<style scoped>
.agent-space {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 20px;
}

.title {
    margin-bottom: 20px;
    font-size: 24px;
    font-weight: bold;
    color: #333;
}

.table-container {
    width: 100%;
    max-width: 1200px;
    margin: 0 auto;
}

.foyer-table {
    margin-bottom: 20px;
    border: 1px solid #ccc;
    border-radius: 8px;
    overflow: hidden;
}

.global-search {
    margin-top: 20px;
    width: 300px;
}

.status-answered {
    color: green;
    font-weight: bold;
}

.status-pending {
    color: orange;
    font-weight: bold;
}

.status-rendezvous {
    color: blue;
    font-weight: bold;
}

.status-refus {
    color: red;
    font-weight: bold;
}

.in-progress {
    color: #ff9900;
    font-weight: bold;
}

.in-progress-self {
    color: #00aaff;
    font-weight: bold;
}

.not-in-progress {
    color: #999;
}
</style>
