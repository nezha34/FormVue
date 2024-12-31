<template>
  <div class="dynamic-table">
    <DataTable
      :value="data || []"
      editMode="cell"
      @cell-edit-complete="onCellEditComplete"
      tableStyle="min-width: 30rem"
    >
      <!-- First Column with Dynamic Chips -->
      <Column :field="columns[0]?.field" :header="columns[0]?.header" :style="{ width: 'auto', whiteSpace: 'nowrap'  }">
        <template #body="slotProps">
          <div class="flex items-center gap-2">
            <!-- Default Field Value -->
            <span>{{ slotProps.data[columns[0]?.field] }}</span>

            <!-- Chip for Chef Menage -->
            <Chip v-if="slotProps.data.chef_menage" class="chef-chip">
              <span class="chip-content">CM</span>
            </Chip>

            <!-- Chip for Maman -->
            <Chip v-else-if="slotProps.data.maman" class="maman-chip">
              <span class="chip-content">M</span>
            </Chip>
          </div>
        </template>
      </Column>

      <!-- Other Dynamic Columns -->
      <Column
        v-for="(column, index) in columns.slice(1)"
        :key="index"
        :field="column.field"
        :header="column.header"
        :style="{ width: '20%' }"
      >
        <template #body="slotProps">
          <span>{{ slotProps.data[column.field] }}</span>
        </template>
      </Column>

      <!-- Statut Column -->
      <Column field="statut" header="Statut">
        <template #body="slotProps">
          <Select
            v-model="slotProps.data.statut"
            :options="statutOptions"
            optionLabel="label"
            optionValue="value"
            placeholder="Select"
            @change="updateStatut(slotProps.data)"
          />
        </template>
      </Column>

      <!-- Activité Column -->
      <Column field="activite" header="Activité">
        <template #body="slotProps">
          <Select
            v-model="slotProps.data.activite"
            :options="activiteOptions"
            optionLabel="label"
            optionValue="value"
            placeholder="Select"
            @change="updateActivite(slotProps.data)"
          />
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
import Chip from "primevue/chip";

// Define Props
const props = defineProps({
  data: {
    type: Array,
    default: () => [],
  },
  columns: {
    type: Array,
    default: () => [],
  },
  uniqueKey: {
    type: String,
    required: true,
  },
});

const emit = defineEmits(["update"]);

const activiteOptions = [
  { label: "Ne Regarde Pas TV", value: "Ne Regarde Pas TV" },
  { label: "Regarder Chaîne TV", value: "Regarder Chaîne TV" },
  { label: "Regarder(DVD/VCD)", value: "Regarder(DVD/VCD)" },
  { label: "Jouer Avec Console De Jeux", value: "Jouer Avec Console De Jeux" },
  { label: "Regarder Magnétoscope", value: "Regarder Magnétoscope" },
  { label: "N'est Pas Devant La télé", value: "N'est Pas Devant La télé" },
  { label: "NSP", value: "NSP" },
  { label: "Absent", value: "Absent" },
  { label: "Sorti", value: "Sorti" },
];

const statutOptions = [
  { label: "Actif", value: 1 },
  { label: "Vacances", value: 2 },
  { label: "Invité Permanent", value: 3 },
  { label: "Suspendu", value: 4 },
  { label: "Sortie", value: 5 },
];

// Watch for Changes in the Data Prop
watch(
  () => props.data,
  (newData) => {
    const updatedData = newData.map((row) => {
      if (row.statut === 5) {
        // Automatically set activite to "Sorti" for statut = 5
        row.activite = "Sorti";
      } else if (row.statut === 2 || row.statut === 4) {
        // Automatically set activite to "Absent" for statut = 2 or 4
        row.activite = "Absent";
      }
      return row;
    });

    // Emit updated data to parent
    emit("update", [...updatedData]);
  },
  { immediate: true, deep: true } // Ensures watcher runs on initial mount and deeply observes changes
);

const updateStatut = (rowData) => {
  if (rowData.statut === 5) {
    rowData.activite = "Sorti";
  } else if (rowData.statut === 2 || rowData.statut === 4) {
    rowData.activite = "Absent";
  }

  // Emit updated data to parent
  emit("update", [...props.data]);
};

const updateActivite = (rowData) => {
  emit("update", [...props.data]);
};

const onCellEditComplete = (event) => {
  const { data, newValue, field } = event;

  if (data && field) {
    data[field] = newValue;
    emit("update", [...props.data]);
  }
};
</script>

<style scoped>

.flex {
  display: flex;
  align-items: center;
  padding: 0.5em;
}
.DataTable{
text-align: center;
padding: 0em;
margin: 0em;
}
.gap-2 {
  gap: 0.5rem;
}

.chef-chip {
  background-color: #007bff;
  color: white;
  font-weight: bold;
  border-radius: 9999px; /* Round badge */
  padding: 0.25rem 0.5rem;
  font-size: 0.75rem;
}

.maman-chip {
  background-color: #f59e0b; /* Orange color for maman */
  color: white;
  font-weight: bold;
  border-radius: 9999px;
  padding: 0.25rem 0.5rem;
  font-size: 0.75rem;
}

.chip-content {
  display: inline-block;
}
.dynamic-table{
  padding:0.5em;
}
</style>
