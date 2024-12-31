import { createRouter, createWebHistory } from 'vue-router';
import Login from './views/Login.vue';
import Admin from './views/Admin.vue';
import Form from './views/FormPage.vue';

// Middleware for authentication
function requireAuth(to, from, next) {
  const loggedInUser = JSON.parse(localStorage.getItem('loggedInUser'));
  if (!loggedInUser) {
    next({ name: 'login' }); // Redirect to login if not authenticated
  } else {
    next(); // Proceed if authenticated
  }
}

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/login',
      name: 'login',
      component: Login,

    }
,    

    {
      path: '/Admin',
      name: 'Admin',
      component: Admin,
      beforeEnter: (to, from, next) => {
        const loggedInUser = JSON.parse(localStorage.getItem('loggedInUser'));
        if (loggedInUser?.role === 'admin') {
          next(); // Allow if user is an admin
        } else {
          next({ name: 'login' }); // Redirect to login otherwise
        }
      },
    },
    {
      path: '/form/',
      name: 'form',
      component: Form,
      beforeEnter: requireAuth, // Protect route
    },
    {
      path: '/:catchAll(.*)',
      name: 'NotFound',
      redirect: '/login', // Redirect undefined routes to login
    },
  ],
});

export default router;
