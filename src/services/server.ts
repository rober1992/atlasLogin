import express from 'express';
import path from 'path';
import * as http from 'http';
import apiRouter from '../routes/index';
import handlebars from 'express-handlebars';
import session from 'express-session';
import { Request, Response } from 'express';
import cookieParser from 'cookie-parser';
import MongoStore from 'connect-mongo';
const advancedOptions = {useNewUrlParser: true, useUnifiedTopology: true };

const StoreOptions = {
    store: MongoStore.create({
      mongoUrl: 'mongodb+srv://santixdist:roberto5@coderhouse.unqpw.mongodb.net/coderhouse?retryWrites=true&w=majority',
      mongoOptions: advancedOptions as any,
    }),
    secret: 'asdasfas',
    resave: false,
    saveUninitialized: false
};



const app = express ();


const publicFolderPath = path.resolve(__dirname, '../../public');
app.use(express.static(publicFolderPath));


const layoutsFolderPath = path.resolve(__dirname, '../../views/layouts')
const defaultLayerPth = path.resolve(__dirname, '../../views/layouts/index.hbs');
const partialsFolderPath = path.resolve(__dirname, '../../views/partials');


app.set('view engine', 'hbs');
app.engine('hbs', handlebars({
    extname: 'hbs',
    layoutsDir : layoutsFolderPath,
    partialsDir : partialsFolderPath ,
    defaultLayout : defaultLayerPth
}));

app.use(express.json());
app.use(express.urlencoded({
  extended: true
}));
app.use(cookieParser());
app.use(session (StoreOptions));

export let logged = { isLogged: false, isTimedOut: false, isDestroyed: false, nombre: '' };

app.get('/', (req : any, res: Response) => {
    const body = req.body;
    if (!req.session.nombre && logged.isLogged) {
        logged.isLogged = false;
        logged.isTimedOut = true;
        res.render('loginForm', logged);
        logged.isTimedOut = false;
        logged.nombre = '';
      }
    if(!req.session.nombre) {
        console.log('not login',body.nombre)
        res.render('loginForm', logged)
        console.log('no logeo')
    }
    else {
        logged.isLogged = true;
        logged.nombre = req.session.nombre;
        console.log('logged nombre:',logged.nombre,'','session nombre',req.session.nombre);
        console.log('logeo');
        res.render('main', logged)
    };

})

app.post('/login', (req : any, res : Response) => {
    const body = req.body;
    console.log('el body',body);
    if (body.nombre) {
        console.log('pase al if');
        req.session.nombre = body.nombre;
        console.log('session nombre', req.session.nombre);
        logged.nombre = req.body.nombre;
        logged.isLogged = true;
        res.redirect('/');
    };
    
});

app.post('/logout', (req: any, res) => {
    req.session.destroy;
    logged.isLogged = false;
    logged.isDestroyed = true;
    res.redirect('/');
});

app.use('/api', apiRouter)



const myServer = new http.Server(app);

export default myServer;