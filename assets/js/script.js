// Ativar a animação da elixir bar quando a página carregar
document.addEventListener('DOMContentLoaded', function () {
    const elixirFill = document.querySelector('.elixir-fill');
    elixirFill.classList.add('active');
});

function scrollToSection(sectionId) {
    document.getElementById(sectionId).scrollIntoView({ behavior: 'smooth' });
}

function runQuery(queryId) {
    const resultsContainer = document.getElementById('results-container');
    resultsContainer.innerHTML = ''; // Limpa resultados anteriores

    let resultText = '';
    switch (queryId) {
        case 1:
            const card1 = document.getElementById('card1').value;
            const startDate1 = document.getElementById('startDate1').value;
            const endDate1 = document.getElementById('endDate1').value;
            resultText = `Calculando taxa de vitórias/derrotas para a carta "${card1}" entre ${startDate1} e ${endDate1}. Resultado fictício: 60% vitórias, 40% derrotas.`;
            break;
        case 2:
            const winPercent2 = document.getElementById('winPercent2').value;
            const startDate2 = document.getElementById('startDate2').value;
            const endDate2 = document.getElementById('endDate2').value;
            resultText = `Listando decks com mais de ${winPercent2}% de vitórias entre ${startDate2} e ${endDate2}. Exemplo fictício: Deck [Golem, Witch, Zap] - 65%.`;
            break;
        case 3:
            const combo3 = document.getElementById('combo3').value;
            const startDate3 = document.getElementById('startDate3').value;
            const endDate3 = document.getElementById('endDate3').value;
            resultText = `Quantidade de derrotas com o combo "${combo3}" entre ${startDate3} e ${endDate3}. Resultado fictício: 120 derrotas.`;
            break;
        case 4:
            const card4 = document.getElementById('card4').value;
            const trophyDiff4 = document.getElementById('trophyDiff4').value;
            resultText = `Vitórias com a carta "${card4}" onde o vencedor tinha ${trophyDiff4}% menos troféus. Resultado fictício: 45 vitórias.`;
            break;
        default:
            resultText = 'Consulta não implementada.';
    }

    const resultElement = document.createElement('p');
    resultElement.textContent = resultText;
    resultElement.classList.add('result-text', 'animate__animated', 'animate__fadeIn');
    resultsContainer.appendChild(resultElement);
}

// Função para buscar cartas da API
async function fetchCards() {
    try {
        // Substitua pela URL da sua API
        const response = await fetch('https://api.clashroyale.com/v1/cards');
        const data = await response.json();

        // Container onde as cartas serão exibidas
        const cardsContainer = document.getElementById('cards-container');

        // Limpa o container antes de adicionar as cartas
        cardsContainer.innerHTML = '';

        // Itera sobre as cartas e cria os elementos HTML
        data.items.forEach(card => {
            const cardElement = document.createElement('div');
            cardElement.classList.add('col-md-3', 'card-item');

            cardElement.innerHTML = `
                <img src="${card.iconUrls.medium}" alt="${card.name}">
                <h5>${card.name}</h5>
                <p>Raridade: ${card.rarity}</p>
            `;

            cardsContainer.appendChild(cardElement);
        });
    } catch (error) {
        console.error('Erro ao buscar as cartas:', error);
    }
}

// Função para buscar carta específica
async function searchCard() {
    const cardName = document.getElementById('searchCardInput').value.trim();
    if (!cardName) {
        alert('Por favor, insira o nome de uma carta.');
        return;
    }

    try {
        const response = await fetch(`https://api.clashroyale.com/v1/cards`);
        const data = await response.json();

        const resultsContainer = document.getElementById('search-results');
        resultsContainer.innerHTML = '';

        const filteredCards = data.items.filter(card => card.name.toLowerCase().includes(cardName.toLowerCase()));

        if (filteredCards.length === 0) {
            resultsContainer.innerHTML = '<p class="text-white">Nenhuma carta encontrada.</p>';
            return;
        }

        filteredCards.forEach(card => {
            const cardElement = document.createElement('div');
            cardElement.classList.add('col-md-3', 'card-item');
            cardElement.innerHTML = `
                <img src="${card.iconUrls.medium}" alt="${card.name}">
                <h5>${card.name}</h5>
                <p>Raridade: ${card.rarity}</p>
            `;
            resultsContainer.appendChild(cardElement);
        });
    } catch (error) {
        console.error('Erro ao buscar cartas:', error);
    }
}

// Funções para manipular o deck
const selectedDeck = [];

function addCardToDeck(card) {
    if (selectedDeck.length >= 8) {
        alert('Você só pode adicionar até 8 cartas ao deck.');
        return;
    }

    if (selectedDeck.includes(card)) {
        alert('Esta carta já foi adicionada ao deck.');
        return;
    }

    selectedDeck.push(card);
    updateDeckUI();
}

function updateDeckUI() {
    const deckContainer = document.getElementById('deck-container');
    deckContainer.innerHTML = '';

    selectedDeck.forEach(card => {
        const cardElement = document.createElement('div');
        cardElement.classList.add('col-md-3', 'card-item');
        cardElement.innerHTML = `
            <img src="${card.iconUrls.medium}" alt="${card.name}">
            <h5>${card.name}</h5>
        `;
        deckContainer.appendChild(cardElement);
    });
}

function finalizeDeck() {
    if (selectedDeck.length === 0) {
        alert('Adicione pelo menos uma carta ao deck.');
        return;
    }

    console.log('Deck finalizado:', selectedDeck);
    alert('Deck finalizado com sucesso!');
}

// Função para buscar informações de batalhas
async function fetchBattleInfo() {
    try {
        const response = await fetch(`https://api.clashroyale.com/v1/battles`);
        const data = await response.json();

        const battleInfoContainer = document.getElementById('battle-info-container');
        battleInfoContainer.innerHTML = '';

        data.items.forEach(battle => {
            const battleElement = document.createElement('div');
            battleElement.classList.add('battle-item');
            battleElement.innerHTML = `
                <h5>Jogador: ${battle.player.name}</h5>
                <p>Troféus: ${battle.player.trophies}</p>
                <p>Deck: ${battle.player.deck.map(card => card.name).join(', ')}</p>
                <p>Tempo de Jogo: ${battle.duration}</p>
            `;
            battleInfoContainer.appendChild(battleElement);
        });
    } catch (error) {
        console.error('Erro ao buscar informações de batalhas:', error);
    }
}

// Chama a função para carregar as cartas ao carregar a página
document.addEventListener('DOMContentLoaded', fetchCards);

// Função para rolar até uma seção
function scrollToSection(sectionId) {
    document.getElementById(sectionId).scrollIntoView({ behavior: 'smooth' });
}

// Função para executar consultas
async function executeQuery(queryName) {
    const resultsContainer = document.getElementById('results-container');
    resultsContainer.innerHTML = '<p>Carregando...</p>';

    try {
        let url, body;
        switch (queryName) {
            case 'calculateWinLossPercentage':
                const cardX = document.getElementById('cardX').value;
                const startDate1 = document.getElementById('startDate1').value;
                const endDate1 = document.getElementById('endDate1').value;
                if (!cardX || !startDate1 || !endDate1) throw new Error('Preencha todos os campos');
                url = '/api/calculateWinLossPercentage';
                body = { cardX, startTimestamp: startDate1, endTimestamp: endDate1 };
                break;

            case 'listWinningDecks':
                const winPercentage = document.getElementById('winPercentage').value;
                const startDate2 = document.getElementById('startDate2').value;
                const endDate2 = document.getElementById('endDate2').value;
                if (!winPercentage || !startDate2 || !endDate2) throw new Error('Preencha todos os campos');
                url = '/api/listWinningDecks';
                body = { percentage: parseFloat(winPercentage), startTimestamp: startDate2, endTimestamp: endDate2 };
                break;

            case 'calculateComboLosses':
                const comboCards = document.getElementById('comboCards').value.split(',').map(c => c.trim());
                const startDate3 = document.getElementById('startDate3').value;
                const endDate3 = document.getElementById('endDate3').value;
                if (!comboCards.length || !startDate3 || !endDate3) throw new Error('Preencha todos os campos');
                url = '/api/calculateComboLosses';
                body = { cards: comboCards, startTimestamp: startDate3, endTimestamp: endDate3 };
                break;

            case 'calculateSpecialWins':
                const cardX4 = document.getElementById('cardX4').value;
                const trophyDifference = document.getElementById('trophyDifference').value;
                if (!cardX4 || !trophyDifference) throw new Error('Preencha todos os campos');
                url = '/api/calculateSpecialWins';
                body = { cardX: cardX4, trophyDifference: parseFloat(trophyDifference) };
                break;

            case 'listWinningCombos':
                const comboSize = document.getElementById('comboSize').value;
                const winPercentage5 = document.getElementById('winPercentage5').value;
                const startDate5 = document.getElementById('startDate5').value;
                const endDate5 = document.getElementById('endDate5').value;
                if (!comboSize || !winPercentage5 || !startDate5 || !endDate5) throw new Error('Preencha todos os campos');
                url = '/api/listWinningCombos';
                body = { comboSize: parseInt(comboSize), percentage: parseFloat(winPercentage5), startTimestamp: startDate5, endTimestamp: endDate5 };
                break;

            case 'calculateCardUsageRate':
                const cardX6 = document.getElementById('cardX6').value;
                const startDate6 = document.getElementById('startDate6').value;
                const endDate6 = document.getElementById('endDate6').value;
                if (!cardX6 || !startDate6 || !endDate6) throw new Error('Preencha todos os campos');
                url = '/api/calculateCardUsageRate';
                body = { cardX: cardX6, startTimestamp: startDate6, endTimestamp: endDate6 };
                break;

            case 'listTopPlayersByCard':
                const cardX7 = document.getElementById('cardX7').value;
                if (!cardX7) throw new Error('Preencha todos os campos');
                url = '/api/listTopPlayersByCard';
                body = { cardX: cardX7 };
                break;

            case 'calculateAverageMatchDuration':
                const cardX8 = document.getElementById('cardX8').value;
                if (!cardX8) throw new Error('Preencha todos os campos');
                url = '/api/calculateAverageMatchDuration';
                body = { cardX: cardX8 };
                break;

            case 'listPopularDecksByCard':
                const cardX9 = document.getElementById('cardX9').value;
                if (!cardX9) throw new Error('Preencha todos os campos');
                url = '/api/listPopularDecksByCard';
                body = { cardX: cardX9 };
                break;

            default:
                throw new Error('Consulta inválida');
        }

        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        });

        if (!response.ok) throw new Error('Erro na requisição');

        const data = await response.json();
        displayResults(queryName, data);

    } catch (error) {
        resultsContainer.innerHTML = `<p class="text-danger">Erro: ${error.message}</p>`;
    }
}

// Função para exibir resultados
function displayResults(queryName, data) {
    const resultsContainer = document.getElementById('results-container');
    resultsContainer.innerHTML = '';

    switch (queryName) {
        case 'calculateWinLossPercentage':
            resultsContainer.innerHTML = `
                <h4>Taxa de Vitória/Derrota</h4>
                <p>Vitórias: ${data.winPercentage.toFixed(2)}%</p>
                <p>Derrotas: ${data.lossPercentage.toFixed(2)}%</p>
            `;
            break;

        case 'listWinningDecks':
            if (data.length === 0) {
                resultsContainer.innerHTML = '<p>Nenhum deck encontrado.</p>';
                return;
            }
            resultsContainer.innerHTML = `
                <h4>Decks Vencedores</h4>
                <ul>
                    ${data.map(item => `<li>Deck: ${item.deck.join(', ')} - ${item.winPercentage.toFixed(2)}%</li>`).join('')}
                </ul>
            `;
            break;

        case 'calculateComboLosses':
            resultsContainer.innerHTML = `
                <h4>Derrotas por Combo</h4>
                <p>Total de Derrotas: ${data}</p>
            `;
            break;

        case 'calculateSpecialWins':
            resultsContainer.innerHTML = `
                <h4>Vitórias Especiais</h4>
                <p>Total de Vitórias: ${data}</p>
            `;
            break;

        case 'listWinningCombos':
            if (data.length === 0) {
                resultsContainer.innerHTML = '<p>Nenhum combo encontrado.</p>';
                return;
            }
            resultsContainer.innerHTML = `
                <h4>Combos Vencedores</h4>
                <ul>
                    ${data.map(combo => `<li>Combo: ${combo.join(', ')}</li>`).join('')}
                </ul>
            `;
            break;

        case 'calculateCardUsageRate':
            resultsContainer.innerHTML = `
                <h4>Taxa de Uso da Carta</h4>
                <p>Taxa: ${data.toFixed(2)}%</p>
            `;
            break;

        case 'listTopPlayersByCard':
            if (data.length === 0) {
                resultsContainer.innerHTML = '<p>Nenhum jogador encontrado.</p>';
                return;
            }
            resultsContainer.innerHTML = `
                <h4>Melhores Jogadores</h4>
                <ul>
                    ${data.map(player => `<li>${player.nickname}: ${player.winPercentage.toFixed(2)}%</li>`).join('')}
                </ul>
            `;
            break;

        case 'calculateAverageMatchDuration':
            resultsContainer.innerHTML = `
                <h4>Duração Média de Partidas</h4>
                <p>Duração: ${data.toFixed(2)} segundos</p>
            `;
            break;

        case 'listPopularDecksByCard':
            if (data.length === 0) {
                resultsContainer.innerHTML = '<p>Nenhum deck encontrado.</p>';
                return;
            }
            resultsContainer.innerHTML = `
                <h4>Decks Populares</h4>
                <ul>
                    ${data.map(item => `<li>Deck: ${item.deck.join(', ')} - Usos: ${item.totalUses}</li>`).join('')}
                </ul>
            `;
            break;
    }
}

// Funções de apoio (para outras seções)
function searchCard() {
    const query = document.getElementById('searchCardInput').value;
    // Implementar lógica de busca de cartas (ex.: via API Clash Royale)
    document.getElementById('search-results').innerHTML = `<p>Buscando "${query}"...</p>`;
}

function searchClan() {
    const query = document.getElementById('clanNameInput').value;
    // Implementar lógica de busca de clãs
    document.getElementById('clan-results').innerHTML = `<p>Buscando "${query}"...</p>`;
}

function finalizeDeck() {
    // Implementar lógica de finalização de deck
    alert('Deck finalizado! (Funcionalidade a implementar)');
}

// Animações com Anime.js
document.addEventListener('DOMContentLoaded', () => {
    // Animação inicial do Hero
    anime({
        targets: '.hero-title',
        scale: [0, 1],
        opacity: [0, 1],
        easing: 'easeOutElastic(1, .6)',
        duration: 1200
    });

    anime({
        targets: '.hero-subtitle',
        translateY: [50, 0],
        opacity: [0, 1],
        easing: 'easeOutQuad',
        duration: 800,
        delay: 300
    });

    anime({
        targets: '.btn-hero',
        scale: [0.8, 1],
        opacity: [0, 1],
        easing: 'easeOutQuad',
        duration: 800,
        delay: 600
    });

    // Animação de seções ao rolar
    const sections = document.querySelectorAll('.query-section, .cards-section, .results-section, .about-section');
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('section-visible');
            }
        });
    }, { threshold: 0.1 });

    sections.forEach(section => {
        section.classList.add('section-hidden');
        observer.observe(section);
    });
});
// Rolar para seção
function scrollToSection(sectionId) {
    document.getElementById(sectionId).scrollIntoView({ behavior: 'smooth' });
}

// Ativar aba
function activateTab(tabId) {
    const tab = new bootstrap.Tab(document.getElementById(tabId));
    tab.show();
}

// Executar consultas
async function executeQuery(queryName) {
    const resultsContainer = document.getElementById('results-container');
    resultsContainer.innerHTML = '<p>Carregando...</p>';

    try {
        let url, body;
        switch (queryName) {
            case 'calculateWinLossPercentage':
                const cardX = document.getElementById('cardX').value;
                const startDate1 = document.getElementById('startDate1').value;
                const endDate1 = document.getElementById('endDate1').value;
                if (!cardX || !startDate1 || !endDate1) throw new Error('Preencha todos os campos');
                url = '/api/calculateWinLossPercentage';
                body = { cardX, startTimestamp: startDate1, endTimestamp: endDate1 };
                break;
            case 'listWinningDecks':
                const winPercentage = document.getElementById('winPercentage').value;
                const startDate2 = document.getElementById('startDate2').value;
                const endDate2 = document.getElementById('endDate2').value;
                if (!winPercentage || !startDate2 || !endDate2) throw new Error('Preencha todos os campos');
                url = '/api/listWinningDecks';
                body = { percentage: parseFloat(winPercentage), startTimestamp: startDate2, endTimestamp: endDate2 };
                break;
            case 'calculateComboLosses':
                const comboCards = document.getElementById('comboCards').value.split(',').map(c => c.trim());
                const startDate3 = document.getElementById('startDate3').value;
                const endDate3 = document.getElementById('endDate3').value;
                if (!comboCards.length || !startDate3 || !endDate3) throw new Error('Preencha todos os campos');
                url = '/api/calculateComboLosses';
                body = { cards: comboCards, startTimestamp: startDate3, endTimestamp: endDate3 };
                break;
            case 'calculateSpecialWins':
                const cardX4 = document.getElementById('cardX4').value;
                const trophyDifference = document.getElementById('trophyDifference').value;
                if (!cardX4 || !trophyDifference) throw new Error('Preencha todos os campos');
                url = '/api/calculateSpecialWins';
                body = { cardX: cardX4, trophyDifference: parseFloat(trophyDifference) };
                break;
            case 'listWinningCombos':
                const comboSize = document.getElementById('comboSize').value;
                const winPercentage5 = document.getElementById('winPercentage5').value;
                const startDate5 = document.getElementById('startDate5').value;
                const endDate5 = document.getElementById('endDate5').value;
                if (!comboSize || !winPercentage5 || !startDate5 || !endDate5) throw new Error('Preencha todos os campos');
                url = '/api/listWinningCombos';
                body = { comboSize: parseInt(comboSize), percentage: parseFloat(winPercentage5), startTimestamp: startDate5, endTimestamp: endDate5 };
                break;
            case 'calculateCardUsageRate':
                const cardX6 = document.getElementById('cardX6').value;
                const startDate6 = document.getElementById('startDate6').value;
                const endDate6 = document.getElementById('endDate6').value;
                if (!cardX6 || !startDate6 || !endDate6) throw new Error('Preencha todos os campos');
                url = '/api/calculateCardUsageRate';
                body = { cardX: cardX6, startTimestamp: startDate6, endTimestamp: endDate6 };
                break;
            case 'listTopPlayersByCard':
                const cardX7 = document.getElementById('cardX7').value;
                if (!cardX7) throw new Error('Preencha todos os campos');
                url = '/api/listTopPlayersByCard';
                body = { cardX: cardX7 };
                break;
            case 'calculateAverageMatchDuration':
                const cardX8 = document.getElementById('cardX8').value;
                if (!cardX8) throw new Error('Preencha todos os campos');
                url = '/api/calculateAverageMatchDuration';
                body = { cardX: cardX8 };
                break;
            case 'listPopularDecksByCard':
                const cardX9 = document.getElementById('cardX9').value;
                if (!cardX9) throw new Error('Preencha todos os campos');
                url = '/api/listPopularDecksByCard';
                body = { cardX: cardX9 };
                break;
            default:
                throw new Error('Consulta inválida');
        }

        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        });

        if (!response.ok) throw new Error('Erro na requisição');

        const data = await response.json();
        displayResults(queryName, data);

    } catch (error) {
        resultsContainer.innerHTML = `<p class="text-danger">Erro: ${error.message}</p>`;
    }
}

// Exibir resultados
function displayResults(queryName, data) {
    const resultsContainer = document.getElementById('results-container');
    resultsContainer.innerHTML = '';

    switch (queryName) {
        case 'calculateWinLossPercentage':
            resultsContainer.innerHTML = `
                <h4>Taxa de Vitória/Derrota</h4>
                <p>Vitórias: ${data.winPercentage.toFixed(2)}%</p>
                <p>Derrotas: ${data.lossPercentage.toFixed(2)}%</p>
            `;
            break;
        case 'listWinningDecks':
            resultsContainer.innerHTML = `
                <h4>Decks Vencedores</h4>
                <ul>${data.map(item => `<li>Deck: ${item.deck.join(', ')} - ${item.winPercentage.toFixed(2)}%</li>`).join('')}</ul>
            `;
            break;
        case 'calculateComboLosses':
            resultsContainer.innerHTML = `
                <h4>Derrotas por Combo</h4>
                <p>Total de Derrotas: ${data}</p>
            `;
            break;
        case 'calculateSpecialWins':
            resultsContainer.innerHTML = `
                <h4>Vitórias Especiais</h4>
                <p>Total de Vitórias: ${data}</p>
            `;
            break;
        case 'listWinningCombos':
            resultsContainer.innerHTML = `
                <h4>Combos Vencedores</h4>
                <ul>${data.map(combo => `<li>Combo: ${combo.join(', ')}</li>`).join('')}</ul>
            `;
            break;
        case 'calculateCardUsageRate':
            resultsContainer.innerHTML = `
                <h4>Taxa de Uso da Carta</h4>
                <p>Taxa: ${data.toFixed(2)}%</p>
            `;
            break;
        case 'listTopPlayersByCard':
            resultsContainer.innerHTML = `
                <h4>Melhores Jogadores</h4>
                <ul>${data.map(player => `<li>${player.nickname}: ${player.winPercentage.toFixed(2)}%</li>`).join('')}</ul>
            `;
            break;
        case 'calculateAverageMatchDuration':
            resultsContainer.innerHTML = `
                <h4>Duração Média de Partidas</h4>
                <p>Duração: ${data.toFixed(2)} segundos</p>
            `;
            break;
        case 'listPopularDecksByCard':
            resultsContainer.innerHTML = `
                <h4>Decks Populares</h4>
                <ul>${data.map(item => `<li>Deck: ${item.deck.join(', ')} - Usos: ${item.totalUses}</li>`).join('')}</ul>
            `;
            break;
    }
}

// Funções de apoio
function searchCard() {
    const query = document.getElementById('searchCardInput').value;
    document.getElementById('search-results').innerHTML = `<p>Buscando "${query}"...</p>`;
}

function searchClan() {
    const query = document.getElementById('clanNameInput').value;
    document.getElementById('clan-results').innerHTML = `<p>Buscando "${query}"...</p>`;
}

function finalizeDeck() {
    alert('Deck finalizado!');
}

// Animações
document.addEventListener('DOMContentLoaded', () => {
    anime({
        targets: '.hero-title',
        scale: [0, 1],
        opacity: [0, 1],
        easing: 'easeOutElastic(1, .6)',
        duration: 1200
    });
    anime({
        targets: '.hero-subtitle',
        translateY: [50, 0],
        opacity: [0, 1],
        easing: 'easeOutQuad',
        duration: 800,
        delay: 300
    });
    anime({
        targets: '.btn-hero',
        scale: [0.8, 1],
        opacity: [0, 1],
        easing: 'easeOutQuad',
        duration: 800,
        delay: 600
    });

    const sections = document.querySelectorAll('.main-tabs-section, .about-section');
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('section-visible');
            }
        });
    }, { threshold: 0.1 });

    sections.forEach(section => {
        section.classList.add('section-hidden');
        observer.observe(section);
    });
});