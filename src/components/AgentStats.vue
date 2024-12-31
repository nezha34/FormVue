<template>
    <div class="agent-stats-panel">
      <h3>Agent Assignments</h3>
      <div v-for="(assignment, agent) in assignments" :key="agent" class="agent-group">
        <h4>{{ agent }}</h4>
        <div v-for="day in assignment.days" :key="day.day" class="day-group">
          <h5>Day {{ day.day }}</h5>
          <p>Total Foyers: {{ day.foyers.length }}</p>
          <ul>
            <li v-for="foyer in day.foyers" :key="foyer.id">
              Foyer ID: {{ foyer.id }} (Size: {{ foyer.taille_foyer }})
            </li>
          </ul>
        </div>
      </div>
      <h3>KPIs</h3>
      <div class="kpis">
        <p><strong>Total Forms:</strong> {{ totalForms }}</p>
        <p><strong>Total Responses:</strong> {{ totalResponses }}</p>
        <p><strong>Non-Responses:</strong> {{ totalNonResponses }}</p>
      </div>
    </div>
  </template>
  
  <script>
  export default {
    props: {
      assignments: {
        type: Object,
        required: true,
      },
      kpiData: {
        type: Object,
        required: true,
      },
    },
    computed: {
      totalForms() {
        return this.kpiData.totalForms || 0;
      },
      totalResponses() {
        return this.kpiData.totalResponses || 0;
      },
      totalNonResponses() {
        return this.kpiData.totalNonResponses || 0;
      },
    },
  };
  </script>
  
  <style scoped>
  .agent-stats-panel {
    padding: 1rem;
    background-color: #f9f9f9;
    border: 1px solid #e0e0e0;
    border-radius: 8px;
    box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.05);
  }
  .agent-group {
    margin-bottom: 1rem;
    padding: 1rem;
    background-color: #ffffff;
    border: 1px solid #ccc;
    border-radius: 4px;
  }
  .kpis {
    margin-top: 1rem;
    padding: 1rem;
    background-color: #eef7ee;
    border: 1px solid #b3ddb3;
    border-radius: 4px;
  }
  </style>
  