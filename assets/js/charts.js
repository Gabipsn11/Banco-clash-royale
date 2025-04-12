const ctxVictory = document.getElementById('victoryChart').getContext('2d');
const victoryChart = new Chart(ctxVictory, {
    type: 'bar',
    data: {
        labels: [], // Será preenchido dinamicamente
        datasets: [{
            label: 'Porcentagem de Vitórias',
            data: [], // Será preenchido dinamicamente
            backgroundColor: ['#ffc107', '#007bff', '#28a745']
        }]
    },
    options: {
        responsive: true,
        plugins: {
            legend: { position: 'top' },
            title: { display: true, text: 'Porcentagem de Vitórias por Carta' }
        }
        
    }
    
});

const ctx = document.getElementById("winLossChart").getContext("2d");
runQuery(calculateWinLossPercentage, "Carta X", "2025-01-01", "2025-01-31").then(data => {
    new Chart(ctx, {
        type: "bar",
        data: {
            labels: ["Vitórias", "Derrotas"],
            datasets: [{
                label: "Porcentagem",
                data: [data.winPercentage, data.lossPercentage]
            }]
        }
    });
});