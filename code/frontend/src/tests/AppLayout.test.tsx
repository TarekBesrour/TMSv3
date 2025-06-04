import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import AppLayout from '../components/layout/AppLayout';

// Mock des composants enfants pour isoler les tests
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  Outlet: () => <div data-testid="outlet-content">Page Content</div>,
}));

describe('AppLayout Component', () => {
  test('renders the navigation menu', () => {
    render(
      <BrowserRouter>
        <AppLayout />
      </BrowserRouter>
    );
    
    // Vérifier que le logo et le titre sont présents
    expect(screen.getByText(/TMS/i)).toBeInTheDocument();
    
    // Vérifier que les éléments de navigation principaux sont présents
    expect(screen.getByText(/Tableau de bord/i)).toBeInTheDocument();
    expect(screen.getByText(/Assistant IA/i)).toBeInTheDocument();
    expect(screen.getByText(/Commandes/i)).toBeInTheDocument();
    expect(screen.getByText(/Planification/i)).toBeInTheDocument();
  });

  test('toggles mobile menu when hamburger button is clicked', () => {
    render(
      <BrowserRouter>
        <AppLayout />
      </BrowserRouter>
    );
    
    // Le menu mobile devrait être fermé par défaut
    const mobileMenu = screen.queryByRole('menu', { hidden: true });
    expect(mobileMenu).not.toBeVisible();
    
    // Cliquer sur le bouton hamburger
    const hamburgerButton = screen.getByLabelText(/open menu/i);
    fireEvent.click(hamburgerButton);
    
    // Le menu mobile devrait maintenant être visible
    expect(mobileMenu).toBeVisible();
    
    // Cliquer à nouveau pour fermer
    fireEvent.click(hamburgerButton);
    
    // Le menu mobile devrait être à nouveau fermé
    expect(mobileMenu).not.toBeVisible();
  });

  test('renders user profile section', () => {
    render(
      <BrowserRouter>
        <AppLayout />
      </BrowserRouter>
    );
    
    // Vérifier que le profil utilisateur est présent
    expect(screen.getByText(/Admin User/i)).toBeInTheDocument();
  });

  test('renders the main content area', () => {
    render(
      <BrowserRouter>
        <AppLayout />
      </BrowserRouter>
    );
    
    // Vérifier que la zone de contenu principal est présente
    expect(screen.getByTestId('outlet-content')).toBeInTheDocument();
  });
});
