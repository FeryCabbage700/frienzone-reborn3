/*=====================================================
    FRIENDZONÉ REBORN
    menu.js
=====================================================*/

const menuManager = {

    initialiser() {

        this.initialiserBoutons();
        this.verifierSauvegarde();
        this.lancerMusique();

    },



    //==================================================
    // Musique du menu
    //==================================================

    lancerMusique() {

        if (typeof audioManager !== "undefined") {

            audioManager.fadeIn("menu");

        }

    },



    //==================================================
    // Vérifie la sauvegarde
    //==================================================

    verifierSauvegarde() {

        const sauvegarde = localStorage.getItem("save");

        const continuer = document.getElementById("continuer");
        const charger = document.getElementById("charger");

        if (!sauvegarde) {

            continuer.disabled = true;
            charger.disabled = true;

            continuer.classList.add("disabled");
            charger.classList.add("disabled");

        }

    },



    //==================================================
    // Boutons
    //==================================================

    initialiserBoutons() {

        document
            .getElementById("nouvellePartie")
            ?.addEventListener("click", this.nouvellePartie);

        document
            .getElementById("continuer")
            ?.addEventListener("click", this.continuer);

        document
            .getElementById("charger")
            ?.addEventListener("click", this.charger);

        document
            .getElementById("galerie")
            ?.addEventListener("click", () => {

                this.ouvrirPopup("fenetreGalerie");

            });

        document
            .getElementById("succes")
            ?.addEventListener("click", () => {

                this.ouvrirPopup("fenetreSucces");

            });

        document
            .getElementById("parametres")
            ?.addEventListener("click", () => {

                this.ouvrirPopup("fenetreParametres");

            });

        document
            .getElementById("credits")
            ?.addEventListener("click", () => {

                this.ouvrirPopup("fenetreCredits");

            });

        document
            .getElementById("quitter")
            ?.addEventListener("click", this.quitter);

    },



    //==================================================
    // Nouvelle partie
    //==================================================

    nouvellePartie() {

        if (!confirm("Commencer une nouvelle partie ?"))
            return;

        localStorage.removeItem("save");

        const sauvegarde = {

            chapitre: 0,
            scene: "intro",

            joueur: {

                relationEva: 0,
                confianceEva: 0,

                relationEmelyne: 0,
                relationZoe: 0,

                gentillesse: 0,

                rencontreEva: 0,
                rencontreEmelyne: 0,
                rencontreZoe: 0

            }

        };

        localStorage.setItem(

            "save",

            JSON.stringify(sauvegarde)

        );

        menuManager.transitionJeu();

    },



    //==================================================
    // Continuer
    //==================================================

    continuer() {

        menuManager.transitionJeu();

    },



    //==================================================
    // Charger
    //==================================================

    charger() {

        alert("Les sauvegardes multiples arriveront dans une prochaine version.");

    },



    //==================================================
    // Transition
    //==================================================

    transitionJeu() {

        if (typeof audioManager !== "undefined") {

            audioManager.fadeOut(1200);

        }

        if (typeof animationManager !== "undefined") {

            animationManager.transitionVersNoir(() => {

                window.location.href = "jeu.html";

            });

        }

        else {

            setTimeout(() => {

                window.location.href = "jeu.html";

            }, 1200);

        }

    },



    //==================================================
    // Popups
    //==================================================

    ouvrirPopup(id) {

        document
            .getElementById(id)
            ?.classList.add("ouverte");

    },



    fermerPopup() {

        document

            .querySelectorAll(".popup")

            .forEach(popup => {

                popup.classList.remove("ouverte");

            });

    },



    //==================================================
    // Quitter
    //==================================================

    quitter() {

        if (confirm("Quitter le jeu ?")) {

            window.close();

        }

    }

};



window.addEventListener("load", () => {

    menuManager.initialiser();

});



// Fonction utilisée par les boutons Fermer des popups

function fermerPopup() {

    menuManager.fermerPopup();

}