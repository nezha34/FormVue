<template>
  <div class="guest-table-container">
    <!-- Editable DataTable -->
    <DataTable :value="guests" class="editable-datatable" :showGridlines="false">
      <Column field="prenom" header="Prénom">
        <template #body="slotProps">
          <InputText 
            v-model="slotProps.data.prenom" 
            placeholder="Entrez Le prénom" 
            class="custom-input"
            @input="autoSave"
          />
        </template>
      </Column>
      <Column field="age" header="Age">
        <template #body="slotProps">
          <Select 
            v-model="slotProps.data.age" 
            :options="tranche_age"
            class="custom-input"
            @input="autoSave"
            placeholder="Entrez l'âge"
            optionLabel="label"
            optionValue="value"
          />
        </template>
      </Column>
      
      <Column field="sex" header="Sexe">
        <template #body="slotProps">
          <Select
            v-model="slotProps.data.sex"
            :options="sexOptions"
            placeholder="Entrez Sex"
            optionLabel="label"
            optionValue="value"
            class="custom-dropdown"
            @change="autoSave"
          />
        </template>
      </Column>
      <Column field="emplacement" header="Emplacement de la TV">
        <template #body="slotProps">
          <Select 
            v-model="slotProps.data.tvLocation" 
            placeholder="Emplacement TV " 
            :options="emplacementOptions"
            optionLabel="label"
            optionValue="value"
            class="custom-dropdown"
            @input="autoSave"
          />
        </template>
      </Column>
    </DataTable>

    <!-- Add Guest Button -->
    <div class="flex justify-end mt-4">
      <Button 
        label="Ajout Invité" 
        icon="pi pi-plus" 
        class="custom-button" 
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
import InputNumber from "primevue/inputnumber";
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
]
const emplacementOptions = [
  { label: "Salon", value: "Salon" },
  { label: "Séjour", value: "Séjour" },
  { label: "Chambre à coucher", value: "Chambre à coucher" },
  { label: "Cuisine", value: "Cuisine" },
  { label: "Autre chambre", value: "Autre chambre" },
];
const emit = defineEmits(["update-guests"]);
const guests = ref([...props.initialGuests]);

const sexOptions = [
  { label: "Male", value: "Male" },
  { label: "Femelle", value: "Femelle" },
];

const addGuest = () => {
  const newGuest = {
    id: guests.value.length + 1,
    prenom: "",
    age: null,
    sex: "",
    emplacement: "",
  };
  guests.value.push(newGuest);
  autoSave();
};

const autoSave = () => {
  emit("update-guests", guests.value);
  console.log("Guest data auto-saved:", guests.value);
};

watch(
  () => props.initialGuests,
  (newGuests) => {
    guests.value = [...newGuests];
  },
  { deep: true }
);

onMounted(() => {
  if (guests.value.length === 0) {
    addGuest();
  } else {
    autoSave();
  }
});
</script>

<style scoped>
.guest-table-container {
  margin-top: 1rem;
  background-color: #ffffff;
  border-radius: 0.75rem;
  padding: 1rem;
}

/* DataTable Styling */
:deep(.p-datatable) {
  border-radius: 0.75rem;
}

:deep(.p-datatable .p-datatable-thead > tr > th) {
  background-color: transparent;
  border-bottom: 2px solid #e2e8f0;
  color: #475569;
  font-weight: 600;
  font-size: 0.875rem;
}

:deep(.p-datatable .p-datatable-tbody > tr > td) {
  border: none;
}

:deep(.p-datatable .p-datatable-tbody > tr:hover) {
  background-color: #f8fafc;
}

/* Input Styling */
.custom-input {
  width: 100%;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  color: #1e293b;
  background-color: #ffffff;
  transition: all 0.2s ease;
}

.custom-input:focus {
  border-color: #4ade80;
  box-shadow: 0 0 0 2px rgba(74, 222, 128, 0.1);
  outline: none;
}

.custom-input::placeholder {
  color: #334155;
}

/* Dropdown Styling */
:deep(.custom-dropdown) {
  width: 100%;
}

:deep(.p-dropdown) {
  border: 1px solid #e2e8f0;
  border-radius: 0.5rem;
}

:deep(.p-dropdown:hover) {
  border-color: #4ade80;
}

:deep(.p-dropdown:not(.p-disabled).p-focus) {
  border-color: #4ade80;
  box-shadow: 0 0 0 2px rgba(74, 222, 128, 0.1);
}

:deep(.p-dropdown-panel) {
  border-radius: 0.5rem;
}

/* Button Styling */
.custom-button {
  background-color: #4ade80 !important;
  border: none !important;
  color: #ffffff !important;
  padding: 0.625rem 1rem !important;
  font-size: 0.875rem !important;
  border-radius: 0.5rem !important;
  transition: all 0.2s ease !important;
}

.custom-button:hover {
  background-color: #22c55e !important;
  transform: translateY(-1px);
}

.custom-button:active {
  transform: translateY(0);
}

/* InputNumber Styling */
:deep(.p-inputnumber-input) {
  width: 100%;
  padding: 0.625rem 0.875rem !important;
  border: 1px solid #e2e8f0 !important;
  border-radius: 0.5rem !important;
  font-size: 0.875rem !important;
  color: #1e293b !important;
}

:deep(.p-inputnumber-input:focus) {
  border-color: #4ade80 !important;
  box-shadow: 0 0 0 2px rgba(74, 222, 128, 0.1) !important;
}
:deep(.p-inputtext.placeholder){
  color:#334155 !important;
}
</style>