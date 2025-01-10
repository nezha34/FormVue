<template>
    <div class="login-wrapper">
        <div class="login-container">
            <h2 class="login-title">Connexion</h2>
            <form>
                <div class="form-group">
                    <label for="username">Nom d'utilisateur</label>
                    <InputText v-model="username" placeholder="Nom d'utilisateur" />
                </div>
                <div class="form-group">
                    <label for="password">Mot de passe</label>
                    <Password v-model="password" placeholder="Mot de passe" />
                </div>
                <Button label="Se connecter" class="login-button" @click="login" />
            </form>
        </div>
    </div>
</template>

<script>
import { ref } from 'vue';
import InputText from 'primevue/inputtext';
import Password from 'primevue/password';
import Button from 'primevue/button';

export default {
    name: 'Login',
    components: {
        InputText,
        Password,
        Button,
    },
    setup() {
        const username = ref('');
        const password = ref('');
        const login = () => {
            console.log("Login function triggered");

            if (!username.value.trim() || !password.value.trim()) {
                alert('Please fill in all fields.');
                return;
            }

            const mockUsers = [
                { id: 1, username: 'kamelia', password: '1234', role: 'agent', name: 'kamelia' },
                { id: 2, username: 'Fati', password: '1234', role: 'agent', name: 'kamelia' },
                { id: 3, username: 'admin', password: 'admin123', role: 'admin', name: 'Admin' },
            ];
            console.log("Mock Users:", mockUsers);

            const user = mockUsers.find(
                (u) =>
                    u.username.toLowerCase() === username.value.trim().toLowerCase() &&
                    u.password === password.value.trim()
            );
            console.log("Matched User:", user);

            if (user) {
                console.log("Redirecting...");
                // Store user details in localStorage
                localStorage.setItem('loggedInUser', JSON.stringify(user));

                if (user.role === 'admin') {
                    window.location.href = '/Admin';
                } else {
                    // Save the numeric ID instead of username
                    localStorage.setItem('agentId', user.name.toString());
                    console.log("Agent ID saved to localStorage:", user.name);
                    window.location.href = '/form'; // Redirect to the form
                }
            } else {
                alert('Invalid username or password!');
            }
        };



        return {
            username,
            password,
            login,
        };
    },
};
</script>

<style scoped>
.login-wrapper {
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 100vh;
    background: linear-gradient(135deg, #4caf50, #81c784);
}

.login-container {
    max-width: 350px;
    width: 100%;
    padding: 30px;
    border-radius: 12px;
    background: #fff;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
    text-align: center;
}

.login-title {
    font-size: 24px;
    font-weight: bold;
    color: #2e7d32;
    margin-bottom: 20px;
}

.form-group {
    margin-bottom: 20px;
    text-align: left;
}

label {
    display: block;
    margin-bottom: 8px;
    font-size: 14px;
    color: #555;
}

input {
    width: 100%;
    padding: 10px 15px;
    border: 1px solid #ccc;
    border-radius: 6px;
    font-size: 14px;
    color: #333;
    background-color: #f9f9f9;
    transition: border-color 0.2s ease, background-color 0.2s ease;
}

input:focus {
    outline: none;
    border-color: #4caf50;
    background-color: #fff;
}

.login-button {
    width: 100%;
    padding: 10px 15px;
    border: none;
    border-radius: 6px;
    font-size: 16px;
    color: #fff;
    background: linear-gradient(135deg, #4caf50, #388e3c);
    cursor: pointer;
    transition: background 0.2s ease;
}

.login-button:hover {
    background: linear-gradient(135deg, #388e3c, #2e7d32);
}

.login-container form {
    margin-top: 10px;
}
</style>
