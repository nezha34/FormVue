<template>
  <header class="header">
    <div class="header-logo">
      <img src="/Users/nezhanezha/Downloads/MarocMetrieLogo.Jpeg" alt="Marocmétrie Logo" />
    </div>

    <Button
      label="Logout"
      icon="pi pi-sign-out"
      class="p-button-danger logout-button"
      @click="handleLogout"
    />
  </header>
</template>

<script>
import { useRouter } from 'vue-router';
import Button from 'primevue/button';

export default {
  name: 'Header',
  components: {
    Button,
  },
  setup() {
    const router = useRouter();

    const handleLogout = () => {
      localStorage.removeItem('loggedInUser'); // Clear user session
      router.push('/login'); // Redirect to login page
    };

    return {
      handleLogout,
    };
  },
};
</script>

<style scoped>
/* Header Container */
.header {
  display: flex;
  align-items: center;
  padding: 10px 20px;
  background-color: #2e7d32; /* Marocmétrie green */
  height: 60px;
  box-shadow: 0px 2px 5px rgba(0, 0, 0, 0.1);
  color: white;
}

/* Logo Section */
.header-logo img {
  height: 40px;
}

/* Navigation Styles */
.nav-links {
  display: flex;
  align-items: center;
  gap: 20px;
  margin-left: auto; /* Align to the left */
}

.nav-links a {
  color: #fff; /* White text for contrast */
  text-decoration: none;
  font-size: 16px;
  font-weight: 500;
  transition: color 0.3s;
}

.nav-links a:hover {
  color: #81c784; /* Lighter green for hover */
}

/* Logout Button */
.logout-button {
  margin-left: auto;
  background-color: #d32f2f; /* Red for logout */
  color: white;
  font-size: 14px;
  font-weight: bold;
  border-radius: 5px;
  transition: background-color 0.3s;
}

.logout-button:hover {
  background-color: #b71c1c; /* Darker red on hover */
}
</style>
