var express = require('express');
var router = express.Router();
var ApiModel  = require('../bdd/api');


// Date du jour
var date = new Date().getDate()
var dateJour = date;

/***** POST /api/justify *****/

router.post('/justify', function(req, res) {


   ApiModel.findOne({ token: "cmzqp4utl0w53h3o0r6hu4"}, function(err, user){
  
    var message;

    // CHECK SI L'UTILISATEUR EXISTE EN BDD
    if(user)  {

        message = "===== User existe =====>";
        console.log(message)

        var limit = user.limit;

          // RESET COMPTEUR SI NOUVEAU JOUR
          if (user.dateDay !== dateJour) {

             ApiModel.updateOne({ token: "cmzqp4utl0w53h3o0r6hu4"},
            
            { numberWords: 0, dateDay : dateJour}, function(err, user) {

            res.set('Content-Type', 'text/plain');
            res.status(200).send('Vous pouvez à nouveau utiliser le service, votre compteur de mot a été remis à 0\nVotre credit est de'+' '+ limit + ' ' + 'mots');
           
        });
            
          } else {
            
          /////////////////////////////////// ALGO : TEXTE JUSTIFICATION //////////////////////////////////////////
        
          // RECUPÈRE LE TEXTE ENVOYÉ COTÉ FRONT
          var str = req.body.text;

          // On définit un tableau résultat vide pour stocker le texte traité
          var result = [];
          // console.log('tableau résultat ===>',result)

          // Transforme la chaine de caractère str en tableau de mot
          var tableauMots = str.split(' ')
          //  console.log(tableauMots)

          // Variable de stockage du texte 
          var line = '';

            // Boucle au sein du tableau de mot
            for (let i = 0; i < tableauMots.length; i++) {
                    
            // Nombre de caractère par mot
            var nombreCaractereParMot = tableauMots[i].length;
            // console.log('nombre caractere par mot',nombreCaractereParMot)

            // Compteur 
            var compteur =  line.length + nombreCaractereParMot
            //  console.log('===== line length => ', line.length,'===== count => ', compteur, '===== word =>', tableauMots[i], )
                    
              if ( compteur <= 80 ) {
                //  console.log('====== OK ======')
                line = line + tableauMots[i] + " ";
                //  console.log('====== OK LINE ======', line)   
              } else {
                //  console.log('==== ELSE ====')
                result.push(line);
                //  console.log('newArray ===>', line) 
                line = tableauMots[i] + " " ;
                // console.log('line dans ELSE ===>',line) 
              }
            }

          // Ajoute la derniere phrase au tableau result qui n'est pas dans la condition else
          result.push(line)

          // Affiche le résultat
          var textFormated = result.join("\n")
          //  console.log(textFormated);

          // Transforme le résultat en tableau
          var tableauMotsFormated = textFormated.split(' ');
          // console.log('tableau mots formatés', tableauMotsFormated)
                
          // Transforme le résultat en chiffre (-1 pour ne pas compter le dernier espace)
          var tableauMotsFormatedLength = tableauMotsFormated.length -1;
          // console.log('somme des mots formatés global', tableauMotsFormatedLength)

          // On met à jour la variable golbale avec le nombre de mots
          var nombreMots = tableauMotsFormatedLength
          // console.log('===== NOMBRE DE MOT ENVOYÉ ====>', nombreMots)

          ///// FIN ALGO /////


          ///// CHECK SI LE USER NE DEPASSE PAS LA LIMITE DE 80 000 MOTS /////
          
          // Compteur pour check si l'utilisateur ne dépasse pas la limite
          var compteurRestantBdd = user.limit - user.numberWords;

          // Message pour indiquer à l'utilisateur combien de mots il peut encore envoyer
          var resultUser = compteurRestantBdd - nombreMots; 
          
          // Si le nombre de mot envoyé est inférieur ou égal au compteur alors on update le compteur en BDD
            if (nombreMots <= compteurRestantBdd) {
            //   console.log('PAIMENT NON REQUIS')

              // Mise à jour du compteur de mots en BDD
              ApiModel.updateOne({ token : "cmzqp4utl0w53h3o0r6hu4"},

                { numberWords: user.numberWords + nombreMots}, function(err, user) {
                
                res.set('Content-Type', 'text/plain');
                res.status(200).send("Vous venez d'envoyer"+ ' ' + nombreMots + ' ' + 'mots' + '\nVous pouvez envoyer encore'+ ' ' + resultUser + ' ' + 'mots\n\n' + textFormated ); 
            });
                  
            } else {
               // Sinon on affiche une erreur 402 et on indique qu'un paiment est requis pour continuer  
              //console.log('PAIEMENT REQUIS')
              res.status(402).send('402 Payment Required,\nVous dépassez la limite gratuite de 80 000 mots par jour.\nMerci de revenir demain ou veuillez prendre une formule premium');
            }
          
          /////////////////////////////////// FIN ALGO ////////////////////////////////////////// 
            
          }    

        } else {
            // Si l'utilisateur n'existe pas en BDD on affiche une erreur
            message= "===== User n'existe pas =====>";
            res.status(404);
            console.log(message)
        }
    });   
});


/* POST /api/token */
router.post('/token', async function(req, res) {

  
// Ajout d'un token au moment de l'inscription
var token = 'cmzqp4utl0w53h3o0r6hu4';
var limitToken = 80000;

// Hash Token
// const salt = await bcrypt.genSalt(10); 
// const hashedToken = await bcrypt.hash(token, salt);
  
// Création du document
var newApi = new ApiModel({
token : token,
email : req.body.email,
limit : limitToken,
numberWords: 0,
dateDay: dateJour,
});
 
// Enregistrement du document en BDD  
newApi.save(function (error, user) {
   
// Retour API CRÉATION DU USER
 if (user) {
    
  res.send(user);
} else {
    res.send(error)
}
});
// Token posté dans le header
res.header('auth-token', token)

});

module.exports = router;
