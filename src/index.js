const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const jwt = require('express-jwt');
const jwksRsa = require('jwks-rsa');



const app = express();


const question = [
    {
        id: 1,
        title:"Ebar ki nowka jitbe?",
        description:"Nowkai vote diye unnoyoner srot avvahoto rakhun",
        answer:["muri khan","Inshallah jitbe"]

    }
];


app.use(helmet());
app.use(bodyParser.json());
app.use(cors());
app.use(morgan('combined'));


app.get('/',(req,res) => {

    const ques = question.map((q) => ({

        id: q.id,
        title: q.title,
        description: q.description,
        answer:q.answer

    }));

    res.send(ques);
});


app.get('/:id',(req,res) => {

    const ques = question.filter((q) => q.id === parseInt(req.params.id) );
    if( ques.length > 1 ) return req.status(500).send();
    if( ques.length === 0 ) return req.status(404).send();

    res.send(ques[0]);
});

const checkJwt = jwt({

    secret:jwksRsa.expressJwtSecret({
        cache: true,
        rateLimit: true,
        jwksRequestsPerMinute: 5,
        jwksUri:`https://omersayem.auth0.com/.well-known/jwks.json`
    }),

    audience: 'qN5OL1JWi37phLJCtkoBQC4BCGnFs04q',
    issuer: `https://omersayem.auth0.com/`,
    algorithms:['RS256']
})


app.post('/',checkJwt,(req,res) => {

    const {title,description} = req.body;
    const newQuestion = {
        
        id: question.length + 1,
        title,
        description,
        answer:[],
        author:req.user.name

    };
    question.push(newQuestion);
    res.status(200).send();
});


app.post('/answer/:id',checkJwt,(req,res) => {

    const {answer} = req.body;
    const ques = question.filter((q) => ( q.id === parseInt(req.params.id) ));
    if( ques.length > 1) return res.status(500).send();
    if( ques.length === 0) return res.send(404).send();

    ques[0].answer.push({
        answer,
        author:req.user.name
    });
    res.status(200).send();
});


app.listen(8081,() => {
    
    console.log("listening on port 8081");
})