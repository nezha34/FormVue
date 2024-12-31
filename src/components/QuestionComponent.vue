<template>
  <div class="question-container">
    <!-- Question Label -->
    <div class="question-wrapper">
      <label :for="`question-${question.id}`" class="question-label">
        {{ question.question }}
      </label>

      <!-- Dynamic Input Rendering Based on Question Type -->
      <div v-if="question.type" class="input-wrapper">
        <!-- Boolean (Yes/No Buttons) -->
        <div v-if="question.type === 'boolean'" class="button-group">
          <Button v-for="option in question.options || ['Oui', 'Non']" :key="option" :label="option"
            :class="['custom-button', { 'selected': localAnswer === option }]" @click="updateAnswer(option)" />
        </div>

        <!-- Text Input -->
        <InputText v-else-if="question.type === 'text'" v-model="localAnswer" @input="emitAnswer"
          placeholder="Enter your response" class="custom-input" />

        <!-- Number Input -->
        <InputNumber v-else-if="question.type === 'number'" showButtons v-model="localAnswer" @input="emitAnswer"
          placeholder="Enter a number" class="custom-input" :min="0" :max="4" :useGrouping="false" />

        <!-- Select Input -->
        <div v-else-if="question.type === 'select'" class="select-wrapper">
          <select @change="updateInterlocuteurNom($event.target.value)" class="custom-select">
            <option value="">{{ placeholder }}</option>
            <option v-for="member in filteredMembers" :key="member.id_indiv" :value="member.id_indiv">
              {{ member.nom + " " + member.prenom }}
            </option>
          </select>
        </div>
        <!-- Special Type with TVQuestionnaire -->
        <div v-else-if="question.type === 'special' && question.children?.length > 0" class="tv-questionnaire">
          <TVQuestionnaire v-if="question.type === 'special' && filteredPostes.length > 0" :postes="filteredPostes"
            :childOptions="question.children" @update-etat="handleEtatChange" @update-activite="handleActiviteUpdate"
            @update-poste-data="handlePosteDataUpdate" />
        </div>
      </div>
    </div>

    <!-- Special Case: GuestTable -->
    <div v-if="question.id === '7' && showChildren" class="guest-table-wrapper">
      <GuestTable :initialGuests="formData.invites" @update-guests="updateGuestData" />
    </div>

    <!-- Recursive Child Questions -->
    <div v-if="hasChildren && showChildren && question.id !== '7'" class="child-questions">
      <QuestionComponent v-for="child in question.children" :key="child.id" :question="child" :answers="answers"
        :formData="formData" :spacing="spacing + 10" @update-answer="$emit('update-answer', $event)" />
    </div>
  </div>
</template>

<script>
import { ref, watch, computed } from 'vue';
import Button from "primevue/button";
import InputText from "primevue/inputtext";
import InputNumber from "primevue/inputnumber";
import TVQuestionnaire from "./TVQuestionnaire.vue";
import GuestTable from "./GuestTable.vue";

export default {
  props: {
    question: {
      type: Object,
      required: true,
    },
    answers: {
      type: Object,
      required: true,
    },
    filteredPostes: {
      type: Array,
      default: () => [],
    },
    filteredMembers: {
      type: Array,
      default: () => [],
    },
    formData: {
      type: Object,
      required: true,
    },
    placeholder: {
      type: String,
      default: "Membres foyer",
    },
    spacing: {
      type: Number,
      default: 0,
    },
  },

  setup(props, { emit }) {
    const localAnswer = ref(props.answers[props.question.id] || "");
    const showChildren = ref(false);
    const question = computed(() => props.question);

    const hasChildren = computed(() => {
      return Array.isArray(props.question.children) && props.question.children.length > 0;
    });

    const updateAnswer = (value) => {
      localAnswer.value = value;

      emit("update-answer", {
        id_qst: props.question.id,
        question: props.question.question,
        answer: localAnswer.value,
      });

      if (props.question.type === "boolean") {
        showChildren.value = value === "Oui";
      }
    };

    const emitAnswer = () => {
      console.log('emitAnswer called');

      emit("update-answer", {
        id_qst: props.question.id,
        question: props.question.question,
        answer: localAnswer.value,
      });
      if (props.question.id === "2" && ["OFF", "Supprimé", "En panne"].includes(localAnswer.value)) {
        console.log('hey nona')
        emit("tv-state-change", localAnswer.value);
      }
      if (props.question.id === "2" && ["On"].includes(localAnswer.value)) {
        emit("tv-state-change", localAnswer.value);
      }
    };

    const handlePosteDataUpdate = (updatedPostes) => {
      console.log('update answer',updatedPostes)
      emit("update-answer", {
        id_qst: question.value.id,
        question: question.value.question,
        answer: updatedPostes,
      });
    };

    const handleEtatChange = (newEtat) => {
      console.log('update etat',newEtat)

      emit("update-answer", { id_qst: props.question.id, question: props.question.question, answer: newEtat });
    };

    const updateGuestData = (updatedGuests) => {
      const invitesArray = Array.isArray(updatedGuests) ? updatedGuests : [updatedGuests];

      props.formData.invites = invitesArray.map((guest) => ({
        no_foyer: guest.no_foyer || props.formData.no_foyer,
        nom: guest.nom || "",
        prenom: guest.prenom || "",
        age: parseInt(guest.age) || 0,
        sex: guest.sex || "",
        emplacement: guest.emplacement || "",
      }));
    };

    const handleActiviteUpdate = (updatedPostes) => {
      console.log('hey hzndleactivite', updatedPostes)
      const isTVInactive = updatedPostes.some((poste) =>
        ["OFF", "Supprimé", "En panne"].includes(poste.etat)
      );

      if (isTVInactive) {
        emit("update-members-activity", "Ne Regarde Pas TV");
      }
    };

    const updateInterlocuteurNom = (selectedId) => {
      const selectedMember = props.filteredMembers.find(
        (member) => member.id_indiv === parseInt(selectedId, 10)
      );

      if (selectedMember) {
        props.formData.interlocuteur_nom = `${selectedMember.nom} ${selectedMember.prenom}`;
        props.formData.interlocuteur_touche = `${selectedMember.num_touche}`;
      } else {
        props.formData.interlocuteur_nom = "";
        props.formData.interlocuteur_touche = "";
      }

      updateAnswer(selectedId);
    };

    watch(() => props.answers[props.question.id], (newAnswer) => {
      if (props.question.type === 'number') {
        const value = parseInt(newAnswer, 10);
        localAnswer.value = isNaN(value) ? null : value;
      } else {
        localAnswer.value = newAnswer || "";
      }
    }, { immediate: true });

    return {
      showChildren,
      hasChildren,
      localAnswer,
      updateAnswer,
      emitAnswer,

      updateInterlocuteurNom,
      updateGuestData,
      handlePosteDataUpdate,
      handleActiviteUpdate,
      question,
    };
  },
  components: {
    Button,
    InputText,
    InputNumber,
    TVQuestionnaire,
    GuestTable,
  },
};
</script>

<style scoped>
.question-container {
  background-color: #ffffff;
  margin-bottom: 0.5rem;
}

.question-wrapper {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  align-items: center;
  justify-content: center;
  text-align: center;
  height: 100%;
}

.question-label {
  font-size: 0.975rem;
  font-weight: 500;
  color: #1A1A1A;
}

.input-wrapper {
  width: 100%;
}

.button-group {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.custom-button {
  min-width: 4rem;
  transition: all 0.2s ease;
}

.custom-button:not(.selected) {
  background-color: #f3f4f6;
  border: 1px solid #e5e7eb;
  color: #374151;
}

.custom-button:not(.selected):hover {
  background-color: #e5e7eb;
  border-color: #d1d5db;
}

.custom-button.selected {
  background-color: #4caf50;
  border-color: #4caf50;
  color: white;
}

.custom-button.selected:hover {
  background-color: #45a049;
  border-color: #45a049;
}

.custom-input,
.custom-select {
  width: 100%;
  padding: 0.625rem 0.875rem;
  border-radius: 0.375rem;
  font-size: 0.95rem;
  background-color: #ffffff;
  color: #64758b;
  border-color: #cbd5e1;
}

.custom-select {
  appearance: none;
  background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236B7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e");
  background-position: right 0.5rem center;
  background-repeat: no-repeat;
  background-size: 1.5em 1.5em;
}

.custom-input:focus,
.custom-select:focus {
  border-color: #4f46e5;
  box-shadow: 0 0 0 2px rgba(79, 70, 229, 0.1);
  outline: none;
}

.child-questions {
  margin-left: 1.5rem;
  margin-top: 0.5rem;
  padding-left: 1rem;
  border-left: 2px solid #e5e7eb;
}

.tv-questionnaire {
  margin-top: 0.5rem;
  width: 100%;
}

/* PrimeVue Component Overrides */
:deep(.p-inputtext),
:deep(.p-dropdown),
:deep(.p-inputnumber-input) {
  width: 100%;
  border-radius: 0.375rem !important;
}

:deep(.p-button) {
  border-radius: 0.375rem !important;
}

/* InputNumber styles */
:deep(.p-inputnumber) {
  width: 100%;
  position: relative;
}

:deep(.p-inputnumber-buttons-stacked) {
  position: absolute;
  right: 0;
  top: 0;
  height: 100%;
}

:deep(.p-inputnumber-button) {
  height: 50% !important;
  width: 2rem !important;
  padding: 0 !important;
}

:deep(.p-inputnumber-button-up) {
  border-top-right-radius: 0.375rem !important;
  border-bottom-right-radius: 0 !important;
  border-top-left-radius: 0 !important;
  border-bottom-left-radius: 0 !important;
}

:deep(.p-inputnumber-button-down) {
  border-bottom-right-radius: 0.375rem !important;
  border-top-right-radius: 0 !important;
  border-top-left-radius: 0 !important;
  border-bottom-left-radius: 0 !important;
}

:deep(.p-inputnumber-input) {
  border-top-right-radius: 0 !important;
  border-bottom-right-radius: 0 !important;
  text-align: left;
  padding-right: 3rem !important;
}

/* Responsive Adjustments */
@media (max-width: 640px) {
  .question-container {
    padding: 0.75rem;
  }

  .button-group {
    flex-wrap: wrap;
  }
}
</style>