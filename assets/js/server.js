const express = require('express');
const { MongoClient } = require('mongodb');
const cors = require('cors');

const app = express();
const port = 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Conexão com MongoDB
const url = 'mongodb://localhost:27017'; // Ajuste para MongoDB Atlas se necessário
const client = new MongoClient(url);
const dbName = 'clashRoyale';

async function connectDB() {
    await client.connect();
    return client.db(dbName);
}

// Consultas (copiadas do código anterior, com ajustes para API)
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

async function calculateSpecialWins(db, cardX, trophyDifference) {
    const result = await db.collection("battles").aggregate([
        {
            $match: {
                winnerDeck: cardX,
                duration: { $lt: 120 },
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

// Endpoints
app.post('/api/calculateWinLossPercentage', async (req, res) => {
    const { cardX, startTimestamp, endTimestamp } = req.body;
    try {
        const db = await connectDB();
        const result = await calculateWinLossPercentage(db, cardX, startTimestamp, endTimestamp);
        res.json(result);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/listWinningDecks', async (req, res) => {
    const { percentage, startTimestamp, endTimestamp } = req.body;
    try {
        const db = await connectDB();
        const result = await listWinningDecks(db, percentage, startTimestamp, endTimestamp);
        res.json(result);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/calculateComboLosses', async (req, res) => {
    const { cards, startTimestamp, endTimestamp } = req.body;
    try {
        const db = await connectDB();
        const result = await calculateComboLosses(db, cards, startTimestamp, endTimestamp);
        res.json(result);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/calculateSpecialWins', async (req, res) => {
    const { cardX, trophyDifference } = req.body;
    try {
        const db = await connectDB();
        const result = await calculateSpecialWins(db, cardX, trophyDifference);
        res.json(result);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/listWinningCombos', async (req, res) => {
    const { comboSize, percentage, startTimestamp, endTimestamp } = req.body;
    try {
        const db = await connectDB();
        const result = await listWinningCombos(db, comboSize, percentage, startTimestamp, endTimestamp);
        res.json(result);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/calculateCardUsageRate', async (req, res) => {
    const { cardX, startTimestamp, endTimestamp } = req.body;
    try {
        const db = await connectDB();
        const result = await calculateCardUsageRate(db, cardX, startTimestamp, endTimestamp);
        res.json(result);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/listTopPlayersByCard', async (req, res) => {
    const { cardX } = req.body;
    try {
        const db = await connectDB();
        const result = await listTopPlayersByCard(db, cardX);
        res.json(result);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/calculateAverageMatchDuration', async (req, res) => {
    const { cardX } = req.body;
    try {
        const db = await connectDB();
        const result = await calculateAverageMatchDuration(db, cardX);
        res.json(result);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/listPopularDecksByCard', async (req, res) => {
    const { cardX } = req.body;
    try {
        const db = await connectDB();
        const result = await listPopularDecksByCard(db, cardX);
        res.json(result);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Iniciar servidor
app.listen(port, () => {
    console.log(`Servidor rodando em http://localhost:${port}`);
});