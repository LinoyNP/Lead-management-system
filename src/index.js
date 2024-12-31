import express from 'express';

const app = express();
const PORT = process.env.PORT || 3000;  

app.get('/', (req, res) => {
    res.send('Hello ,Word!');
})

app.get('/home', (req, res) => {
    res.send('Hello ,from home!');
})

app.get('/hi_byJSON', (req, res) => {
    res.send('{ "text": "Hello ,from home!" }');
})



app.listen(PORT, () => {
    console.log("listening on port", PORT);
})
