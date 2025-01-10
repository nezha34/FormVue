<template>
  <div>
    <DataTable :value="localInfoRows" editMode="cell" class="editable-datatable">
      <!-- Information Column -->
      <Column field="information" header="Information" />

      <!-- Detail Column -->
      <Column field="detail" header="Détail">
        <template #body="slotProps">
          <!-- Conditional Editors -->
          <template v-if="slotProps.data?.information === 'Nouveau N° téléphone'">
            <InputMask
              v-model="slotProps.data.detail"
              mask="+212-999999999"
              placeholder="+212-999999999"
            />
          </template>
          <template v-else-if="slotProps.data?.information === 'Commentaires'">
            <div class="comments-container">
              <Select
                v-model="slotProps.data.comportement"
                :options="comportementOptions"
                optionLabel="label"
                optionValue="value"
                placeholder="Sélectionner le comportement"
                class="behavior-dropdown"
              />

            </div>
          </template>
          <template v-else>
            <InputText
              v-model="slotProps.data.detail"
              placeholder="Entrez les details"
              class="w-full"
            />
          </template>
        </template>
      </Column>
    </DataTable>
  </div>
</template>

<script setup>
import { ref, watch } from "vue";
import DataTable from "primevue/datatable";
import Column from "primevue/column";
import InputText from "primevue/inputtext";
import Textarea from "primevue/textarea";
import InputMask from "primevue/inputmask";
import Select from "primevue/select";

const comportementOptions = [
  { label: 'Ne veut pas nous répondre', value: 1 },
  { label: 'Le foyer a utilisé un langage irrespectueux', value: 2 },
  { label: 'Le répondant ne comprend pas nos questions', value: 3 },
  { label: 'Répondant sympathique', value: 4 }
];

const props = defineProps({
  infoRows: {
    type: Array,
    default: () => [
      { information: "Nouvel équipement", detail: "" },
      { information: "Nouvelle adresse", detail: "" },
      { information: "Nouveau N° téléphone", detail: "" },
      { information: "Commentaires", detail: "" },
      { information: "Commentaire_facultatif", comportement: null },

    ],
  },
});

const emit = defineEmits(["update"]);
const localInfoRows = ref([...props.infoRows]);

watch(
  localInfoRows,
  (newValue) => {
    emit("update", [...newValue]);
  },
  { deep: true }
);

watch(
  () => props.infoRows,
  (newVal) => {
    if (JSON.stringify(newVal) !== JSON.stringify(localInfoRows.value)) {
      localInfoRows.value = [...newVal];
    }
  },
  { deep: true }
);
</script>

<style scoped>
.editable-datatable :deep(.p-datatable-cell) {
  padding: 0.5rem !important;
}

.comments-container {
  display: flex !important;
  gap: 1rem !important;
  width: 100% !important;
  align-items: flex-start !important;

}

.behavior-dropdown {
  width: 300px !important;
  min-width: 300px !important;
  flex-shrink: 0 !important;
}

.comments-textarea {
  flex: 1 !important;
  width: auto !important;
  min-width: 200px !important;
}

:deep(.p-select) {
  width: 100% !important;
}

:deep(.p-select-label) {
  white-space: normal !important;
}

:deep(.p-inputtext) {
  width: 100% !important;
}
</style>