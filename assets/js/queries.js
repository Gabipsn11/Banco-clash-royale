// Requisito: Driver MongoDB para Node.js
// Instale com: npm install mongodb

// Função auxiliar para conectar ao MongoDB e executar consultas
async function runQuery(queryFn, ...params) {
    const { MongoClient } = require("mongodb");
    const client = new MongoClient("mongodb://localhost:27017"); // Ajuste a URL para MongoDB local ou Atlas
    try {
        await client.connect();
        const db = client.db("clashRoyale");
        return await queryFn(db, ...params);
    } catch (error) {
        console.error("Erro ao executar consulta:", error);
        throw error;
    } finally {
        await client.close();
    }
}

/**
 * Consulta 1: Calcula a porcentagem de vitórias e derrotas utilizando a carta X em um intervalo de timestamps.
 * @param {string} cardX - Nome da carta.
 * @param {string} startTimestamp - Timestamp inicial (ex: "2025-01-01").
 * @param {string} endTimestamp - Timestamp final (ex: "2025-01-31").
 */
async function calculateWinLossPercentage(db, cardX, startTimestamp, endTimestamp) {
    const result = await db.collection("battles").aggregate([
        {
            $match: {
                timestamp: {
                    $gte: new Date(startTimestamp),
                    $lte: new Date(endTimestamp)
                },
                $or: [
                    { winnerDeck: cardX },
                    { loserDeck: cardX }
                ]
            }
        },
        {
            $group: {
                _id: null,
                totalWins: {
                    $sum: { $cond: [{ $in: [cardX, "$winnerDeck"] }, 1, 0] }
                },
                totalLosses: {
                    $sum: { $cond: [{ $in: [cardX, "$loserDeck"] }, 1, 0] }
                }
            }
        },
        {
            $project: {
                winPercentage: {
                    $multiply: [
                        { $divide: ["$totalWins", { $add: ["$totalWins", "$totalLosses"] }] },
                        100
                    ]
                },
                lossPercentage: {
                    $multiply: [
                        { $divide: ["$totalLosses", { $add: ["$totalWins", "$totalLosses"] }] },
                        100
                    ]
                }
            }
        }
    ]).toArray();

    return result.length > 0 ? result[0] : { winPercentage: 0, lossPercentage: 0 };
}

/**
 * Consulta 2: Lista os decks completos que produziram mais de X% de vitórias em um intervalo de timestamps.
 * @param {number} percentage - Porcentagem mínima de vitórias.
 * @param {string} startTimestamp - Timestamp inicial.
 * @param {string} endTimestamp - Timestamp final.
 */
async function listWinningDecks(db, percentage, startTimestamp, endTimestamp) {
    const result = await db.collection("battles").aggregate([
        {
            $match: {
                timestamp: {
                    $gte: new Date(startTimestamp),
                    $lte: new Date(endTimestamp)
                }
            }
        },
        {
            $facet: {
                wins: [
                    {
                        $group: {
                            _id: "$winnerDeck",
                            totalWins: { $sum: 1 }
                        }
                    }
                ],
                battles: [
                    {
                        $project: {
                            decks: [
                                { deck: "$winnerDeck", type: "winner" },
                                { deck: "$loserDeck", type: "loser" }
                            ]
                        }
                    },
                    { $unwind: "$decks" },
                    {
                        $group: {
                            _id: "$decks.deck",
                            totalBattles: { $sum: 1 }
                        }
                    }
                ]
            }
        },
        {
            $project: {
                decks: {
                    $setUnion: ["$wins", "$battles"]
                }
            }
        },
        { $unwind: "$decks" },
        {
            $group: {
                _id: "$decks._id",
                totalWins: { $sum: { $ifNull: ["$decks.totalWins", 0] } },
                totalBattles: { $sum: { $ifNull: ["$decks.totalBattles", 0] } }
            }
        },
        {
            $project: {
                deck: "$_id",
                winPercentage: {
                    $cond: [
                        { $gt: ["$totalBattles", 0] },
                        { $multiply: [{ $divide: ["$totalWins", "$totalBattles"] }, 100] },
                        0
                    ]
                }
            }
        },
        {
            $match: { winPercentage: { $gt: percentage } }
        },
        {
            $sort: { winPercentage: -1 }
        }
    ]).toArray();

    return result;
}

/**
 * Consulta 3: Calcula a quantidade de derrotas utilizando o combo de cartas (X1, X2, ...) em um intervalo de timestamps.
 * @param {Array<string>} cards - Array de cartas no combo.
 * @param {string} startTimestamp - Timestamp inicial.
 * @param {string} endTimestamp - Timestamp final.
 */
async function calculateComboLosses(db, cards, startTimestamp, endTimestamp) {
    const result = await db.collection("battles").aggregate([
        {
            $match: {
                timestamp: {
                    $gte: new Date(startTimestamp),
                    $lte: new Date(endTimestamp)
                },
                loserDeck: { $all: cards }
            }
        },
        {
            $count: "totalLosses"
        }
    ]).toArray();

    return result.length > 0 ? result[0].totalLosses : 0;
}

/**
 * Consulta 4: Calcula a quantidade de vitórias envolvendo a carta X com condições específicas.
 * @param {string} cardX - Nome da carta.
 * @param {number} trophyDifference - Diferença percentual de troféus (ex: 20 para 20%).
 */
async function calculateSpecialWins(db, cardX, trophyDifference) {
    const result = await db.collection("battles").aggregate([
        {
            $match: {
                winnerDeck: cardX,
                duration: { $lt: 120 }, // Menos de 2 minutos
                loserTowersDestroyed: { $gte: 2 },
                $expr: {
                    $lte: [
                        "$winnerTrophies",
                        { $multiply: ["$loserTrophies", (1 - trophyDifference / 100)] }
                    ]
                }
            }
        },
        {
            $count: "totalWins"
        }
    ]).toArray();

    return result.length > 0 ? result[0].totalWins : 0;
}

/**
 * Consulta 5: Lista o combo de cartas de tamanho N que produziram mais de Y% de vitórias em um intervalo de timestamps.
 * @param {number} comboSize - Tamanho do combo (ex: 3 para 3 cartas).
 * @param {number} percentage - Porcentagem mínima de vitórias.
 * @param {string} startTimestamp - Timestamp inicial.
 * @param {string} endTimestamp - Timestamp final.
 */
async function listWinningCombos(db, comboSize, percentage, startTimestamp, endTimestamp) {
    const result = await db.collection("battles").aggregate([
        {
            $match: {
                timestamp: {
                    $gte: new Date(startTimestamp),
                    $lte: new Date(endTimestamp)
                }
            }
        },
        {
            $project: {
                winnerDeck: 1
            }
        },
        {
            $group: {
                _id: "$winnerDeck",
                totalWins: { $sum: 1 }
            }
        },
        {
            $lookup: {
                from: "battles",
                let: { deck: "$_id" },
                pipeline: [
                    {
                        $match: {
                            $expr: { $eq: ["$loserDeck", "$$deck"] },
                            timestamp: {
                                $gte: new Date(startTimestamp),
                                $lte: new Date(endTimestamp)
                            }
                        }
                    },
                    { $count: "totalLosses" }
                ],
                as: "losses"
            }
        },
        {
            $unwind: { path: "$losses", preserveNullAndEmptyArrays: true }
        },
        {
            $project: {
                deck: "$_id",
                totalWins: 1,
                totalLosses: { $ifNull: ["$losses.totalLosses", 0] },
                winPercentage: {
                    $multiply: [
                        {
                            $divide: [
                                "$totalWins",
                                { $add: ["$totalWins", { $ifNull: ["$losses.totalLosses", 0] }] }
                            ]
                        },
                        100
                    ]
                }
            }
        },
        {
            $match: { winPercentage: { $gt: percentage } }
        },
        {
            $unwind: "$deck"
        },
        {
            $group: {
                _id: null,
                cards: { $push: "$deck" }
            }
        },
        {
            $project: {
                combos: {
                    $slice: ["$cards", comboSize]
                }
            }
        },
        {
            $match: {
                $expr: { $eq: [{ $size: "$combos" }, comboSize] }
            }
        }
    ]).toArray();

    return result.length > 0 ? result[0].combos : [];
}

/**
 * Consulta Adicional 1: Calcula a taxa de uso de uma carta específica em partidas.
 * @param {string} cardX - Nome da carta.
 * @param {string} startTimestamp - Timestamp inicial.
 * @param {string} endTimestamp - Timestamp final.
 */
async function calculateCardUsageRate(db, cardX, startTimestamp, endTimestamp) {
    const result = await db.collection("battles").aggregate([
        {
            $match: {
                timestamp: {
                    $gte: new Date(startTimestamp),
                    $lte: new Date(endTimestamp)
                }
            }
        },
        {
            $group: {
                _id: null,
                totalBattles: { $sum: 1 },
                battlesWithCard: {
                    $sum: {
                        $cond: [
                            { $or: [{ $in: [cardX, "$winnerDeck"] }, { $in: [cardX, "$loserDeck"] }] },
                            1,
                            0
                        ]
                    }
                }
            }
        },
        {
            $project: {
                usageRate: { $multiply: [{ $divide: ["$battlesWithCard", "$totalBattles"] }, 100] }
            }
        }
    ]).toArray();

    return result.length > 0 ? result[0].usageRate : 0;
}

/**
 * Consulta Adicional 2: Lista os jogadores com maior taxa de vitórias utilizando uma carta específica.
 * @param {string} cardX - Nome da carta.
 */
async function listTopPlayersByCard(db, cardX) {
    const result = await db.collection("battles").aggregate([
        {
            $match: {
                winnerDeck: cardX
            }
        },
        {
            $group: {
                _id: "$winnerId",
                totalWins: { $sum: 1 }
            }
        },
        {
            $lookup: {
                from: "battles",
                let: { playerId: "$_id" },
                pipeline: [
                    {
                        $match: {
                            $expr: {
                                $or: [
                                    { $eq: ["$winnerId", "$$playerId"] },
                                    { $eq: ["$loserId", "$$playerId"] }
                                ]
                            },
                            $or: [
                                { winnerDeck: cardX },
                                { loserDeck: cardX }
                            ]
                        }
                    },
                    { $count: "totalBattles" }
                ],
                as: "battles"
            }
        },
        {
            $unwind: "$battles"
        },
        {
            $lookup: {
                from: "players",
                localField: "_id",
                foreignField: "_id",
                as: "player"
            }
        },
        {
            $unwind: "$player"
        },
        {
            $project: {
                nickname: "$player.nickname",
                winPercentage: { $multiply: [{ $divide: ["$totalWins", "$battles.totalBattles"] }, 100] }
            }
        },
        {
            $sort: { winPercentage: -1 }
        },
        {
            $limit: 10
        }
    ]).toArray();

    return result;
}

/**
 * Consulta Adicional 3: Calcula a média de duração das partidas envolvendo uma carta específica.
 * @param {string} cardX - Nome da carta.
 */
async function calculateAverageMatchDuration(db, cardX) {
    const result = await db.collection("battles").aggregate([
        {
            $match: {
                $or: [
                    { winnerDeck: cardX },
                    { loserDeck: cardX }
                ]
            }
        },
        {
            $group: {
                _id: null,
                averageDuration: { $avg: "$duration" }
            }
        }
    ]).toArray();

    return result.length > 0 ? result[0].averageDuration : 0;
}

/**
 * Consulta Adicional 4: Lista os decks mais populares que utilizam uma carta específica.
 * @param {string} cardX - Nome da carta.
 */
async function listPopularDecksByCard(db, cardX) {
    const result = await db.collection("battles").aggregate([
        {
            $match: {
                $or: [
                    { winnerDeck: cardX },
                    { loserDeck: cardX }
                ]
            }
        },
        {
            $project: {
                deck: {
                    $cond: [
                        { $in: [cardX, "$winnerDeck"] },
                        "$winnerDeck",
                        "$loserDeck"
                    ]
                }
            }
        },
        {
            $group: {
                _id: "$deck",
                totalUses: { $sum: 1 }
            }
        },
        {
            $sort: { totalUses: -1 }
        },
        {
            $limit: 10
        },
        {
            $project: {
                deck: "$_id",
                totalUses: 1,
                _id: 0
            }
        }
    ]).toArray();

    return result;
}

// Chamadas de teste
runQuery(calculateWinLossPercentage, "Carta X", "2025-01-01", "2025-01-31")
    .then(result => console.log("Consulta 1 - Win/Loss Percentage:", result))
    .catch(err => console.error("Erro Consulta 1:", err));

runQuery(listWinningDecks, 60, "2025-01-01", "2025-01-31")
    .then(result => console.log("Consulta 2 - Winning Decks:", result))
    .catch(err => console.error("Erro Consulta 2:", err));

runQuery(calculateComboLosses, ["Hog Rider", "Fireball"], "2025-01-01", "2025-01-31")
    .then(result => console.log("Consulta 3 - Combo Losses:", result))
    .catch(err => console.error("Erro Consulta 3:", err));

runQuery(calculateSpecialWins, "Hog Rider", 20)
    .then(result => console.log("Consulta 4 - Special Wins:", result))
    .catch(err => console.error("Erro Consulta 4:", err));

runQuery(listWinningCombos, 3, 70, "2025-01-01", "2025-01-31")
    .then(result => console.log("Consulta 5 - Winning Combos:", result))
    .catch(err => console.error("Erro Consulta 5:", err));

runQuery(calculateCardUsageRate, "Hog Rider", "2025-01-01", "2025-01-31")
    .then(result => console.log("Consulta Adicional 1 - Card Usage Rate:", result))
    .catch(err => console.error("Erro Consulta Adicional 1:", err));

runQuery(listTopPlayersByCard, "Hog Rider")
    .then(result => console.log("Consulta Adicional 2 - Top Players:", result))
    .catch(err => console.error("Erro Consulta Adicional 2:", err));

runQuery(calculateAverageMatchDuration, "Hog Rider")
    .then(result => console.log("Consulta Adicional 3 - Average Match Duration:", result))
    .catch(err => console.error("Erro Consulta Adicional 3:", err));

runQuery(listPopularDecksByCard, "Hog Rider")
    .then(result => console.log("Consulta Adicional 4 - Popular Decks:", result))
    .catch(err => console.error("Erro Consulta Adicional 4:", err));