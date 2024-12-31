<template>

    <!-- Drawer (Agent Dashboard) -->
    <Drawer v-model:visible="visible" position="left" class="assignment-sidebar">
        <template #container="{ closeCallback }">
            <div class="flex flex-column h-full">
                <!-- Header -->
                <div class="flex align-items-center justify-content-between px-4 pt-3 flex-shrink-0">
                    <span class="font-semibold text-2xl text-primary">Agent Dashboard</span>
                    <Button type="button" @click="closeCallback" icon="pi pi-times" rounded outlined
                        class="h-2rem w-2rem" />
                </div>

                <!-- Agent Stats -->
                <div v-if="agentStats" class="p-4 overflow-y-auto flex-grow-1">
                    <!-- Stats Summary -->
                    <div class="mb-6">
                        <h4 class="text-lg font-semibold">Stats Pour Agent {{ agentStats.agent_id }}</h4>
                        <div class="flex items-center mt-2">
                            <span class="mr-2">Taux d'achèvement:</span>
                        </div>
                        <ProgressBar :value="completion_rate" class="w-full" />

                        <div class="mt-4">
                            <h5 class="text-md font-semibold">Résumé</h5>
                            <p><strong>Total Foyers:</strong> {{ agentStats.total_foyers }}</p>
                            <p><strong>Appels Complétés:</strong> {{ agentStats.completed_calls }}</p>
                            <p><strong>Appels Pendants:</strong> {{ agentStats.pending_calls }}</p>
                            <p><strong>Appels Rendez-vous:</strong> {{ agentStats.rendezvous_calls }}</p>
                            <p><strong>Appels Refusés:</strong> {{ agentStats.rejected_calls }}</p>
                            <p class="mt-2">
                                <strong>Taux d'achèvement:</strong> {{ completion_rate.toFixed(2) }}%
                            </p>
                        </div>
                    </div>

                    <!-- Upcoming Rendezvous -->
                    <div>
                        <h5 class="text-md font-semibold">Rendez-vous A venir</h5>
                        <div v-if="agentStats.upcoming_rendezvous && agentStats.upcoming_rendezvous.length"
                            class="rendezvous-list max-h-60 overflow-y-auto mt-2">
                            <div v-for="rendezvous in agentStats.upcoming_rendezvous" :key="rendezvous.no_foyer"
                                class="p-3 bg-white rounded shadow-sm mb-2">
                                <p><strong>Foyer ID:</strong> {{ rendezvous.no_foyer }}</p>
                                <p><strong>Date:</strong> {{ new Date(rendezvous.rendezvous_details).toLocaleString() }}</p>
                            </div>
                        </div>
                        <div v-else class="mt-2">
                            <p class="text-gray-500">No Upcoming Rendezvous</p>
                        </div>
                    </div>
                </div>

                <!-- Error Message -->
                <div v-if="error" class="p-4 text-red-600">
                    {{ error }}
                </div>
            </div>
        </template>
    </Drawer>



    <!-- Main Container -->
    <div class="form-container p-4">
        <div class="flex justify-between items-center mb-4">
            <!-- Left Section: Agent Dashboard and Title -->
            <div class="flex items-center gap-4">
                <Button icon="pi pi-bars" label="Agent Dashboard" @click="visible = true" class="p-button-primary" />

                <h1 class="text-3xl font-bold">Formulaire</h1>
            </div>

            <!-- Right Section: Foyer Indisponible -->
            <div>
                <Button class="p-button-danger custom-button" @click="setClientUnavailable"
                    :class="{ disabled: isUnavailable }">
                    <span class="indicator"></span>
                    Foyer Indisponible
                </Button>
            </div>

        </div>
        <div class="form-container p-4">
            <Toast />

            <ConfirmDialog />
            <div class="flex flex-row">
                <!-- Main Content -->
                <div class="main-content flex-grow-1 pr-4">




                    <div v-if="isUnavailable" class="unavailable-reason flex flex-col gap-4 mt-4">
                        <div class="reason-selector">
                            <label for="reason">Motif d'indisponibilité :</label>
                            <select v-model="unavailableReason" id="reason">
                                <option disabled value="">Select a reason</option>
                                <option>Moins de 15ans</option>
                                <option>Pas un membre du foyer</option>
                                <option>Refus</option>
                                <option>Pas Disponible/Prendre un rendez-vous</option>
                            </select>
                        </div>

                        <div v-if="unavailableReason === 'Pas Disponible/Prendre un rendez-vous'" class="actions">
                            <div>
                                <DatePicker v-model="appointment.date" id="date" class="border rounded-md text-gray-800"
                                    showTime hourFormat="24" showIcon placeholder="Prendre Rendez-Vous" />
                            </div>
                            <Button type="submit" severity="secondary" label="Confirm"
                                @click="confirmAndScheduleRendezvous" />


                        </div>
                    </div>









                    <div v-show="!isUnavailable">
                        <div class="foyer-info-horizontal">
                            <div class="info-item">
                                <span class="label">Foyer ID:</span>
                                <span class="value">{{ foyerId || 'N/A' }}</span>
                            </div>
                            <div class="info-item">
                                <span class="label">Nom:</span>
                                <span class="value">{{ foyerData.nom || 'N/A' }}</span>
                            </div>
                            <div class="info-item">
                                <span class="label">Ville:</span>
                                <span class="value">{{ foyerData.ville || 'N/A' }}</span>
                            </div>

                            <div class="info-item">
                                <span class="label">Adresse:</span>
                                <span class="value">{{ foyerData.adresse || 'N/A' }}</span>
                            </div>
                            <div class="info-item">
                                <span class="label">Taille Foyer:</span>
                                <span class="value">{{ foyerData.taille_foyer || 'N/A' }}</span>
                            </div>
                            <div class="info-item">
                                <span class="label">Tel:</span>
                                <span class="value">{{ foyerData.tel || 'N/A' }}</span>
                            </div>
                            <div class="info-item">
                                <span class="label">Mobile:</span>
                                <span class="value">{{ foyerData.mobile1 || 'N/A' }}</span>
                            </div>
                        </div>



                        <!-- Stepper and form section -->
                        <div class="form-steps">
                            <Stepper v-model:value="activeStep" class="basis-[40rem]">
                                <StepList>
                                    <Step v-slot="{ activateCallback }" :value="1" @click="activateCallback(1)">Foyer
                                    </Step>
                                    <Step v-slot="{ activateCallback }" :value="2" @click="activateCallback(2)">Individu
                                    </Step>
                                    <Step v-slot="{ activateCallback }" :value="3" @click="activateCallback(3)">Console
                                        Web
                                    </Step>
                                    <Step v-slot="{ activateCallback }" :value="4" @click="activateCallback(4)">
                                        Informations
                                        Supplémentaires
                                    </Step>

                                </StepList>
                                <StepPanels class="form-steps">
                                    <!-- Step 1: Foyer -->
                                    <StepPanel v-slot="{ activateCallback }" :value="1" class="w-full">
                                        <Card title="Household Information" icon="pi-home">
                                            <div id="household-info-container">
                                                <!-- Render root question from the tree -->
                                                <div v-if="questionsTree.question">
                                                    <p>{{ questionsTree.question }}</p>
                                                    <!-- Check for type to render appropriately -->
                                                    <template v-if="questionsTree.type === 'boolean'">
                                                        <div class="p-buttonset">
                                                            <Button
                                                                v-for="option in questionsTree.options || ['Yes', 'No']"
                                                                :key="option"
                                                                @click="setAnswer(questionsTree.id, option)"
                                                                size="small">
                                                                {{ option }}
                                                            </Button>
                                                        </div>
                                                        <!-- Show child questions if 'Yes' is selected -->
                                                        <div v-if="answers[questionsTree.id] === 'Yes'">
                                                            <div v-for="child in questionsTree.children['Yes']"
                                                                :key="child.id">
                                                                <QuestionComponent :question="child" :answers="answers"
                                                                    @set-answer="setAnswer" />
                                                            </div>
                                                        </div>
                                                    </template>

                                                    <template v-else-if="questionsTree.type === 'text'">
                                                        <input v-model="answers[questionsTree.id]"
                                                            placeholder="Enter your response"
                                                            @input="updateAnswer(questionsTree.id, answers[questionsTree.id])"
                                                            class="input-text" />
                                                    </template>
                                                    <template v-else-if="questionsTree.type === 'select'">
                                                        <select
                                                            @change="event => updateInterlocuteurNom(event.target.value)"
                                                            placeholder="Membres foyer">
                                                            <option disabled value="">{{ placeholder }}</option>
                                                            <option v-for="member in filteredMembers"
                                                                :key="member.id_indiv" :value="member.id_indiv">
                                                                {{ member.nom + " " + member.prenom }}
                                                            </option>
                                                        </select>



                                                    </template>
                                                </div>

                                                <!-- Render permanent child questions -->
                                                <div v-for="question in questionsTree.permanentChildren"
                                                    :key="question.id">
                                                    <!-- Check for boolean questions with options -->
                                                    <template
                                                        v-if="question.type === 'boolean' && String(question.id) !== '7'">
                                                        <p>{{ question.question }}</p>
                                                        <div class="p-buttonset">
                                                            <Button v-for="option in question.options || ['Yes', 'No']"
                                                                :key="option" @click="setAnswer(question.id, option)"
                                                                size="small">
                                                                {{ option }}
                                                            </Button>
                                                        </div>
                                                        <!-- Render guests table when "Yes" is selected -->
                                                        <div v-if="answers[question.id] === 'Yes'">
                                                            <GuestTable :initialGuests="guests"
                                                                @update-guests="updateGuestData" />
                                                        </div>

                                                    </template>

                                                    <!-- Render child questions for non-boolean questions -->
                                                    <template v-if="question.type === 'number' || question.type === 'special'">
                                                        <QuestionComponent :question="question" :answers="answers"
                                                            @set-answer="setAnswer" />
                                                        <div
                                                            v-if="question.id === '2' && question.children && question.children.length > 0">
                                                            <TVQuestionnaire :postes="filterePostes || []"
                                                                :childOptions="question.children"
                                                                @update-etat="handleEtatChange"                                                                />
                                                        </div>
                                                    </template>
                                                </div>
                                            </div>

                                            <div class="flex pt-6 justify-between">
                                                <Button label="Next" icon="pi pi-arrow-right" iconPos="right"
                                                    @click="activateCallback(2)" />
                                            </div>
                                        </Card>
                                    </StepPanel>


                                    <!-- Step 2: Individu (Multiple Members) -->
                                    <StepPanel v-slot="{ activateCallback }" :value="2" class="w-full">
                                        <Card title="Individu Information" icon="pi-users">
                                            <div class="panel-content">
                                                <template v-if="filteredMembers.length > 0">
                                                    <div class="panel-content">

                                                        <DynamicTable :data="filteredMembers" :columns="individuColumns"
                                                            uniqueKey="indiv_id" @update="handleIndividuUpdate" />

                                                    </div>
                                                </template>

                                                <div v-for="question in questionsTree.permanentChildren"
                                                    :key="question.id">
                                                    <!-- Check for boolean questions with options -->
                                                    <template v-if="question.type === 'boolean' && question.id==7">
                                                        <p>{{ question.question }}</p>
                                                        <div class="p-buttonset">
                                                            <Button v-for="option in question.options || ['Yes', 'No']"
                                                                :key="option" @click="setAnswer(question.id, option)"
                                                                size="small">
                                                                {{ option }}
                                                            </Button>
                                                        </div>
                                                        <!-- Render guests table when "Yes" is selected -->
                                                        <div
                                                            v-if="answers[question.id] === 'Yes' && question.id === '7'">
                                                            <GuestTable :initialGuests="guests"
                                                                @update-guests="updateGuestData" />
                                                        </div>
                                                    </template>
                                                </div>
                                                <div class="actions">
                                                    <Button label="Back" severity="secondary" icon="pi pi-arrow-left"
                                                        @click="activateCallback(1)" />
                                                    <Button label="Next" icon="pi pi-arrow-right" iconPos="right"
                                                        @click="activateCallback(3)" />
                                                </div>
                                            </div>

                                        </Card>
                                    </StepPanel>

                                    <StepPanel v-slot="{ activateCallback }" :value="3" class="w-full">
                                        <Card title="Console Web" icon="pi-users">
                                            <consoleWeb v-model="formData.consoleWeb" />
                                            <div class="actions">
                                                <Button label="Back" severity="secondary" icon="pi pi-arrow-left"
                                                    @click="activateCallback(2)" />
                                                <Button label="Next" icon="pi pi-arrow-right" iconPos="right"
                                                    @click="activateCallback(4)" />
                                            </div>
                                        </Card>
                                    </StepPanel>




                                    <!-- Step 3: Autres / Nouvelles informations. -->
                                    <StepPanel v-slot="{ activateCallback }" :value="4">
                                        <Card title=" Informations Supplémentaires:" icon="pi-id-card"
                                            class="form-steps">
                                            <NewInfoSection :infoRows="infoRows" @update="updateNewInfoData" />
                                            <Button label="Back" severity="secondary" icon="pi pi-arrow-left"
                                                @click="activateCallback(2)" />

                                            <Button label="Submit" icon="pi pi-check" class="p-button-success"
                                                @click="handleSubmitAndMarkAsAnswered" />
                                        </Card>
                                    </StepPanel>



                                </StepPanels>
                            </Stepper>
                        </div>

                        <!-- Side Panel for Submission History and Current Answers -->
                        <div class="sidebar" v-show="!isUnavailable">
                            <h3>Sommaire:</h3>

                            <!-- Foyer Section -->
                            <div class="answer-section">
                                <h4>Foyer</h4>
                                <p><strong>Foyer ID:</strong> {{ foyerId }}</p>
                                <p><strong>Interlocuteur:</strong> {{ formData.interlocuteur_nom || 'Non spécifié' }}
                                </p>
                                <!-- Add other fields as needed -->
                            </div>


                            <!-- Individu Section -->
                            <div class="answer-section">
                                <h4>Individu</h4>
                                <div v-if="filteredMembers.length > 0">
                                    <div v-for="(member, index) in filteredMembers" :key="index"
                                        class="collapsible-section">
                                        <details>
                                            <summary @click="toggleSection('member', index)">
                                                Member {{ index + 1 }} - {{ member.nom || 'Unnamed' }}
                                            </summary>
                                            <div class="expanded-content">
                                                <p><strong>Nom:</strong> {{ member.nom }}</p>
                                                <p><strong>Age:</strong> {{ member.age }}</p>
                                                <p><strong>statut:</strong> {{ member.statut }}</p>
                                                <p><strong>Activité:</strong> {{ member.activite }}</p>

                                            </div>
                                        </details>
                                    </div>
                                </div>
                                <div v-else>
                                    <p>No members found for this foyer.</p>
                                </div>
                            </div>

                            <!-- Poste Section -->
                            <div class="answer-section" v-if="filterePostes.length > 0">
                                <h4>Poste</h4>
                                <div v-for="(poste, index) in filterePostes" :key="index" class="collapsible-section">
                                    <details>
                                        <summary @click="toggleSection('poste', index)">
                                            Poste {{ index + 1 }} - {{ poste.num_poste || 'Unnamed' }}
                                        </summary>
                                        <div class="expanded-content">
                                            <p><strong>Numero:</strong> {{ poste.num_poste }}</p>
                                            <p><strong>Emplacement:</strong> {{ poste.emplacement }}</p>

                                        </div>
                                    </details>
                                </div>
                            </div>




                            <!-- Invité Section -->
                            <div class="answer-section" v-if="guests.length > 0">
                                <h4>Invité</h4>
                                <div v-for="(guest, index) in guests" :key="index" class="collapsible-section">
                                    <details>
                                        <summary @click="toggleSection('guest', index)">
                                            Guest {{ index + 1 }} - {{ guest.name || 'Unnamed' }}
                                        </summary>
                                        <div class="expanded-content">
                                            <p><strong>Name:</strong> {{ guest.name }}</p>
                                            <p><strong>Age:</strong> {{ guest.age }}</p>
                                            <p><strong>Sex:</strong> {{ guest.sex }}</p>
                                            <p><strong>Activity:</strong> {{ guest.activity }}</p>
                                        </div>
                                    </details>
                                </div>
                            </div>
                            <!-- ConsoleWeb Section -->
                            <!-- ConsoleWeb Section -->
                            <div class="answer-section" v-if="formData.consoleWeb && formData.consoleWeb.length > 0">
                                <h4>Console Web Responses</h4>
                                <div v-for="(response, index) in formData.consoleWeb" :key="index"
                                    class="collapsible-section">
                                    <details>
                                        <summary>
                                            {{ findConsoleWebQuestionText(response.question_id) || 'Question ' +
                                                response.question_id }}
                                        </summary>
                                        <div class="expanded-content">
                                            <p><strong>Response:</strong> {{ response.reponse }}</p>
                                        </div>
                                    </details>
                                </div>
                            </div>


                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted, computed, getCurrentInstance, watch, nextTick, toRaw } from 'vue';
import axios, { formToJSON } from 'axios';
import { assignFoyersToAgents } from '../utils/assignment';
import AgentStats from "../components/AgentStats.vue";
import Card from '../components/Card.vue';
import QuestionComponent from '../components/QuestionComponent.vue';
import Stepper from 'primevue/stepper';
import StepList from 'primevue/steplist';
import StepPanels from 'primevue/steppanels';
import Step from 'primevue/step';
import StepPanel from 'primevue/steppanel';
import Button from 'primevue/button';
import 'primeicons/primeicons.css';
import ConfirmDialog from 'primevue/confirmdialog';
import Select from 'primevue/select';
import 'primeflex/primeflex.css';
import TVQuestionnaire from '../components/TVQuestionnaire.vue';
import NewInfoSection from '../components/NewInfo.vue';
import DynamicTable from "../components/DynamicTable.vue";
import Popover from "primevue/popover";
import GuestTable from "../components/GuestTable.vue";
import DatePicker from "primevue/datepicker";
import Toast from 'primevue/toast';
import Drawer from 'primevue/drawer';
import Header from '../components/header.vue'
import ProgressBar from 'primevue/progressbar';
import consoleWeb from '@/components/consoleWeb.vue';
import fillMode from 'tailwindcss-primeui/src/utils/fillMode';
const placeholder = "Membres foyer";
const visible = ref(false);

const error = ref(null);
const op = ref(null); // Popover reference

const isUnavailable = ref(false);
const unavailableReason = ref('');
const activeStep = ref(1);
const questionsTree = ref({}); // Load Foyer and Health questions dynamically
const answers = ref({});
const members = ref([]); // Array to store multiple members
const guests = ref([]); // Array to store multiple guests
const postes = ref([]); // Array to store multiple members
const currentPoste = ref({ chaine: '' });
const filteredMembers = ref([]);
const posteData = ref([]);
const foyerData = ref({});
const loading = ref(null);
const appointment = ref({ date: null });
const currentGuest = ref({ name: '', age: '', sex: '', activity: '' });
const Sex = ref(['Male', 'Femelle'])
const { proxy } = getCurrentInstance();
const infoRows = ref([
    { information: "Nouvel équipement", detail: "" },
    { information: "Nouvelle adresse", detail: "" },
    { information: "Nouveau N° téléphone", detail: "" },
    { information: "Commentaires", detail: "" }, // New Comments field
]);

const individuColumns = ref([
    { field: "nom", header: "Nom", placeholder: "Enter Nom", editable: false },
    { field: "prenom", header: "Prénom", placeholder: "Enter Prénom", editable: false },
    { field: "age", header: "Age", placeholder: "Enter Age", editable: false },
    { field: "num_touche", header: "Num Touche", placeholder: "Enter Num Touche", editable: true },
]);

// Data and component logic
const agentAssignments = ref({});

// Fetch foyers and assign them to agents
const handleEtatChange = (updatedPoste) => {
  if (["OFF", "Supprimé", "En panne"].includes(updatedPoste.etat)) {
    console.log('we are updating it to off ')
    // Update "activite" for all individuals in filteredMembers
    filteredMembers.value = filteredMembers.value.map((member) => ({
      ...member,
      activite: "Ne Regarde Pas TV",
    }));

    console.log("new activite",filteredMembers.value)
  }
};


const props = defineProps({
    foyerId: {
        type: Number,
        required: true,
    },
    agent: {
        type: Number,
        required: true,
    },

});

const { foyerId, agent } = props;

console.log('fetched data', foyerId, agent)








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
        statut: indiv.statut || "", // Adjust type based on your model
        activite: indiv.activite || "",
    }));
};





const handlePosteUpdate = (updatedPostes) => {
  // Check if the TV state requires updating activities
  const requiresUpdate = updatedPostes.some((poste) =>
    ["OFF", "Supprimé", "En panne"].includes(poste.etat)
  );

  if (requiresUpdate) {
    // Update activity for all members in the table
    filteredMembers.value = filteredMembers.value.map((member) => ({
      ...member,
      activite: "Ne Regarde Pas TV",
    }));
  }

  // Update the formData for postes
  const postesArray = Array.isArray(updatedPostes) ? updatedPostes : [updatedPostes];
  formData.value.postes = postesArray.map((poste) => ({
    no_foyer: poste.no_foyer || formData.value.no_foyer,
    id_poste: poste.id_poste || 0,
    num_poste: poste.num_poste || 0,
    emplacement: poste.emplacement || "",
    emplacement_actuel: poste.emplacement_actuel || "",
    etat: poste.etat || "",
    activite: poste.activite || "",
    chaine: poste.chaine || "",
  }));
};





const updateInterlocuteurNom = (selectedId) => {
    console.log("Selected ID:", selectedId);
    const selectedMember = filteredMembers.value.find(member => member.id_indiv === parseInt(selectedId, 10));
    console.log("Selected Member:", selectedMember);

    if (selectedMember) {
        formData.value.interlocuteur_nom = `${selectedMember.nom} ${selectedMember.prenom}`;
        console.log("Updated Interlocuteur Nom:", formData.value.interlocuteur_nom);
    } else {
        formData.value.interlocuteur_nom = "";
    }
};





const updateGuestData = (updatedGuests) => {
    const invitesArray = Array.isArray(updatedGuests) ? updatedGuests : [updatedGuests];

    formData.value.invites = invitesArray.map((guest) => ({
        no_foyer: guest.no_foyer || formData.value.no_foyer,
        nom: guest.nom || "",
        prenom: guest.prenom || "",
        age: parseInt(guest.age) || 0,
        sex: guest.sex || "",
        emplacement: guest.emplacement || "",
    }));
};


const findConsoleWebQuestionText = (questionId) => {
    const traverseTree = (node) => {
        if (parseInt(node.id) === parseInt(questionId)) {
            return node.question;
        }
        if (node.children) {
            for (const childKey in node.children) {
                const result = traverseTree(node.children[childKey]);
                if (result) return result;
            }
        }
        return null;
    };
    return traverseTree(consoleWebTree.value);
};

// Assuming you have access to the consoleTree used in ConsoleWeb
const consoleWebTree = ref(null);

// Fetch the consoleTree (you can reuse the fetchConsoleTree function from your ConsoleWeb component)
const fetchConsoleWebTree = async () => {
    try {
        const response = await axios.get("http://127.0.0.1:8000/consoleTree");
        consoleWebTree.value = response.data;
    } catch (error) {
        console.error("Error fetching consoleWebTree:", error);
    }
};

const updateNewInfoData = (updatedNewInfo) => {
    formData.value.new_info = {
        no_foyer: formData.value.no_foyer,
        Nouvel_equipement: updatedNewInfo[0]?.detail || "",
        Nouvelle_addresse: updatedNewInfo[1]?.detail || "",
        Nouveau_numTel: updatedNewInfo[2]?.detail || "",
        Commentaire: updatedNewInfo[3]?.detail || "",
    };
    console.log("Updated new_info:", formData.value.new_info);

};


const agentStats = ref(null);



// Fetch Agent Stats
const fetchAgentStats = async () => {
    try {
        if (agent) {
            // Fetch all agents' stats
            const response = await axios.get("http://127.0.0.1:8000/admin/agents-stats");
            const data = response.data;
            const currentAgentStats = data.find(a => a.agent_id === agent);

            if (currentAgentStats) {
                agentStats.value = currentAgentStats;
            } else {
                agentStats.value = {
                    agent_id: agent,
                    total_foyers: 0,
                    completed_calls: 0,
                    pending_calls: 0,
                    rendezvous_calls: 0,
                    rejected_calls: 0
                };
            }

            // Now fetch upcoming rendezvous separately
            const rendezvousResponse = await axios.get(`http://127.0.0.1:8000/agents/${agent}/upcoming_rendezvous`);
            agentStats.value.upcoming_rendezvous = rendezvousResponse.data;
        }
    } catch (err) {
        console.error("Error fetching agent stats:", err.message);
        error.value = "Failed to fetch agent stats. Please try again later.";
    }
};

onMounted(fetchAgentStats);

const completion_rate = computed(() => {
    if (!agentStats.value || agentStats.value.total_foyers === 0) return 0.0;
    return (agentStats.value.completed_calls / agentStats.value.total_foyers) * 100;
});




watch(
    () => agentStats.value?.upcoming_rendezvous,
    (rendezvousList) => {
        if (!rendezvousList || rendezvousList.length === 0) {
            return; // Exit if rendezvousList is empty or undefined
        }

        const now = new Date();
        rendezvousList.forEach((rendezvous) => {
            const rendezvousTime = new Date(rendezvous.rendezvous_details);
            const timeDiff = (rendezvousTime - now) / (1000 * 60); // Time in minutes

            if (timeDiff > 0 && timeDiff <= 30) {
                if (proxy?.$toast?.add) {
                    proxy.$toast.add({
                        severity: 'info',
                        summary: 'Upcoming Rendezvous',
                        detail: `Foyer ID: ${rendezvous.no_foyer} at ${rendezvousTime.toLocaleTimeString()}`,
                        life: 10000,
                    });
                } else {
                    console.warn('Toast service is not available.');
                }
            }
        });
    },
    { immediate: true }
);


// Initial Fetch




const updateAnswer = (questionId, value) => {
    nextTick(() => {
        answers.value[questionId] = value;
        console.log(`Answer updated for question ID ${questionId}:`, value);
    });
};



// Close Popover
const closePopover = () => {
    const popover = op.value;
    if (popover) popover.hide();
};

// Confirm Rendezvous
const confirmRendezvous = () => {
    if (!appointment.value.date) {
        // If no date is selected, show a warning
        proxy.$confirm.require({
            message: "Please select a valid date and time for the rendezvous.",
            header: "Error",
            icon: "pi pi-times-circle",
            acceptLabel: "OK",
            rejectVisible: false,
        });
        return;
    }

    console.log("Selected appointment date:", appointment.value.date);

    // Close the popover
    closePopover();

    // Show confirmation dialog
    proxy.$confirm.require({
        message: `Rendezvous scheduled successfully for ${appointment.value.date.toLocaleString()}.`,
        header: "Rendezvous Scheduled",
        icon: "pi pi-check-circle",
        acceptLabel: "OK",
        rejectVisible: false,
        accept: () => {
            console.log("Rendezvous confirmed."); // You can add further actions here if needed
        },
    });
};
const confirmAndScheduleRendezvous = () => {
    confirmRendezvous(); // Existing confirmation logic
    if (appointment.value.date) {
        scheduleRendezvous(appointment.value.date); // Schedule rendezvous only if a date is selected
    }
};

const setAnswer = (questionId, answer) => {
    if (questionId === 'someSpecificField') {
        formData.value.someField = answer; // Update the specific field in formData
    } else {
        answers.value[questionId] = answer; // Keep updating local answers object for dynamic questions
    }
};



const activateCallback = (step) => {
    activeStep.value = step;
    nextTick(() => {
        // Example: Explicit focus only when required
        const firstInput = document.querySelector('.step-panel input');
        if (firstInput) firstInput.focus();
    });
};

const expandedSection = ref({ type: null, index: null });

const toggleSection = (type, index) => {
    if (expandedSection.value.type === type && expandedSection.value.index === index) {
        // Collapse if already expanded
        expandedSection.value = { type: null, index: null };
    } else {
        // Expand the selected section
        expandedSection.value = { type, index };
    }
};



const filterePostes = computed(() => {
    if (posteData.value.length > 0 && foyerId) {
        return posteData.value.filter(poste => poste.no_foyer === foyerId);
    }
    return [];
});




watch(unavailableReason, async (newReason) => {
    console.log("New Reason:", newReason); // Debug the reason selected

    if (newReason === "Pas Disponible/Prendre un rendez-vous") {
        console.log("Schedule Rendez-vous selected. Skipping form submission.");
        return; // Skip form submission
    }

    if (newReason) {
        console.log("Submitting with reason:", newReason);
        await handleSubmitAndPost(3, newReason); // Submit the form for other reasons
    } else {
        console.warn("No reason selected");
    }
});






const fetchFoyerData = async () => {
    try {
        loading.value = true; // Start loading
        error.value = null; // Reset error state

        // Fetch the foyer based on the `foyerId`
        const foyerResponse = await axios.get(`http://127.0.0.1:8000/foyers/${foyerId}`);
        foyerData.value = foyerResponse.data;

        // Fetch related members
        const membresResponse = await axios.get(`http://127.0.0.1:8000/membres/${foyerId}`);
        filteredMembers.value = membresResponse.data;


        const response4 = await axios.get('http://127.0.0.1:8000/poste')
        posteData.value = response4.data

        const response = await axios.get('http://127.0.0.1:8000/questions-tree');
        questionsTree.value = response.data;

    } catch (err) {
        error.value = err.message || "Failed to fetch data";
        console.error("Error fetching data:", error.value);
    } finally {
        loading.value = false; // End loading
    }
};

watch(
    () => foyerId,
    (newVal) => {
        console.log("foyerId updated:", newVal);
        if (newVal) {
            fetchFoyerData(); // Call your API fetch function here
        }
    },
    { immediate: true }
);




const formData = ref({
    no_foyer: foyerId || null,
    interlocuteur_nom: "",
    start_time: new Date().toISOString(),
    end_time: new Date().toISOString(),
    status: 0,
    refus_motif: "",
    rendezvous_details: appointment.value.date,
    individus: [],
    postes: [],
    invites: [],
    consoleWeb: [],
    new_info: {
        no_foyer: foyerId || null,
        Nouvel_equipement: "",
        Nouvelle_addresse: "",
        Nouveau_numTel: "",
        Commentaire: "",
    },
    agent: agent,

});
const validateAndFormatFormData = (data) => {
    return {
        no_foyer: parseInt(data.no_foyer) || 0, // Ensure it's an integer
        interlocuteur_nom: String(data.interlocuteur_nom || ""), // Ensure it's a string
        start_time: new Date(data.start_time).toISOString(), // Ensure ISO string format
        end_time: new Date(data.end_time).toISOString(), // Ensure ISO string format
        status: parseInt(data.status) || 0, // Ensure it's a numeric status (0, 2, 3)
        refus_motif: String(unavailableReason.value || ""),
        rendezvous_details: String(data.rendezvous_details || ""), // Ensure it's a string
        individus: (data.individus || []).map((ind) => ({
            id_indiv: parseInt(ind.id_indiv) || 0,
            no_foyer: parseInt(ind.no_foyer) || 0,
            chef_menage: Boolean(ind.chef_menage),
            nom: String(ind.nom || ""),
            prenom: String(ind.prenom || ""),
            num_touche: parseInt(ind.num_touche) || 0,
            age: parseInt(ind.age) || 0,
            statut: parseInt(ind.statut) || 0,
            activite: String(ind.activite),
        })),
        postes: (data.postes || []).map((poste) => ({
            no_foyer: parseInt(poste.no_foyer) || 0,
            id_poste: parseInt(poste.id_poste) || 0,
            num_poste: parseInt(poste.num_poste) || 0,
            emplacement: String(poste.emplacement || ""),
            emplacement_actuel: String(poste.emplacement_actuel || ""),
            etat: String(poste.etat || ""),
            activite: String(poste.activite || ""),
            chaine: String(poste.chaine || ""),
        })),
        invites: (data.invites || []).map((invite) => ({
            no_foyer: parseInt(invite.no_foyer) || 0,
            nom: String(invite.nom || ""),
            prenom: String(invite.prenom || ""),
            age: parseInt(invite.age) || 0,
            sex: String(invite.sex || ""),
            emplacement: String(invite.emplacement || ""),
        })),
        consoleWeb: Array.isArray(data.consoleWeb) ? [...data.consoleWeb] : [],

        new_info: {
            no_foyer: parseInt(data.new_info.no_foyer) || parseInt(data.no_foyer) || 0, // Default to no_foyer if not set
            Nouvel_equipement: String(data.new_info.Nouvel_equipement || ""),
            Nouvelle_addresse: String(data.new_info.Nouvelle_addresse || ""),
            Nouveau_numTel: String(data.new_info.Nouveau_numTel || ""),
            Commentaire: String(data.new_info.Commentaire || ""),
        },
        agent: parseInt(agent),
    };
};



const markAsAnswered = () => {
    formData.value.status = true;
    formData.value.end_time = new Date().toISOString(); // Set end time to current timestamp
    updateAssignmentStatus();
    // Optionally, trigger any notification or visual update to the user
};
const setClientUnavailable = () => {
    isUnavailable.value = !isUnavailable.value;

    if (!isUnavailable.value) {
        // Reset reason and status when toggling off
        unavailableReason.value = '';
        formData.value.status = 0;
    }

    // No need to handle form submission here; it's already in the watcher
};





const scheduleRendezvous = async (date) => {
    try {
        formData.value.rendezvous_details = date;
        formData.value.refus_motif = unavailableReason.value || "";
        formData.value.end_time = new Date().toISOString();
        formData.value.status = 2; // Set status for scheduled rendezvous

        await handleSubmitAndPost(formData.value.status, unavailableReason.value);
        window.location.href = `/agent-space?agent=${agent}&foyerId=${foyerId}`;
    } catch (error) {
        console.error("Error scheduling rendezvous:", error.message);
        alert("Échec de la planification du rendez-vous. Veuillez réessayer.");
    }
};


const handleSubmitAndPost = async (status, reason = "") => {
    try {

        // Prepare form data
        formData.value.agent_id = agent;
        formData.value.start_time = formData.value.start_time || new Date().toISOString();
        formData.value.end_time = new Date().toISOString();
        formData.value.status = status;
        formData.value.refus_motif = reason;

        const formattedData = validateAndFormatFormData(formData.value);

        console.log("Validated and formatted form data:", formattedData);

        // Submit to backend
        const response = await axios.post("http://127.0.0.1:8000/submit", formattedData);

        console.log("Form submitted successfully:", response.data);

        proxy?.$toast?.add({
            severity: 'success',
            summary: 'Succès',
            detail: "Formulaire soumis avec succès.",
            life: 3000,
        });

        // Redirect on success
        window.location.href = `/agent-space?agent=${agent}&foyerId=${foyerId}`;
    } catch (error) {
        if (error.response && error.response.data) {
            console.error("Validation Error Details:", error.response.data.detail); // Show exact error details
            console.error("Submitted Data:", error.response.data.body); // Show the submitted data
        } else {
            console.error("Submission error:", error.message); // Generic error logging
        }

        proxy?.$toast?.add({
            severity: 'error',
            summary: 'Erreur',
            detail: "Échec de la soumission. Veuillez réessayer.",
            life: 3000,
        });
    }
};




const handleSubmitAndMarkAsAnswered = async () => {
    await handleSubmitAndPost(); // Submit form
    markAsAnswered();


    // Redirect to the admin page
    alert("Form submitted successfully. Redirecting to the admin dashboard.");
    window.location.href = `/agent-space?agent=${agent}&foyerId=${foyerId}`; // Include agent, and foyerId in the URL
};

// Helper function to update the status of the current assignment
const updateAssignmentStatus = () => {
    // You can update the status of the current assignment in the local data if necessary
    const assignment = agentAssignments.value[agent];
    if (assignment) {
        const foyer = assignment.foyers.find((f) => f.id === foyerId);
        if (foyer) {
            foyer.status = formData.value.status ? '0' : '1';
        }
    }
};


onMounted(fetchFoyerData);
onMounted(() => {
    fetchConsoleWebTree();
    // ... other onMounted code ...
});


</script>

<style scoped>
.gap-2 {
    display: inline-flex;
    align-items: center;
    gap: 1rem;
}

.h-2 {
    height: 0.5rem;
    /* Adjust size of the indicator */
}

.indicator {
    display: inline-block;
    height: 0.5rem;
    /* Adjust size of the indicator dot */
    width: 0.5rem;
    background-color: white;
    /* Dot color */
    border-radius: 50%;
    /* Make the dot circular */
    animation: pulse 1.5s infinite;
    /* Pulse animation */
}


@keyframes pulse {

    0%,
    100% {
        opacity: 1;
    }

    50% {
        opacity: 0.5;
    }
}

.btn,
.p-button {
    padding: 0.75rem 1.5rem;
    border-radius: 4px;
    font-weight: 500;
    transition: var(--transition);
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    cursor: pointer;
}

.p-button:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.btn-primary,
.p-button-success {
    background: var(--primary-color);
    /* Updated background color */
    color: white;
}

.btn-outline {
    border: 1px solid var(--border-color);
    background: transparent;
}

.foyer-info-horizontal {
    display: flow;
    flex-direction: row;
    flex-wrap: nowrap;
    gap: 1.5rem;
    padding: 1.5rem;
    background-color: #f9f9f9;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
    text-align: center;
}

.info-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
}

.info-item .label {
    font-weight: bold;
    font-size: 1rem;
    margin-bottom: 0.3rem;
    /* Add spacing between label and value */
}

.info-item .value {
    color: #555;
    font-size: 1rem;
}

/* Adjust container styling for consistency */
#household-info-container {
    margin-bottom: 10px;
    padding: 10px;
    border: 1px solid #ddd;
    background: #ffffff;
    border-radius: 8px;
}


.flex {
    display: flex;
}

.justify-between {
    justify-content: space-between;
}

.items-center {
    align-items: center;
}

.gap-4 {
    gap: 1rem;
}

.text-3xl {
    font-size: 1.875rem;
    font-weight: bold;
}



.p-button-primary {
    background-color: #007bff !important;
}

.availability-check {
    display: flex;
    justify-content: center;
    margin-bottom: 20px;
}



.unavailable-reason {
    display: flex;
    align-items: center;
    background-color: #f7fafc;
    border-radius: 6px;
    padding: 1rem;
    margin-top: 1rem;
    gap: 1rem;
}

.unavailable-reason label {
    font-weight: 500;
    color: #4a5568;
    margin-right: 1rem;
    white-space: nowrap;
}

.unavailable-reason select,
.unavailable-reason input {
    flex: 1;
    padding: 0.5rem;
    border: 1px solid #e2e8f0;
    border-radius: 4px;
    font-size: 1rem;
    min-width: 200px;
}

.unavailable-reason .actions {
    display: flex;
    gap: 0.5rem;
}

.actions .p-button {
    padding: 0.5rem 1rem;
    font-size: 0.9rem;
}

@media (max-width: 640px) {
    .unavailable-reason {
        flex-direction: column;
        align-items: flex-start;
    }

    .unavailable-reason label {
        margin-bottom: 0.5rem;
    }

    .actions {
        align-self: stretch;
        justify-content: space-between;
    }
}


flex.justify-between.items-center {
    margin-bottom: 2rem;
}

.text-3xl.font-bold {
    color: #2c3e50;
}

/* Foyer Indisponible button styles */
.custom-button {
    position: relative;
    padding: 0.75rem 1.5rem;
    padding-left: 2.5rem !important;
    font-weight: 600;
    transition: all 0.3s ease;
}

.custom-button .indicator {
    position: absolute;
    left: 1rem;
    top: 50%;
    transform: translateY(-50%);
    width: 10px;
    height: 10px;
    border-radius: 50%;
    background-color: #ffffff;
    transition: background-color 0.3s ease;
}

.custom-button:not(.disabled) .indicator {
    background-color: #ef4444;
}

.custom-button:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 6px rgba(239, 68, 68, 0.2);
}

/* Unavailable reason styles */
.unavailable-reason {
    background-color: #f8fafc;
    border-radius: 8px;
    padding: 1.5rem;
    margin-top: 1.5rem;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.unavailable-reason label {
    font-weight: 600;
    color: #4b5563;
    margin-bottom: 0.5rem;
    display: block;
}

.unavailable-reason .p-dropdown {
    width: 100%;
}

/* Schedule Rendez-vous button styles */
.p-button-success {
    background-color: #10b981;
    border-color: #10b981;
    color: #ffffff;
    transition: all 0.3s ease;
}

.p-button-success:hover {
    background-color: #059669;
    border-color: #059669;
    transform: translateY(-2px);
    box-shadow: 0 4px 6px rgba(16, 185, 129, 0.2);
}

/* Popover styles */
.popover-container {
    background-color: #ffffff;
    border-radius: 8px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    padding: 1.5rem;
}

.popover-container h3 {
    color: #1f2937;
    font-size: 1.25rem;
    font-weight: 600;
    margin-bottom: 1rem;
}

.p-calendar {
    width: 100%;
}

.p-calendar .p-inputtext {
    width: 100%;
    padding: 0.75rem;
    border-radius: 6px;
    border: 1px solid #d1d5db;
    font-size: 1rem;
    color: #374151;
}

.p-calendar .p-inputtext:focus {
    border-color: #60a5fa;
    box-shadow: 0 0 0 3px rgba(96, 165, 250, 0.2);
}

/* Button styles in popover */
.popover-container .p-button {
    padding: 0.75rem 1.5rem;
    font-weight: 600;
    transition: all 0.3s ease;
}

.popover-container .p-button-outlined {
    color: #ef4444;
    border-color: #ef4444;
}

.popover-container .p-button-outlined:hover {
    background-color: #fef2f2;
    color: #dc2626;
}

.popover-container .p-button-success {
    background-color: #10b981;
    border-color: #10b981;
}

.popover-container .p-button-success:hover {
    background-color: #059669;
    border-color: #059669;
}

/* Responsive adjustments */
@media (max-width: 640px) {
    .form-container {
        padding: 1rem;
    }

    .flex.justify-between.items-center {
        flex-direction: column;
        align-items: stretch;
    }

    .custom-button {
        width: 100%;
        margin-top: 1rem;
    }

    .unavailable-reason {
        padding: 1rem;
    }
}




.disabled-field {
    margin-right: 10px;
    opacity: 0.5;
    /* Grey out the disabled field */
    pointer-events: none;
}

.editable-field {
    margin-left: 10px;
}

#household-info-container {
    display: flex;
    flex-direction: column;
    gap: 10px;
    padding: 15px;
    margin-bottom: 20px;
    background-color: #f9fafe;
    border: 1px solid #e0e6ef;
    border-radius: 12px;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.05);
}

.p-buttonset {
    display: flex;
    gap: 5px;
    justify-content: center;
    /* Center-aligns the buttons if desired */

}

.main-content {
    display: flex;
    /* Enables flexbox layout */

    display: inline;
    justify-content: center;
    align-items: center;
    min-height: 100vh;
    /* Ensures the card is vertically centered within the viewport */
    padding: 1rem;
    /* Optional padding */
    /* Background color for better visibility */
    box-sizing: border-box;

}

.form-steps {
    width: 60em;
    /* Ensures responsiveness */
    margin: 1rem 0;
    /* Adds space between sections */

    flex-direction: column;
    align-items: center;
    /* Horizontally centers content */
    padding: 1rem;
    gap: 1.5rem;
    /* Adds space between elements */
}



.actions {
    display: flex;
    justify-content: space-between;
    margin-top: 1rem;
}



/* Sidebar */
.sidebar {
    border-left: 1px solid #ddd;
    padding: 1rem;
    width: 300px;
    position: fixed;
    right: 0;
    top: 0;
    height: 100vh;
    background-color: #f9f9f9;
    border-left: 1px solid #e0e0e0;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
    overflow-y: auto;
    z-index: 1000;
}

.sidebar h3 {
    font-size: 1.25rem;
    font-weight: bold;
    text-align: center;
    margin-bottom: 1rem;
}

.answer-section {
    margin-bottom: 1rem;
    padding: 1rem;
    background-color: #ffffff;
    border-radius: 6px;
    box-shadow: 0px 2px 4px rgba(0, 0, 0, 0.05);
}

.guest-table-section {
    background-color: #f9f9f9;
    padding: 1rem;
    border: 1px solid #e0e0e0;
    border-radius: 8px;
    box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.05);
}

.answer-section h4 {
    font-size: 1rem;
    font-weight: bold;
    margin-bottom: 0.5rem;
}

.answer-section p {
    font-size: 0.95rem;
    color: #555;
    margin: 0;
}

.answer-section p strong {
    color: #333;
}

.collapsible-section summary {
    cursor: pointer;
    font-weight: 500;
    padding: 5px 0;
    color: #555;
    border-bottom: 1px solid #e0e0e0;
    transition: color 0.3s;
}

.collapsible-section summary:hover {
    color: #333;
}

.expanded-content {
    padding: 10px 15px;
    margin-top: 5px;
    background-color: #f0f2f5;
    border-radius: 8px;
    border-left: 3px solid #666;
}



.answer-section {
    margin-bottom: 1rem;
    padding: 1rem;
    background-color: #ffffff;
    border-radius: 6px;
    box-shadow: 0px 2px 4px rgba(0, 0, 0, 0.05);
}

.answer-section h4 {
    font-size: 1rem;
    font-weight: bold;
    margin-bottom: 0.5rem;
}

.answer-section p {
    font-size: 0.95rem;
    color: #555;
    margin: 0;
}

.answer-section p strong {
    color: #333;
}

.collapsible-section summary {
    cursor: pointer;
    font-weight: 500;
    padding: 5px 0;
    color: #555;
    border-bottom: 1px solid #e0e0e0;
    transition: color 0.3s;
}

.collapsible-section summary:hover {
    color: #333;
}

.expanded-content {
    padding: 10px 15px;
    margin-top: 5px;
    background-color: #f0f2f5;
    border-radius: 8px;
    border-left: 3px solid #666;
}

/* Adjusted color for links or highlighted text */
.answer-section a,
.answer-section .highlight {
    color: #444;
    font-weight: 600;
    text-decoration: none;
}

.answer-section a:hover,
.answer-section .highlight:hover {
    color: #222;
    text-decoration: underline;
}




/* Centered Foyer Info Card */
#foyerInfoCard {
    width: 100%;
    max-width: 800px;
    padding: 30px;
    background-color: #f9fafe;
    border: 1px solid #e0e6ef;
    border-radius: 8px;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.05);
}

.foyer-info-horizontal {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
    gap: 1rem;
    padding: 15px;
    background-color: #f9f9f9;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
    font-size: 0.9rem;
    /* Smaller font for compact details */
}

.info-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
}


.foyer-info-horizontal .label {
    font-weight: bold;
    font-size: 1rem;
    /* Keep labels slightly larger for emphasis */
}

.foyer-info-horizontal .value {
    color: #555;
}


@media screen and (max-width: 768px) {
    .content-wrapper {
        flex-direction: column;
    }

    .main-content {
        padding-right: 0;
    }
}

.foyer-info-item {
    flex: 1;
    font-size: 0.9rem;
    color: #333;
    font-family: Arial, sans-serif;
}

.foyer-info-item strong {
    font-weight: 600;
    color: #333;
}

.foyer-info-item span {
    color: #555;
}



.form-container {
    margin-right: 300px;
    align-items: center;
    box-sizing: border-box;
    /* Include padding in size calculations */


}

.unavailable-reason {
    margin-top: 1rem;
}



.popover-panel {
    max-width: 300px;
    background-color: white;
    border: 1px solid #e5e7eb;
    border-radius: 8px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    padding: 1rem;
}

.p-button-text {
    margin-top: 0.5rem;
}

.Select {
    max-width: 300px;
}

.p-button-success {
    background-color: #4caf50 !important;
    /* Adjust green color */
    border-color: transparent;
}


.shadow-lg {
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1), 0 1px 3px rgba(0, 0, 0, 0.06);
}

h1 {
    font-size: 1.5rem;
    margin-bottom: 1rem;
}

label {
    font-size: 1rem;
    font-weight: 600;
    color: #333;
    white-space: nowrap;
}

.value {
    font-size: 1rem;
    font-weight: 400;
    color: #555;
}

select {
    padding: 5px;
    margin-bottom: 20px;
}

.day-section {
    margin-bottom: 20px;
}

ul {
    list-style-type: none;
    padding: 0;
}

li {
    background-color: #f9f9f9;
    border: 1px solid #ddd;
    padding: 10px;
    margin-bottom: 5px;
    border-radius: 5px;
}
</style>