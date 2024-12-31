<template>
  <div class="console-web">
    <h1>Console Web Questionnaire</h1>
    <div v-if="loading">Loading questions...</div>
    <div v-else-if="error">{{ error }}</div>
    <div v-else>
      <!-- Render Current Question -->
      <div v-if="currentQuestion" class="question-section">
        <p><strong>{{ currentQuestion.question }}</strong></p>
        <!-- Render options for single and multi-select -->
        <div class="option-button-container">
          <button
            v-for="option in currentQuestion.options"
            :key="option.code"
            @click="isMultiSelect ? handleMultiSelect(option) : handleAnswer(option)"
            class="option-button"
            :class="{ selected: selectedOptions.includes(option) }"
            severity="secondary" raised
          >
            {{ option.value }}
          </button>
        </div>
        <!-- Text input for "Autre à préciser" -->
        <div v-if="showTextInput">
          <input
            v-model="customInput"
            placeholder="Veuillez préciser..."
            @input="handleCustomInput(currentQuestion.id, customInput)"
            class="input-text"
          />
        </div>
        <!-- Navigation Buttons -->
        <div class="navigation-buttons">
          <!-- Back Button -->
          <button
            v-if="questionHistory.length > 0"
            @click="goBackToPreviousQuestion"
            class="back-button"
          >
            Back
          </button>
          <!-- Next Button for Multi-select Questions -->
          <div v-if="isMultiSelect" class="option-button-container">
            <button @click="handleMultiSelectSubmit" class="next-button">
              Next
            </button>
          </div>
        </div>
      </div>
      <!-- End of Section -->
      <div v-if="sectionEnded">
        <p class="end-note">Cette partie du questionnaire est terminée.</p>
      </div>
    </div>
  </div>
</template>

<script>
import axios from "axios";
import { ref, onMounted } from "vue";

export default {
  name: "ConsoleWeb",
  props: {
    modelValue: {
      type: Array,
      default: () => [],
    },
  },
  setup(props, { emit }) {
    const loading = ref(true);
    const error = ref(null);
    const consoleTree = ref(null);
    const currentQuestion = ref(null);
    const sectionEnded = ref(false);
    const questionQueue = ref([]);
    const showTextInput = ref(false);
    const customInput = ref("");
    const selectedOptions = ref([]);
    const isMultiSelect = ref(false);
    const questionHistory = ref([]);
    const questionMap = ref({}); // Keep track of questions added based on answers

    // Initialize answers
    const answers = ref({});

    // Fetch the consoleTree from the given endpoint
    const fetchConsoleTree = async () => {
      try {
        const response = await axios.get("http://127.0.0.1:8000/consoleTree");
        consoleTree.value = response.data;

        // Initialize the question queue and question history
        questionQueue.value = [];
        questionHistory.value = [];
        questionMap.value = {};

        // Add the root question to the queue
        questionQueue.value.push(consoleTree.value);

        // Set the current question
        currentQuestion.value = questionQueue.value.shift();
        updateMultiSelectStatus();
      } catch (err) {
        error.value = "Failed to load the questionnaire. Please try again later.";
        console.error(err);
      } finally {
        loading.value = false;
      }
    };

    // Update the multi-select status for the current question
    const updateMultiSelectStatus = () => {
      isMultiSelect.value =
        currentQuestion.value && currentQuestion.value.type === "multi-select";
      selectedOptions.value = []; // Clear previous selections
      showTextInput.value = false; // Reset text input visibility
      customInput.value = ""; // Reset custom input value
    };

    // Convert answers to the expected array format
    const convertAnswersToExpectedFormat = () => {
      const result = [];
      for (const [questionId, response] of Object.entries(answers.value)) {
        if (questionId.endsWith("_custom")) continue;

        const customInputValue = answers.value[`${questionId}_custom`];
        const finalResponse = customInputValue
          ? `${response} (${customInputValue})`
          : response;

        result.push({
          question_id: parseInt(questionId),
          reponse: finalResponse,
        });
      }
      return result;
    };

    // Handle user answer and navigate through the tree for single select
    const handleAnswer = (option) => {
      answers.value[currentQuestion.value.id] = option.value;

      if (option.value.includes("Autres")) {
        showTextInput.value = true;
      } else {
        showTextInput.value = false;
      }

      // Emit updated value as an array
      emit("update:modelValue", convertAnswersToExpectedFormat());

      navigateToNextQuestion(option);
    };

    // Handle custom input for "Autre à préciser"
    const handleCustomInput = (questionId, value) => {
      answers.value[`${questionId}_custom`] = value;

      // Emit updated value as an array
      emit("update:modelValue", convertAnswersToExpectedFormat());
    };

    // Handle multi-select option selection
    const handleMultiSelect = (option) => {
      const index = selectedOptions.value.indexOf(option);

      if (index === -1) {
        selectedOptions.value.push(option);
        if (option.value.includes("Autre")) {
          showTextInput.value = true;
        }
      } else {
        selectedOptions.value.splice(index, 1);
        if (option.value.includes("Autre")) {
          showTextInput.value = false;
          customInput.value = "";
        }
      }
    };

    // Handle multi-select submission
    const handleMultiSelectSubmit = () => {
      answers.value[currentQuestion.value.id] = selectedOptions.value
        .map((opt) => opt.value)
        .join(", ");

      // Emit updated value as an array
      emit("update:modelValue", convertAnswersToExpectedFormat());

      navigateToNextQuestion();
    };

    // Navigate to the next question
    const navigateToNextQuestion = (option = null) => {
      // Save the current question to history before moving forward
      if (currentQuestion.value) {
        questionHistory.value.push(currentQuestion.value);
      }

      const optionValueLower = option ? option.value.toLowerCase() : "";

      // Remove any previous mapping for the current question
      delete questionMap.value[currentQuestion.value.id];

      let addedQuestionIds = [];

      if (currentQuestion.value.children) {
        if (optionValueLower.includes("oui") || optionValueLower.includes("yes")) {
          // If the answer is "Yes", add child questions to the front of the queue
          const children = Object.values(currentQuestion.value.children);
          questionQueue.value.unshift(...children);

          // Keep track of the IDs of the questions added
          addedQuestionIds = children.map((child) => child.id);
        }
        // If "No", do not add child questions
      }

      // Map the current question ID to the added question IDs
      if (addedQuestionIds.length > 0) {
        questionMap.value[currentQuestion.value.id] = addedQuestionIds;
      }

      // Proceed to the next question in the queue
      if (questionQueue.value.length > 0) {
        currentQuestion.value = questionQueue.value.shift();
        updateMultiSelectStatus();
      } else {
        endSection();
      }
    };

    // Go back to the previous question
    const goBackToPreviousQuestion = () => {
      if (questionHistory.value.length > 0) {
        // Remove any answers given to the current question
        delete answers.value[currentQuestion.value.id];

        // Remove any child questions added based on the current question's previous answer
        const addedQuestionIds = questionMap.value[currentQuestion.value.id];
        if (addedQuestionIds) {
          questionQueue.value = questionQueue.value.filter(
            (q) => !addedQuestionIds.includes(q.id)
          );
          delete questionMap.value[currentQuestion.value.id];
        }

        // Set the previous question as the current question
        currentQuestion.value = questionHistory.value.pop();

        // Remove any answers given to questions after the current one
        for (const questionId in answers.value) {
          if (parseInt(questionId) > currentQuestion.value.id) {
            delete answers.value[questionId];
          }
        }

        updateMultiSelectStatus();

        // Emit updated answers
        emit("update:modelValue", convertAnswersToExpectedFormat());
      }
    };

    // End the section
    const endSection = () => {
      currentQuestion.value = null;
      sectionEnded.value = true;
    };

    onMounted(fetchConsoleTree);

    return {
      loading,
      error,
      currentQuestion,
      answers,
      sectionEnded,
      handleAnswer,
      showTextInput,
      customInput,
      handleCustomInput,
      handleMultiSelect,
      handleMultiSelectSubmit,
      isMultiSelect,
      selectedOptions,
      goBackToPreviousQuestion,
      questionHistory,
    };
  },
};
</script>


<style scoped>
.console-web {
  padding: 20px;
  font-family: Arial, sans-serif;
}
.option-button-container {
  display: flex;
  gap: 0.5rem; /* Adjust spacing as needed */
  align-items: center;
  justify-content: center; /* Center buttons horizontally */

}

.question-section {
  margin-bottom: 20px;
}

.option-button {
  margin: 10px 0;
  padding: 10px 15px;
  background-color: #4caf50;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}

.option-button:hover {
  background-color: #45a049;
}

.option-button.selected {
  background-color: #ff9800;
}

.navigation-buttons {
  display: flex;
  justify-content: space-between;
  margin-top: 20px;
}

.back-button {
  padding: 10px 15px;
  background-color: #f0ad4e; /* Bootstrap warning color */
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}

.back-button:hover {
  background-color: #ec971f;
}

.next-button {
  padding: 10px 15px;
  background-color: #2196f3;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}

.next-button:hover {
  background-color: #0b7dda;
}

.input-text {
  padding: 10px;
  margin-top: 10px;
  width: 100%;
}

.end-note {
  margin-top: 20px;
  padding: 15px;
  background-color: #f0f0f0;
  border-radius: 5px;
  text-align: center;
  font-weight: bold;
}
</style>
