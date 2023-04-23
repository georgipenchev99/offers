let express = require('express');

let router = express.Router();

const fs = require('fs');

/* GET home page. */

//let todo = new Array();

//Показване на Login форма

router.get('/login', function(req, res) {

        res.render('login', {info: 'PLEASE LOGIN'});

});

//Създаване на сесия след успешен Login

session = require('express-session'); //Как да намерим информация за този модул?

router.use(session({

    secret: 'random string',

    resave: true,

    saveUninitialized: false,

}));


sqlite3 = require('sqlite3');
db = new sqlite3.Database('todo.sqlitedb');
db.serialize();
db.run(`CREATE TABLE IF NOT EXISTS offers(
    id INTEGER PRIMARY KEY,
    user TEXT NOT NULL,
    title TEXT,
    offer TEXT,
    url TEXT,
    date_created TEXT,
    date_modified TEXT)`
);
db.parallelize();
fileUpload = require('express-fileupload');
router.use(fileUpload());


bcrypt = require('bcryptjs');
users = require('./passwd.json');
router.post('/login', function(req, res){
        bcrypt.compare(req.body.password, users[req.body.username] || "", function(err, is_match) {
                if(err) throw err;
                if(is_match === true) {
                        req.session.username = req.body.username;
                        req.session.count = 0;
                        res.redirect("/offers/");
                } else {
                        res.render('login', {warn: 'TRY AGAIN'});
                }
        });
});

//Logout - унищожаване на сесия

router.get('/logout', (req, res) => {

        req.session.destroy();

        res.redirect("/offers/");

});


router.all('*', function(req, res, next) {
        if(!req.session.username) {
                res.redirect("/offers/login");
                return;
        }
        next();
});

router.get('/', function(req, res, next) {
        req.session.count++;
        s = "User: " + req.session.username + " Count: " + req.session.count + " " + new Date();
        db.all('SELECT * FROM offers ORDER BY date_modified DESC;', function(err, rows) {
                if(err) throw err;
                res.render('offers', { info: s, rows: rows, user:req.session.username });
        });
});

//CREATErud + Picture upload

router.post('/upload',(req, res) => {
        url = "";
        if(req.files && req.files.file) {
            req.files.file.mv('./public/images/' + req.files.file.name, (err) => {   
                if (err) throw err;    
            });   
            url = '/images/' + req.files.file.name;  
        }           
    
        db.run(`    
            INSERT INTO offers(    
                user,    
                title,
                offer,    
                url,    
                date_created,    
                date_modified    
            ) VALUES (    
                ?,    
                ?,    
                ?,
                ?,    
                DATETIME('now','localtime'),    
                DATETIME('now','localtime'));    
            `,    
            [req.session.username, req.body.title || "",req.body.offer || "", url],
                (err) => {
                    if(err) throw err;
                    res.redirect('/offers/');
                }
        );
});
//cruDELETE

router.post('/delete', (req, res) => {
        db.all('SELECT * FROM offers WHERE id=? and user=?;', req.body.id, req.session.username, function(err, rows) {
                if(err) throw err;
                if(rows.length>0){
                        db.run('DELETE FROM offers WHERE id = ?', req.body.id, (err) => {
                        if(err) throw err;
                        res.redirect('/offers/');
                        });
                }
                else{
                        db.all('SELECT * FROM offers ORDER BY date_modified DESC;', function(err, rows) {
                                if(err) throw err;
                                res.render('offers', { warning: "ACCESS DENIED", rows: rows, user:req.session.username });
                        });
                }
        });
        
        
        
});
//crUPDATEd
router.post('/update', (req, res) => {

        db.all('SELECT * FROM offers WHERE id=? and user=?;', req.body.id, req.session.username, function(err, rows) {
                if(err) throw err;
                if(rows.length>0){
                        db.run(`UPDATE offers
                        SET user = ?,
                        title = ?,
                        offer = ?,
                        url = ?,
                        date_modified = DATETIME('now','localtime')
                        WHERE id = ?;`,
                        req.session.username,
                        req.body.title,
                        req.body.offer,
                        req.body.url,
                        req.body.id,
                        (err) => {
                                if(err) throw err;
                                res.redirect('/offers/');
                        });
                }
                else{
                        db.all('SELECT * FROM offers ORDER BY date_modified DESC;', function(err, rows) {
                                if(err) throw err;
                                res.render('offers', { warning: "ACCESS DENIED", rows: rows, user:req.session.username });
                        });
                }
        });

        
});

router.all('*', function(req, res) {
        res.send("No such page or action! Go to: <a href='/offers/'>main page</a>");
});

module.exports = router;