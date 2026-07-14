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
            document.getElementById(
                "texte"
            );

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
        REMPLACER LES VARIABLES DANS LES TEXTES
    =====================================================*/

    remplacerVariables(
        texte
    ) {

        let resultat =
            String(
                texte || ""
            );

        let nomJoueur =
            "Joueur";


        if (
            typeof moteur !==
                "undefined" &&
            moteur.joueur &&
            moteur.joueur.nom
        ) {

            nomJoueur =
                String(
                    moteur.joueur.nom
                ).trim();

        }


        resultat = resultat
            .replaceAll(
                "{{nomJoueur}}",
                nomJoueur
            )
            .replaceAll(
                "{{nom du joueur}}",
                nomJoueur
            )
            .replaceAll(
                "{{nom_du_joueur}}",
                nomJoueur
            );


        return resultat;

    },


    /*=====================================================
        OBTENIR LA RELATION D'UN PERSONNAGE
    =====================================================*/

    obtenirRelationPersonnage(
        personnage
    ) {

        if (
            typeof moteur ===
                "undefined" ||
            !moteur.joueur
        ) {

            return 0;

        }


        const type =
            this.normaliserPersonnage(
                personnage
            );


        const variablesRelation = {

            eva:
                "relationEva",

            zoe:
                "relationZoe",

            emelyne:
                "relationEmelyne",

            bryan:
                "relationBryan"

        };


        const variable =
            variablesRelation[type];


        if (!variable) {

            return 0;

        }


        const valeur =
            Number(
                moteur.joueur[variable]
            );


        if (
            !Number.isFinite(
                valeur
            )
        ) {

            return 0;

        }


        return valeur;

    },


    /*=====================================================
        OBTENIR LA CONFIANCE D'UN PERSONNAGE
    =====================================================*/

    obtenirConfiancePersonnage(
        personnage
    ) {

        if (
            typeof moteur ===
                "undefined" ||
            !moteur.joueur
        ) {

            return 0;

        }


        const type =
            this.normaliserPersonnage(
                personnage
            );


        const variablesConfiance = {

            eva:
                "confianceEva",

            zoe:
                "confianceZoe",

            emelyne:
                "confianceEmelyne",

            bryan:
                "confianceBryan"

        };


        const variable =
            variablesConfiance[type];


        if (!variable) {

            return 0;

        }


        const valeur =
            Number(
                moteur.joueur[variable]
            );


        if (
            !Number.isFinite(
                valeur
            )
        ) {

            return 0;

        }


        return valeur;

    },


    /*=====================================================
        DÉTERMINER LE NIVEAU DE RELATION
    =====================================================*/

    obtenirNiveauRelation(
        personnage
    ) {

        const relation =
            this.obtenirRelationPersonnage(
                personnage
            );


        if (
            relation < 0
        ) {

            return "negative";

        }


        if (
            relation < 5
        ) {

            return "neutre";

        }


        if (
            relation < 10
        ) {

            return "amicale";

        }


        return "proche";

    },


    /*=====================================================
        DÉTERMINER LE NIVEAU DE CONFIANCE
    =====================================================*/

    obtenirNiveauConfiance(
        personnage
    ) {

        const confiance =
            this.obtenirConfiancePersonnage(
                personnage
            );


        if (
            confiance < 0
        ) {

            return "negative";

        }


        if (
            confiance < 5
        ) {

            return "faible";

        }


        if (
            confiance < 10
        ) {

            return "moyenne";

        }


        return "haute";

    },


    /*=====================================================
        CHOISIR LE TEXTE SELON LA RELATION
    =====================================================*/

    obtenirTexteMessage(
        message
    ) {

        if (!message) {

            return "";

        }


        /*
            Ancien format :

            {
                "personnage": "eva",
                "texte": "Salut."
            }
        */

        if (
            !message.variantes ||
            typeof message.variantes !==
                "object"
        ) {

            return message.texte || "";

        }


        /*
            relationAvec permet d'utiliser
            la relation d'un personnage même
            lorsque le message appartient au narrateur.

            Exemple :

            {
                "personnage": "narrateur",
                "relationAvec": "emelyne",
                "variantes": { ... }
            }
        */

        const personnageReference =

            message.relationAvec ||

            message.personnage ||

            message.type ||

            "narrateur";


        const niveau =
            this.obtenirNiveauRelation(
                personnageReference
            );


        return (

            message.variantes[niveau] ||

            message.variantes.neutre ||

            message.variantes.amicale ||

            message.variantes.proche ||

            message.variantes.negative ||

            message.texte ||

            ""

        );

    },


    /*=====================================================
        CHOISIR LE TEXTE SELON LA CONFIANCE
    =====================================================*/

    obtenirTexteConfiance(
        message
    ) {

        if (!message) {

            return "";

        }


        if (
            !message.variantesConfiance ||
            typeof message.variantesConfiance !==
                "object"
        ) {

            return this.obtenirTexteMessage(
                message
            );

        }


        const personnageReference =

            message.confianceAvec ||

            message.relationAvec ||

            message.personnage ||

            message.type ||

            "narrateur";


        const niveau =
            this.obtenirNiveauConfiance(
                personnageReference
            );


        return (

            message.variantesConfiance[niveau] ||

            message.variantesConfiance.faible ||

            message.texte ||

            this.obtenirTexteMessage(
                message
            ) ||

            ""

        );

    },


    /*=====================================================
        OBTENIR LE TEXTE FINAL
    =====================================================*/

    preparerTexteMessage(
        message
    ) {

        if (!message) {

            return "";

        }


        let texte =
            "";


        /*
            Priorité aux variantes de confiance
            lorsqu'elles sont présentes.
        */

        if (
            message.variantesConfiance
        ) {

            texte =
                this.obtenirTexteConfiance(
                    message
                );

        }
        else {

            texte =
                this.obtenirTexteMessage(
                    message
                );

        }


        return this.remplacerVariables(
            texte
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

        this.conteneur.innerHTML =
            "";

    },


    /*=====================================================
        AFFICHER UNE SCÈNE
    =====================================================*/

    afficherScene(
        scene
    ) {

        if (!scene) {

            console.error(
                "dialogue.js : scène invalide."
            );

            return;

        }


        /*
            Les anciens messages restent visibles
            afin de conserver l'apparence
            d'une conversation SMS.
        */

        if (
            Array.isArray(
                scene.dialogues
            )
        ) {

            scene.dialogues.forEach(
                message => {

                    if (!message) {

                        return;

                    }


                    const texteMessage =
                        this.preparerTexteMessage(
                            message
                        );


                    if (!texteMessage) {

                        return;

                    }


                    this.ajouterMessage(

                        texteMessage,

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


        const contenuPrepare =
            this.remplacerVariables(
                contenu
            );


        const message =
            document.createElement(
                "div"
            );


        message.classList.add(

            "message",

            type

        );


        /*
            Nom du personnage
        */

        if (
            type !== "narration" &&
            type !== "pensee"
        ) {

            const nom =
                document.createElement(
                    "div"
                );


            nom.classList.add(
                "nom"
            );


            nom.textContent =
                this.obtenirNom(
                    type
                );


            message.appendChild(
                nom
            );

        }


        /*
            Bulle
        */

        const bulle =
            document.createElement(
                "div"
            );


        bulle.classList.add(
            "bulle"
        );


        /*
            innerHTML permet de conserver
            les anciennes balises <br>.
        */

        bulle.innerHTML =
            contenuPrepare;


        message.appendChild(
            bulle
        );


        /*
            Classe d'animation
        */

        if (
            type === "joueur"
        ) {

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

            if (
                type === "joueur" &&
                typeof animationManager.envoi ===
                    "function"
            ) {

                animationManager.envoi(
                    message
                );

            }
            else if (
                type !== "joueur" &&
                typeof animationManager.reception ===
                    "function"
            ) {

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


        const contenuPrepare =
            this.remplacerVariables(
                contenu
            );


        const type =
            this.normaliserPersonnage(
                personnage
            );


        const message =
            document.createElement(
                "div"
            );


        message.classList.add(

            "message",

            type

        );


        /*
            Nom du personnage
        */

        if (
            type !== "narration" &&
            type !== "pensee"
        ) {

            const nom =
                document.createElement(
                    "div"
                );


            nom.classList.add(
                "nom"
            );


            nom.textContent =
                this.obtenirNom(
                    type
                );


            message.appendChild(
                nom
            );

        }


        /*
            Bulle
        */

        const bulle =
            document.createElement(
                "div"
            );


        bulle.classList.add(
            "bulle"
        );


        message.appendChild(
            bulle
        );


        /*
            Classe d'animation
        */

        if (
            type === "joueur"
        ) {

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
            Écriture caractère par caractère
        */

        let texteAffiche =
            "";


        for (
            let index = 0;
            index < contenuPrepare.length;
            index++
        ) {

            texteAffiche +=
                contenuPrepare[index];


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
        NORMALISER LE PERSONNAGE
    =====================================================*/

    normaliserPersonnage(
        personnage
    ) {

        const valeur =
            String(
                personnage ||
                "narrateur"
            )
                .toLowerCase()
                .normalize(
                    "NFD"
                )
                .replace(
                    /[\u0300-\u036f]/g,
                    ""
                )
                .trim();


        switch (valeur) {

            case "joueur":
            case "toi":
            case "vous":
            case "player":

                return "joueur";


            case "eva":

                return "eva";


            case "zoe":

                return "zoe";


            case "emelyne":

                return "emelyne";


            case "bryan":

                return "bryan";


            case "eleve":
            case "etudiant":
            case "etudiante":

                return "eleve";


            case "systeme":

                return "systeme";


            case "pensee":
            case "pensée":

                return "pensee";


            case "narration":
            case "narrateur":

                return "narration";


            default:

                return "narration";

        }

    },


    /*=====================================================
        NOM AFFICHÉ
    =====================================================*/

    obtenirNom(
        personnage
    ) {

        if (
            personnage === "joueur" &&
            typeof moteur !==
                "undefined" &&
            moteur.joueur &&
            moteur.joueur.nom
        ) {

            return String(
                moteur.joueur.nom
            );

        }


        const noms = {

            joueur:
                "Joueur",

            eva:
                "Eva",

            zoe:
                "Zoé",

            emelyne:
                "Émelyne",

            bryan:
                "Bryan",

            eleve:
                "Élève",

            systeme:
                "Système",

            narration:
                "Narrateur",

            pensee:
                "Pensée"

        };


        return (

            noms[personnage] ||

            personnage

        );

    },


    /*=====================================================
        MESSAGE SYSTÈME
    =====================================================*/

    systeme(
        texte
    ) {

        if (!texte) {

            return;

        }


        this.ajouterMessage(

            texte,

            "systeme"

        );

    },


    /*=====================================================
        NOTIFICATION
    =====================================================*/

    notification(
        texte
    ) {

        if (!texte) {

            return;

        }


        const notification =
            document.createElement(
                "div"
            );


        notification.className =
            "notification";


        notification.textContent =
            this.remplacerVariables(
                texte
            );


        document.body.appendChild(
            notification
        );


        requestAnimationFrame(
            () => {

                notification.classList.add(
                    "visible"
                );

            }
        );


        setTimeout(
            () => {

                notification.classList.remove(
                    "visible"
                );


                setTimeout(
                    () => {

                        notification.remove();

                    },
                    300
                );

            },
            2500
        );

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


        requestAnimationFrame(
            () => {

                conversation.scrollTo({

                    top:
                        conversation.scrollHeight,

                    behavior:
                        "smooth"

                });

            }
        );

    },


    /*=====================================================
        ATTENDRE
    =====================================================*/

    attendre(
        duree
    ) {

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
