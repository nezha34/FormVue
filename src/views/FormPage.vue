<template>
    <!-- Toast and Confirm Dialog for Notifications -->
    <Toast />
    <ConfirmDialog />
    <div class="dashboard-layout">
        <AgentStatsDrawer :agentStats="agentStats" :visible="visible" @update:visible="(val) => (visible = val)"
            :error="error" @foyer-selected="handleFoyerSelection" />


        <!-- Left Sidebar with FoyerList Component -->
        <aside class="dashboard-sidebar-left">
            <div class="sidebar-header">

                <Button icon="pi pi-bars" @click="visible = true" severity="contrast" variant="text" />
                <img src="/Users/nezhanezha/Downloads/MarocMetrieLogo.Jpeg" alt="Marocmétrie" class="company-logo" />

            </div>

            <div class="sidebar-content">

                <FoyerList :agent="agent" @foyer-selected="handleFoyerSelection" />
            </div>


        </aside>
        <main v-if="!foyerId" class="dashboard-main">
            <Accueil @start-calls="visible = true" v-model="visible" />
        </main>

        <!-- Main Content -->
        <main v-else class="dashboard-main">
            <Banner />

            <div class="main-content">
                <!-- Header with Unavailability Button -->
                <div class="main-header">
                    <div class="header-actions">

                        <Dialog v-model:visible="scheduleVisible" modal :style="{ width: '500px' }"
                            class="schedule-dialog">
                            <div class="p-6 relative">

                                <h2 class="text-2xl font-semibold text-gray-800 mb-8">Rendez-Vous </h2>

                                <div class="mb-8">
                                    <label class="text-gray-700 text-lg block mb-2">Select Date & Time</label>
                                    <DatePicker v-model="appointment.date" timeOnly hourFormat="24" class="w-full" :pt="{
                                        root: { class: 'w-full' },
                                        input: { class: 'w-full p-3 text-lg border border-gray-200 rounded-lg' }
                                    }" />
                                </div>

                                <div class="flex justify-end gap-4">
                                    <Button label="Cancel" @click="scheduleVisible = false" class="p-button-text" :pt="{
                                        root: { class: 'text-emerald-600 hover:bg-emerald-50 px-6' },
                                        label: { class: 'text-lg font-medium' }
                                    }" />
                                    <Button label="Confirm" @click="handleScheduleConfirm" class="p-button-text" :pt="{
                                        root: { class: 'text-emerald-600 hover:bg-emerald-50 px-6' },
                                        label: { class: 'text-lg font-medium' }
                                    }" />
                                </div>
                            </div>
                        </Dialog>


                    </div>
                </div>

                <!-- Household Info Card -->
                <Card class="info-card" v-if="foyerId">
                    <template #content>
                        <div class="info-grid">
                            <div class="info-item">
                                <div class="info-label">Foyer ID</div>
                                <div class="info-value"> {{ foyerData.no_foyer || 'N/A' }}</div>
                            </div>
                            <div class="info-item">
                                <div class="info-label">Nom</div>
                                <div class="info-value"> {{ foyerData.nom || 'N/A' }}</div>
                            </div>
                            <div class="info-item">
                                <div class="info-label">Ville</div>
                                <div class="info-value"> {{ foyerData.ville || 'N/A' }}</div>
                            </div>
                            <div class="info-item">
                                <div class="info-label">Taille Foyer</div>
                                <div class="info-value">{{ foyerData.taille_foyer || 'N/A' }}</div>
                            </div>
                            <div class="info-item">
                                <div class="info-label">Tel</div>
                                <div class="info-value">
                                    <span v-if="!isTelVisible">********</span>
                                    <span v-else>{{ foyerData.tel || 'N/A' }}</span>
                                    <i class="pi" :class="isTelVisible ? 'pi-eye-slash' : 'pi-eye'"
                                        @click="toggleTelVisibility" style="cursor: pointer; margin-left: 0.5rem;"></i>
                                </div>
                            </div>
                            <div class="info-item">
                                <div class="info-label">Mobile</div>
                                <div class="info-value">
                                    <span v-if="!isMobileVisible">********</span>
                                    <span v-else>{{ foyerData.mobile || 'N/A' }}</span>
                                    <i class="pi" :class="isMobileVisible ? 'pi-eye-slash' : 'pi-eye'"
                                        @click="toggleMobileVisibility"
                                        style="cursor: pointer; margin-left: 0.5rem;"></i>
                                </div>
                            </div>
                        </div>
                        <!-- Time Controls -->
                        <div class="time-controls">
                            <Button v-if="!formData.start_time" class="schedule-button" severity="secondary"
                                @click="scheduleVisible = true">
                                <i class="pi pi-calendar mr-2"></i>
                                Rendez-Vous
                            </Button>
                            <button v-if="!isUnavailable" class="time-button"
                                :class="{ 'time-set': formData.start_time }" @click="setStartTime">
                                <i class="pi pi-clock"></i>
                                {{ formData.start_time ? new Date(formData.start_time).toLocaleTimeString() : 'Début' }}
                            </button>
                            <button v-if="!isUnavailable" class="time-button" :class="{ 'time-set': formData.end_time }"
                                @click="setEndTime">
                                <i class="pi pi-clock"></i>
                                {{ formData.end_time ? new Date(formData.end_time).toLocaleTimeString() : 'Fin' }}
                            </button>
                            <Button v-if="!formData.start_time" class="unavailable-button" severity="Info"
                                @click="setClientUnavailable" :class="{ disabled: isUnavailable }">
                                <span class="status-dot"></span>
                                Indisponible
                            </Button>
                        </div>
                    </template>
                </Card>


                <!-- Main Form Tabs -->

                <div class="tabs-container" v-if="!isUnavailable && foyerId"
                    :class="{ 'form-disabled': !formData.start_time }">
                    <Tabs v-model:value="activeTab" class="custom-tabview">
                        <TabList>
                            <Tab value="0">Foyer</Tab>
                            <Tab value="1">Individu</Tab>
                            <Tab value="3">Conso Web</Tab>
                            <Tab value="2">Information Supplémentaires</Tab>
                        </TabList>
                        <TabPanels>

                            <TabPanel value="0">
                                <template #header>
                                    <div class="tab-header">

                                        <i class="pi pi-home mr-2"></i>
                                        <span>Foyer</span>
                                    </div>
                                </template>
                                <Card class="form-card">
                                    <template #content>
                                        <div class="form-content">
                                            <div class="form-field">
                                                <!-- Render root question from the tree -->
                                                <QuestionComponent :question="questionsTree" :answers="answers"
                                                    :filteredMembers="filteredMembers" :filteredPostes="filteredPostes"
                                                    :formData="formData" @update-answer="setAnswer" />
                                            </div>
                                            <div class="form-field">
                                                <!-- Render Permanent Children -->
                                                <div v-for="child in questionsTree.permanentChildren" :key="child.id">
                                                    <QuestionComponent v-if="child.id !== '7'" :question="child"
                                                        :answers="answers" :filteredMembers="filteredMembers"
                                                        :filteredPostes="filteredPostes" :formData="formData"
                                                        @update-answer="setAnswer"
                                                        @tv-state-change="handleTVStateChange"
                                                        @update-members-activity="updateMembersActivity" />
                                                </div>

                                            </div>


                                        </div>
                                        <div class="flex pt-6 justify-between">
                                            <Button label="Next" icon="pi pi-arrow-right" iconPos="right"
                                                @click="goToTab('1'); markAsComplete('foyer')" />
                                        </div>
                                    </template>
                                </Card>
                            </TabPanel>

                            <TabPanel value="1">
                                <template #header>
                                    <div class="tab-header">
                                        <i class="pi pi-users"></i>
                                        <span>Individu</span>
                                    </div>
                                </template>
                                <Card class="form-card">

                                    <template #content>
                                        <div class="form-content">
                                            <template v-if="filteredMembers.length > 0">
                                                <div class="panel-content">
                                                    <div class="question-wrapper">

                                                        <DynamicTable :data="filteredMembers" :columns="individuColumns"
                                                            :posteData="filteredPostes" uniqueKey="indiv_id"
                                                            @update="handleIndividuUpdate" />
                                                    </div>
                                                    <div class="question-wrapper">
                                                        <!-- Render the question with ID '7' only once -->
                                                        <QuestionComponent
                                                            v-if="questionsTree.permanentChildren && questionsTree.permanentChildren.some(child => child.id === '7')"
                                                            :question="questionsTree.permanentChildren.find(child => child.scope === 'individu')"
                                                            :answers="answers" :filteredMembers="filteredMembers"
                                                            :filteredPostes="filteredPostes" :formData="formData"
                                                            @update-answer="setAnswer" />
                                                    </div>

                                                </div>
                                            </template>

                                        </div>
                                        <div class="actions">
                                            <Button label="Back" severity="secondary" icon="pi pi-arrow-left"
                                                @click="goToTab('0')" />
                                            <Button label="Next" icon="pi pi-arrow-right" iconPos="right"
                                                @click="goToTab('2'); markAsComplete('individu')" />
                                        </div>
                                    </template>
                                </Card>
                            </TabPanel>

                            <TabPanel value="2">
                                <template #header>
                                    <div class="tab-header">
                                        <i class="pi pi-file"></i>
                                        <span>Informations Supplémentaires</span>
                                    </div>
                                </template>
                                <Card class="form-card">

                                    <template #content>

                                        <div class="form-content">
                                            <div class="panel-content">

                                                <NewInfoSection :infoRows="infoRows" @update="updateNewInfoData" />

                                            </div>
                                            <div class="actions">
                                                <Button label="Back" severity="secondary" icon="pi pi-arrow-left"
                                                    @click="goToTab('1')" />
                                                <Button label="Submit" icon="pi pi-check" class="p-button-success"
                                                    :disabled="!formData.end_time" @click="handleSubmitAndPost" />
                                            </div>

                                        </div>
                                    </template>
                                </Card>
                            </TabPanel>

                            <TabPanel value="3">
                                <template #header>
                                    <div class="tab-header">
                                        <i class="pi pi-file"></i>
                                        <span>Conso Web</span>
                                    </div>
                                </template>
                                <Card class="form-card">

                                    <template #content>

                                        <div class="form-content">
                                            <div>
                                                <!-- Step 1: Member Selection -->
                                                <h2>Select Qui est Present</h2>
                                                <div>
                                                    <label v-for="member in filteredMembers" :key="member.id_indiv"
                                                        style="display: block; margin-bottom: 0.5rem;">
                                                        <input type="checkbox" :value="member"
                                                            v-model="selectedMembers" />
                                                        {{ member.nom }} {{ member.prenom }} ({{ member.age }} ans)
                                                    </label>
                                                </div>

                                                <hr />

                                                <!-- Step 2: Pass only the selected people to ConsoleWeb -->
                                                <ConsoleWeb v-model="surveyResponses" :members="selectedMembers"
                                                    :consoleTree="consoTree" />

                                                <button @click="handleSubmitAllAnswers">
                                                    Submit All
                                                </button>
                                            </div>
                                            <div class="actions">
                                                <Button label="Back" severity="secondary" icon="pi pi-arrow-left"
                                                    @click="goToTab('1')" />
                                                <Button label="Submit" icon="pi pi-check" class="p-button-success"
                                                    :disabled="!formData.end_time" @click="handleSubmitAndPost" />
                                            </div>

                                        </div>
                                    </template>
                                </Card>
                            </TabPanel>
                        </TabPanels>

                    </Tabs>

                </div>

                <!-- Unavailable Reason Section -->
                <div v-if="isUnavailable" class="unavailable-reason">
                    <div class="reason-selector">
                        <label for="reason">Motif d'indisponibilité :</label>
                        <select v-model="unavailableReason" id="reason" class="reason-dropdown">
                            <option disabled value="">Select a reason</option>
                            <option>Abondon</option>
                            <option>Absent du Domicile</option>
                            <option>Non Réponse</option>
                            <option>Moins de 15ans</option>
                            <option>Injoignable</option>
                            <option>Faux Num</option>
                            <option>Foyer En voyage</option>
                            <option>Pas un membre du foyer</option>
                            <option>Refus</option>
                            <option>Pas Disponible/Prendre un rendez-vous</option>
                        </select>
                    </div>
                    <Button label="Submit" icon="pi pi-check" class="p-button-success submit-button"
                        @click="handleSubmitWithReason" />
                </div>


            </div>
        </main>

        <!-- Right Sidebar - Progress -->
        <aside class="dashboard-sidebar-right">

            <div class="sidebar-content">

                <h2 class="sidebar-title">Progress</h2>

                <!-- Foyer Section -->
                <div class="progress-section" :class="getSectionStatus('foyer')">
                    <div class="section-header" @click="toggleSection('foyer')">
                        <i class="pi pi-home"></i>
                        <span>Foyer Information</span>
                        <i v-if="progress.foyer" class="pi pi-check-circle status-icon"></i>
                    </div>

                    <div v-show="currentSection === 'foyer'" class="section-content">
                        <div class="info-group">
                            <div class="info-row">
                                <span class="info-label">Répondant:</span>
                                <span class="info-value">{{ formData.interlocuteur_nom || "Non spécifié" }}</span>
                            </div>
                            <div class="info-row">
                                <span class="info-label">Numéro Touche:</span>
                                <span class="info-value">{{ formData.interlocuteur_touche || "Non spécifié" }}</span>
                            </div>
                        </div>

                        <!-- Postes Summary -->

                        <div class="info-card">
                            <h3 class="info-card-title">
                                <i class="pi pi-desktop"></i>
                                Poste Information
                            </h3>
                            <div class="info-card-content">
                                <div class="info-row">
                                    <span class="info-label">Total Postes:</span>
                                    <span class="info-value">{{ formData.postes.length }}</span>
                                </div>
                                <div class="postes-list">
                                    <div v-for="poste in postesDisplay" :key="poste.id_poste" class="poste-item">
                                        <div class="poste-header">Poste {{ poste.num_poste }}</div>
                                        <div class="poste-details">
                                            <span>État: {{ poste.etat || "N/A" }}</span>
                                            <span>Activité: {{ poste.activite || "N/A" }}</span>
                                            <span>Chaîne: {{ poste.chaine || "N/A" }}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>



                        <div class="answers-card">
                            <h3 class="info-card-title">
                                <i class="pi pi-list"></i>
                                Réponses
                            </h3>
                            <div class="answers-content">
                                <template v-for="(answer, id) in filteredAnswers" :key="id">
                                    <div class="answer-item" @click="navigateToQuestion(id)">
                                        <span class="answer-question">{{ answer.question }}</span>
                                        <span class="answer-value">{{ answer.answer }}</span>
                                    </div>
                                </template>
                            </div>
                        </div>


                    </div>
                </div>

                <!-- Individu Section -->
                <div class="progress-section" :class="getSectionStatus('individu')">
                    <div class="section-header" @click="toggleSection('individu')">
                        <i class="pi pi-users"></i>
                        <span>Individu Information</span>
                        <i v-if="progress.individu" class="pi pi-check-circle status-icon"></i>
                    </div>

                    <div v-show="currentSection === 'individu'" class="section-content">
                        <div class="members-list">
                            <div v-for="member in filteredMembers" :key="member.id_indiv" class="member-item">
                                <div class="member-header">
                                    <span>{{ member.nom }} {{ member.prenom }}</span>
                                    <span class="member-age">{{ member.age }} ans</span>
                                </div>
                                <div class="member-details">
                                    <span>Touche: {{ member.num_touche || 'Non spécifié' }}</span>
                                    <span>{{ member.activite || 'Activité non spécifiée' }}</span>
                                </div>
                            </div>
                        </div>
                        <div class="info-card">
                            <h3 class="info-card-title">
                                <i class="pi pi-users"></i>
                                Invités
                            </h3>
                            <div class="info-card-content">
                                <div v-if="answers['7']" class="guests-list">
                                    <div v-if="formData.invites && formData.invites.length > 0">
                                        <div v-for="(guest, index) in formData.invites" :key="index" class="guest-item">

                                            <div class="guest-header">
                                                <span class="guest-name">{{ guest.prenom || 'Sans nom' }}</span>
                                                <span class="guest-age">{{ guest.age || 'Age non spécifié' }}</span>
                                            </div>
                                            <div class="guest-details">
                                                <span>Sexe: {{ guest.sex || 'Non spécifié' }}</span>
                                                <span>TV: {{ getEmplacementLabel(guest.emplacement_TV) }}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div v-else class="no-guests">
                                        Aucun invité ajouté
                                    </div>
                                </div>
                                <div v-else class="no-answer">
                                    Pas d'information sur les invités
                                </div>
                            </div>
                        </div>


                    </div>
                </div>
            </div>
        </aside>




    </div>
</template>

<script setup>
import { ref, onMounted, computed, watch, reactive } from 'vue';
import axios from 'axios';
import { useToast } from 'primevue/usetoast';
import QuestionComponent from '../components/QuestionComponent.vue';
import NewInfoSection from '../components/NewInfo.vue';
import DynamicTable from "../components/DynamicTable.vue";
import ConfirmDialog from 'primevue/confirmdialog';
import Tabs from 'primevue/tabs';
import TabList from 'primevue/tablist';
import Tab from 'primevue/tab';
import TabPanels from 'primevue/tabpanels';
import TabPanel from 'primevue/tabpanel';
import DatePicker from 'primevue/datepicker';
import Card from 'primevue/card';
import Button from 'primevue/button';
import FoyerList from '@/components/FoyerList.vue';
import AgentStatsDrawer from '@/components/AgentStatsDrawer.vue';
import Accueil from '@/components/Accueil.vue';
import 'primeicons/primeicons.css'

import Banner from '@/components/Banner.vue';
import ConsoleWeb from '@/components/consoleWeb.vue';
const agent = ref(null); // Initialize as a reactive variable
const storedAgentId = localStorage.getItem('agentId');
agent.value = String(storedAgentId)
console.log('agent', agent.value)
const surveyResponses = ref([]);
const selectedMembers = ref([]);

onMounted(() => {
    if (storedAgentId) {
        // Update the reactive variable
    } else {
        console.error('Agent ID not found in localStorage.');
        window.location.href = '/login'; // Redirect if missing
    }
});



const visible = ref(false);

// Initialize useToast
const toast = useToast();
const scheduleVisible = ref(false);

// Reactive References
const foyerId = ref("");
const foyerData = ref({});
const filteredMembers = ref([]);
const filteredPostes = ref([]);
const questionsTree = ref({});
const consoTree = ref({});
const answers = ref({});
const formData = ref({
    no_foyer: foyerData.no_foyer,
    interlocuteur_nom: "",
    interlocuteur_touche: 0,
    taille_foyer: foyerData.taille_foyer,
    start_time: null,
    end_time: null,
    status: 0,
    refus_motif: "",
    rendezvous_details: null,
    individus: [],
    postes: [],
    invites: [],
    consoleWeb: [],
    new_info: {
        no_foyer: null,
        Nouvel_equipement: "",
        Nouvelle_addresse: "",
        Nouveau_numTel: "",
        Commentaire: "",
        Commentaire_facultatif: "",
    },
    agent: agent.value,
    day: new Date().toISOString().split("T")[0], // Initializes with today's date in YYYY-MM-DD format
    dynamic_answers: [],
});

// Update agent in formData when prop changes

const agentStats = ref(null);
const fetchAgentStats = async () => {
    try {
        if (agent) {
            // Get today's date in YYYY-MM-DD format
            const today = new Date().toISOString().split("T")[0];

            // Fetch all agent stats
            const response = await axios.get("http://127.0.0.1:8000/agent/agents-stats");
            const data = response.data.filter((a) => a.agent_id === agent.value && a.day === today);

            if (data.length > 0) {
                // Aggregate the data for today's stats
                const aggregatedStats = data.reduce(
                    (acc, stat) => {
                        // Merge completed_by_taille dictionaries
                        const mergedCompletedByTaille = { ...acc.completed_by_taille };
                        for (const [taille, count] of Object.entries(stat.completed_by_taille || {})) {
                            mergedCompletedByTaille[taille] = (mergedCompletedByTaille[taille] || 0) + count;
                        }

                        return {
                            ...acc,
                            total_foyers: acc.total_foyers + stat.total_foyers,
                            completed_calls: acc.completed_calls + stat.completed_calls,
                            rendezvous_calls: acc.rendezvous_calls + stat.rendezvous_calls,
                            unreached_calls: acc.unreached_calls + stat.unreached_calls,
                            rejected_calls: acc.rejected_calls + stat.rejected_calls,
                            completed_by_taille: mergedCompletedByTaille,
                        };
                    },
                    {
                        agent_id: agent.value,
                        day: today,
                        total_foyers: 0,
                        completed_calls: 0,
                        rendezvous_calls: 0,
                        unreached_calls: 0,
                        rejected_calls: 0,
                        completed_by_taille: {}, // Initialize as an empty object
                    }
                );

                agentStats.value = aggregatedStats;
            } else {
                // If no stats are found for today
                agentStats.value = {
                    agent_id: agent.value,
                    day: today,
                    total_foyers: 0,
                    completed_calls: 0,
                    rendezvous_calls: 0,
                    unreached_calls: 0,
                    rejected_calls: 0,
                    completed_by_taille: {}, // Default as empty object
                };
            }

            // Fetch upcoming rendezvous
            const rendezvousResponse = await axios.get(`http://127.0.0.1:8000/agents/${agent.value}/upcoming_rendezvous`);
            agentStats.value.upcoming_rendezvous = rendezvousResponse.data;
        }
    } catch (err) {
        console.error("Error fetching agent stats:", err.message);
        error.value = "Failed to fetch agent stats. Please try again later.";
    }
};

// Fetch stats on component mount and when the drawer becomes visible
onMounted(fetchAgentStats);
watch(visible, (newValue) => {
    if (newValue) {
        fetchAgentStats();
    }
});






// Form Controls
const isUnavailable = ref(false);
const unavailableReason = ref('');
const appointment = ref({ date: null });
const isTelVisible = ref(false);
const isMobileVisible = ref(false);
const loading = ref(null);
// Tabs Control
const activeTab = ref('0');
const error = ref(null);

// Progress Tracking
const currentSection = ref("");
const progress = ref({
    foyer: false,
    individu: false,
    poste: false,
    invite: false,
});
const updateMembersActivity = (activity) => {
    // Update the activity for all members
    filteredMembers.value = filteredMembers.value.map((member) => ({
        ...member,
        activite: activity,
    }));

};
const setStartTime = () => {
    formData.value.start_time = new Date().toISOString();
    console.log("start", formData.value.start_time);
};

// Method to capture end time
const setEndTime = () => {
    formData.value.end_time = new Date().toISOString();
    console.log("fin", formData.value.end_time);

};
// Columns for Individuals Table
const individuColumns = ref([
    { field: "nom", header: "Nom", placeholder: "Enter Nom", editable: false },
    { field: "prenom", header: "Prénom", placeholder: "Enter Prénom", editable: false },
    { field: "age", header: "Age", placeholder: "Enter Age", editable: false },
    { field: "num_touche", header: "Touche", placeholder: "Enter Num Touche", editable: true },

]);

// Info Rows for Additional Information
const infoRows = ref([
    { information: "Nouvel équipement", detail: "" },
    { information: "Nouvelle adresse", detail: "" },
    { information: "Nouveau N° téléphone", detail: "" },
    { information: "Commentaires", detail: "" },
    { information: "Commentaire facultatif", detail: "" },

]);
watch(infoRows, (newVal) => {
}, { deep: true });
const emplacementOptions = [
    { label: "Séjour", value: 1 },
    { label: "Salon", value: 3 },
    { label: "Chambre à coucher", value: 4 },
    { label: "Autre chambre", value: 5 },
    { label: "Cuisine", value: 7 },
    { label: "Supprimé", value: 9 },
    { label: "Sorti", value: 10 },
    { label: "Absent", value: 11 },

];
const getEmplacementLabel = (value) => {
    const option = emplacementOptions.find((opt) => opt.value === value);
    return option ? option.label : "Non spécifié";
};

watch(unavailableReason, async (newReason) => {

    if (newReason) {
        formData.value.end_time = new Date().toISOString();

        console.log("Submitting with reason:", newReason, formData.end_time);
        //await handleSubmitAndPost(3, newReason); // Submit the form for other reasons
    } else {
        console.warn("No reason selected");
    }
});
const handleSubmitWithReason = async () => {
    if (!unavailableReason.value) {
        console.warn("No reason selected");
        return;
    }

    const status =
        unavailableReason.value === "Abondon" || unavailableReason.value === "Refus"
            ? 3
            : 4;

    console.log("Submitting with status:", status, "and reason:", unavailableReason.value);
    await handleSubmitAndPost(status, unavailableReason.value);
};


// Watch `foyerId` to Fetch Foyer Data and Reset Progress
watch(
    foyerId,
    async (newFoyerId, oldFoyerId) => {
        if (newFoyerId !== oldFoyerId) {
            resetProgress();
            updateProgressSidebar();
            resetFormData();


            if (newFoyerId) {
                await fetchFoyerData(); // Fetch data for the new foyer
            }
        }
    }
);

const filteredAnswers = computed(() => {
    return Object.entries(answers.value)
        .filter(([id]) => id !== '1' && id !== '2' && id !== '7')
        .reduce((acc, [id, value]) => {
            acc[id] = value;
            return acc;
        }, {});
});
watch(
    () => formData.postes,
    (newPostes) => {
    },
    { deep: true }
);

const navigateToQuestion = (questionId) => {
    // Implementation for navigating to specific question
    // This would involve finding the correct tab and scrolling to the question
    const questionElement = document.querySelector(`[data-question-id="${questionId}"]`);
    if (questionElement) {
        questionElement.scrollIntoView({ behavior: 'smooth' });
    }
};
const handleScheduleConfirm = () => {
    if (appointment.value.date) {
        formData.value.start_time = new Date().toISOString();

        confirmAndScheduleRendezvous();
    } else {
        toast.add({
            severity: 'warn',
            summary: 'Warning',
            detail: 'Please select a date and time',
            life: 3000
        });
    }
};


// Reset Progress Tracking
const resetProgress = () => {
    progress.value = {
        foyer: false,
        individu: false,
        poste: false,
        invite: false,
    };
    currentSection.value = "foyer";
    activeTab.value = '0';
};
// Method to switch between tabs
const goToTab = (tabValue) => {
    activeTab.value = tabValue; // Update the activeTab ref
};

// Fetch Foyer Data Based on Selected foyerId
const fetchFoyerData = async () => {
    if (!foyerId.value) {
        console.log("No foyerId set. Exiting fetchFoyerData.");
        return;
    }

    try {
        loading.value = true;
        error.value = null;

        // Fetch Foyer Details
        const foyerResponse = await axios.get(`http://127.0.0.1:8000/foyers/${foyerId.value}`);
        foyerData.value = foyerResponse.data;

        // Fetch Related Members
        const membresResponse = await axios.get(`http://127.0.0.1:8000/membres/${foyerId.value}`);
        filteredMembers.value = membresResponse.data;

        // Fetch Postes related to the foyer
        const postesResponse = await axios.get(`http://127.0.0.1:8000/postes/${foyerId.value}`);
        filteredPostes.value = postesResponse.data;

        // Fetch questions tree
        const questionsResponse = await axios.get('http://127.0.0.1:8000/questions-tree');
        questionsTree.value = reactive(questionsResponse.data);
        const consoResponse = await axios.get('http://127.0.0.1:8000/consoleTree');
        consoTree.value = reactive(consoResponse.data);
        console.log('consoweb', consoTree)
        // Update Form Data
        formData.value.no_foyer = foyerId.value;
        formData.value.new_info.no_foyer = foyerId.value;
    } catch (err) {
        error.value = err.message || "Failed to fetch foyer data";
        toast.add({ severity: 'error', summary: 'Error', detail: error.value, life: 3000 });
        console.error("Error fetching foyer data:", error.value);
    } finally {
        loading.value = false;
    }
};
const handleTVStateChange = (newState) => {
    if (["OFF", "Supprimé", "En panne"].includes(newState)) {
        // Set "Ne Regarde Pas TV" when TV is inactive
        filteredMembers.value = filteredMembers.value.map((member) => ({
            ...member,
            activite: "Ne Regarde Pas TV",
        }));
    } else if (newState === "ON") {
        // Reset "activite" when TV is active
        filteredMembers.value = filteredMembers.value.map((member) => ({
            ...member,
            activite: "", // Reset or set to a default value when TV is ON
        }));
    } else {
        console.warn("Unhandled TV state:", newState);
    }
};


// Handle Foyer Selection (Triggered by FoyerList Component)
const handleFoyerSelection = async (selectedFoyerId) => {
    console.log(`Selected Foyer ID: ${selectedFoyerId}`);
    foyerId.value = selectedFoyerId;
    formData.value.no_foyer = selectedFoyerId;

    // Fetch data for the selected foyer
    await fetchFoyerData();
};

// Handle Individual Updates
const handleIndividuUpdate = (updatedIndividus) => {
    // Ensure updatedIndividus is an array
    const individusArray = Array.isArray(updatedIndividus) ? updatedIndividus : [updatedIndividus];

    formData.value.individus = individusArray.map((indiv) => ({
        id_indiv: indiv.id_indiv || 0,
        no_foyer: indiv.no_foyer || formData.value.no_foyer,
        chef_menage: indiv.chef_menage || false,
        nom: indiv.nom || "",
        prenom: indiv.prenom || "",
        num_touche: parseInt(indiv.num_touche) || 0,
        age: parseInt(indiv.age) || 0,
        statut: indiv.statut || "",
        activite: indiv.activite || "",
        emplacement: indiv.emplacement || "",
    }));

};

// Set Answers for Dynamic Questions

const setAnswer = ({ id_qst, question, answer }) => {
    if (id_qst === "2") { // Replace `postesQuestionId` with the actual ID of the postes question
        formData.value.postes = answer; // Assign the postes data to formData
        console.log("Updated postes in formData1:", formData.value.postes);
    } else {
        answers.value[id_qst] = { question, answer };
        // Update dynamic_answers in formData
        const existingIndex = formData.value.dynamic_answers.findIndex((item) => item.id === id_qst);
        if (existingIndex !== -1) {
            // Update existing question
            formData.value.dynamic_answers[existingIndex] = { id_qst, question, answer };
        } else {
            // Add new question
            formData.value.dynamic_answers.push({ id_qst, question, answer });
        }
    }
};
const updateNewInfoData = (updatedNewInfo) => {
    console.log("Received updatedNewInfo:", updatedNewInfo);

    formData.value.new_info = {
        no_foyer: formData.value.no_foyer,
        Nouvel_equipement: updatedNewInfo[0]?.detail || "",
        Nouvelle_addresse: updatedNewInfo[1]?.detail || "",
        Nouveau_numTel: updatedNewInfo[2]?.detail || "",
        Commentaire: updatedNewInfo[3]?.comportement || "",
        Commentaire_facultatif: updatedNewInfo[4]?.detail || "", // Ensure mapping for "Commentaire facultatif"
    };

    console.log("Updated formData.new_info:", formData.value.new_info);
};


// Toggle Client Availability
const setClientUnavailable = () => {
    isUnavailable.value = !isUnavailable.value;
    formData.value.start_time = new Date().toISOString();

    if (!isUnavailable.value) {
        // Reset reason and status when toggling off
        unavailableReason.value = '';
        formData.value.status = 0;
    }
};

// Mark a section as complete
const areAllFieldsAnswered = (section) => {
    let missingFields = [];

    switch (section) {
        case "foyer":
            // Check main questions excluding question 2 (postes) and its children
            questionsTree.value.permanentChildren.forEach((child) => {
                if (child.id !== '2' && child.id !== '7' && (!answers.value[child.id] || answers.value[child.id].answer === "")) {
                    missingFields.push(child.question);
                }
            });

            // Debugging logs
            console.log("Type of formData.value.postes:", typeof formData.value.postes);
            console.log("Is formData.value.postes an array?", Array.isArray(formData.value.postes));
            console.log("Postes content:", formData.value.postes);

            // Check if postes data is properly filled
            if (Array.isArray(formData.value.postes) && formData.value.postes.length > 0) {
                formData.value.postes.forEach((poste, index) => {
                    if (!poste.activite || !poste.etat) {
                        missingFields.push(`Poste ${index + 1} - Information incomplète`);
                    }
                });
            } else {
                missingFields.push("Information des postes TV");
            }

            // Check if interlocuteur is specified
            if (!formData.value.interlocuteur_nom || !formData.value.interlocuteur_touche) {
                missingFields.push("Information du répondant");
            }
            break;

        case "individu":
            // Check if members data is properly filled
            if (filteredMembers.value.length === 0) {
                missingFields.push("Information des membres");
            } else {
                filteredMembers.value.forEach((member, index) => {
                    if (!member.num_touche || member.num_touche === 0) {
                        missingFields.push(`Membre ${member.nom} - Numéro touche manquant`);
                    }
                    if (!member.activite) {
                        missingFields.push(`Membre ${member.nom} - Activité manquante`);
                    }
                });
            }

            // Check question 7 if it exists
            const question7 = questionsTree.value.permanentChildren.find((child) => child.id === '7');
            if (question7 && (!answers.value['7'] || answers.value['7'].answer === "")) {
                missingFields.push(question7.question);
            }
            break;
    }

    return missingFields;
};



const markAsComplete = (section) => {
    const missingFields = areAllFieldsAnswered(section);

    if (missingFields.length > 0) {
        toast.add({
            severity: 'warn',
            summary: 'Section Incomplète',
            detail: `Veuillez compléter les champs suivants: ${missingFields.join(", ")}`,
            life: 5000,
        });
        return false;
    }

    // Mark the section as complete
    progress.value[section] = true;

    // Move to next section
    const sections = ["foyer", "individu"];
    const currentIndex = sections.indexOf(section);
    if (currentIndex >= 0 && currentIndex <= sections.length - 1) {
        console.log('index', currentIndex, sections.length - 1);
        currentSection.value = sections[currentIndex + 1];
        activeTab.value = (currentIndex + 1).toString();
    }

    return true;
};
const postesDisplay = computed(() => {
    return formData.value.postes.length > 0 ? formData.value.postes : filteredPostes.value;
});
const getSectionStatus = (section) => {
    if (progress.value[section]) {
        return 'completed';
    }
    if (section === currentSection.value) {
        return 'current';
    }
    return 'pending';
};
// Expand a section

const toggleSection = (section) => {
    currentSection.value = currentSection.value === section ? '' : section;
};

// Toggle Visibility of Tel
const toggleTelVisibility = () => {
    isTelVisible.value = !isTelVisible.value;
};

// Toggle Visibility of Mobile
const toggleMobileVisibility = () => {
    isMobileVisible.value = !isMobileVisible.value;
};

// Confirm and Schedule Rendezvous
const confirmAndScheduleRendezvous = () => {
    if (!appointment.value.date) {
        // Show a warning if no date is selected
        toast.add({
            severity: 'warn',
            summary: 'Warning',
            detail: 'Please select a date and time for the rendez-vous',
            life: 3000
        });
        return;
    }

    // Update the formData with rendezvous details and set the status to 2
    formData.value.rendezvous_details = appointment.value.date.toISOString(); // Format the date in ISO format
    formData.value.status = 2; // Status set to 2 for rendez-vous scheduled
    formData.value.end_time = new Date().toISOString();

    console.log("Updated formData with rendez-vous:", formData.value);

    // Call handleSubmitAndPost to save the changes
    handleSubmitAndPost(formData.value.status)
        .then(() => {
            // Show success notification
            toast.add({
                severity: 'success',
                summary: 'Rendez-vous Scheduled',
                detail: `Rendez-vous set for ${new Date(formData.value.rendezvous_details).toLocaleString()}`,
                life: 3000
            });

            scheduleVisible.value = false; // Assuming this controls the visibility of the rendezvous modal
        })
        .catch((error) => {
            // Show error notification
            toast.add({
                severity: 'error',
                summary: 'Error',
                detail: 'Failed to schedule rendez-vous. Please try again.',
                life: 3000
            });
            console.error("Error during submission:", error);
        });
};


const handleSubmitAndPost = async (status, reason = "") => {
    try {
        formData.value.agent = String(agent.value); // Ensure agent is an integer
        formData.value.status = status;
        formData.value.refus_motif = reason;
        formData.value.day = new Date().toISOString().split("T")[0];
        formData.value.taille_foyer = foyerData.value.taille_foyer;

        const formattedData = validateAndFormatFormData(formData.value);
        console.log("Formatted Data Sent to Backend:", JSON.stringify(formattedData, null, 2));

        const response = await axios.post("http://127.0.0.1:8000/submit", formattedData);
        console.log('submitted', formattedData);
        console.log("Form submitted successfully:", response.data);
        resetProgress();
        updateProgressSidebar();
        resetFormData();
        isUnavailable.value = false; // Reset isUnavailable to false

        toast.add({
            severity: "success",
            summary: "Succès",
            detail: "Formulaire soumis avec succès.",
            life: 3000,
        });
        window.location.href = "/form";

    } catch (error) {
        console.error("Submission error:", error.response?.data || error.message);
        toast.add({
            severity: "error",
            summary: "Erreur",
            detail: "Échec de la soumission. Veuillez réessayer.",
            life: 3000,
        });
    }
};

const validateAndFormatFormData = (data) => {
    console.log("formData.taille_foyer:", data.taille_foyer);

    return {
        ...data,
        dynamic_answers: data.dynamic_answers.map(({ id_qst, question, answer }) => ({
            id_qst,
            question: String(question || ""),
            answer: String(answer || ""),
        })),
        no_foyer: parseInt(data.no_foyer) || 0,
        interlocuteur_nom: String(data.interlocuteur_nom || ""),
        taille_foyer: parseInt(data.taille_foyer),
        start_time: data.start_time ? new Date(data.start_time).toISOString() : null,
        end_time: data.end_time ? new Date(data.end_time).toISOString() : null,
        status: parseInt(data.status) || 0,
        refus_motif: String(data.refus_motif || ""),
        rendezvous_details: data.rendezvous_details ? new Date(data.rendezvous_details).toISOString() : null,
        individus: (data.individus || []).map((indiv) => ({
            id_indiv: parseInt(indiv.id_indiv) || 0,
            no_foyer: parseInt(data.no_foyer) || 0,
            chef_menage: Boolean(indiv.chef_menage),
            nom: String(indiv.nom || ""),
            prenom: String(indiv.prenom || ""),
            num_touche: parseInt(indiv.num_touche) || 0,
            age: parseInt(indiv.age) || 0,
            statut: String(indiv.statut || ""),
            activite: String(indiv.activite || ""),
            emplacement: String(indiv.emplacement || ""),
        })),
        invites: (data.invites || []).map((invite) => ({
            no_foyer: parseInt(invite.no_foyer) || 0,
            prenom: String(invite.prenom || ""),
            age: String(invite.age || ""),
            sex: String(invite.sex || ""),
            emplacement_TV: String(invite.emplacement_TV || ""),
        })),
        postes: Array.isArray(data.postes)
            ? data.postes.map((poste) => ({
                no_foyer: parseInt(data.no_foyer) || 0,
                id_poste: parseInt(poste.id_poste) || 0,
                num_poste: parseInt(poste.num_poste) || 0,
                emplacement: String(poste.emplacement || ""),
                emplacement_actuel: String(poste.emplacement_actuel || ""),
                etat: String(poste.etat || ""),
                activite: String(poste.activite || ""),
                chaine: String(poste.chaine || ""),
            }))
            : [], // Fallback to an empty array if postes is invalid
        new_info: {
            no_foyer: parseInt(data.no_foyer) || 0,
            Nouvel_equipement: String(data.new_info.Nouvel_equipement || ""),
            Nouvelle_addresse: String(data.new_info.Nouvelle_addresse || ""),
            Nouveau_numTel: String(data.new_info.Nouveau_numTel || ""),
            Commentaire: String(data.new_info.Commentaire || ""),
            Commentaire_facultatif: String(data.new_info.Commentaire_facultatif || ""),

        },
        agent: String(agent.value),
    };
};
const resetFormData = () => {
    Object.assign(formData.value, {
        start_time: null,
        end_time: null,
        interlocuteur_nom: '',
        interlocuteur_touche: '',
        postes: [],
        invites: [],
        dynamic_answers: [],
        individus: [],
        new_info: []
    });
};

const updateProgressSidebar = () => {



    // Update postes
    filteredPostes.value = formData.value.postes;

    // Update dynamic answers
    formData.value.dynamic_answers.forEach(({ id_qst, question, answer }) => {
        answers.value[id_qst] = { question, answer };
    });

    // Update members
    filteredMembers.value = formData.value.individus;



    // Force reactivity update
    answers.value = {};
    filteredPostes.value = [];
    filteredMembers.value = [];
};


</script>

<style scoped>
.progress-section {
    background: white;
    border-radius: 0.75rem;
    margin-bottom: 1rem;
    border: 1px solid #e2e8f0;
    transition: all 0.2s ease;
}

.progress-section.completed {
    border-color: #22c55e;
}

.progress-section.current {
    border-color: #3b82f6;
    box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.1);
}

.section-header {
    display: flex;
    align-items: center;
    padding: 1rem;
    cursor: pointer;
    gap: 0.5rem;
    background: #f8fafc;
    border-radius: 0.75rem 0.75rem 0 0;
}

.section-header i {
    color: #64748b;
}

.status-icon {
    margin-left: auto;
    color: #22c55e;
}

.section-content {
    padding: 1rem;
    border-top: 1px solid #e2e8f0;
}

.time-controls {
    display: flex;
    gap: 0.75rem;
    justify-content: flex-start;
    margin-top: 1rem;
    padding-top: 1rem;
    border-top: 1px solid #f1f5f9;
}

.time-button,
.schedule-button,
.unavailable-button {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    padding: 0.625rem;
    font-size: 0.875rem;
    color: #64748b;
    background-color: #f8fafc;
    border: 1px solid #e2e8f0;
    border-radius: 0.5rem;
    cursor: pointer;
    transition: all 0.2s;
    min-width: 150px;
}

.time-set {
    background-color: #e5f2ff;
    border-color: #93c5fd;
    color: #0ea5e9;
}

.time-button {
    flex: 0 1 200px;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    padding: 0.625rem;
    font-size: 0.875rem;
    color: #64748b;
    background-color: #f8fafc;
    border: 1px solid #e2e8f0;
    border-radius: 0.5rem;
    cursor: pointer;
    transition: all 0.2s;
}

.time-set {
    background-color: #e5f2ff;
    border-color: #93c5fd;
    color: #0ea5e9;
}

.form-disabled {
    opacity: 0.7;
    pointer-events: none;
}

.form-disabled input,
.form-disabled select,
.form-disabled button {
    pointer-events: none;
}

.time-button.time-set {
    background: #22c55e;
    color: white;
    border-color: #22c55e;
}

.postes-list,
.members-list {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
}

.poste-item,
.member-item {
    background: #f8fafc;
    border-radius: 0.375rem;
    padding: 0.5rem;
}

.poste-header,
.member-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 0.25rem;
    font-weight: 500;
}

.status-dot {
    width: 0.5rem;
    height: 0.5rem;
    border-radius: 50%;
}

.status-dot.on {
    background: #22c55e;
}

.status-dot.off {
    background: #64748b;
}

.status-dot.sup {
    background: #ef4444;
}

.status-dot.pan {
    background: #f59e0b;
}

.poste-details,
.member-details {
    display: flex;
    flex-direction: column;
    font-size: 0.875rem;
    color: #64748b;
}

.member-age {
    font-size: 0.875rem;
    color: #64748b;
}

.sidebar {
    padding: 1rem;
    background-color: #f9fafb;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.progress-list {
    list-style: none;
    padding: 0;
}

.progress-summary {
    font-weight: bold;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    cursor: pointer;
}

.completed {
    color: green;
}

.expanded-content {
    padding: 1rem;
    background: white;
    margin-top: 0.5rem;
    border: 1px solid #e0e6ef;
    border-radius: 4px;
}

/* Ensure that the icons and text are visible */
.pi-check {
    margin-right: 0.5rem;
}

/* Optional: Add some spacing and styling */
.progress-list li {
    margin-bottom: 1rem;
}

button:hover {
    background-color: #45a049;
}

.unavailable-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1rem;
}


.dashboard-layout {
    display: flex !important;
    min-height: 100vh;
    background-color: #f8f9fa;
    width: 100%;
}

.dashboard-sidebar-left {
    width: 16rem;
    background-color: white;
    border-right: 1px solid #e9ecef;
    flex-shrink: 0;
}

.dashboard-main {
    flex: 1;
    overflow: auto;
    min-width: 0;
    padding: 1.5rem;
}

.dashboard-sidebar-right {
    width: 320px;
    background-color: #f8fafc;
    border-left: 1px solid #e2e8f0;
    overflow-y: auto;
}

.sidebar-content {
    padding: 1.5rem;
}

.section-title {
    font-size: 1.25rem;
    font-weight: 600;
    color: #0f172a;
    margin-bottom: 1.5rem;
}

.info-card {
    background: white;
    border-radius: 0.75rem;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    margin-bottom: 1.5rem;
    overflow: hidden;
}

.info-card-title {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 1rem;
    font-weight: 600;
    color: #1e293b;
    padding: 1rem;
    background-color: #f8fafc;
    border-bottom: 1px solid #e2e8f0;
}

.info-card-content {
    padding: 1rem;
}

.answer-item {
    padding: 0.75rem;
    border-bottom: 1px solid #f1f5f9;
}

.answer-item:last-child {
    border-bottom: none;
}

.answer-question {
    display: block;
    font-size: 0.875rem;
    color: #64748b;
    margin-bottom: 0.25rem;
}

.answer-value {
    display: block;
    font-size: 0.875rem;
    font-weight: 500;
    color: #0f172a;
}

.no-answer {
    color: #64748b;
    font-style: italic;
    padding: 0.75rem;
}

.guests-list {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
}

.guest-item {
    background: #f8fafc;
    border-radius: 0.5rem;
    padding: 0.75rem;
    border: 1px solid #e2e8f0;
}

.guest-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 0.5rem;
}

.sidebar-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 1rem;
    border-bottom: 1px solid #e2e8f0;
}

.menu-button {
    width: 40px;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
}

.company-logo {
    max-width: 58px;
    height: auto;
    object-fit: contain;
}

.sidebar-content {
    flex: 1;
    overflow-y: auto;
    padding: 1rem;
}

.objectives-section {
    margin-top: 1rem;
}

.section-title {
    font-size: 1.25rem;
    font-weight: 600;
    color: #1e293b;
    margin-bottom: 1rem;
}

.guest-name {
    font-weight: 500;
    color: #1e293b;
}

.guest-age {
    color: #64748b;
    font-size: 0.875rem;
}

.guest-details {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
    font-size: 0.875rem;
    color: #64748b;
}

.no-guests {
    color: #64748b;
    font-style: italic;
    padding: 0.75rem;
    text-align: center;
}

:deep(.p-datepicker) {
    background: white;
    border: none;
    border-radius: 0.5rem;
}

:deep(.p-datepicker input) {
    background: transparent;
}

:deep(.p-button-text) {
    border: 1px solid rgba(255, 255, 255, 0.3);
}

:deep(.schedule-dialog) {
    .p-dialog-header {
        display: none;
    }

    .p-dialog-content {
        padding: 0;
        border-radius: 1rem;
    }

    .p-dialog-mask {
        backdrop-filter: blur(4px);
        background-color: rgba(0, 0, 0, 0.1);
    }

    .p-calendar .p-inputtext {
        font-size: 1.125rem;
    }

    .p-button.p-button-text {
        color: #10b981;
    }
}

.info-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.5rem 0;
    border-bottom: 1px solid #f1f5f9;
}

.info-row:last-child {
    border-bottom: none;
}

.info-label {
    font-size: 0.875rem;
    color: #64748b;
}

.info-value {
    font-size: 0.875rem;
    font-weight: 500;
    color: #0f172a;
}



.time-button:hover {
    background-color: #f1f5f9;
    border-color: #cbd5e1;
}

.time-button.time-set {
    background-color: #22c55e;
    border-color: #22c55e;
    color: white;
}

.answers-card {
    background: white;
    border-radius: 0.75rem;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    margin-bottom: 1.5rem;
}

.answers-content {
    padding: 0.5rem;
}

.answer-item {
    padding: 0.75rem;
    border-bottom: 1px solid #f1f5f9;
    cursor: pointer;
    transition: background-color 0.2s;
}

.answer-item:hover {
    background-color: #f8fafc;
}

.answer-item:last-child {
    border-bottom: none;
}

.answer-question {
    display: block;
    font-size: 0.875rem;
    color: #64748b;
    margin-bottom: 0.25rem;
}

.answer-value {
    display: block;
    font-size: 0.875rem;
    font-weight: 500;
    color: #0f172a;
}

.postes-list {
    margin-top: 0.5rem;
}

.poste-item {
    background-color: #f8fafc;
    border-radius: 0.5rem;
    padding: 0.75rem;
    margin-bottom: 0.5rem;
}

.poste-header {
    font-weight: 600;
    color: #0f172a;
    margin-bottom: 0.5rem;
}

.poste-details {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
    font-size: 0.875rem;
    color: #64748b;
}



.actions .p-button {
    padding: 0.5rem 1rem;
    font-size: 0.9rem;
}

:deep(.p-card-body) {
    padding: 1em !important;
    margin: 0 !important;
}

:deep(.p-tabview-panels) {
    padding: 0em !important;
    margin: 0 !important;
}

:deep(.p-datatable) {
    width: 100% !important;
    table-layout: fixed;
    /* Force table to respect the container width */
}

:deep(.p-tabpanels) {
    padding: 0%;
}

:deep(.p-datatable-tbody > tr > td),
:deep(.p-datatable-thead > tr > th) {
    font-size: 1rem;
    /* Reduce font size */
    text-align: center;
    /* Center-align text */
    padding: 0.5em;
    /* Reduce padding */
    white-space: nowrap;
    /* Prevent text wrapping */
    overflow: hidden;
    text-overflow: ellipsis;
}

:deep(.p-datatable-header-cell) {
    padding: 0.5em;
}

:deep(.p-datatable-column-header-content) {
    padding: 0.5em;
}

.sidebar-title {
    font-size: 1.25rem;
    font-weight: 600;
    margin-bottom: 1.5rem;
    color: #1a1a1a;
}

.kpi-grid {
    display: flex;
    flex-direction: column;
    gap: 1rem;
}

.kpi-card {
    background-color: #f8f9fa;
    padding: 1.25rem;
    border-radius: 0.5rem;
    transition: all 0.2s;
}

.kpi-card:hover {
    background-color: #f1f3f5;
}

.kpi-label {
    font-size: 0.875rem;
    color: #6c757d;
    margin-bottom: 0.5rem;
}

.kpi-value {
    font-size: 1.5rem;
    font-weight: 700;
    color: #1a1a1a;
}

.main-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1.5rem;
}

.page-title {
    font-size: 1.5rem;
    font-weight: 700;
    color: #1a1a1a;
}

.header-actions {
    display: flex;
    gap: 0.75rem;
    margin-left: auto;
}


.unavailable-button {
    display: flex;
    align-items: center;
    gap: 0.5rem;
}

.actions {
    display: flex;
    justify-content: space-between;

}


.status-dot {
    width: 0.5rem;
    height: 0.5rem;
    background-color: white;
    border-radius: 50%;
    animation: pulse 2s infinite;
}

.info-card {
    margin-bottom: 1.5rem;
    border-radius: 0.5rem;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.info-grid {
    display: grid;
    grid-template-columns: repeat(6, 1fr);
    gap: 2rem;
}

.info-label {
    font-size: 0.875rem;
    color: #6c757d;
    margin-bottom: 0.25rem;
}

.info-value {
    font-size: 0.875rem;
    font-weight: 500;
    color: #1a1a1a;
}

.tabs-container {
    width: 100%;
    max-width: 64rem;
    margin: 0 auto;
    padding: 0em;
}

.custom-tabview {
    padding: 0px;
}

:deep(.p-tabview-nav) {
    border: none !important;
    padding: 0.5rem !important;
    background-color: #f8f9fa !important;
    border-radius: 0.5rem 0.5rem 0 0 !important;
}

:deep(.p-tab-active) {
    border-color: transparent;
    color: #64748b;
}

.custom-tabview ::v-deep .p-tabview-nav {
    background-color: #f3f4f6;
    border-radius: 0.5rem;
    padding: 0.25rem;
}

.custom-tabview ::v-deep .p-tabview-nav li .p-tabview-nav-link {
    background-color: transparent;
    color: #4b5563;
    border: none;
    border-radius: 0.375rem;
    padding: 0.75rem 1rem;
}

.custom-tabview ::v-deep .p-tabview-nav li.p-highlight .p-tabview-nav-link {
    background-color: #ffffff;
    color: #111827;
}

.form-card {
    background-color: #ffffff;
    border-radius: 0.5rem;
    box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
    border: 1px solid #e5e7eb;
}

.form-content {
    display: flex;
    flex-direction: column;
    padding: 0em important;
}

.form-field {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
}

.form-field label {
    font-size: 0.875rem;
    font-weight: 500;
    color: #374151;
}

.tab-header {
    display: flex;
    align-items: center;
    gap: 0.5rem;
}

#household-info-container {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
    margin-top: 1.5rem;
}

:deep(.p-tabview-nav-link) {
    border: none !important;
    padding: 0.75rem 1rem !important;
    border-radius: 0.375rem !important;
}

:deep(.p-tabview-selected .p-tabview-nav-link) {
    background-color: white !important;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1) !important;
}

.tab-header {
    display: flex;
    align-items: center;
    gap: 0.5rem;
}

.form-card {
    border: none;
    box-shadow: none;
}

.form-content {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
    padding: 0.5rem;
}

.form-field {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
}

.form-field label {
    font-size: 0.875rem;
    font-weight: 500;
    color: #1a1a1a;
}

:deep(.p-inputtext),
:deep(.p-dropdown) {
    border-radius: 0.375rem;
    border-color: #e9ecef;
    padding: 0.625rem;
}

.progress-list {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    margin-bottom: 1.5rem;
}

.progress-item {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.875rem;
}

.progress-item.completed {
    color: #22c55e;
}

.progress-item.pending {
    color: #6c757d;
}

.section-title {
    font-size: 0.875rem;
    font-weight: 600;
    margin-bottom: 1rem;
    color: #1a1a1a;
}

.answers-list {
    font-size: 0.875rem;
    color: #6c757d;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
}

@keyframes pulse {
    0% {
        opacity: 1;
    }

    50% {
        opacity: 0.5;
    }

    100% {
        opacity: 1;
    }
}

.time-controls {
    display: flex;
    gap: 0.75rem;
    justify-content: center;
    margin-top: 1rem;
    padding-top: 1rem;
    border-top: 1px solid #f1f5f9;
}


.time-button {
    background-color: #4CAF50;
    color: white;
    border: none;
    border-radius: 5px;
    padding: 0.5rem 1rem;
    cursor: pointer;
}

.time-button:hover {
    background-color: #45a049;
}

.time-controls span {
    font-size: 0.9rem;
    color: #555;
}

.agent-stats-drawer {
    z-index: 1000;
}

.drawer-content {
    display: flex;
    flex-direction: column;
    height: 100%;
    background-color: #f8fafc;
}

.drawer-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 1rem 1.5rem;
    background-color: white;
    border-bottom: 1px solid #e2e8f0;
}

.drawer-title {
    font-size: 1.25rem;
    font-weight: 600;
    color: #1a1a1a;
}

.close-button {
    width: 2rem !important;
    height: 2rem !important;
    padding: 0 !important;
}

.drawer-body {
    flex: 1;
    padding: 1.5rem;
    overflow-y: auto;
}

.stats-section {
    margin-bottom: 2rem;
}

.stats-title {
    font-size: 1.125rem;
    font-weight: 600;
    color: #1a1a1a;
    margin-bottom: 1rem;
}

.completion-rate {
    margin-bottom: 1.5rem;
}

.completion-rate span {
    display: block;
    margin-bottom: 0.5rem;
    color: #64748b;
}

.progress-bar {
    height: 0.5rem !important;
}

.stats-summary h5 {
    font-size: 1rem;
    font-weight: 600;
    color: #1a1a1a;
    margin-bottom: 1rem;
}

.stats-grid {
    display: grid;
    gap: 1rem;
}

.stat-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.75rem;
    background-color: white;
    border-radius: 0.5rem;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

.stat-label {
    color: #64748b;
    font-size: 0.875rem;
}

.stat-value {
    font-weight: 600;
    color: #1a1a1a;
}

.stat-item.completion {
    background-color: #f1f5f9;
    border: 1px solid #e2e8f0;
}

.rendezvous-section {
    background-color: white;
    padding: 1.5rem;
    border-radius: 0.5rem;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.rendezvous-section h5 {
    font-size: 1rem;
    font-weight: 600;
    color: #1a1a1a;
    margin-bottom: 1rem;
}

.rendezvous-list {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    max-height: 300px;
    overflow-y: auto;
}

.rendezvous-card {
    background-color: #f8fafc;
    padding: 1rem;
    border-radius: 0.375rem;
    border: 1px solid #e2e8f0;
}

.foyer-id {
    font-weight: 500;
    color: #1a1a1a;
    margin-bottom: 0.25rem;
}

.rendezvous-date {
    color: #64748b;
    font-size: 0.875rem;
}

.no-rendezvous {
    color: #64748b;
    text-align: center;
    padding: 1rem;
}

.error-message {
    padding: 1rem;
    color: #ef4444;
    background-color: #fef2f2;
    border-radius: 0.375rem;
    margin: 1rem;
}

/* Ensure the drawer doesn't affect main layout */
:deep(.p-drawer) {
    position: fixed;
}

:deep(.p-drawer-content) {
    box-shadow: 4px 0 8px rgba(0, 0, 0, 0.1);
}

/* Responsive adjustments */
@media (max-width: 768px) {
    .agent-stats-drawer {
        width: 100% !important;
    }
}

.unavailable-reason {
    background: white;
    border-radius: 12px;
    padding: 1.5rem;
    margin-top: 1rem;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
    border: 1px solid #e2e8f0;
    animation: slideDown 0.3s ease-out;
}

.reason-selector {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    margin-bottom: 1.5rem;
}

.reason-selector label {
    font-size: 0.875rem;
    font-weight: 500;
    color: #64748b;
}

.reason-dropdown {
    padding: 0.75rem 1rem;
    border-radius: 8px;
    border: 1px solid #e2e8f0;
    background: #f8fafc;
    font-size: 1rem;
    color: #1e293b;
    transition: all 0.2s ease;
    width: 100%;
    cursor: pointer;
    appearance: none;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%2364748b'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E");
    background-repeat: no-repeat;
    background-position: right 1rem center;
    background-size: 1rem;
    padding-right: 2.5rem;
}

.reason-dropdown:hover {
    border-color: #cbd5e1;
    background-color: #ffffff;
}

.reason-dropdown:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
    background-color: #ffffff;
}

.reason-dropdown option {
    padding: 0.5rem;
    font-size: 1rem;
}

:deep(.submit-button) {
    width: 100%;
    justify-content: center;
    padding: 0.75rem;
    font-weight: 500;
    text-transform: uppercase;
    letter-spacing: 0.025em;
    transition: all 0.2s ease;
}

:deep(.submit-button:hover) {
    transform: translateY(-1px);
    box-shadow: 0 4px 6px -1px rgba(34, 197, 94, 0.2);
}

:deep(.submit-button:active) {
    transform: translateY(0);
}

@keyframes slideDown {
    from {
        opacity: 0;
        transform: translateY(-10px);
    }

    to {
        opacity: 1;
        transform: translateY(0);
    }
}

/* Dark mode support */
:deep(.dark) .unavailable-reason {
    background: #1e293b;
    border-color: #334155;
}

:deep(.dark) .reason-dropdown {
    background-color: #0f172a;
    border-color: #334155;
    color: #e2e8f0;
}

:deep(.dark) .reason-dropdown:hover {
    border-color: #475569;
    background-color: #1e293b;
}

:deep(.dark) .reason-selector label {
    color: #94a3b8;
}

/* Responsive adjustments */
@media (max-width: 640px) {
    .unavailable-reason {
        padding: 1rem;
    }

    .reason-dropdown {
        font-size: 0.875rem;
    }
}
</style>