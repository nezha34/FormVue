<template>
    <div class="section-card">
      <div class="card-header">
        <i v-if="icon" :class="['pi', icon]" class="section-icon"></i>
        <h3 class="section-title">{{ title }}</h3>
      </div>
      <slot></slot>
    </div>
  </template>
  
  <script>
  import 'primeicons/primeicons.css';
  
  export default {
    props: {
      title: {
        type: String,
        required: true,
      },
      icon: {
        type: String,
        required: false,
      },
    },
  };
  </script>
  
  <style scoped>
  .section-card {
    background-color: #f0f2f5;
    padding: 15px;
    margin: 20px 0;
    border-radius: 8px;
    box-shadow: 0px 4px 6px rgba(0, 0, 0, 0.1);
    text-align: center; /* Center-aligns everything inside the card */
  }
  
  .card-header {
    display: flex;
    align-items: center;
    justify-content: center; /* Centers icon and title together */
  }
  
  .section-icon {
    font-size: 1.2em; /* Set icon size relative to text */
    color: #333;
    margin-right: 8px;
  }
  
  .section-title {
    font-size: 1.2em; /* Match icon and title sizes */
    font-weight: bold;
    color: #333;
  }
  </style>
  