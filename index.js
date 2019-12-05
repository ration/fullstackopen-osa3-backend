const express = require("express");
const morgan = require("morgan");
const cors = require("cors");

const app = express();

morgan.token('body', (req, res) => {
    if (req.method === "POST" && req.body) {
        return JSON.stringify(req.body);
    }
});


app.use(express.json());
app.use(morgan(":method :url :status :req[Content-Length] - :response-time ms :body"));
app.use(cors());

//
const persons = new Map();
persons.set(1, {
    name: "Arto Hellas",
    number: "123-23442",
    id: 1
});
persons.set(2, {
    name: "Jack Jones",
    number: "02-32322-3",
    id: 2
});

const getNewId = () => {
    let id = 0;
    const limit = 1000000;
    // This would get progressively slower until freezes altogether
    do {
        id = Math.floor(Math.random() * Math.floor(limit));
    } while (persons.has(id));
    return id;
};

const validate = (person) => {
    for (let p of persons.values()) {
        if (p.name === person.name) {
            return "name must be unique";
        } else if (!person.name) {
            return "name required";
        } else if (!p.number) {
            return "number required";
        }
    }
    return null;
};


app.get('/info', (req, res) => {

    ans = `Phonebook has info for ${persons.size} people<br/>` +
        `${(new Date()).toISOString()}`;

    res.send(ans);
});

app.get("/api/persons", (request, response) => {
    response.json(Array.from(persons.values()));
});

app.delete("/api/persons/:id", (req, res) => {
    const id = Number(req.params.id);
    if (!persons.has(id)) {
        res.statusCode = 404;
        res.send('');
    } else {
        persons.delete(id);
    }
});
app.post('/api/persons', (req, res) => {
    const id = getNewId();
    var obj = req.body;
    const error = validate(obj);
    if (error) {
        res.statusCode = 400;
        res.json({error: error});
        return;
    }
    obj["id"] = id.toString();
    persons.set(id, obj);
    res.statusCode = 200;
    res.send(null);
    return;
});
app.get('/api/persons/:id', (req, res) => {
    const id = Number(req.params.id);
    if (!persons.has(id)) {
        res.statusCode = 404;
        res.send('');
    } else {
        res.json(persons.get(id));
    }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});
