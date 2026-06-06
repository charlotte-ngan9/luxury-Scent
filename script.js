// ===================== 1. CHARGEMENT DES PRODUITS =====================
let produits = [];

// Charger le fichier produits.json
fetch('produits.json')
    .then(response => response.json())
    .then(data => {
        produits = data.produits;
        // Afficher les produits sur la page d'accueil et catalogue si on est dessus
        if (document.getElementById('accueil-produits')) {
            afficherProduits(produits, 'accueil-produits');
        }
        if (document.getElementById('catalogue-grid')) {
            afficherProduits(produits, 'catalogue-grid');
        }
    })
    .catch(error => console.error('Erreur chargement produits:', error));

// Fonction pour afficher une grille de produits
function afficherProduits(produitsArray, containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;
    container.innerHTML = '';
    produitsArray.forEach(p => {
        const card = document.createElement('div');
        card.className = 'produit-card';
        card.innerHTML = `
            <img src="${p.image}" alt="${p.nom}" onerror="this.src='images/placeholder.jpg'">
            <h3>${p.nom}</h3>
            <p>${p.description.substring(0, 80)}...</p>
            <div class="prix">${p.prix.toFixed(2)} €</div>
            <button class="btn-ajout" data-id="${p.id}">Ajouter au panier</button>
        `;
        container.appendChild(card);
    });

    // Ajouter les écouteurs sur les boutons "Ajouter au panier"
    document.querySelectorAll('.btn-ajout').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const id = parseInt(btn.dataset.id);
            ajouterAuPanier(id);
        });
    });
}

// ===================== 2. GESTION DU PANIER (localStorage) =====================
function getPanier() {
    const panier = localStorage.getItem('luxuryPanier');
    return panier ? JSON.parse(panier) : [];
}

function sauvegarderPanier(panier) {
    localStorage.setItem('luxuryPanier', JSON.stringify(panier));
    mettreAJourCompteur();
}

function ajouterAuPanier(idProduit) {
    let panier = getPanier();
    const produit = produits.find(p => p.id === idProduit);
    if (!produit) return;

    const existant = panier.find(item => item.id === idProduit);
    if (existant) {
        existant.quantite++;
    } else {
        panier.push({ ...produit, quantite: 1 });
    }
    sauvegarderPanier(panier);
    alert(`${produit.nom} ajouté au panier !`);
}

function mettreAJourCompteur() {
    const panier = getPanier();
    const totalItems = panier.reduce((sum, item) => sum + item.quantite, 0);
    const compteur = document.getElementById('cart-count');
    if (compteur) compteur.textContent = totalItems;
}

// Afficher le contenu du panier sur la page panier.html
function afficherPanier() {
    const container = document.getElementById('panier-items');
    const totalSpan = document.getElementById('total-panier');
    if (!container) return;
    let panier = getPanier();
    if (panier.length === 0) {
        container.innerHTML = '<p>Votre panier est vide.</p>';
        totalSpan.textContent = '0.00';
        return;
    }
    let total = 0;
    container.innerHTML = '';
    panier.forEach((item, index) => {
        const itemDiv = document.createElement('div');
        itemDiv.className = 'panier-item';
        itemDiv.innerHTML = `
            <span>${item.nom} x ${item.quantite}</span>
            <span>${(item.prix * item.quantite).toFixed(2)} €</span>
            <button data-index="${index}">Supprimer</button>
        `;
        container.appendChild(itemDiv);
        total += item.prix * item.quantite;
    });
    totalSpan.textContent = total.toFixed(2);

    // Gérer suppression
    document.querySelectorAll('.panier-item button').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const idx = parseInt(btn.dataset.index);
            let panier = getPanier();
            panier.splice(idx, 1);
            sauvegarderPanier(panier);
            afficherPanier(); // rafraîchir
        });
    });
}

// Simuler la commande
function validerCommande() {
    let panier = getPanier();
    if (panier.length === 0) {
        alert("Votre panier est vide.");
        return;
    }
    // On stocke la commande dans localStorage (simulation)
    const commande = {
        date: new Date().toISOString(),
        articles: panier,
        total: panier.reduce((s, i) => s + i.prix * i.quantite, 0)
    };
    localStorage.setItem('derniereCommande', JSON.stringify(commande));
    localStorage.removeItem('luxuryPanier'); // vider panier
    mettreAJourCompteur();
    alert("Commande simulée validée ! Merci.");
    window.location.href = "index.html";
}

// ===================== 3. QUIZ ET RECOMMANDATION =====================
// Fonction exécutée quand on soumet le quiz
function traiterQuiz() {
    // Récupérer les réponses
    const age = document.getElementById('age').value;
    const genre = document.getElementById('genre').value;
    const intensite = document.getElementById('intensite').value;
    const ambiance = document.getElementById('ambiance').value;
    const occasion = document.getElementById('occasion').value;
    const notePref = document.getElementById('note').value;
    const mot = document.getElementById('mot').value;

    // Calcul des scores pour chaque produit (logique simplifiée)
    let scores = produits.map(produit => {
        let score = 0;
        // Règles de scoring (tu peux ajuster)
        if (genre === 'homme' && produit.cible === 'homme') score += 3;
        if (genre === 'femme' && produit.cible === 'femme') score += 3;
        if (genre === 'autre' && produit.cible === 'mixte') score += 2;
        
        if (intensite === 'fort' && produit.intensite === 'fort') score += 2;
        if (intensite === 'modere' && produit.intensite === 'modere') score += 2;
        if (intensite === 'leger' && produit.intensite === 'leger') score += 2;
        
        if (ambiance === 'orientale' && produit.famille === 'Orientale') score += 3;
        if (ambiance === 'boisee' && produit.famille === 'Boisée') score += 3;
        if (ambiance === 'florale' && produit.famille === 'Florale') score += 3;
        
        if (notePref === 'bois' && produit.notes.includes('bois')) score += 2;
        if (notePref === 'vanille' && (produit.notes.includes('vanille') || produit.notes.includes('ambre'))) score += 2;
        if (notePref === 'fleurs' && (produit.notes.includes('jasmin') || produit.notes.includes('rose'))) score += 2;
        // ... ajoute d'autres règles selon ton inspiration
        return { produit, score };
    });

    // Trier par score décroissant
    scores.sort((a,b) => b.score - a.score);
    const meilleur = scores[0];
    const second = scores[1];

    // Si le score du meilleur est inférieur à 4 ou trop proche du second, proposer mixage
    if (meilleur.score < 4 || (second.score && meilleur.score - second.score < 1.5)) {
        window.location.href = "mixage.html?quiz=indecis";
    } else {
        // Rediriger vers la fiche produit du meilleur
        window.location.href = `catalogue.html?reco=${meilleur.produit.id}`;
    }
}

// ===================== INITIALISATION =====================
document.addEventListener('DOMContentLoaded', () => {
    mettreAJourCompteur();
    if (window.location.pathname.includes('panier.html')) afficherPanier();
    if (document.getElementById('valider-commande')) {
        document.getElementById('valider-commande').addEventListener('click', validerCommande);
    }
    if (document.getElementById('quiz-form')) {
        document.getElementById('quiz-form').addEventListener('submit', (e) => {
            e.preventDefault();
            traiterQuiz();
        });
    }
});