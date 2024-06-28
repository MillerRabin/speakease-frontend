export const createButtons = (label, stage, text) => `<div class="taskbutton-container">
    <button is="speakease-taskbutton" class="yes" task="${label}" stage="${stage}" postfix="Yes">${text.yes}</button>
    <button is="speakease-taskbutton" class="no" task="${label}" stage="${stage}" postfix="No">${text.no}</button>
  </div>`;