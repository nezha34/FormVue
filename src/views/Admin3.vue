<template>
    <Header />
    <div class="dashboard-container">
      <!-- Set Objectives Section -->
      <div class="objectives-section">
        <Card class="objectives-panel">
          <template #title>
            <div class="panel-header">
              <i class="pi pi-chart-line"></i>
              <span>Set Daily Objectives</span>
            </div>
          </template>
          <template #content>
            <div class="objectives-form">
              <div class="section-title">
                <h3>Define Objectives</h3>
                <div class="title-underline"></div>
              </div>
              
              <div class="objectives-grid">
                <div v-for="groupNum in 3" :key="groupNum" class="objective-input">
                  <span class="p-float-label">
                    <InputNumber 
                      v-model="globalObjectives[`group${groupNum}`]"
                      :inputId="'group' + groupNum" 
                      class="w-full" 
                      showButtons
                      buttonLayout="horizontal" 
                      :min="0" 
                      :step="1"
                    />
                    <label :for="'group' + groupNum">
                      Group {{ groupNum }}
                    </label>
                  </span>
                </div>
              </div>
  
              <div class="section-title">
                <h3>Select Agents</h3>
                <div class="title-underline"></div>
              </div>
              
              <MultiSelect 
                v-model="selectedAgents" 
                :options="agentOptions" 
                optionLabel="name"
                placeholder="Select Agents" 
                class="agent-select" 
              />
  
              <Button 
                label="Apply Objectives to Selected Agents" 
                icon="pi pi-check"
                @click="applyGlobalObjectives" 
                class="apply-button" 
                :loading="loading" 
              />
            </div>
          </template>
        </Card>
      </div>
  
      <!-- Stats Analysis Section -->
      <div class="stats-section">
        <Card class="stats-panel">
          <template #title>
            <div class="panel-header stats">
              <i class="pi pi-table"></i>
              <span>Stats Analysis</span>
            </div>
          </template>
          <template #content>
            <div id="pivot-table-container"></div>
          </template>
        </Card>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref, onMounted, onUnmounted } from 'vue';
  import Card from 'primevue/card';
  import Button from 'primevue/button';
  import InputNumber from 'primevue/inputnumber';
  import MultiSelect from 'primevue/multiselect';
  import Header from '@/components/header.vue';
  import axios from 'axios';
  
  // Import jQuery and PivotTable.js
  import $ from 'jquery';
  window.jQuery = $;
  import 'jquery-ui-dist/jquery-ui.min.js';
  import 'pivottable/dist/pivot.min.js';
  import 'pivottable/dist/pivot.min.css';
  import plotly from 'plotly.js/dist/plotly-basic.min.js'; // Import Plotly
  import 'pivottable/dist/plotly_renderers.js'; // Import Plotly renderers
  
  const globalObjectives = ref({
      group1: 0,
      group2: 0,
      group3: 0,
  });
  
  const agentStats = ref([]);
  const selectedAgents = ref([]);
  const agentOptions = ref([]);
  const loading = ref(false);
  
  const transformDataForPivot = (data) => {
      const transformedData = [];
  
      data.forEach(agent => {
          Object.entries(agent.days || {}).forEach(([date, stats]) => {
              Object.entries(stats).forEach(([statType, value]) => {
                  transformedData.push({
                      agent: `Agent ${agent.agent_id}`,
                      date: date,
                      stat_type: statType,
                      value: value,
                      group1: agent.objectives?.group1 || 0,
                      group2: agent.objectives?.group2 || 0,
                      group3: agent.objectives?.group3 || 0
                  });
              });
          });
      });
  
      return transformedData;
  };
  
  const renderPivotTable = () => {
      const container = $("#pivot-table-container");
  
      // Transform data to exclude unwanted fields
      const transformedData = agentStats.value.map((agent) => ({
          agent_id: agent.agent_id,
          day: agent.day,
          groupe: agent.groupe,
          status: agent.status,
      }));
  
      if (container.length && transformedData.length) {
          const renderers = $.extend($.pivotUtilities.renderers, $.pivotUtilities.plotly_renderers);
  
          container.pivotUI(transformedData, {
              renderers: renderers,
              rows: ["agent_id", "day"], // Specify rows to display
              cols: ["groupe", "status"], // Specify columns to display
              rendererName: "Horizontal Stacked Bar Chart", // Default chart renderer
              rowOrder: "value_a_to_z",
              colOrder: "value_z_to_a",
              // Additional PivotUI configurations can go here
          });
      }
  };
  
  const fetchAgentStatistics = async () => {
      try {
          const response = await axios.get("http://127.0.0.1:8000/admin/agents-stats");
          agentStats.value = response.data.map((agent) => ({
              ...agent,
              objectives: { group1: 0, group2: 0, group3: 0 },
          }));
  
          agentOptions.value = agentStats.value.map((agent) => ({
              name: `Agent ${agent.agent_id}`,
              id: agent.agent_id,
          }));
  
          for (const agent of agentStats.value) {
              await fetchObjectives(agent.agent_id);
          }
  
          // Render pivot table after data is loaded
          renderPivotTable();
      } catch (error) {
          console.error("Error fetching agent statistics:", error);
      }
  };
  
  const fetchObjectives = async (agentId) => {
      try {
          const response = await axios.get(`http://127.0.0.1:8000/admin/daily-objectives/${agentId}`);
          const agent = agentStats.value.find((a) => a.agent_id === agentId);
          if (agent) {
              agent.objectives = response.data.objectives;
          }
      } catch (error) {
          console.error(`Error fetching objectives for agent ${agentId}:`, error);
      }
  };
  
  const applyGlobalObjectives = async () => {
      loading.value = true;
      try {
          for (const agent of selectedAgents.value) {
              await axios.post(`http://127.0.0.1:8000/admin/daily-objectives/${agent.id}`, {
                  objectives: globalObjectives.value,
              });
  
              const agentToUpdate = agentStats.value.find((a) => a.agent_id === agent.id);
              if (agentToUpdate) {
                  agentToUpdate.objectives = { ...globalObjectives.value };
              }
          }
          // Re-render pivot table after updating objectives
          renderPivotTable();
      } catch (error) {
          console.error("Error applying objectives:", error);
      } finally {
          loading.value = false;
      }
  };
  
  const destroyPivotTable = () => {
      $("#pivot-table-container").empty(); // Clears the pivot table content
  };
  
  onMounted(() => {
      fetchAgentStatistics();
  });
  
  onUnmounted(() => {
      destroyPivotTable();
  });
  </script>
  
  <style>
  .dashboard-container {
    display: grid;
    grid-template-columns: minmax(300px, 1fr) 3fr;
    gap: 2rem;
    padding: 2rem;
    background: linear-gradient(to bottom right, #f8fafc, #f1f5f9);
    min-height: calc(100vh - 64px);
  }
  
  .objectives-section {
    position: sticky;
    top: 2rem;
  }
  
  .objectives-panel {
    background: white;
    border-radius: 16px;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
    border: 1px solid rgba(255, 255, 255, 0.7);
    backdrop-filter: blur(10px);
  }
  
  .stats-panel {
    background: white;
    border-radius: 16px;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
    border: 1px solid rgba(255, 255, 255, 0.7);
  }
  
  .panel-header {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 1.5rem;
    background: linear-gradient(to right, #4ade80, #22c55e);
    border-radius: 16px 16px 0 0;
    color: white;
  }
  
  .panel-header.stats {
    background: linear-gradient(to right, #60a5fa, #3b82f6);
  }
  
  .panel-header i {
    font-size: 1.5rem;
  }
  
  .panel-header span {
    font-size: 1.25rem;
    font-weight: 600;
    letter-spacing: 0.025em;
  }
  
  .section-title {
    margin: 1.5rem 0 1rem;
  }
  
  .section-title h3 {
    color: #1f2937;
    font-size: 1.125rem;
    font-weight: 600;
    margin-bottom: 0.5rem;
  }
  
  .title-underline {
    height: 2px;
    width: 40px;
    background: #22c55e;
    border-radius: 2px;
  }
  
  .objectives-grid {
    display: grid;
    gap: 1rem;
    margin-bottom: 1.5rem;
  }
  
  .objective-input {
    background: #f8fafc;
    padding: 1rem;
    border-radius: 12px;
    border: 1px solid #e2e8f0;
  }
  
  .objective-input label {
    color: #64748b;
    font-weight: 500;
  }
  
  :deep(.p-inputnumber) {
    width: 100%;
  }
  
  :deep(.p-inputnumber-input) {
    border-radius: 8px;
    border: 1px solid #e2e8f0;
    transition: all 0.2s;
  }
  
  :deep(.p-inputnumber-input:focus) {
    border-color: #22c55e;
    box-shadow: 0 0 0 2px rgba(34, 197, 94, 0.2);
  }
  
  .agent-select {
    margin-bottom: 1.5rem;
  }
  
  :deep(.p-multiselect) {
    width: 100%;
    border-radius: 8px;
  }
  
  :deep(.p-multiselect:not(.p-disabled).p-focus) {
    border-color: #22c55e;
    box-shadow: 0 0 0 2px rgba(34, 197, 94, 0.2);
  }
  
  .apply-button {
    width: 100%;
    background: linear-gradient(to right, #4ade80, #22c55e);
    border: none;
    border-radius: 8px;
    padding: 1rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    transition: all 0.2s;
  }
  
  .apply-button:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 6px -1px rgba(34, 197, 94, 0.2);
  }
  
  .apply-button:active {
    transform: translateY(0);
  }
  
  /* Enhanced PivotTable.js styles */
  #pivot-table-container {
    padding: 1.5rem;
    background: white;
    min-height: 400px;
    border-radius: 0 0 16px 16px;
  }
  
  :deep(.pvtUi) {
    width: 100%;
  }
  
  :deep(.pvtAxisContainer), :deep(.pvtVals) {
    background: #f8fafc;
    border: 1px solid #e2e8f0;
    border-radius: 8px;
    padding: 1rem;
  }
  
  :deep(.pvtAxisContainer li span.pvtAttr) {
    background: white;
    border: 1px solid #e2e8f0;
    border-radius: 6px;
    padding: 0.5rem 1rem;
    transition: all 0.2s;
  }
  
  :deep(.pvtAxisContainer li span.pvtAttr:hover) {
    background: #f1f5f9;
    border-color: #cbd5e1;
  }
  
  :deep(.pvtRenderer), :deep(.pvtAggregator) {
    margin: 0.5rem;
    padding: 0.5rem 1rem;
    border: 1px solid #e2e8f0;
    border-radius: 6px;
    background: white;
  }
  
  :deep(.pvtTable) {
    border-collapse: separate;
    border-spacing: 0;
    width: 100%;
    border-radius: 8px;
    overflow: hidden;
    border: 1px solid #e2e8f0;
  }
  
  :deep(.pvtTable th), :deep(.pvtTable td) {
    padding: 0.75rem 1rem;
    border: 1px solid #e2e8f0;
    transition: background-color 0.2s;
  }
  
  :deep(.pvtTable th) {
    background: #f8fafc;
    font-weight: 600;
    color: #1f2937;
  }
  
  :deep(.pvtTable td:hover) {
    background: #f1f5f9;
  }
  
  :deep(.pvtTotal), :deep(.pvtGrandTotal) {
    font-weight: 600;
    background: #f1f5f9;
    color: #1f2937;
  }
  
  @media (max-width: 1024px) {
    .dashboard-container {
      grid-template-columns: 1fr;
    }
  
    .objectives-section {
      position: static;
    }
  }
  </style>
  