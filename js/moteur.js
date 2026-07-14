"use strict";

/*=========================================================
    FRIENDZONÉ REBORN
    moteur.js
=========================================================*/

const moteur = {

    chapitreActuel: 0,
    sceneActuelle: "",
    chapitre: null,

    timerChoix: null,
    boutonChoix: null,

    joueur: null,


    /*=====================================================
        INITIALISATION
    =====================================================*/

    async initialiser() {

        try {

            this.initialiserTransition();

            if (
                typeof chapitresManager ===
                "undefined"
            ) {

                throw new Error(
                    "chapitresManager est introuvable."
                );

            }

            if (
                typeof sauvegardeManager ===
                "undefined"
            ) {

                throw new Error(
                    "sauvegardeManager est introuvable."
                );

            }

            await chapitresManager.charger();


            if (
                chapitresManager.nombre() === 0
            ) {

                this.afficherErreur(
                    "Aucun chapitre n'a pu être chargé."
                );

                return;

            }


            /*
                Vérifie si le joueur vient
                de cliquer sur Nouvelle partie
                depuis le menu.
            */

            const nouvellePartieDemandee =

                localStorage.getItem(
                    "nouvellePartieDemandee"
                ) === "true";


            if (nouvellePartieDemandee) {

                localStorage.removeItem(
                    "nouvellePartieDemandee"
                );

                sauvegardeManager.supprimer();

                this.nouvellePartie();

                return;

            }


            /*
                Charge une sauvegarde existante.
            */

            const sauvegarde =
                sauvegardeManager.charger();


            if (sauvegarde) {

                this.appliquerSauvegarde(
                    sauvegarde
                );

            }
            else {

                this.nouvellePartie();

            }

        }
        catch (erreur) {

            console.error(
                "Erreur d'initialisation :",
                erreur
            );

            this.afficherErreur(
                "Une erreur est survenue pendant le chargement du jeu."
            );

        }

    },


    /*=====================================================
        TRANSITION D'ENTRÉE
    =====================================================*/

    initialiserTransition() {

        const transition =
            document.getElementById(
                "transition"
            );

        if (!transition) {

            return;

        }

        setTimeout(
            () => {

                transition.classList.remove(
                    "actif"
                );

                transition.style.opacity =
                    "0";

            },
            100
        );

    },


    /*=====================================================
        DEMANDER LE NOM DU JOUEUR
    =====================================================*/

    demanderNomJoueur() {

        let nomChoisi =
            window.prompt(

                "Quel est le prénom de ton personnage ?",

                "Mikael"

            );


        nomChoisi =
            String(
                nomChoisi || ""
            ).trim();


        if (
            nomChoisi.length < 2
        ) {

            nomChoisi =
                "Joueur";

        }


        if (
            nomChoisi.length > 20
        ) {

            nomChoisi =
                nomChoisi.substring(
                    0,
                    20
                );

        }


        return nomChoisi;

    },


    /*=====================================================
        NOUVELLE PARTIE
    =====================================================*/

    nouvellePartie() {

        const premierChapitre =
            chapitresManager.obtenir(
                0
            );


        if (!premierChapitre) {

            this.afficherErreur(
                "Le chapitre 1 est introuvable."
            );

            return;

        }


        this.chapitreActuel =
            0;

        this.sceneActuelle =
            premierChapitre.debut;


        this.joueur =
            sauvegardeManager
                .creerJoueurParDefaut();


        /*
            Demande le prénom avant
            de créer la sauvegarde.
        */

        this.joueur.nom =
            this.demanderNomJoueur();


        if (
            typeof dialogueManager !==
            "undefined"
        ) {

            dialogueManager.vider();

        }


        this.sauvegarder();


        this.chargerChapitre(

            0,

            this.sceneActuelle

        );

    },


    /*=====================================================
        APPLIQUER UNE SAUVEGARDE
    =====================================================*/

    appliquerSauvegarde(
        sauvegarde
    ) {

        if (!sauvegarde) {

            this.nouvellePartie();

            return;

        }


        this.chapitreActuel =
            sauvegarde.chapitre ?? 0;


        this.sceneActuelle =
            sauvegarde.scene || "";


        this.joueur = {

            ...sauvegardeManager
                .creerJoueurParDefaut(),

            ...(sauvegarde.joueur || {})

        };


        /*
            Compatibilité avec les anciennes
            sauvegardes ne contenant pas de prénom.
        */

        if (
            !this.joueur.nom ||
            this.joueur.nom.toLowerCase() ===
                "joueur"
        ) {

            this.joueur.nom =
                this.demanderNomJoueur();

            this.sauvegarder();

        }


        this.chargerChapitre(

            this.chapitreActuel,

            this.sceneActuelle

        );

    },


    /*=====================================================
        SAUVEGARDER
    =====================================================*/

    sauvegarder() {

        if (
            typeof sauvegardeManager ===
            "undefined"
        ) {

            return;

        }


        sauvegardeManager.sauvegarder({

            chapitre:
                this.chapitreActuel,

            scene:
                this.sceneActuelle,

            joueur:
                this.joueur,

            musique:

                typeof audioManager !==
                    "undefined"

                    ? audioManager
                        .musiqueActuelle

                    : "",

            ambiance:

                typeof audioManager !==
                    "undefined"

                    ? audioManager
                        .ambianceActuelle

                    : ""

        });

    },


    /*=====================================================
        CHARGER UN CHAPITRE
    =====================================================*/

    chargerChapitre(
        numero,
        sceneDepart = null
    ) {

        const chapitre =
            chapitresManager.obtenir(
                numero
            );


        if (!chapitre) {

            this.afficherErreur(

                "Chapitre introuvable : " +

                (numero + 1)

            );

            return;

        }


        this.annulerAttenteChoix();


        this.chapitreActuel =
            numero;

        this.chapitre =
            chapitre;


        const titre =
            document.getElementById(
                "titre"
            );


        if (titre) {

            titre.textContent =
                chapitre.titre ||
                `Chapitre ${numero + 1}`;

        }


        if (
            chapitre.musique &&
            typeof audioManager !==
                "undefined"
        ) {

            audioManager.changerMusique(
                chapitre.musique
            );

        }


        const sceneInitiale =

            sceneDepart ||

            chapitre.debut;


        if (!sceneInitiale) {

            this.afficherErreur(
                "Aucune scène de départ n'est définie."
            );

            return;

        }


        this.chargerScene(
            sceneInitiale
        );

    },

        /*=====================================================
        CHARGER UNE SCÈNE
    =====================================================*/

    chargerScene(
        id
    ) {

        if (!this.chapitre) {

            this.afficherErreur(
                "Aucun chapitre n'est chargé."
            );

            return;

        }


        const scene =
            this.chapitre.scenes?.[id];


        if (!scene) {

            this.afficherErreur(

                "Scène introuvable : " +

                id

            );

            return;

        }


        this.annulerAttenteChoix();


        if (
            typeof choixManager !==
                "undefined"
        ) {

            if (
                typeof choixManager.fermerPopup ===
                    "function"
            ) {

                choixManager.fermerPopup();

            }

            if (
                typeof choixManager.vider ===
                    "function"
            ) {

                choixManager.vider();

            }

        }


        /* Vérification de l'accès */

        if (
            typeof conditionsManager !==
                "undefined" &&
            typeof conditionsManager
                .verifierAccesScene ===
                "function"
        ) {

            const accesAutorise =
                conditionsManager
                    .verifierAccesScene(

                        scene,

                        this.joueur

                    );


            if (!accesAutorise) {

                if (scene.sinon) {

                    this.chargerScene(
                        scene.sinon
                    );

                }
                else {

                    this.afficherErreur(
                        "Cette scène n'est pas accessible."
                    );

                }

                return;

            }

        }


        /* Redirection automatique */

        if (
            typeof conditionsManager !==
                "undefined" &&
            typeof conditionsManager
                .obtenirRedirection ===
                "function"
        ) {

            const redirection =
                conditionsManager
                    .obtenirRedirection(

                        scene,

                        this.joueur

                    );


            if (redirection) {

                this.gererDestination(
                    redirection
                );

                return;

            }

        }


        this.sceneActuelle =
            id;


        this.gererAudioScene(
            scene
        );


        if (
            typeof dialogueManager !==
                "undefined" &&
            typeof dialogueManager.afficherScene ===
                "function"
        ) {

            dialogueManager.afficherScene(
                scene
            );

        }


        let choixDisponibles =
            Array.isArray(
                scene.choix
            )

                ? scene.choix

                : [];


        if (
            typeof conditionsManager !==
                "undefined" &&
            typeof conditionsManager.preparerChoix ===
                "function"
        ) {

            choixDisponibles =
                conditionsManager
                    .preparerChoix(

                        choixDisponibles,

                        this.joueur

                    );

        }


        if (
            choixDisponibles.length > 0
        ) {

            this.afficherBoutonChoix(
                choixDisponibles
            );

        }


        this.sauvegarder();

    },


    /*=====================================================
        AFFICHER LE BOUTON DES CHOIX
    =====================================================*/

    afficherBoutonChoix(
        choixDisponibles
    ) {

        this.supprimerBoutonChoix();


        if (
            !Array.isArray(
                choixDisponibles
            ) ||
            choixDisponibles.length === 0
        ) {

            return;

        }


        const conteneur =
            document.getElementById(
                "texte"
            );


        if (!conteneur) {

            console.error(
                "Impossible d'afficher le bouton des choix : #texte introuvable."
            );

            return;

        }


        const zoneBouton =
            document.createElement(
                "div"
            );


        zoneBouton.className =
            "zone-afficher-choix";


        const bouton =
            document.createElement(
                "button"
            );


        bouton.type =
            "button";


        bouton.className =
            "bouton-afficher-choix";


        bouton.textContent =
            "Afficher les choix";


        bouton.setAttribute(
            "aria-label",
            "Afficher les choix disponibles"
        );


        bouton.addEventListener(
            "click",
            () => {

                this.supprimerBoutonChoix();


                if (
                    typeof choixManager !==
                        "undefined" &&
                    typeof choixManager.afficher ===
                        "function"
                ) {

                    choixManager.afficher(
                        choixDisponibles
                    );

                }
                else {

                    console.error(
                        "choixManager.afficher est introuvable."
                    );

                }

            }
        );


        zoneBouton.appendChild(
            bouton
        );


        conteneur.appendChild(
            zoneBouton
        );


        this.boutonChoix =
            zoneBouton;


        if (
            typeof dialogueManager !==
                "undefined" &&
            typeof dialogueManager.defiler ===
                "function"
        ) {

            dialogueManager.defiler();

        }

    },


    /*=====================================================
        SUPPRIMER LE BOUTON DES CHOIX
    =====================================================*/

    supprimerBoutonChoix() {

        if (
            this.boutonChoix &&
            this.boutonChoix.parentNode
        ) {

            this.boutonChoix.remove();

        }


        this.boutonChoix =
            null;


        document
            .querySelectorAll(
                ".zone-afficher-choix"
            )
            .forEach(
                element => {

                    element.remove();

                }
            );

    },


    /*=====================================================
        ANNULER L'ATTENTE DES CHOIX
    =====================================================*/

    annulerAttenteChoix() {

        if (this.timerChoix) {

            clearTimeout(
                this.timerChoix
            );

            this.timerChoix =
                null;

        }


        this.supprimerBoutonChoix();

    },


    /*=====================================================
        TRAITER UN CHOIX
    =====================================================*/

    traiterChoix(
        choix
    ) {

        if (!choix) {

            return;

        }


        this.annulerAttenteChoix();


        if (choix.verrouille) {

            if (
                typeof dialogueManager !==
                    "undefined" &&
                typeof dialogueManager.notification ===
                    "function"
            ) {

                dialogueManager.notification(

                    choix.messageVerrouille ||

                    "Ce choix n'est pas disponible."

                );

            }

            return;

        }


        let messageAffiche =

            choix.message?.texte ||

            choix.texte ||

            "";


        if (
            typeof dialogueManager !==
                "undefined" &&
            typeof dialogueManager.remplacerVariables ===
                "function"
        ) {

            messageAffiche =
                dialogueManager
                    .remplacerVariables(
                        messageAffiche
                    );

        }


        const personnage =

            choix.message?.personnage ||

            "joueur";


        if (
            typeof dialogueManager !==
                "undefined" &&
            typeof dialogueManager.ajouterMessage ===
                "function"
        ) {

            dialogueManager.ajouterMessage(

                messageAffiche,

                personnage

            );

        }


        if (
            choix.son &&
            typeof audioManager !==
                "undefined" &&
            typeof audioManager.jouerSon ===
                "function"
        ) {

            audioManager.jouerSon(

                choix.son,

                choix.volumeSon

            );

        }


        if (
            typeof conditionsManager !==
                "undefined"
        ) {

            if (
                typeof conditionsManager.appliquerEffet ===
                    "function"
            ) {

                conditionsManager.appliquerEffet(

                    choix.effet,

                    this.joueur

                );

            }


            if (
                typeof conditionsManager.appliquerEffets ===
                    "function"
            ) {

                conditionsManager.appliquerEffets(

                    choix.effets,

                    this.joueur

                );

            }

        }


        let destination =
            choix.next || null;


        if (
            typeof conditionsManager !==
                "undefined" &&
            typeof conditionsManager.resoudreDestination ===
                "function"
        ) {

            destination =
                conditionsManager
                    .resoudreDestination(

                        choix,

                        this.joueur

                    );

        }


        this.sauvegarder();


        setTimeout(
            () => {

                this.gererDestination(
                    destination
                );

            },
            800
        );

    },

        /*=====================================================
        GÉRER UNE DESTINATION
    =====================================================*/

    gererDestination(
        destination
    ) {

        if (!destination) {

            console.warn(
                "Destination manquante."
            );

            return;

        }


        if (
            String(destination)
                .startsWith(
                    "chapitre"
                )
        ) {

            const numero =
                Number.parseInt(

                    String(destination)
                        .replace(
                            "chapitre",
                            ""
                        ),

                    10

                );


            if (
                Number.isNaN(
                    numero
                )
            ) {

                this.afficherErreur(

                    "Destination invalide : " +

                    destination

                );

                return;

            }


            this.changerChapitre(
                numero - 1
            );

            return;

        }


        this.chargerScene(
            destination
        );

    },


    /*=====================================================
        CHANGER DE CHAPITRE
    =====================================================*/

    changerChapitre(
        numero
    ) {

        const chapitre =
            chapitresManager.obtenir(
                numero
            );


        if (!chapitre) {

            this.afficherErreur(

                "Chapitre introuvable : " +

                (numero + 1)

            );

            return;

        }


        this.annulerAttenteChoix();


        this.chapitreActuel =
            numero;


        this.sceneActuelle =
            chapitre.debut;


        this.sauvegarder();


        if (
            typeof dialogueManager !==
                "undefined" &&
            typeof dialogueManager.vider ===
                "function"
        ) {

            dialogueManager.vider();

        }


        if (
            typeof animationManager !==
                "undefined" &&
            typeof animationManager
                .transitionVersNoir ===
                "function"
        ) {

            animationManager
                .transitionVersNoir(
                    () => {

                        this.chargerChapitre(
                            numero
                        );


                        if (
                            typeof animationManager
                                .sortirDuNoir ===
                                "function"
                        ) {

                            setTimeout(
                                () => {

                                    animationManager
                                        .sortirDuNoir();

                                },
                                150
                            );

                        }

                    }
                );

            return;

        }


        this.chargerChapitre(
            numero
        );

    },


    /*=====================================================
        GÉRER L'AUDIO D'UNE SCÈNE
    =====================================================*/

    gererAudioScene(
        scene
    ) {

        if (
            !scene ||
            typeof audioManager ===
                "undefined"
        ) {

            return;

        }


        if (
            scene.musique &&
            typeof audioManager
                .changerMusique ===
                "function"
        ) {

            audioManager.changerMusique(
                scene.musique
            );

        }


        if (
            scene.ambiance &&
            typeof audioManager
                .jouerAmbiance ===
                "function"
        ) {

            audioManager.jouerAmbiance(
                scene.ambiance
            );

        }


        if (
            scene.arreterAmbiance ===
                true &&
            typeof audioManager
                .arreterAmbiance ===
                "function"
        ) {

            audioManager
                .arreterAmbiance();

        }


        if (
            scene.son &&
            typeof audioManager
                .jouerSon ===
                "function"
        ) {

            audioManager.jouerSon(

                scene.son,

                scene.volumeSon

            );

        }

    },


    /*=====================================================
        TERMINER LE JEU
    =====================================================*/

    terminerJeu(
        nomFin = "finNeutre"
    ) {

        this.annulerAttenteChoix();


        let fins = [];


        try {

            fins =
                JSON.parse(

                    localStorage.getItem(
                        "finsDebloquees"
                    ) || "[]"

                );

        }
        catch (erreur) {

            console.warn(
                "Impossible de lire les fins débloquées :",
                erreur
            );

            fins = [];

        }


        if (
            !Array.isArray(
                fins
            )
        ) {

            fins = [];

        }


        if (
            !fins.includes(
                nomFin
            )
        ) {

            fins.push(
                nomFin
            );

        }


        localStorage.setItem(

            "finsDebloquees",

            JSON.stringify(
                fins
            )

        );


        this.sauvegarder();


        if (
            typeof audioManager !==
                "undefined"
        ) {

            if (
                typeof audioManager.fadeOut ===
                    "function"
            ) {

                audioManager.fadeOut(
                    1200
                );

            }


            if (
                typeof audioManager
                    .arreterAmbiance ===
                    "function"
            ) {

                audioManager
                    .arreterAmbiance();

            }

        }


        if (
            typeof animationManager !==
                "undefined" &&
            typeof animationManager
                .transitionVersNoir ===
                "function"
        ) {

            animationManager
                .transitionVersNoir(
                    () => {

                        window.location.href =
                            "index.html";

                    }
                );

            return;

        }


        window.location.href =
            "index.html";

    },


    /*=====================================================
        AFFICHER UNE ERREUR
    =====================================================*/

    afficherErreur(
        message
    ) {

        console.error(
            message
        );


        this.annulerAttenteChoix();


        const texte =
            document.getElementById(
                "texte"
            );


        const choix =
            document.getElementById(
                "choix"
            );


        if (texte) {

            texte.innerHTML =

                `<div class="message narration">

                    <div class="bulle">

                        ${String(message)}

                    </div>

                </div>`;

        }


        if (choix) {

            choix.innerHTML =
                "";

        }


        if (
            typeof choixManager !==
                "undefined" &&
            typeof choixManager
                .fermerPopup ===
                "function"
        ) {

            choixManager
                .fermerPopup();

        }

    }

};


/*=========================================================
    DÉMARRAGE
=========================================================*/

window.addEventListener(

    "load",

    () => {

        moteur.initialiser();

    }

);

