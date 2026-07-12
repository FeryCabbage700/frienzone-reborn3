"use strict";

/*=========================================================
    FRIENDZONÉ REBORN
    dialogue.js
=========================================================*/

const dialogueManager = {

    conteneur: null,


    /*=====================================================
        INITIALISATION
    =====================================================*/

    initialiser() {

        this.conteneur =
            document.getElementById("texte");

        if (!this.conteneur) {

            console.error(
                "dialogue.js : l'élément #texte est introuvable."
            );

            return;

        }

        console.log(
            "dialogueManager initialisé."
        );

    },


    /*=====================================================
        VIDER LA CONVERSATION
    =====================================================*/

    vider() {

        if (!this.conteneur) {

            this.initialiser();

        }

        if (!this.conteneur) {

            return;

        }

        this.conteneur.innerHTML = "";

    },


    /*=====================================================
        AFFICHER UNE SCÈNE
    =====================================================*/

    afficherScene(scene) {

        if (!scene) {

            console.error(
                "dialogue.js : scène invalide."
            );

            return;

        }

        /*
            Important :
            on ne vide pas la conversation ici.
            Les messages doivent rester visibles
            comme dans une discussion SMS.
        */

        if (
            Array.isArray(scene.dialogues)
        ) {

            scene.dialogues.forEach(
                message => {

                    this.ajouterMessage(

                        message.texte || "",

                        message.personnage ||
                        message.type ||
                        "narrateur"

                    );

                }
            );

            return;

        }

        /*
            Compatibilité avec l'ancien format :
            "texte": "..."
        */

        if (scene.texte) {

            this.ajouterMessage(
                scene.texte,
                "narrateur"
            );

        }

    },


    /*=====================================================
        AJOUTER UN MESSAGE
    =====================================================*/

    ajouterMessage(
        contenu,
        personnage = "narrateur"
    ) {

        if (!this.conteneur) {

            this.initialiser();

        }

        if (!this.conteneur) {

            return null;

        }

        const type =
            this.normaliserPersonnage(
                personnage
            );

        const message =
            document.createElement("div");

        message.classList.add(
            "message",
            type
        );


        /*
            Nom du personnage
        */

        if (type !== "narration") {

            const nom =
                document.createElement("div");

            nom.classList.add("nom");

            nom.textContent =
                this.obtenirNom(type);

            message.appendChild(nom);

        }


        /*
            Bulle
        */

        const bulle =
            document.createElement("div");

        bulle.classList.add("bulle");

        bulle.innerHTML =
            contenu || "";

        message.appendChild(bulle);


        /*
            Animation
        */

        if (type === "joueur") {

            message.classList.add(
                "envoye"
            );

        }
        else {

            message.classList.add(
                "recu"
            );

        }


        this.conteneur.appendChild(
            message
        );


        /*
            AnimationManager facultatif
        */

        if (
            typeof animationManager !==
            "undefined"
        ) {

            if (type === "joueur") {

                animationManager.envoi(
                    message
                );

            }
            else {

                animationManager.reception(
                    message
                );

            }

        }


        this.defiler();

        return message;

    },


    /*=====================================================
        MESSAGE PROGRESSIF
    =====================================================*/

    async ecrireProgressivement(
        contenu,
        personnage = "narrateur",
        vitesse = 20
    ) {

        if (!this.conteneur) {

            this.initialiser();

        }

        if (!this.conteneur) {

            return null;

        }

        const type =
            this.normaliserPersonnage(
                personnage
            );

        const message =
            document.createElement("div");

        message.classList.add(
            "message",
            type
        );


        if (type !== "narration") {

            const nom =
                document.createElement("div");

            nom.classList.add("nom");

            nom.textContent =
                this.obtenirNom(type);

            message.appendChild(nom);

        }


        const bulle =
            document.createElement("div");

        bulle.classList.add("bulle");

        message.appendChild(bulle);

        this.conteneur.appendChild(
            message
        );


        if (type === "joueur") {

            message.classList.add(
                "envoye"
            );

        }
        else {

            message.classList.add(
                "recu"
            );

        }


        let texteAffiche = "";

        for (
            let index = 0;
            index < contenu.length;
            index++
        ) {

            texteAffiche +=
                contenu[index];

            bulle.textContent =
                texteAffiche;

            this.defiler();

            await this.attendre(
                vitesse
            );

        }

        return message;

    },


    /*=====================================================
        NORMALISER LE NOM DU PERSONNAGE
    =====================================================*/

    normaliserPersonnage(personnage) {

        const valeur =
            String(
                personnage || "narrateur"
            )
                .toLowerCase()
                .normalize("NFD")
                .replace(
                    /[\u0300-\u036f]/g,
                    ""
                )
                .trim();

        switch (valeur) {

            case "joueur":
            case "toi":
            case "vous":

                return "joueur";


            case "eva":

                return "eva";


            case "zoe":

                return "zoe";


            case "emelyne":

                return "emelyne";


            case "narration":
            case "narrateur":
            default:

                return "narration";

        }

    },


    /*=====================================================
        NOM AFFICHÉ
    =====================================================*/

    obtenirNom(type) {

        const noms = {

            joueur: "Toi",

            eva: "Eva",

            zoe: "Zoé",

            emelyne: "Émelyne"

        };

        return noms[type] || "";

    },


    /*=====================================================
        MESSAGE SYSTÈME
    =====================================================*/

    systeme(texte) {

        if (!texte) {

            return;

        }

        this.ajouterMessage(
            texte,
            "narrateur"
        );

    },


    /*=====================================================
        NOTIFICATION
    =====================================================*/

    notification(texte) {

        if (!texte) {

            return;

        }

        const notification =
            document.createElement("div");

        notification.className =
            "notification";

        notification.textContent =
            texte;

        document.body.appendChild(
            notification
        );

        requestAnimationFrame(() => {

            notification.classList.add(
                "visible"
            );

        });

        setTimeout(() => {

            notification.classList.remove(
                "visible"
            );

            setTimeout(() => {

                notification.remove();

            }, 300);

        }, 2500);

    },


    /*=====================================================
        DÉFILEMENT AUTOMATIQUE
    =====================================================*/

    defiler() {

        const conversation =
            document.getElementById(
                "conversation"
            );

        if (!conversation) {

            return;

        }

        requestAnimationFrame(() => {

            conversation.scrollTo({

                top:
                    conversation.scrollHeight,

                behavior: "smooth"

            });

        });

    },


    /*=====================================================
        ATTENDRE
    =====================================================*/

    attendre(duree) {

        return new Promise(
            resolve => {

                setTimeout(
                    resolve,
                    duree
                );

            }
        );

    }

};


/*=========================================================
    INITIALISATION AUTOMATIQUE
=========================================================*/

window.addEventListener(
    "DOMContentLoaded",
    () => {

        dialogueManager.initialiser();

    }
);