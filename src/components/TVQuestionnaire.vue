<template>
  <div>
    <h3>Poste Information</h3>
    <DataTable :value="posteData" editMode="cell" class="editable-datatable" >
      <!-- Display ID, Num, and Emplacement -->
      <Column field="id_poste" header="Poste ID" :sortable="true" />
      <Column field="num_poste" header="Numero" :sortable="true" />
      <Column field="emplacement" header="Emplacement" :sortable="true">
        <template #body="slotProps">
          {{ slotProps?.data?.emplacement ? mapEmplacement(slotProps.data.emplacement) : "N/A" }}
        </template>
        <template #editor="slotProps">
          <Select v-if="slotProps?.data" v-model="slotProps.data.emplacement" :options="emplacementOptions"
            optionLabel="label" optionValue="value" placeholder="Emplacement" />
        </template>
      </Column>

      <!-- Etat Column -->
      <Column field="etat" header="Etat">
        <template #body="slotProps">
          <Select v-if="slotProps?.data" v-model="slotProps.data.etat" :options="etatOptions" optionLabel="label"
            optionValue="value" placeholder="Etat" @change="onEtatChange(slotProps.data)" />
        </template>
      </Column>



      <!-- Activite Column -->
      <Column field="activite" header="Activité">
        <template #body="slotProps">
          <Select v-if="slotProps?.data" v-model="slotProps.data.activite"
            :options="getActiviteOptions(slotProps.data.etat)" optionLabel="value" optionValue="code"
            placeholder="Activité" :disabled="['OFF', 'Supprimé', 'En panne'].includes(slotProps.data.etat)"
            @change="updatePosteData(slotProps.data)" />
        </template>
      </Column>
      <!-- Chaine Column -->
      <Column field="chaine" header="Chaine">
        <template #body="slotProps">
          <Select v-if="slotProps?.data" v-model="slotProps.data.chaine"
            :options="getChaineOptions(slotProps.data.etat)" optionLabel="value" optionValue="code"
            placeholder="Chaine" :disabled="['OFF', 'Supprimé', 'En panne'].includes(slotProps.data.etat)"
            @change="updatePosteData(slotProps.data)" />
        </template>
      </Column>
    </DataTable>
  </div>
</template>

<script setup>
import { ref, watch } from "vue";
import DataTable from "primevue/datatable";
import Column from "primevue/column";
import Select from "primevue/select";

const props = defineProps({
  postes: {
    type: Array,
    required: true,
  },
  childOptions: {
    type: Array,
    required: true, // Options for "chaine" and "activite" are passed here
  },
});

const emit = defineEmits(["update-etat", "update-activite", "update-poste-data"]);

const posteData = ref([...props.postes]);

// Define options

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

const etatOptions = [
  { label: "ON", value: "ON" },
  { label: "OFF", value: "OFF" },
  { label: "Supprimé", value: "Supprimé" },
  { label: "En panne", value: "En panne" },
];

// Helper to map emplacement
const mapEmplacement = (value) => {
  const option = emplacementOptions.find((opt) => opt.value === value);
  return option ? option.label : "Unknown";
};

// Extract options for "chaine" and "activite" from childOptions
const getChaineOptions = (etat) => {
  if (["OFF", "Supprimé", "En panne"].includes(etat)) {
    return [{ code: "0", value: "TV OFF" }];
  }
  const chaineOptions = props.childOptions.find((opt) => opt.label === "chaine");

  return chaineOptions?.options || [];
};

const getActiviteOptions = (etat) => {
  if (["OFF", "Supprimé", "En panne"].includes(etat)) {

    return [{ code: "OFF", value: "TV OFF" }];
  }
  const activiteOptions = props.childOptions.find((opt) => opt.label === "Activité");

  return activiteOptions?.options || [];
};
const onEtatChange = (poste) => {
    const posteIndex = posteData.value.findIndex((p) => p.id_poste === poste.id_poste);

    if (posteIndex !== -1) {
        posteData.value = [...posteData.value]; // Ensure reactivity
        posteData.value[posteIndex] = { ...poste };

        if (["OFF", "Supprimé", "En panne"].includes(poste.etat)) {
            posteData.value[posteIndex].chaine = "TV OFF";
            posteData.value[posteIndex].activite = "Ne Regarde Pas TV";
            console.log('urgent',posteData.value)
        } 
        emit("update-activite", posteData.value);
    } else if (poste.etat === "ON") {
        // Handle case when TV is turned back ON
        posteData.value[posteIndex].chaine = "";
        posteData.value[posteIndex].activite = ""; // Reset activite or set a default value
        emit("update-activite", posteData.value);
    }

    emit("update-etat", poste); // Emit state change for the poste
};



// Initialize posteData
const initializePosteData = () => {
    posteData.value = Array.isArray(props.postes)
        ? props.postes.map((poste) => ({
            id_poste: poste.id_poste || null,
            num_poste: poste.num_poste || null,
            emplacement: poste.emplacement || null,
            etat: poste.etat || "ON",
            chaine: poste.chaine || "",
            activite: poste.activite || "",
        }))
        : []; // Ensure an array even if props.postes is invalid
};


// Watch for prop changes
watch(
  () => props.postes,
  () => {
    initializePosteData();
  },
  { immediate: true }
);

// In TVQuestionnaire.vue's script setup
const updatePosteData = (row) => {
  const poste = posteData.value.find((p) => p.id_poste === row.id_poste);
  if (poste) {
    Object.assign(poste, row); // Update the poste data
    emit("update-poste-data", posteData.value); // Emit the updated postes to the parent
  }
};


</script>

<style scoped>
.editable-datatable {
  margin-top: 20px;
}
</style>