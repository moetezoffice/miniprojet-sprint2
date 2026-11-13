# Gestion des plantes

Application Angular simple de gestion de plantes connectée au backend fourni dans `api_rest_produits.jar`. Le backend garde les données sous la forme de produits (`nomProduit`, `prixProduit`); l'interface les présente comme des plantes.

## Démarrage

1. Démarrer MySQL. Le JAR utilise la base `demo_DB`, l'utilisateur `root` et aucun mot de passe.
2. Démarrer le backend dans un terminal:

   ```powershell
   java -Dserver.port=8090 -jar C:\Users\PCMike\Downloads\api_rest_produits.jar
   ```

3. Dans un autre terminal, lancer Angular depuis le dossier `MesPlantes`:

   ```powershell
   npm install
   npm start
   ```

4. Ouvrir <http://localhost:4200/>.

L'API utilisee par Angular est <http://localhost:8090/produits/api>. Le JAR est demarre sur le port 8090 dans les commandes ci-dessus.

## API à vérifier avec Postman

- `GET http://localhost:8090/produits/api` : lister les plantes
- `GET http://localhost:8090/produits/api/2` : consulter l'identifiant 2
- `POST http://localhost:8090/produits/api` avec le corps JSON `{"nomProduit":"Basilic","prixProduit":8}` : ajouter
- `PUT http://localhost:8090/produits/api` avec le corps JSON `{"idProduit":2,"nomProduit":"Basilic","prixProduit":10,"dateCreation":"2026-11-13T00:00:00.000Z"}` : modifier
- `DELETE http://localhost:8090/produits/api/5` : supprimer l'identifiant 5

La page affiche l'état de connexion en cas d'indisponibilité du backend. Les modifications sont enregistrées dans la base par l'API.

## Authentification et droits

- Compte administrateur : `admin` / `123`
- Compte utilisateur : `moetez` / `123`
- Les deux comptes peuvent consulter la liste. Seul `admin` peut ajouter, modifier ou supprimer des plantes.
- La session est restauree depuis le stockage local. La deconnexion efface cette session.
- Les routes de gestion sont protegees par un guard d'administrateur; une route protegee est redirigee vers la page de connexion ou d'acces refuse.

Ces comptes sont des comptes de demonstration definis dans le frontend pour l'atelier.

## Types et donnees de plantes

La base conserve maintenant les exemples de plantes : Monstera deliciosa, Ficus elastica, Aloe vera, Basilic, Romarin, Lavande et Menthe. Le JAR fourni expose les champs produit (nom, prix et date), mais pas les types. Les choix de type (plantes d'interieur, succulentes, plantes aromatiques) sont donc conserves dans le stockage local du navigateur pour l'interface.
