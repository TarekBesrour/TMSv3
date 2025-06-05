import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Assistant from '../pages/Assistant';

// Mock des composants et fonctions externes
jest.mock('../services/ai', () => ({
  sendMessageToAssistant: jest.fn().mockImplementation((message) => 
    Promise.resolve({
      text: `Réponse à: ${message}`,
      timestamp: new Date().toISOString(),
      source: 'ai'
    })
  )
}));

describe('Assistant Component', () => {
  test('renders the assistant interface', () => {
    render(
      <BrowserRouter>
        <Assistant />
      </BrowserRouter>
    );
    
    // Vérifier que les éléments principaux sont présents
    expect(screen.getByText(/Assistant IA/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Posez votre question.../i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Envoyer/i })).toBeInTheDocument();
  });

  test('allows user to send a message and displays response', async () => {
    render(
      <BrowserRouter>
        <Assistant />
      </BrowserRouter>
    );
    
    // Simuler la saisie d'un message
    const input = screen.getByPlaceholderText(/Posez votre question.../i);
    fireEvent.change(input, { target: { value: 'Comment optimiser mes tournées?' } });
    
    // Envoyer le message
    const sendButton = screen.getByRole('button', { name: /Envoyer/i });
    fireEvent.click(sendButton);
    
    // Vérifier que le message utilisateur est affiché
    expect(screen.getByText('Comment optimiser mes tournées?')).toBeInTheDocument();
    
    // Vérifier que la réponse de l'IA est affichée (asynchrone)
    const aiResponse = await screen.findByText(/Réponse à: Comment optimiser mes tournées?/i);
    expect(aiResponse).toBeInTheDocument();
    
    // Vérifier que le champ de saisie est vidé après l'envoi
    expect((input as HTMLInputElement).value).toBe('');
  });

  test('displays suggested questions and allows clicking them', async () => {
    render(
      <BrowserRouter>
        <Assistant />
      </BrowserRouter>
    );
    
    // Vérifier que les suggestions sont présentes
    const suggestions = screen.getAllByRole('button', { name: /^(?!Envoyer).+/ });
    expect(suggestions.length).toBeGreaterThan(0);
    
    // Cliquer sur une suggestion
    fireEvent.click(suggestions[0]);
    
    // Vérifier que la suggestion est envoyée comme message
    const suggestionText = suggestions[0].textContent;
    expect(screen.getByText(suggestionText || '')).toBeInTheDocument();
    
    // Vérifier que la réponse de l'IA est affichée (asynchrone)
    const aiResponse = await screen.findByText(new RegExp(`Réponse à: ${suggestionText}`, 'i'));
    expect(aiResponse).toBeInTheDocument();
  });

  test('handles empty message submission', () => {
    render(
      <BrowserRouter>
        <Assistant />
      </BrowserRouter>
    );
    
    // Tenter d'envoyer un message vide
    const sendButton = screen.getByRole('button', { name: /Envoyer/i });
    fireEvent.click(sendButton);
    
    // Vérifier qu'aucun message n'est ajouté à la conversation
    const messages = screen.queryAllByRole('listitem');
    expect(messages.length).toBe(0);
  });
});
