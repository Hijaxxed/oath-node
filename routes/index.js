var express = require('express');
var router = express.Router();

var pg = require('pg');

var mysql      = require('mysql');
var connection = mysql.createConnection({
  host     : '127.0.0.1',
  user     : 'root',
  password : 'Password123',
  database : 'mydb'
});

var name = "Declan Hetherington";

var loggedInUser = null;

router.get('/', function(req, res, next) {

  loggedInUser = req.session.user;

  
  res.render('index',{name, loggedInUser});
});

router.get('/about', function(req, res, next) {

  loggedInUser = req.session.user;

  res.render('about', {name, loggedInUser});
});

router.get('/database', function(req,res,next){



  connection.connect(function(err){
    connection.query('SELECT * FROM Population', function(err, results, fields){
      var population = results;
        //Create an empty object that we will fill with the table names
      var tableName = {};
     
        //Loop through the first person in the array and get the key (i.e id, firstName, lastName etc
      for(i in population[0]){
        tableName[i] = i;
      }
      res.render('database', {population, tableName, loggedInUser});
    });
  });
});

router.post('/newPerson', function(req, res, next) {
  console.log(req.body);

  //var randomID = Math.floor(Math.random() * 1000) + 11;

  if (req.body.firstName === '' || req.body.lastName === '' || req.body.age === '' || req.body.city === '' || req.body.country === 'r'){
    res.redirect('/database')
  } else { 

    connection.connect(function(err){
      connection.query(`INSERT INTO Population ( firstName,lastName,age, city, country) VALUES( '${req.body.firstName}','${req.body.lastName}',${req.body.age}, '${req.body.city}', '${req.body.country}');`, function(err, results, fields){
        if(err)
          throw err;
        
        res.redirect('/database')
      });
    });
  }
});

router.post('/deletePerson', function(req, res, next) {
  console.log(req.body);
 
  connection.connect(function(err){
    connection.query(`DELETE FROM Population WHERE id = (${req.body.buttonSubmit})`, function(err, results, fields){
      if(err)
        throw err;
 
      res.redirect('/database')
    });
  });
});

router.post('/editPerson', function(req, res, next) {
  console.log(req.body);

  var person = JSON.parse(req.body.buttonSubmit)

  res.render('editPerson', {person})

});

router.post('/updatePerson', function(req, res, next) {
 
  connection.connect(function(err){

    
    console.log(req.body.id)
    connection.query(`UPDATE Population SET firstName = '${req.body.firstName}' , lastName='${req.body.lastName}' , age=${req.body.age} , city='${req.body.city}' , country='${req.body.country}' WHERE id = ${req.body.id};`, function(err, results, fields){
      if(err)
        throw err;
 
      res.redirect('/database')
    });
  });
});

router.get('/signUp', function(req, res, next) {

  res.render('signUp')

});

router.post('/createUser', function(req, res, next) {

  console.log(req.body);

  if (req.body.userName === '' || req.body.email === '' || req.body.passHash === '' || req.body.passHash != req.body.passCheck){
    res.redirect('/signUp')
  } else { 

    connection.connect(function(err){
      connection.query(`INSERT INTO Users ( userName,email, passhash) VALUES( '${req.body.userName}','${req.body.email}','${req.body.passHash}');`, function(err, results, fields){
        if(err)
          throw err;
        
        res.redirect('/')
      });
    });
  }
});

router.get('/logIn', function(req, res, next) {

  res.render('logIn')

});



router.post('/logInUser', function(req, res, next) {
  var exists = false;
  if (req.body.email === '' || req.body.passHash === '' ){
    res.redirect('/logIn')
  } else { 
      connection.connect(function(err){
        connection.query(`SELECT * FROM Users`, function(err, results, fields){   
          //connection.query(`SELECT email FROM Users WHERE email='${req.body.email}'`, function(err, results, fields){

          //console.log(results);  
          var userThere = true;  
          if(err)
            throw err;
    
          for(var i = 0; i < results.length; i++){
            if(req.body.email === results[i].email){
              if(req.body.passHash === results[i].passHash){

                req.session.user = {
                  email : req.body.email, userName : results[i].userName, description : results[i].description
                };

                return res.redirect('/');
              } else{
                return res.redirect('/logIn');
              }
            }
              else{
                userThere = false;
              }
          
          }
          if(!userThere)
            return res.redirect('/login'); 
        }); // end conncetion.query
      }); // end connection.connect
    } // end else
}); //end router.post

router.get('/signOut', function(req, res, next) {

  req.session.user = null;

  res.redirect('/');
});

router.get('/accountDetails', function(req, res, next) {

  loggedInUser = req.session.user;
  console.log(loggedInUser);

  res.render('accountDetails', {name, loggedInUser});
});

router.post('/editAccount', function(req, res, next) {

  if (req.body.userName === '' || req.body.email === '' ){
    res.redirect('/accountDetails')
  } else { 

    connection.connect(function(err){

      connection.query(`UPDATE Users SET userName = '${req.body.userName}' , description='${req.body.description}' WHERE email = '${loggedInUser.email}';`, function(err, results, fields){
        if(err)
          throw err;

          req.session.user = {
            userName : req.body.userName, description : req.body.description, email : loggedInUser.email
          };

        console.log('Description:' + loggedInUser.description);
        res.redirect('/accountDetails')
      });
    });
  }
});

module.exports = router;
