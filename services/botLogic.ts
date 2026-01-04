
import { BotResponse } from '../types';

/**
 * Core Rule-Based logic for the Health-Care Assistant.
 * Uses keyword matching and if/else conditions to determine responses.
 */
export const getBotResponse = (input: string): BotResponse => {
  const query = input.toLowerCase().trim();

  // Basic keyword matching logic
  if (query.includes('hi') || query.includes('hello') || query.includes('hey')) {
    return {
      text: "Hello! I'm your Health-Care Assistant. I'm available 24/7 to help you with basic health inquiries. How can I assist you today?",
      suggestions: ['Symptoms', 'Appointment', 'Emergency Help', 'Medicine Reminder']
    };
  }

  if (query.includes('fever')) {
    return {
      text: "Fever is often a sign that your body is fighting an infection. Common causes include the flu, cold, or COVID-19. \n\nCare Tips:\n1. Drink plenty of fluids.\n2. Get lots of rest.\n3. Monitor your temperature.\n\nPlease consult a doctor if the fever exceeds 103°F (39.4°C) or lasts more than 3 days.",
      suggestions: ['Symptoms', 'Medicines', 'Doctor Appointment']
    };
  }

  if (query.includes('cold') || query.includes('cough')) {
    return {
      text: "Common colds usually resolve on their own within a week. \n\nTips:\n- Stay hydrated with warm liquids.\n- Use a humidifier.\n- Gargle with salt water for sore throat.\n\nIf symptoms persist, consider speaking with a physician.",
      suggestions: ['Medicines', 'Doctor Appointment']
    };
  }

  if (query.includes('headache')) {
    return {
      text: "Headaches can be caused by stress, dehydration, or eye strain. Try resting in a dark, quiet room and drinking water. If you experience sudden, severe pain or vision changes, seek immediate help.",
      suggestions: ['Symptoms', 'Emergency Help']
    };
  }

  if (query.includes('appointment') || query.includes('book') || query.includes('doctor')) {
    return {
      text: "To book an appointment with our specialists, you can:\n1. Use our online portal at www.health-care.com/book\n2. Call our help desk at 1-800-HEALTHY.\n3. Visit our hospital reception desk.\n\nWould you like information about a specific department?",
      suggestions: ['Cardiology', 'Pediatrics', 'General Medicine']
    };
  }

  if (query.includes('emergency') || query.includes('urgent') || query.includes('help')) {
    return {
      text: "⚠️ **Emergency Protocol**\nIf this is a life-threatening emergency, please call **911** (or your local emergency number) immediately.\n\nOur 24/7 Emergency Room is located at: \n123 Wellness Ave, Health City.\nHelpline: 999-000-111",
    };
  }

  if (query.includes('covid') || query.includes('corona')) {
    return {
      text: "COVID-19 symptoms include fever, dry cough, and tiredness. If you suspect you have COVID-19, please self-isolate and get tested. Ensure you are up to date with vaccinations.",
      suggestions: ['Symptoms', 'Vaccination Info']
    };
  }

  if (query.includes('symptoms')) {
    return {
      text: "I can provide information about symptoms for common ailments like Fever, Cold, Headache, or Allergies. Which one are you experiencing?",
      suggestions: ['Fever', 'Headache', 'Cold']
    };
  }

  if (query.includes('medicine') && !query.includes('reminder')) {
    return {
      text: "I cannot prescribe specific medications. However, for mild symptoms, over-the-counter options like Ibuprofen or Acetaminophen are commonly used. Always consult a pharmacist or doctor before taking new medication.",
      suggestions: ['Doctor Appointment', 'Medicine Reminder']
    };
  }

  if (query.includes('hospital') || query.includes('location')) {
    return {
      text: "Our main hospital, 'City Health Center', is located at 123 Wellness Ave. We have branches in Northview and Southside. All locations are open 24/7.",
      suggestions: ['View Map', 'Emergency Help']
    };
  }

  if (query.includes('diseases')) {
    return {
      text: "We provide care for various conditions including Diabetes, Hypertension, and Infectious Diseases. Please visit our 'Services' page or book a consultation for a detailed diagnosis.",
      suggestions: ['Diabetes', 'Hypertension', 'Doctor Appointment']
    };
  }

  if (query.includes('reminder')) {
    return {
      text: "I can help you set a medicine reminder! Let's start. What is the name of the medicine?",
      suggestions: ['Cancel']
    };
  }

  if (query.includes('thank')) {
    return {
      text: "You're very welcome! Stay healthy. I'm here 24/7 if you need anything else.",
      suggestions: ['Menu', 'Symptoms']
    };
  }

  // Fallback response
  return {
    text: "I'm sorry, I didn't quite catch that. I am a rule-based assistant specializing in healthcare. Try asking about symptoms, appointments, or emergency help.",
    suggestions: ['Symptoms', 'Doctor Appointment', 'Emergency Help', 'Medicine Reminder']
  };
};
