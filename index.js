import express from 'express';
import fs from "fs";
import { v4 as uuidv4 } from 'uuid';

const app = express();
const PORT = 8800;

app.use(express.text());

function readFile(filePath) {
    return new Promise((resolve, reject) => {
        fs.readFile(filePath, (err, data) => {
            if (err) return reject(err);
            resolve(data);
        })
    })
}

function writeFile(filePath, data) {
    return new Promise((resolve, reject) => {
        fs.writeFile(filePath, data, 'utf-8', (err) => {
            if (err) return reject(err);
            resolve(null);
        })
    })
}

const logsPath = "./logs.txt"

async function newLog(name) {
    const date = new Date();
    const uuid = uuidv4();
    const log = `${uuid} - ${date} - ${name}`;

    const allLogs = await readFile(logsPath);
    await writeFile(logsPath, allLogs + "\n" + log);
    return log;
}

app.post('/logs', (req, res) => {
    if (!req.body) return res.status(400).send('You must pass a name in the body');

    newLog(req.body).then(log => {
        res.status(201).send(log);
    }).catch(err => {
        res.status(500).send(err);
    });
})

function getLog(id) {
    return new Promise((resolve, reject) => {
        readFile(logsPath).then(data => {
            let log = undefined;

            String(data).split('\n').forEach(line => {
                if (line.substring(0, id.length) !== id) return;
                log = line;
            })
            if (log) resolve(log);
            reject(new Error("No log found with specified ID"));
        }).catch(err => reject(err));
    })
}

app.get('/logs/:id', (req, res) => {
    const id = String(req.params.id);
    if (!id) return res.status(404).send('You must pass a valid ID');

    getLog(id)
        .then(log => res.status(200).send(log))
        .catch(err => res.status(500).send(err));
})

app.listen(PORT, () => console.log(`Listening on port ${PORT}`));
