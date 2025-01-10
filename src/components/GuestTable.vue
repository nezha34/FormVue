<template>
  <div class="guest-table-container">
    <DataTable :value="guests" class="editable-datatable" :showGridlines="false">
      <Column field="prenom" header="Prénom">
        <template #body="slotProps">
          <InputText 
            v-model="slotProps.data.prenom" 
            placeholder="Entrez Le prénom" 
            class="form-input"
            @input="autoSave"
          />
        </template>
      </Column>
      <Column field="age" header="Age">
        <template #body="slotProps">
          <Select
            v-model="slotProps.data.age" 
            :options="tranche_age"
            class="form-input"
            placeholder="Âge"
            optionLabel="label"
            optionValue="value"
            @change="autoSave"
          />
        </template>
      </Column>
      <Column field="sex" header="Sexe">
        <template #body="slotProps">
          <Select
            v-model="slotProps.data.sex"
            :options="sexOptions"
            placeholder="Sexe"
            optionLabel="label"
            optionValue="value"
            class="form-input"
            @change="autoSave"
          />
        </template>
      </Column>
      <Column field="emplacement_TV" header="Emplacement TV">
        <template #body="slotProps">
          <Select
            v-model="slotProps.data.emplacement_TV" 
            placeholder="Emplacement" 
            :options="emplacementOptions"
            optionLabel="label"
            optionValue="value"
            class="form-input"
            @change="autoSave"
          />
        </template>
      </Column>
    </DataTable>

    <div class="flex justify-end mt-4">
      <Button 
        label="Ajout Invité" 
        icon="pi pi-plus" 
        class="add-button" 
        @click="addGuest" 
      />
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted } from "vue";
import DataTable from "primevue/datatable";
import Column from "primevue/column";
import InputText from "primevue/inputtext";
import Button from "primevue/button";
import Select from 'primevue/select';

const props = defineProps({
  initialGuests: {
    type: Array,
    default: () => [],
  },
});

const tranche_age = [
  { label: "5-14 ans", value: "5-14 ans" },
  { label: "15-24 ans", value: "15-24 ans" },
  { label: "25-34 ans", value: "25-34 ans" },
  { label: "35-44 ans", value: "35-44 ans" },
  { label: "45-54 ans", value: "45-54 ans" },
  { label: "55ans et plus", value: "55ans et plus" },
];

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

const sexOptions = [
  { label: "Homme", value: "Homme" },
  { label: "Femme", value: "Femme" },
];

const emit = defineEmits(["update-guests"]);
const guests = ref([...props.initialGuests]);

const addGuest = () => {
  const newGuest = {
    prenom: "",
    age: "",
    sex: "",
    emplacement_TV: "",
  };
  guests.value.push(newGuest);
  autoSave();
};

const autoSave = () => {
  emit("update-guests", [...guests.value]);
};

// Initialize with props or add first guest
onMounted(() => {
  if (guests.value.length === 0) {
    addGuest();
  }
});

// Watch for prop changes
watch(() => props.initialGuests, (newValue) => {
  if (JSON.stringify(newValue) !== JSON.stringify(guests.value)) {
    guests.value = [...newValue];
    console.log()
  }
}, { deep: true });

// Watch for changes in guests array
watch(guests, () => {
  autoSave();
}, { deep: true });
</script>

<style scoped>
.guest-table-container {
  margin-top: 1rem;
  background-color: #ffffff;
  border-radius: 0.75rem;
  padding: 1rem;
}

/* Unified form input styling */
:deep(.form-input) {
  width: 100% !important;
  min-width: 20px !important;
  font-family: inherit !important;
  font-size: 0.875rem !important;
}

:deep(.p-dropdown),
:deep(.p-inputtext) {
  width: 100% !important;
  min-width: 20px !important;
  padding: 0.5rem 0.75rem !important;
  border: 1px solid #e2e8f0 !important;
  border-radius: 0.5rem !important;
  background-color: #ffffff !important;
  color: #1e293b !important;
  font-size: 0.875rem !important;
  transition: all 0.2s ease !important;
  height: 38px !important;
}

:deep(.p-dropdown:hover),
:deep(.p-inputtext:hover) {
  border-color: #4ade80 !important;
}

:deep(.p-dropdown:focus),
:deep(.p-inputtext:focus) {
  outline: none !important;
  border-color: #4ade80 !important;
  box-shadow: 0 0 0 2px rgba(74, 222, 128, 0.1) !important;
}

:deep(.p-dropdown-panel) {
  border-radius: 0.5rem !important;
  border: 1px solid #e2e8f0 !important;
  min-width: 20px !important;
}

:deep(.p-dropdown-items-wrapper) {
  max-height: 200px !important;
}

:deep(.p-dropdown-item) {
  padding: 0.25rem 0.5rem !important;
  color: #1e293b !important;
  font-size: 0.875rem !important;
}

:deep(.p-dropdown-item:hover) {
  background-color: #f1f5f9 !important;
}

:deep(.p-placeholder) {
  color: #64748b !important;
}

/* Table styling */
:deep(.p-datatable) {
  border-radius: 0.75rem !important;
}

:deep(.p-datatable .p-datatable-thead > tr > th) {
  background-color: transparent !important;
  border-bottom: 2px solid #e2e8f0 !important;
  color: #475569 !important;
  font-weight: 600 !important;
  padding: 0.75rem 1rem !important;
}

:deep(.p-datatable .p-datatable-tbody > tr > td) {
  border: none !important;
  padding: 0.75rem 0.5rem !important;
}

:deep(.p-datatable-tbody > tr > td) {
  min-width: 20px !important;
}

/* Button styling */
.add-button {
  background-color: #4ade80 !important;
  border: none !important;
  color: #ffffff !important;
  padding: 0.625rem 1rem !important;
  font-size: 0.875rem !important;
  border-radius: 0.5rem !important;
  transition: all 0.2s ease !important;
}

.add-button:hover {
  background-color: #22c55e !important;
  transform: translateY(-1px) !important;
}

.add-button:active {
  transform: translateY(0) !important;
}
</style>