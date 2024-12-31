<template>
    <Drawer v-model:visible="visible" position="left" class="assignment-sidebar">
      <template #container="{ closeCallback }">
        <div class="flex flex-column h-full">
          <!-- Header -->
          <div class="flex align-items-center justify-content-between px-4 pt-3 flex-shrink-0">
            <span class="font-semibold text-2xl text-primary">Agent Dashboard</span>
            <Button
              type="button"
              @click="closeCallback"
              icon="pi pi-times"
              rounded
              outlined
              class="h-2rem w-2rem"
            />
          </div>
  
          <!-- Main Content -->
          <div class="overflow-y-auto p-4">
            <!-- Agent Selection -->
            <div class="p-3">
              <label for="agentSelect">Select Agent:</label>
              <select id="agentSelect" v-model="selectedAgent">
                <option v-for="agent in agents" :key="agent" :value="agent">{{ agent }}</option>
              </select>
            </div>
  
            <!-- Day Selection -->
            <div class="p-3">
              <label for="daySelect">Select Day:</label>
              <select id="daySelect" v-model="selectedDay">
                <option v-for="day in days" :key="day" :value="day">Day {{ day }}</option>
              </select>
            </div>
  
            <!-- KPI Summary -->
            <div v-if="dayFoyers.length > 0" class="p-3">
              <h4>Foyer Stats for Day {{ selectedDay }}</h4>
  
              <!-- Grouped Foyer Stats -->
              <div v-for="(group, groupName) in groupedFoyers" :key="groupName" class="group-stat">
                <h5>{{ groupName }}</h5>
                <p>Total Foyers: {{ group.length }}</p>
              </div>
  
              <!-- KPI Summary -->
              <h5>Summary</h5>
              <p><strong>Appels effectués:</strong> {{ stats.answered }}</p>
              <p><strong>Pas de réponse:</strong> {{ stats.didntPick }}</p>
              <p><strong>A venir:</strong> {{ stats.left }}</p>
            </div>
          </div>
        </div>
      </template>
    </Drawer>
  
    <!-- Trigger Button -->
    <Button
      icon="pi pi-bars"
      label="Agent Dashboard"
      @click="toggleSidebar"
      class="p-button-primary"
    />
  </template>
  
  <script setup>
  import { ref, computed, watch } from "vue";
  import  Button  from "primevue/button";
  import  Drawer from "primevue/drawer";

  
  // State
  const visible = ref(false);
  const selectedAgent = ref("Agent 1");
  const selectedDay = ref(1);
  
  // Dummy Data (Replace with API data)
  const agents = ["Agent 1", "Agent 2", "Agent 3"];
  const days = Array.from({ length: 15 }, (_, i) => i + 1);
  
  // Example assignment logic
  const foyers = ref([
    { id: 1, taille_foyer: "G1", day: 1, status: "answered" },
    { id: 2, taille_foyer: "G2", day: 1, status: "didntPick" },
    { id: 3, taille_foyer: "G1", day: 2, status: "left" },
    { id: 4, taille_foyer: "G3", day: 2, status: "answered" },
  ]);
  
  // State for unavailable tracking
  const unavailableFoyers = ref([]);
  
  // Function to mark a foyer as unavailable
  const markAsUnavailable = (foyerId) => {
    const foyer = foyers.value.find((f) => f.id === foyerId);
    if (foyer) {
      foyer.status = "didntPick"; // Update status
      unavailableFoyers.value.push(foyerId); // Track in unavailable list
    }
  };
  
  // Computed Properties
  const dayFoyers = computed(() => {
    // Filter foyers based on selected day
    return foyers.value.filter((foyer) => foyer.day === selectedDay.value);
  });
  
  const groupedFoyers = computed(() => {
    return dayFoyers.value.reduce((groups, foyer) => {
      const groupName = foyer.taille_foyer;
      if (!groups[groupName]) groups[groupName] = [];
      groups[groupName].push(foyer);
      return groups;
    }, {});
  });
  
  const stats = computed(() => {
    let answered = 0,
      didntPick = 0,
      left = 0;
  
    dayFoyers.value.forEach((foyer) => {
      if (foyer.status === "answered") answered++;
      else if (foyer.status === "didntPick") didntPick++;
      else left++;
    });
  
    return { answered, didntPick, left };
  });
  
  // Watchers
  watch(unavailableFoyers, () => {
    // React to unavailable updates and recalculate stats
    console.log("Updated unavailable foyers:", unavailableFoyers.value);
  });
  
  watch(selectedDay, () => {
    console.log(`Day changed to: ${selectedDay.value}`);
    // Any additional logic to fetch or calculate data for the new day
    console.log("Updated day-specific foyers:", dayFoyers.value);
  });
  
  // Functions
  const toggleSidebar = () => {
    visible.value = !visible.value;
  };
  </script>
  
  <style scoped>
  .assignment-sidebar {
    width: 300px;
    background-color: #fff;
    padding: 1rem;
    box-shadow: 2px 0px 5px rgba(0, 0, 0, 0.1);
  }
  
  .group-stat {
    margin-bottom: 1rem;
  }
  
  .group-stat h5 {
    margin: 0;
    font-weight: bold;
  }
  
  .group-stat p {
    margin: 0.25rem 0;
  }
  </style>
  