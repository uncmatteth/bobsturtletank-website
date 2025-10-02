import { getAllCharacters } from './characters';
import { getAllArtifacts } from './artifacts';
import { getAllLocations } from './locations';

export interface TriviaQuestion {
  question: string;
  correctAnswer: string;
  wrongAnswers: string[];
  category: 'characters' | 'artifacts' | 'locations' | 'general';
}

function shuffle<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export function generateTriviaQuestions(count: number = 10): TriviaQuestion[] {
  const allQuestions: TriviaQuestion[] = [];

  // Character questions
  const characters = getAllCharacters();
  characters.forEach(char => {
    // Question about first appearance
    if (char.firstAppearance) {
      const wrongChapters = characters
        .filter(c => c.name !== char.name && c.firstAppearance && c.firstAppearance !== char.firstAppearance)
        .map(c => c.firstAppearance)
        .slice(0, 3);
      
      if (wrongChapters.length === 3) {
        allQuestions.push({
          question: `In which chapter did ${char.name} first appear?`,
          correctAnswer: `Chapter ${char.firstAppearance}`,
          wrongAnswers: wrongChapters.map(ch => `Chapter ${ch}`),
          category: 'characters',
        });
      }
    }

    // Question about subcategory/role
    if (char.subcategory) {
      const otherCategories = ['Main', 'Allies', 'Antagonists', 'Minor']
        .filter(cat => cat !== char.subcategory);
      
      allQuestions.push({
        question: `What role does ${char.name} play in the story?`,
        correctAnswer: char.subcategory,
        wrongAnswers: shuffle(otherCategories).slice(0, 3),
        category: 'characters',
      });
    }

    // Question about status
    if (char.status && char.status !== 'None') {
      const otherStatuses = ['Active', 'Defeated', 'Transformed', 'Unknown']
        .filter(s => s !== char.status);
      
      allQuestions.push({
        question: `What is the current status of ${char.name}?`,
        correctAnswer: char.status,
        wrongAnswers: shuffle(otherStatuses).slice(0, 3),
        category: 'characters',
      });
    }
  });

  // Artifact questions
  const artifacts = getAllArtifacts();
  artifacts.forEach(artifact => {
    // Question about owner
    if (artifact.owner && artifact.owner !== 'None') {
      const otherOwners = characters
        .map(c => c.name)
        .filter(name => name !== artifact.owner)
        .slice(0, 3);
      
      if (otherOwners.length === 3) {
        allQuestions.push({
          question: `Who owns or possesses the ${artifact.name}?`,
          correctAnswer: artifact.owner,
          wrongAnswers: shuffle(otherOwners).slice(0, 3),
          category: 'artifacts',
        });
      }
    }

    // Question about artifact type
    if (artifact.subcategory) {
      const otherTypes = ['Weapons', 'Food', 'Tools', 'Magical Items', 'Relics']
        .filter(t => t !== artifact.subcategory);
      
      allQuestions.push({
        question: `What type of artifact is the ${artifact.name}?`,
        correctAnswer: artifact.subcategory,
        wrongAnswers: shuffle(otherTypes).slice(0, 3),
        category: 'artifacts',
      });
    }
  });

  // Location questions
  const locations = getAllLocations();
  locations.forEach(location => {
    // Question about location type
    if (location.subcategory) {
      const otherTypes = ['Villages', 'Forests', 'Mountains', 'Cities', 'Dungeons', 'Realms']
        .filter(t => t !== location.subcategory);
      
      allQuestions.push({
        question: `What type of location is ${location.name}?`,
        correctAnswer: location.subcategory,
        wrongAnswers: shuffle(otherTypes).slice(0, 3),
        category: 'locations',
      });
    }

    // Question about first appearance
    if (location.firstAppearance) {
      const wrongChapters = locations
        .filter(l => l.name !== location.name && l.firstAppearance && l.firstAppearance !== location.firstAppearance)
        .map(l => l.firstAppearance)
        .slice(0, 3);
      
      if (wrongChapters.length === 3) {
        allQuestions.push({
          question: `In which chapter was ${location.name} first mentioned or visited?`,
          correctAnswer: `Chapter ${location.firstAppearance}`,
          wrongAnswers: wrongChapters.map(ch => `Chapter ${ch}`),
          category: 'locations',
        });
      }
    }
  });

  // Return a random selection
  return shuffle(allQuestions).slice(0, count);
}

