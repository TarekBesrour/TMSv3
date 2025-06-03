import React, { useState } from 'react';
import { ChatBubbleLeftRightIcon, PaperAirplaneIcon, MicrophoneIcon } from '@heroicons/react/24/outline';

// Assistant IA component - Virtual assistant for TMS users
const Assistant: React.FC = () => {
  const [message, setMessage] = useState('');
  const [chatHistory, setChatHistory] = useState([
    { role: 'assistant', content: 'Bonjour ! Je suis votre assistant TMS. Comment puis-je vous aider aujourd\'hui ?' },
  ]);

  // Sample quick actions that the assistant can perform
  const quickActions = [
    { id: 1, text: 'Afficher les livraisons en retard' },
    { id: 2, text: 'Créer une nouvelle commande' },
    { id: 3, text: 'Optimiser les tournées de demain' },
    { id: 4, text: 'Analyser la performance de la semaine' },
    { id: 5, text: 'Vérifier le statut du véhicule TR-7845' },
  ];

  // Handle sending a new message
  const handleSendMessage = () => {
    if (!message.trim()) return;
    
    // Add user message to chat
    setChatHistory([...chatHistory, { role: 'user', content: message }]);
    
    // Clear input
    setMessage('');
    
    // Simulate assistant response (in a real app, this would call the backend IA service)
    setTimeout(() => {
      let response;
      
      // Simple pattern matching for demo purposes
      if (message.toLowerCase().includes('retard') || message.toLowerCase().includes('en retard')) {
        response = 'J\'ai identifié 3 livraisons en retard aujourd\'hui. La livraison #4582 a un retard estimé de 45 minutes en raison d\'un embouteillage sur l\'A1. Souhaitez-vous voir les détails ou contacter le client ?';
      } else if (message.toLowerCase().includes('commande') || message.toLowerCase().includes('nouvelle commande')) {
        response = 'Je peux vous aider à créer une nouvelle commande. Avez-vous déjà les informations du client et les détails de l\'expédition ?';
      } else if (message.toLowerCase().includes('optimiser') || message.toLowerCase().includes('tournée')) {
        response = 'D\'après mon analyse, je peux optimiser les tournées de demain pour réduire les coûts de 8.5% et améliorer le taux de remplissage de 12%. Souhaitez-vous voir ma proposition d\'optimisation ?';
      } else if (message.toLowerCase().includes('performance') || message.toLowerCase().includes('analyser')) {
        response = 'La performance de cette semaine montre une amélioration de 5% du taux de livraison à l\'heure et une réduction de 3% des coûts par kilomètre par rapport à la semaine dernière. Je peux générer un rapport détaillé si vous le souhaitez.';
      } else if (message.toLowerCase().includes('tr-7845') || message.toLowerCase().includes('véhicule')) {
        response = 'Le véhicule TR-7845 est actuellement en tournée (chauffeur: Martin Dupont). J\'ai détecté une usure des plaquettes de frein qui nécessitera une maintenance dans les 2 semaines à venir. Souhaitez-vous planifier cette maintenance ?';
      } else {
        response = 'Je comprends votre demande concernant "' + message + '". Comment puis-je vous aider plus précisément sur ce sujet ?';
      }
      
      setChatHistory(prev => [...prev, { role: 'assistant', content: response }]);
    }, 1000);
  };

  return (
    <div className="h-full flex flex-col">
      {/* Page header */}
      <div className="border-b border-gray-200 pb-4">
        <div className="sm:flex sm:items-center sm:justify-between">
          <div className="flex items-center">
            <ChatBubbleLeftRightIcon className="h-8 w-8 text-indigo-600 mr-3" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Assistant IA</h1>
              <p className="mt-1 text-sm text-gray-500">
                Votre assistant personnel pour la gestion du transport
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main content area */}
      <div className="flex-1 flex flex-col bg-gray-50 rounded-lg mt-5 overflow-hidden">
        {/* Chat messages area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {chatHistory.map((msg, index) => (
            <div 
              key={index} 
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div 
                className={`max-w-3/4 rounded-lg px-4 py-2 ${
                  msg.role === 'user' 
                    ? 'bg-indigo-600 text-white' 
                    : 'bg-white border border-gray-200 text-gray-800'
                }`}
              >
                <p>{msg.content}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Quick actions */}
        <div className="bg-white border-t border-gray-200 p-4">
          <h3 className="text-sm font-medium text-gray-500 mb-3">Actions rapides</h3>
          <div className="flex flex-wrap gap-2">
            {quickActions.map((action) => (
              <button
                key={action.id}
                className="inline-flex items-center px-3 py-1 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-full text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                onClick={() => {
                  setMessage(action.text);
                  setTimeout(() => handleSendMessage(), 100);
                }}
              >
                {action.text}
              </button>
            ))}
          </div>
        </div>

        {/* Message input */}
        <div className="bg-white border-t border-gray-200 p-4">
          <div className="flex">
            <div className="flex-1">
              <input
                type="text"
                className="block w-full rounded-full border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                placeholder="Posez votre question ou demandez une action..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              />
            </div>
            <div className="ml-3 flex">
              <button
                type="button"
                className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-full shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                onClick={handleSendMessage}
              >
                <PaperAirplaneIcon className="h-5 w-5" />
              </button>
              <button
                type="button"
                className="ml-2 inline-flex items-center px-3 py-2 border border-gray-300 text-sm leading-4 font-medium rounded-full shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <MicrophoneIcon className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* AI capabilities section */}
      <div className="mt-6">
        <h2 className="text-lg font-medium text-gray-900">Capacités de l'Assistant IA</h2>
        <div className="mt-3 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-base font-medium text-indigo-800">Assistance Opérationnelle</h3>
              <p className="mt-1 text-sm text-gray-500">
                Suivi des expéditions, gestion des incidents, création de commandes et planification des tournées.
              </p>
            </div>
          </div>
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-base font-medium text-indigo-800">Analyse et Reporting</h3>
              <p className="mt-1 text-sm text-gray-500">
                Génération de rapports personnalisés, analyse des KPIs et recommandations d'optimisation.
              </p>
            </div>
          </div>
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-base font-medium text-indigo-800">Automatisation des Tâches</h3>
              <p className="mt-1 text-sm text-gray-500">
                Exécution automatique des tâches répétitives, alertes proactives et suggestions contextuelles.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Assistant;
