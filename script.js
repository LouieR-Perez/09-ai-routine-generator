// Add an event listener to the form that runs when the form is submitted
document.getElementById('routineForm').addEventListener('submit', async (e) => {
  // Prevent the form from refreshing the page
  e.preventDefault();
  
  // Get values from all form inputs and store them in variables
  const timeOfDay = document.getElementById('timeOfDay').value;
  const focusArea = document.getElementById('focusArea').value;
  const timeAvailable = document.getElementById('timeAvailable').value;
  const energyLevel = document.getElementById('energyLevel').value;
  // Get all checked activities
  const activityNodes = document.querySelectorAll('input[name="activities"]:checked');
  const preferredActivitiesArr = Array.from(activityNodes).map(cb => cb.value);
  const preferredActivities = preferredActivitiesArr.join(', ') || 'None';

  // Save preferences to localStorage
  const preferences = {
    timeOfDay,
    focusArea,
    timeAvailable,
    energyLevel,
    preferredActivitiesArr
  };
  localStorage.setItem('routinePreferences', JSON.stringify(preferences));
  
  // Find the submit button and update its appearance to show loading state
  const button = document.querySelector('button[type="submit"]');
  button.textContent = 'Generating...';
  button.disabled = true;
  
  try {    
    // Make the API call to OpenAI's chat completions endpoint
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [      
          { role: 'system', content: `You are a helpful assistant that creates quick, focused daily routines. Always keep routines short, realistic, and tailored to the user's preferences.` },
          { role: 'user', content: `Plan a personalized daily routine for me based on these details:\n- Time of day: ${timeOfDay}\n- Focus area: ${focusArea}\n- Time available: ${timeAvailable}\n- Energy level: ${energyLevel}\n- Preferred activities: ${preferredActivities}\n\nPlease provide a structured, step-by-step routine that fits these parameters.` }
        ],
        temperature: 0.7,
        max_completion_tokens: 500
      })
    });
    
    // Convert API response to JSON and get the generated routine
    const data = await response.json();
    const routine = data.choices[0].message.content;
    
    // Show the result section and display the routine
    document.getElementById('result').classList.remove('hidden');
    document.getElementById('routineOutput').textContent = routine;
    
  } catch (error) {
    // If anything goes wrong, log the error and show user-friendly message
    console.error('Error:', error);
    document.getElementById('routineOutput').textContent = 'Sorry, there was an error generating your routine. Please try again.';
  } finally {
    // Always reset the button back to its original state using innerHTML to render the icon
    button.innerHTML = '<i class="fas fa-wand-magic-sparkles"></i> Generate My Routine';
    button.disabled = false;
  }
});

// Load preferences from localStorage and set form values
window.addEventListener('DOMContentLoaded', () => {
  const saved = localStorage.getItem('routinePreferences');
  if (saved) {
    try {
      const prefs = JSON.parse(saved);
      if (prefs.timeOfDay) document.getElementById('timeOfDay').value = prefs.timeOfDay;
      if (prefs.focusArea) document.getElementById('focusArea').value = prefs.focusArea;
      if (prefs.timeAvailable) document.getElementById('timeAvailable').value = prefs.timeAvailable;
      if (prefs.energyLevel) document.getElementById('energyLevel').value = prefs.energyLevel;
      if (Array.isArray(prefs.preferredActivitiesArr)) {
        document.querySelectorAll('input[name="activities"]').forEach(cb => {
          cb.checked = prefs.preferredActivitiesArr.includes(cb.value);
        });
      }
    } catch (e) {
      // Ignore errors and do not restore if parsing fails
    }
  }
});
