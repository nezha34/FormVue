<template>
  <div class="console-web">
    <h1>Conso Web Questionnaire</h1>

    <div v-if="!consoleTree">Loading tree...</div>
    <div v-else>
      <h2>Questionnaire Pour {{ currentMemberName }} ({{ currentMemberIndex + 1 }}/{{ members.length }})</h2>

      <div v-if="currentQuestion" class="question-section">
        <p><strong>{{ currentQuestion.question }}</strong></p>

        <!-- Single or multi-select options -->
        <div v-if="Array.isArray(currentQuestion.options)">
          <button
            v-for="option in currentQuestion.options"
            :key="option.code"
            @click="handleAnswer(option)"
            class="option-button"
          >
            {{ option.value }}
          </button>
        </div>

        <!-- ... possibly handle multi-select or "Autre" inputs ... -->
      </div>

      <!-- If finished current member's questions -->
      <div v-if="sectionEnded">
        <p>Terminé pour {{ currentMemberName }}.</p>
        <button v-if="currentMemberIndex < members.length - 1" @click="moveToNextMember">
          Membre Suivant
        </button>
        <button v-else @click="finishAll">
          Submit Pour tous les individus
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, watch, computed } from "vue";

export default {
  name: "ConsoleWeb",
  props: {
    modelValue: {
      type: Array,
      default: () => [],
    },
    members: {
      type: Array,
      default: () => [],
    },
    consoleTree: {
      type: Object,
      required: true,
    },
  },
  emits: ["update:modelValue"],
  setup(props, { emit }) {
    // State
    const currentMemberIndex = ref(0);
    const answers = ref({}); // e.g. answers["Alice"] = [{ question_id, reponse }...]
    const currentQuestion = ref(null);
    const questionQueue = ref([]);
    const sectionEnded = ref(false);

    const currentMemberName = computed(() => {
      return props.members[currentMemberIndex.value]?.nom || // If your member object is {nom, prenom, ...}
             props.members[currentMemberIndex.value]?.name ||
             `Member #${currentMemberIndex.value + 1}`;
    });


    const resetSurvey = (tree) => {
      if (!tree) return;
      questionQueue.value = [tree];
      currentQuestion.value = questionQueue.value.shift();
      sectionEnded.value = false;

      // Initialize answers for the current member if not existing
      const memberName = currentMemberName.value;
      if (!answers.value[memberName]) {
        answers.value[memberName] = [];
      }
    };
    // Watch for new consoleTree
    watch(
      () => props.consoleTree,
      (newVal) => {
        if (newVal) {
          resetSurvey(newVal);
        }
      },
      { immediate: true }
    );

    // Convert internal answers -> array
    const convertAnswersToExpectedFormat = () => {
      return Object.entries(answers.value).map(([member, resp]) => ({
        person: member,
        responses: resp,
      }));
    };

    const updateModelValue = () => {
      emit("update:modelValue", convertAnswersToExpectedFormat());
    };



    // Single-select example
    const handleAnswer = (option) => {
      if (!currentQuestion.value) return;

      const memberName = currentMemberName.value;
      // Save answer
      answers.value[memberName].push({
        question_id: currentQuestion.value.id,
        reponse: option.value,
      });
      updateModelValue();

      navigateNext(option);
    };

    const navigateNext = (option) => {
      // If "yes"/"oui", add children
      if (option.value.toLowerCase().includes("oui") && currentQuestion.value.children) {
        const children = Object.values(currentQuestion.value.children);
        questionQueue.value.unshift(...children);
      }

      if (questionQueue.value.length > 0) {
        currentQuestion.value = questionQueue.value.shift();
      } else {
        sectionEnded.value = true;
      }
    };

    const moveToNextMember = () => {
      // Move to next person
      if (currentMemberIndex.value < props.members.length - 1) {
        currentMemberIndex.value++;
        resetSurvey(props.consoleTree); // Re-initialize for the new person
      }
    };

    const finishAll = () => {
      console.log("Final answers:", convertAnswersToExpectedFormat());
      alert("All done! Check console for final answers.");
      // Possibly emit a "finish" event or do something else
    };

    return {
      currentMemberIndex,
      currentMemberName,
      currentQuestion,
      questionQueue,
      sectionEnded,
      handleAnswer,
      moveToNextMember,
      finishAll,
    };
  },
};
</script>
