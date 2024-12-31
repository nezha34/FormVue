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
              <Textarea
                v-model="slotProps.data.detail"
                rows="3"
                placeholder="Enter comments"
                class="w-full"
              />
            </template>
            <template v-else>
              <InputText
                v-model="slotProps.data.detail"
                placeholder="Enter detail"
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
  import InputMask from "primevue/inputmask"
  // Define props
  const props = defineProps({
    infoRows: {
      type: Array,
      default: () => [
        { information: "Nouvel équipement", detail: "" },
        { information: "Nouvelle adresse", detail: "" },
        { information: "Nouveau N° téléphone", detail: "" },
        { information: "Commentaires", detail: "" }, // Added Comments section
      ],
    },
  });
  
  // Emit updates to parent
  const emit = defineEmits(["update"]);
  
  // Reactive local data
  const localInfoRows = ref([...props.infoRows]);
  
  // Watch for changes in the local rows and emit updates to the parent
  watch(
  localInfoRows,
  (newValue) => {
    console.log("Emitting updated localInfoRows:", newValue); // Debugging emission
    emit("update", [...newValue]); // Emit a deep copy
  },
  { deep: true }
);

  // Sync local data when parent prop changes
  watch(
  () => props.infoRows,
  (newVal) => {
    // Update only if the data is different
    if (JSON.stringify(newVal) !== JSON.stringify(localInfoRows.value)) {
      localInfoRows.value = [...newVal];

    }
  },
  { deep: true }
);

  
  // Debugging
  console.log("Initial infoRows in child:", props.infoRows);
  console.log("Initial localInfoRows:", localInfoRows.value);
  </script>
  

  