import express from 'express';
import cors from 'cors';
import axios from 'axios';

import {
scrapeM3U8,
getDriveDirectLink,
} from './episode_parser.js';

const port = process.env.PORT || 3000;

const corsOptions = {
    origin: '*',
    credentails: true,
    optionSuccessStatus: 200,
    port: port,
};

const app = express();

app.use(cors(corsOptions));
app.use(express.json());

app.get('/', (req, res) => {
    res.status(200).json('Welcome to GogoAnime API by Homen!');
});

app.get('/vidcdn/watch/:id', async(req, res) => {
    try {
        const id = req.params.id;

        const data = await scrapeM3U8({ id: id });

        res.status(200).json(data);
    } catch (err) {
        res.status(500).json({
            status: 500,
            error: 'Internal Error',
            message: err,
        });
    }
});

app.get('/drive/direct/:id', async(req, res) => {
    try {
        const id = req.params.id;

        const data = await getDriveDirectLink({ id: id });

        res.status(200).json(data);
    } catch (err) {
        res.status(500).json({
            status: 500,
            error: 'Internal Error',
            message: err,
        });
    }
});

app.use((req, res) => {
    res.status(404).json({
        status: 404,
        error: 'Not Found',
    });
});

app.listen(port, () => {
    console.log('Express server listening on port %d in %s mode', port, app.settings.env);
});
