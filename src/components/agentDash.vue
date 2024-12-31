<template>
  <Drawer v-model:visible="visible" position="left" class="assignment-sidebar">
    <template #container="{ closeCallback }">
      <div class="flex flex-column h-full">
        <div class="header">
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
        <div class="content">
          <div>
            <label for="agentSelect">Select Agent:</label>
            <select id="agentSelect" v-model="selectedAgent">
              <option v-for="agent in agents" :key="agent" :value="agent">{{ agent }}</option>
            </select>
          </div>
          <div>
            <label for="daySelect">Select Day:</label>
            <select id="daySelect" v-model="selectedDay">
              <option v-for="day in 15" :key="day" :value="day">Day {{ day }}</option>
            </select>
          </div>
        </div>
      </div>
    </template>
  </Drawer>
</template>

<script>
import { ref } from 'vue';

export default {
  setup() {
    const visible = ref(false);
    const agents = ['Agent 1', 'Agent 2', 'Agent 3'];
    const selectedAgent = ref(agents[0]);
    const selectedDay = ref(1);

    return { visible, agents, selectedAgent, selectedDay };
  },
};
</script>

<style scoped>
.assignment-sidebar .header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
}
.assignment-sidebar .content {
  padding: 1rem;
}
</style>
