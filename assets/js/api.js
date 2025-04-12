//  buscar dados do clã
async function fetchClanData() {
    const clanTag = document.getElementById('clanTag').value;
    if (!clanTag) {
        alert('Por favor, insira um Clan Tag válido.');
        return;
    }

    try {
        showLoading(); // Mostra o spinner de carregamento
        const response = await fetch(`https://api.clashroyale.com/v1/clans/%23${clanTag}`, {
            headers: {
                Authorization: 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzUxMiIsImtpZCI6IjI4YTMxOGY3LTAwMDAtYTFlYi03ZmExLTJjNzQzM2M2Y2NhNSJ9.eyJpc3MiOiJzdXBlcmNlbGwiLCJhdWQiOiJzdXBlcmNlbGw6Z2FtZWFwaSIsImp0aSI6IjkzMmVhYzIwLTM2ODEtNGQzNC05NTQ1LTg1YTlmZGFiNjU4MSIsImlhdCI6MTc0MzgxODExOCwic3ViIjoiZGV2ZWxvcGVyLzdjMjkyNzdlLWIxYjEtZGM3Zi1mODI3LWEyMjE3MDlmYWIyYSIsInNjb3BlcyI6WyJyb3lhbGUiXSwibGltaXRzIjpbeyJ0aWVyIjoiZGV2ZWxvcGVyL3NpbHZlciIsInR5cGUiOiJ0aHJvdHRsaW5nIn0seyJjaWRycyI6WyI1NC44Ni41MC4xMzkiLCIxODcuMjEuMTMuMTk2Il0sInR5cGUiOiJjbGllbnQifV19.5EB80j73BrcIvJO6488i8PzVoxiW5RSQtyGrg9y8MxDazsghR2hQV7QawW-HrVGkajCkwTdHmF3JlvtpUOLb2w' // Substituir pelo token da API
            }
        });

        if (!response.ok) {
            throw new Error('Erro ao buscar dados do clã.');
        }

        const data = await response.json();
        updateClanInfo(data); // Atualiza a interface com os dados do clã
    } catch (error) {
        console.error(error);
        alert('Erro ao buscar dados do clã. Verifique o Clan Tag e tente novamente.');
    } finally {
        hideLoading(); // Esconde o spinner de carregamento
    }
}

// Função para pesquisar clãs
async function searchClan() {
    const clanName = document.getElementById('clanNameInput').value.trim();
    if (!clanName) {
        alert('Por favor, insira o nome de um clã.');
        return;
    }

    try {
        const response = await fetch(`https://api.clashroyale.com/v1/clans?name=${encodeURIComponent(clanName)}`, {
            headers: {
                Authorization: `eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzUxMiIsImtpZCI6IjI4YTMxOGY3LTAwMDAtYTFlYi03ZmExLTJjNzQzM2M2Y2NhNSJ9.eyJpc3MiOiJzdXBlcmNlbGwiLCJhdWQiOiJzdXBlcmNlbGw6Z2FtZWFwaSIsImp0aSI6IjkzMmVhYzIwLTM2ODEtNGQzNC05NTQ1LTg1YTlmZGFiNjU4MSIsImlhdCI6MTc0MzgxODExOCwic3ViIjoiZGV2ZWxvcGVyLzdjMjkyNzdlLWIxYjEtZGM3Zi1mODI3LWEyMjE3MDlmYWIyYSIsInNjb3BlcyI6WyJyb3lhbGUiXSwibGltaXRzIjpbeyJ0aWVyIjoiZGV2ZWxvcGVyL3NpbHZlciIsInR5cGUiOiJ0aHJvdHRsaW5nIn0seyJjaWRycyI6WyI1NC44Ni41MC4xMzkiLCIxODcuMjEuMTMuMTk2Il0sInR5cGUiOiJjbGllbnQifV19.5EB80j73BrcIvJO6488i8PzVoxiW5RSQtyGrg9y8MxDazsghR2hQV7QawW-HrVGkajCkwTdHmF3JlvtpUOLb2w` // Substitua pelo token da API
            }
        });

        if (!response.ok) {
            throw new Error('Erro ao buscar clãs.');
        }

        const data = await response.json();
        const clanResults = document.getElementById('clan-results');
        clanResults.innerHTML = '';

        data.items.forEach(clan => {
            const clanElement = document.createElement('div');
            clanElement.classList.add('col-md-4', 'card-item');
            clanElement.innerHTML = `
                <div class="card p-3">
                    <h5>${clan.name}</h5>
                    <p><strong>Tag:</strong> ${clan.tag}</p>
                    <p><strong>Membros:</strong> ${clan.members}</p>
                    <p><strong>Trofeus:</strong> ${clan.clanScore}</p>
                </div>
            `;
            clanResults.appendChild(clanElement);
        });
    } catch (error) {
        console.error('Erro ao buscar clãs:', error);
    }
}

// Função para atualizar a interface com os dados do clã
function updateClanInfo(data) {
    const resultsSection = document.getElementById('results');
    resultsSection.innerHTML = `
        <h3 class="text-center">Informações do Clã</h3>
        <p><strong>Nome:</strong> ${data.name}</p>
        <p><strong>Descrição:</strong> ${data.description}</p>
        <p><strong>Quantidade de Membros:</strong> ${data.members}</p>
        <p><strong>Trofeus:</strong> ${data.clanScore}</p>
    `;
}

// Função para buscar estatísticas de vitórias/derrotas
async function fetchStatistics() {
    const startDate = document.getElementById('startDate').value;
    const endDate = document.getElementById('endDate').value;
    const selectedCard = document.getElementById('cardSelect').value;

    try {
        showLoading();
        const response = await fetch(`/api/statistics?startDate=${startDate}&endDate=${endDate}&card=${selectedCard}`);
        if (!response.ok) {
            throw new Error('Erro ao buscar estatísticas.');
        }

        const data = await response.json();
        updateCharts(data); // Atualiza os gráficos com os dados
    } catch (error) {
        console.error(error);
        alert('Erro ao buscar estatísticas.');
    } finally {
        hideLoading();
    }
}

// Função para atualizar os gráficos
function updateCharts(data) {
    // Atualiza o gráfico de vitórias
    victoryChart.data.labels = data.cards.map(card => card.name); // Nomes das cartas
    victoryChart.data.datasets[0].data = data.cards.map(card => card.victoryRate); // Taxa de vitórias
    victoryChart.update();

    // Atualiza o gráfico de decks
    deckChart.data.labels = data.decks.map(deck => deck.name); // Nomes dos decks
    deckChart.data.datasets[0].data = data.decks.map(deck => deck.winRate); // Taxa de vitórias dos decks
    deckChart.update();
}

// Função para carregar as cartas no filtro
async function loadCards() {
    try {
        const response = await fetch('https://api.clashroyale.com/v1/cards', {
            headers: {
                Authorization: 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzUxMiIsImtpZCI6IjI4YTMxOGY3LTAwMDAtYTFlYi03ZmExLTJjNzQzM2M2Y2NhNSJ9.eyJpc3MiOiJzdXBlcmNlbGwiLCJhdWQiOiJzdXBlcmNlbGw6Z2FtZWFwaSIsImp0aSI6IjkzMmVhYzIwLTM2ODEtNGQzNC05NTQ1LTg1YTlmZGFiNjU4MSIsImlhdCI6MTc0MzgxODExOCwic3ViIjoiZGV2ZWxvcGVyLzdjMjkyNzdlLWIxYjEtZGM3Zi1mODI3LWEyMjE3MDlmYWIyYSIsInNjb3BlcyI6WyJyb3lhbGUiXSwibGltaXRzIjpbeyJ0aWVyIjoiZGV2ZWxvcGVyL3NpbHZlciIsInR5cGUiOiJ0aHJvdHRsaW5nIn0seyJjaWRycyI6WyI1NC44Ni41MC4xMzkiLCIxODcuMjEuMTMuMTk2Il0sInR5cGUiOiJjbGllbnQifV19.5EB80j73BrcIvJO6488i8PzVoxiW5RSQtyGrg9y8MxDazsghR2hQV7QawW-HrVGkajCkwTdHmF3JlvtpUOLb2w' // Substitua pelo token da API
            }
        });

        if (!response.ok) {
            throw new Error('Erro ao carregar as cartas.');
        }

        const data = await response.json();
        const cardSelect = document.getElementById('cardSelect');

        // Limpa as opções existentes
        cardSelect.innerHTML = '<option value="all">Todas</option>';

        // Adiciona as cartas como opções
        data.items.forEach(card => {
            const option = document.createElement('option');
            option.value = card.id; // Use o ID da carta como valor
            option.textContent = card.name; // Use o nome da carta como texto
            cardSelect.appendChild(option);
        });
    } catch (error) {
        console.error(error);
        alert('Erro ao carregar as cartas. Tente novamente mais tarde.');
    }
}

// Função para buscar dados do jogador
async function fetchPlayerData(playerTag) {
    try {
        const response = await fetch(`http://localhost:3000/api/player/${playerTag}`);
        if (!response.ok) {
            throw new Error('Erro ao buscar dados do jogador.');
        }

        const playerData = await response.json();
        updatePlayerUI(playerData); // Atualiza a interface com os dados
    } catch (err) {
        console.error("❌ Erro ao buscar dados do jogador:", err.message);
        alert('Erro ao buscar dados do jogador. Verifique a tag e tente novamente.');
    }
}

// Função para atualizar a interface com os dados do jogador
function updatePlayerUI(data) {
    const resultsDiv = document.getElementById('clanResults');
    resultsDiv.innerHTML = `
        <h3>${data.name}</h3>
        <p><strong>Tag:</strong> ${data.tag}</p>
        <p><strong>Nível:</strong> ${data.expLevel}</p>
        <p><strong>Trofeus:</strong> ${data.trophies}</p>
        <p><strong>Vitórias:</strong> ${data.wins}</p>
        <p><strong>Derrotas:</strong> ${data.losses}</p>
    `;
}

// Função para buscar jogador
function searchPlayer() {
    const playerTag = document.getElementById('playerTag').value.trim();
    if (!playerTag) {
        alert('Por favor, insira uma tag válida.');
        return;
    }

    fetchPlayerData(playerTag);
}

// Função para calcular porcentagem de vitórias e derrotas com uma carta específica
async function calculateWinLossPercentage(cardX, startDate, endDate) {
    try {
        const response = await fetch(`/api/statistics/win-loss?card=${cardX}&startDate=${startDate}&endDate=${endDate}`);
        if (!response.ok) {
            throw new Error('Erro ao buscar estatísticas de vitórias/derrotas.');
        }

        const data = await response.json();
        const resultsContainer = document.getElementById('resultsContainer');
        resultsContainer.innerHTML = `
            <p>Porcentagem de Vitórias com a carta ${cardX}: ${data.winPercentage}%</p>
            <p>Porcentagem de Derrotas com a carta ${cardX}: ${data.lossPercentage}%</p>
        `;
    } catch (error) {
        console.error('Erro ao calcular porcentagem de vitórias/derrotas:', error);
    }
}

// Função para calcular derrotas com um combo de cartas específico
async function calculateComboLosses(combo, startDate, endDate) {
    try {
        const response = await fetch(`/api/statistics/combo-losses?combo=${combo.join(',')}&startDate=${startDate}&endDate=${endDate}`);
        if (!response.ok) {
            throw new Error('Erro ao buscar derrotas por combo.');
        }

        const data = await response.json();
        const resultsContainer = document.getElementById('resultsContainer');
        resultsContainer.innerHTML = `
            <p>Quantidade de derrotas com o combo [${combo.join(', ')}]: ${data.losses}</p>
        `;
    } catch (error) {
        console.error('Erro ao calcular derrotas por combo:', error);
    }
}

// Função para listar decks vencedores com mais de X% de vitórias
async function listWinningDecks(percentage, startDate, endDate) {
    try {
        const response = await fetch(`/api/statistics/winning-decks?percentage=${percentage}&startDate=${startDate}&endDate=${endDate}`);
        if (!response.ok) {
            throw new Error('Erro ao buscar decks vencedores.');
        }

        const data = await response.json();
        const resultsContainer = document.getElementById('resultsContainer');
        resultsContainer.innerHTML = '<h3>Decks Vencedores</h3>';
        data.decks.forEach(deck => {
            resultsContainer.innerHTML += `
                <div>
                    <p><strong>Deck:</strong> ${deck.cards.join(', ')}</p>
                    <p><strong>Taxa de Vitórias:</strong> ${deck.winRate}%</p>
                </div>
            `;
        });
    } catch (error) {
        console.error('Erro ao listar decks vencedores:', error);
    }
}

// Função para executar consultas
function executeQueries() {
    const cardX = document.getElementById('cardX').value;
    const timestamps = document.getElementById('timestamps').value;
    const percentage = parseFloat(document.getElementById('percentage').value);

    // Exemplo de consulta 1: Calcular porcentagem de vitórias e derrotas com a carta X
    calculateWinLossPercentage(cardX, timestamps.startDate, timestamps.endDate);

    // Outras consultas podem ser chamadas aqui
}

// Carregar cartas ao carregar a página
document.addEventListener('DOMContentLoaded', loadCards);

const selectedDeck = [];

// Função para carregar cartas disponíveis
async function loadAvailableCards() {
    try {
        const response = await fetch('https://api.clashroyale.com/v1/cards', {
            headers: {
                Authorization: `eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzUxMiIsImtpZCI6IjI4YTMxOGY3LTAwMDAtYTFlYi03ZmExLTJjNzQzM2M2Y2NhNSJ9.eyJpc3MiOiJzdXBlcmNlbGwiLCJhdWQiOiJzdXBlcmNlbGw6Z2FtZWFwaSIsImp0aSI6IjkzMmVhYzIwLTM2ODEtNGQzNC05NTQ1LTg1YTlmZGFiNjU4MSIsImlhdCI6MTc0MzgxODExOCwic3ViIjoiZGV2ZWxvcGVyLzdjMjkyNzdlLWIxYjEtZGM3Zi1mODI3LWEyMjE3MDlmYWIyYSIsInNjb3BlcyI6WyJyb3lhbGUiXSwibGltaXRzIjpbeyJ0aWVyIjoiZGV2ZWxvcGVyL3NpbHZlciIsInR5cGUiOiJ0aHJvdHRsaW5nIn0seyJjaWRycyI6WyI1NC44Ni41MC4xMzkiLCIxODcuMjEuMTMuMTk2Il0sInR5cGUiOiJjbGllbnQifV19.5EB80j73BrcIvJO6488i8PzVoxiW5RSQtyGrg9y8MxDazsghR2hQV7QawW-HrVGkajCkwTdHmF3JlvtpUOLb2w` // Substitua pelo token da API
            }
        });

        if (!response.ok) {
            throw new Error('Erro ao carregar cartas.');
        }

        const data = await response.json();
        const availableCardsContainer = document.getElementById('available-cards');
        availableCardsContainer.innerHTML = '';

        data.items.forEach(card => {
            const cardElement = document.createElement('div');
            cardElement.classList.add('col-md-3', 'card-item');
            cardElement.innerHTML = `
                <div class="card p-3 text-center">
                    <img src="${card.iconUrls.medium}" alt="${card.name}" class="img-fluid">
                    <h5>${card.name}</h5>
                    <p>${card.description}</p>
                    <button class="btn btn-primary mt-2" onclick="addCardToDeck('${card.name}', '${card.iconUrls.medium}')">Adicionar</button>
                </div>
            `;
            availableCardsContainer.appendChild(cardElement);
        });
    } catch (error) {
        console.error('Erro ao carregar cartas:', error);
    }
}

// Função para adicionar carta ao deck
function addCardToDeck(cardName, cardImage) {
    if (selectedDeck.length >= 8) {
        alert('Você só pode adicionar até 8 cartas ao deck.');
        return;
    }

    if (selectedDeck.some(card => card.name === cardName)) {
        alert('Esta carta já foi adicionada ao deck.');
        return;
    }

    selectedDeck.push({ name: cardName, image: cardImage });
    updateDeckUI();
}

// Função para atualizar o deck na interface
function updateDeckUI() {
    const deckContainer = document.getElementById('deck-container');
    deckContainer.innerHTML = '';

    selectedDeck.forEach(card => {
        const cardElement = document.createElement('div');
        cardElement.classList.add('col-md-3', 'card-item');
        cardElement.innerHTML = `
            <div class="card p-3 text-center">
                <img src="${card.image}" alt="${card.name}" class="img-fluid">
                <h5>${card.name}</h5>
            </div>
        `;
        deckContainer.appendChild(cardElement);
    });
}

// Função para finalizar o deck
function finalizeDeck() {
    if (selectedDeck.length === 0) {
        alert('Adicione pelo menos uma carta ao deck.');
        return;
    }

    console.log('Deck finalizado:', selectedDeck);
    alert('Deck finalizado com sucesso!');
}

// Carregar cartas ao carregar a página
document.addEventListener('DOMContentLoaded', loadAvailableCards);